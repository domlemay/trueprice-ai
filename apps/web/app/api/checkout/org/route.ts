import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { stripe } from "@/lib/stripe";
import { prisma, isOrgAdmin } from "@trueprice-ai/db";

export async function POST(req: Request) {
  const { userId: clerkId } = await auth();
  if (!clerkId) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { clerkId },
    select: { id: true, stripeCustomerId: true, email: true, name: true },
  });
  if (!user) return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });

  const { orgId, priceId, seats } = await req.json() as {
    orgId: string;
    priceId: string;
    seats?: number;
  };

  if (!orgId || !priceId) return NextResponse.json({ error: "orgId et priceId requis" }, { status: 400 });
  if (!(await isOrgAdmin(orgId, user.id))) {
    return NextResponse.json({ error: "Droits admin requis" }, { status: 403 });
  }

  const org = await prisma.organization.findUnique({
    where: { id: orgId },
    select: { id: true, name: true, stripeCustomerId: true },
  });
  if (!org) return NextResponse.json({ error: "Organisation introuvable" }, { status: 404 });

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  let customerId = org.stripeCustomerId ?? undefined;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      name:  org.name,
      metadata: { orgId, userId: user.id },
    });
    customerId = customer.id;
    await prisma.organization.update({
      where: { id: orgId },
      data:  { stripeCustomerId: customerId },
    });
  }

  const seatsQty = Math.max(1, seats ?? 10);

  const session = await stripe.checkout.sessions.create({
    customer:            customerId,
    client_reference_id: orgId,
    mode:                "subscription",
    line_items:          [{ price: priceId, quantity: seatsQty }],
    subscription_data: {
      metadata: { orgId, userId: user.id, type: "org_subscription" },
    },
    automatic_tax:       { enabled: true },
    success_url: `${baseUrl}/dashboard/organisation/${orgId}/facturation?success=1`,
    cancel_url:  `${baseUrl}/dashboard/organisation/${orgId}/facturation?canceled=1`,
    allow_promotion_codes: true,
    metadata: { orgId, type: "org_subscription" },
  });

  return NextResponse.json({ url: session.url });
}
