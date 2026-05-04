import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import {
  prisma,
  checkPriceAlertQuota,
  createPriceAlert,
  getUserPriceAlerts,
  createStockAlert,
  getUserStockAlerts,
} from "@trueprice-ai/db";

export async function GET() {
  const { userId: clerkId } = await auth();
  if (!clerkId) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { clerkId }, select: { id: true } });
  if (!user) return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });

  const [priceAlerts, stockAlerts] = await Promise.all([
    getUserPriceAlerts(user.id),
    getUserStockAlerts(user.id),
  ]);

  return NextResponse.json({ priceAlerts, stockAlerts });
}

export async function POST(req: NextRequest) {
  const { userId: clerkId } = await auth();
  if (!clerkId) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const user = await prisma.user.findUnique({
    where:  { clerkId },
    select: { id: true, plan: true },
  });
  if (!user) return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });

  const body = await req.json() as {
    type?:           "price" | "stock";
    productId?:      string;
    targetPrice?:    number;
    currency?:       string;
    marketplaceIds?: string[];
  };

  const alertType = body.type ?? "price";

  if (alertType === "price") {
    if (typeof body.targetPrice !== "number" || body.targetPrice <= 0) {
      return NextResponse.json({ error: "targetPrice invalide" }, { status: 400 });
    }

    const quota = await checkPriceAlertQuota(user.id, user.plan);
    if (!quota.allowed) {
      return NextResponse.json(
        { error: `Limite atteinte (${quota.used}/${quota.limit} alertes). Passez à PREMIUM.`, quota },
        { status: 429 },
      );
    }

    const alert = await createPriceAlert({
      userId:         user.id,
      productId:      body.productId,
      targetPrice:    body.targetPrice,
      currency:       body.currency,
      marketplaceIds: body.marketplaceIds,
    });
    return NextResponse.json({ alert }, { status: 201 });
  }

  // Stock alert
  const alert = await createStockAlert({
    userId:         user.id,
    productId:      body.productId,
    marketplaceIds: body.marketplaceIds,
  });
  return NextResponse.json({ alert }, { status: 201 });
}
