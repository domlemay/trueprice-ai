import { headers } from "next/headers";
import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { prisma } from "@trueprice-ai/db";
import { upsertSubscription, cancelSubscription, recordAiTokenPurchase } from "@trueprice-ai/db";
import type { Plan, SubscriptionStatus } from "@prisma/client";

export const runtime = "nodejs";

// Map price_id → Plan interne
const PRICE_TO_PLAN: Record<string, Plan> = {
  [process.env.STRIPE_PRICE_ID_PREMIUM_MONTHLY!]:    "PREMIUM",
  [process.env.STRIPE_PRICE_ID_PREMIUM_YEARLY!]:     "PREMIUM",
  [process.env.STRIPE_PRICE_ID_PREMIUM_MONTHLY_USD!]:"PREMIUM",
  [process.env.STRIPE_PRICE_ID_PREMIUM_YEARLY_USD!]: "PREMIUM",
  [process.env.STRIPE_PRICE_ID_ENTERPRISE_MONTHLY!]: "ENTERPRISE",
  [process.env.STRIPE_PRICE_ID_ENTERPRISE_YEARLY!]:  "ENTERPRISE",
  [process.env.STRIPE_PRICE_ID_ENTERPRISE_MONTHLY_USD!]: "ENTERPRISE",
  [process.env.STRIPE_PRICE_ID_ENTERPRISE_YEARLY_USD!]:  "ENTERPRISE",
};

const STATUS_MAP: Record<Stripe.Subscription.Status, SubscriptionStatus> = {
  trialing:         "TRIALING",
  active:           "ACTIVE",
  past_due:         "PAST_DUE",
  canceled:         "CANCELED",
  unpaid:           "UNPAID",
  incomplete:       "INCOMPLETE",
  incomplete_expired: "INCOMPLETE",
  paused:           "PAST_DUE",
};

// Vérification signature HMAC Stripe — rejette toute requête falsifiée
async function verifyWebhook(req: Request): Promise<Stripe.Event> {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) throw new Error("STRIPE_WEBHOOK_SECRET non configuré");

  const headersList = headers();
  const signature   = headersList.get("stripe-signature");
  if (!signature) throw new Error("Header stripe-signature manquant");

  const body = await req.text();
  return stripe.webhooks.constructEvent(body, signature, secret);
}

// Retrouver le userId interne depuis le stripeCustomerId
async function getUserByStripeCustomer(customerId: string) {
  return prisma.user.findFirst({ where: { stripeCustomerId: customerId } });
}

