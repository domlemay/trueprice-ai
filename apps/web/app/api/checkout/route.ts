import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@trueprice-ai/db";

type Body = {
  priceId: string;
};

const ALLOWED_PRICE_IDS = new Set([
  process.env.STRIPE_PRICE_ID_PREMIUM_MONTHLY,
  process.env.STRIPE_PRICE_ID_PREMIUM_YEARLY,
  process.env.STRIPE_PRICE_ID_PREMIUM_MONTHLY_USD,
  process.env.STRIPE_PRICE_ID_PREMIUM_YEARLY_USD,
  process.env.STRIPE_PRICE_ID_ENTERPRISE_MONTHLY,
  process.env.STRIPE_PRICE_ID_ENTERPRISE_YEARLY,
  process.env.STRIPE_PRICE_ID_ENTERPRISE_MONTHLY_USD,
  process.env.STRIPE_PRICE_ID_ENTERPRISE_YEARLY_USD,
]);

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  let body: Body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Corps invalide" }, { status: 400 });
  }

  const { priceId } = body;

  if (!priceId || !ALLOWED_PRICE_IDS.has(priceId)) {
    return NextResponse.json({ error: "Prix non autorisé" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    select: { id: true, stripeCustomerId: true, email: true, name: true },
  });

  if (!user) return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  // Réutiliser le customer Stripe existant ou en créer un nouveau
  let customerId = user.stripeCustomerId ?? undefined;

  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      name: user.name ?? undefined,
      metadata: { userId: user.id, clerkId: userId },
    });
    customerId = customer.id;
    await prisma.user.update({
      where: { id: user.id },
      data: { stripeCustomerId: customerId },
    });
  }

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    client_reference_id: userId,
    mode: "subscription",
    line_items: [{ price: priceId, quantity: 1 }],
    subscription_data: {
      trial_period_days: 14,
      metadata: { userId: user.id, clerkId: userId },
    },
    automatic_tax: { enabled: true },
    success_url: `${baseUrl}/dashboard/abonnement?success=1`,
    cancel_url: `${baseUrl}/dashboard/abonnement?canceled=1`,
    allow_promotion_codes: true,
  });

  return NextResponse.json({ url: session.url });
}
