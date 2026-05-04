import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { Webhook } from "svix";
import type { WebhookEvent } from "@clerk/nextjs/server";
import { prisma } from "@trueprice-ai/db";
import {
  createUser,
  syncUserFromClerk,
  requestAccountDeletion,
} from "@trueprice-ai/db";

export const runtime = "nodejs";

// Vérification HMAC Svix — rejette toute requête non signée par Clerk
async function verifyWebhook(req: Request): Promise<WebhookEvent> {
  const secret = process.env.CLERK_WEBHOOK_SECRET;
  if (!secret) throw new Error("CLERK_WEBHOOK_SECRET non configuré");

  const headersList = await headers();
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
      case "user.created": {
        const { id, email_addresses, first_name, last_name, image_url } = event.data;
        const email = email_addresses[0]?.email_address;
        if (!email) break;

        const name = [first_name, last_name].filter(Boolean).join(" ") || null;

        // Transaction : créer user + préférences notif par défaut
        const user = await createUser({
          clerkId:   id,
          email,
          name,
          avatarUrl: image_url ?? null,
        });

        // Log usage
        await prisma.usageLog.create({
          data: { userId: user.id, action: "user.created" },
        });

        break;
      }

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

      case "user.deleted": {
        const { id } = event.data;
        if (!id) break;

        const existing = await prisma.user.findUnique({ where: { clerkId: id } });
        if (!existing) break;

        // Soft delete RGPD — suppression définitive par job cron J+30
        await requestAccountDeletion(id);

        break;
      }

      default:
        // Événement non géré — ignorer silencieusement
        break;
    }
  } catch (err) {
    console.error("[Clerk webhook] Erreur traitement:", event.type, err);
    // Retourner 200 quand même pour éviter les retry Clerk sur erreurs applicatives
    return NextResponse.json({ error: "Erreur interne" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