export async function POST(req: Request) {
  let event: Stripe.Event;

  try {
    event = await verifyWebhook(req);
  } catch {
    return NextResponse.json({ error: "Signature invalide" }, { status: 401 });
  }

  try {
    switch (event.type) {

      // ─── Checkout complété → abonnement activé ──────────────────────────
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.mode !== "subscription") break;

        const customerId     = session.customer as string;
        const subscriptionId = session.subscription as string;

        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        const priceId      = subscription.items.data[0]?.price.id ?? "";
        const plan         = PRICE_TO_PLAN[priceId] ?? "PREMIUM";
        const user         = await getUserByStripeCustomer(customerId);
        if (!user) break;

        const item = subscription.items.data[0];
        await upsertSubscription({
          userId:               user.id,
          stripeSubscriptionId: subscriptionId,
          stripePriceId:        priceId,
          stripeCustomerId:     customerId,
          plan,
          status:               STATUS_MAP[subscription.status] ?? "ACTIVE",
          currentPeriodStart:   new Date((item?.current_period_start ?? Date.now() / 1000) * 1000),
          currentPeriodEnd:     new Date((item?.current_period_end   ?? Date.now() / 1000 + 2592000) * 1000),
          cancelAtPeriodEnd:    subscription.cancel_at_period_end,
        });

        await prisma.usageLog.create({
          data: { userId: user.id, action: "subscription.created", metadata: { plan, priceId } },
        });

        break;
      }

      // ─── Abonnement modifié (upgrade, downgrade, renouvellement) ────────
      case "customer.subscription.updated": {
        const sub      = event.data.object as Stripe.Subscription;
        const priceId  = sub.items.data[0]?.price.id ?? "";
        const plan     = PRICE_TO_PLAN[priceId] ?? "PREMIUM";
        const user     = await getUserByStripeCustomer(sub.customer as string);
        if (!user) break;

        const subItem = sub.items.data[0];
        await upsertSubscription({
          userId:               user.id,
          stripeSubscriptionId: sub.id,
          stripePriceId:        priceId,
          stripeCustomerId:     sub.customer as string,
          plan,
          status:               STATUS_MAP[sub.status] ?? "ACTIVE",
          currentPeriodStart:   new Date((subItem?.current_period_start ?? Date.now() / 1000) * 1000),
          currentPeriodEnd:     new Date((subItem?.current_period_end   ?? Date.now() / 1000 + 2592000) * 1000),
          cancelAtPeriodEnd:    sub.cancel_at_period_end,
          canceledAt:           sub.canceled_at ? new Date(sub.canceled_at * 1000) : null,
        });

        break;
      }

      // ─── Abonnement annulé → retour FREE ─────────────────────────────────
      case "customer.subscription.deleted": {
        const sub  = event.data.object as Stripe.Subscription;
        const user = await getUserByStripeCustomer(sub.customer as string);
        if (!user) break;

        await cancelSubscription(user.id);

        await prisma.usageLog.create({
          data: { userId: user.id, action: "subscription.canceled" },
        });

        break;
      }

      // ─── Facture payée → confirmer renouvellement ────────────────────────
      case "invoice.paid": {
        const invoice = event.data.object as Stripe.Invoice;
        if (invoice.billing_reason === "subscription_create") break; // Déjà géré par checkout.completed

        const user = await getUserByStripeCustomer(invoice.customer as string);
        if (!user) break;

        await prisma.usageLog.create({
          data: {
            userId:   user.id,
            action:   "invoice.paid",
            metadata: { amount: invoice.amount_paid, currency: invoice.currency },
          },
        });

        break;
      }

      // ─── Paiement échoué → notifier l'utilisateur ───────────────────────
      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const user    = await getUserByStripeCustomer(invoice.customer as string);
        if (!user) break;

        // Log — l'envoi email sera déclenché par un job ou une notification in-app
        await prisma.usageLog.create({
          data: {
            userId:   user.id,
            action:   "invoice.payment_failed",
            metadata: { amount: invoice.amount_due, currency: invoice.currency },
          },
        });

        break;
      }

      // ─── Action requise (3D Secure) ───────────────────────────────────────
      case "invoice.payment_action_required": {
        const invoice = event.data.object as Stripe.Invoice;
        const user    = await getUserByStripeCustomer(invoice.customer as string);
        if (!user) break;

        await prisma.usageLog.create({
          data: { userId: user.id, action: "invoice.action_required" },
        });

        break;
      }

      // ─── Fin d'essai imminente (3 jours avant) ───────────────────────────
      case "customer.subscription.trial_will_end": {
        const sub  = event.data.object as Stripe.Subscription;
        const user = await getUserByStripeCustomer(sub.customer as string);
        if (!user) break;

        // Log — email envoyé par le service notification (Phase 6)
        await prisma.usageLog.create({
          data: {
            userId:   user.id,
            action:   "trial.ending_soon",
            metadata: { trialEnd: sub.trial_end },
          },
        });

        break;
      }

      // ─── Paiement unique réussi (tokens IA à la carte) ──────────────────
      case "payment_intent.succeeded": {
        const pi = event.data.object as Stripe.PaymentIntent;

        // Uniquement pour les achats de tokens (metadata.type === "ai_tokens")
        if (pi.metadata?.type !== "ai_tokens") break;

        const user = await getUserByStripeCustomer(pi.customer as string);
        if (!user) break;

        const tokensAmount = parseInt(pi.metadata.tokens_amount ?? "0", 10);
        if (!tokensAmount) break;

        await recordAiTokenPurchase({
          userId:          user.id,
          stripePaymentId: pi.id,
          tokensAmount,
          pricePaid:       pi.amount / 100,
          currency:        pi.currency.toUpperCase(),
        });

        break;
      }

      // ─── Paiement unique échoué ───────────────────────────────────────────
      case "payment_intent.payment_failed": {
        const pi   = event.data.object as Stripe.PaymentIntent;
        const user = await getUserByStripeCustomer(pi.customer as string);
        if (!user) break;

        await prisma.usageLog.create({
          data: {
            userId:   user.id,
            action:   "payment.failed",
            metadata: { amount: pi.amount, currency: pi.currency },
          },
        });

        break;
      }

      default:
        break;
    }
  } catch (err) {
    console.error("[Stripe webhook] Erreur traitement:", event.type, err);
    return NextResponse.json({ error: "Erreur interne" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
