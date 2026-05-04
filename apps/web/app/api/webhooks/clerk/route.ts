import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { Webhook } from "svix";
import type { WebhookEvent } from "@clerk/nextjs/server";
import { clerkClient } from "@clerk/nextjs/server";
import { prisma } from "@trueprice-ai/db";
import {
  createUser,
  syncUserFromClerk,
  requestAccountDeletion,
  updateUserPlan,
} from "@trueprice-ai/db";
import { stripe } from "@/lib/stripe";

export const runtime = "nodejs";

const TRIAL_DAYS = 14;

// Vérification HMAC Svix — rejette toute requête non signée par Clerk
async function verifyWebhook(req: Request): Promise<WebhookEvent> {
  const secret = process.env.CLERK_WEBHOOK_SECRET;
  if (!secret) throw new Error("CLERK_WEBHOOK_SECRET non configuré");

  const headersList = headers();
  const svix_id        = headersList.get("svix-id");
  const svix_timestamp = headersList.get("svix-timestamp");
  const svix_signature = headersList.get("svix-signature");

  if (!svix_id || !svix_timestamp || !svix_signature) {
    throw new Error("Headers Svix manquants");
  }

  const body = await req.text();
  const wh = new Webhook(secret);

  return wh.verify(body, {
    "svix-id":        svix_id,
    "svix-timestamp": svix_timestamp,
    "svix-signature": svix_signature,
  }) as WebhookEvent;
}

export async function POST(req: Request) {
  let event: WebhookEvent;

  try {
    event = await verifyWebhook(req);
  } catch {
    return NextResponse.json({ error: "Signature invalide" }, { status: 401 });
  }

  try {
    switch (event.type) {

      // ─── Nouvelle inscription ────────────────────────────────────────────
      case "user.created": {
        const { id, email_addresses, first_name, last_name, image_url } = event.data;
        const email = email_addresses[0]?.email_address;
        if (!email) break;

        const name = [first_name, last_name].filter(Boolean).join(" ") || null;

        // 1. Créer le customer Stripe (avant l'user BD pour pouvoir passer l'ID)
        const stripeCustomer = await stripe.customers.create({
          email,
          name: name ?? undefined,
          metadata: { clerkId: id },
        });

        // 2. Créer l'user en BD + préférences notif par défaut (transaction ACID)
        const user = await createUser({
          clerkId:          id,
          email,
          name,
          avatarUrl:        image_url ?? null,
          stripeCustomerId: stripeCustomer.id,
        });

        // 3. Activer l'essai PREMIUM 14 jours
        const trialEndsAt = new Date(Date.now() + TRIAL_DAYS * 24 * 60 * 60 * 1000);
        await updateUserPlan(user.id, "PREMIUM", {
          isTrialing: true,
          trialEndsAt,
          trialPlan:  "PREMIUM",
        });

        // 4. Synchroniser le plan dans les publicMetadata Clerk
        //    → getSessionPlan() retourne "PREMIUM" dès la première session
        const client = await clerkClient();
        await client.users.updateUserMetadata(id, {
          publicMetadata: { plan: "PREMIUM" },
        });

        await prisma.usageLog.create({
          data: {
            userId:   user.id,
            action:   "user.created",
            metadata: { stripeCustomerId: stripeCustomer.id, trial: true },
          },
        });

        break;
      }

      // ─── Mise à jour profil ───────────────────────────────────────────────
      case "user.updated": {
        const { id, email_addresses, first_name, last_name, image_url } = event.data;
        const email = email_addresses[0]?.email_address;
        const name  = [first_name, last_name].filter(Boolean).join(" ") || null;

        // Idempotent — si l'user n'existe pas encore en BD, on ignore
        const existing = await prisma.user.findUnique({ where: { clerkId: id } });
        if (!existing) break;

        await syncUserFromClerk(id, {
          email:     email ?? undefined,
          name,
          avatarUrl: image_url ?? null,
        });

        break;
      }

      // ─── Suppression compte → soft delete RGPD ───────────────────────────
      case "user.deleted": {
        const { id } = event.data;
        if (!id) break;

        const existing = await prisma.user.findUnique({ where: { clerkId: id } });
        if (!existing) break;

        // gdprDeleteRequestedAt = now() → job cron supprime définitivement J+30
        await requestAccountDeletion(id);

        break;
      }

      default:
        break;
    }
  } catch (err) {
    console.error("[Clerk webhook] Erreur traitement:", event.type, err);
    return NextResponse.json({ error: "Erreur interne" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
