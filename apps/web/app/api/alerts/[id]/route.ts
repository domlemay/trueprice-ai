import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import {
  prisma,
  deletePriceAlert,
  togglePriceAlert,
  deleteStockAlert,
  toggleStockAlert,
} from "@trueprice-ai/db";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { userId: clerkId } = await auth();
  if (!clerkId) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { clerkId }, select: { id: true } });
  if (!user) return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });

  const { id } = await params;
  const alertType = req.nextUrl.searchParams.get("type") ?? "price";

  const deleted = alertType === "stock"
    ? await deleteStockAlert(user.id, id)
    : await deletePriceAlert(user.id, id);

  if (!deleted) return NextResponse.json({ error: "Alerte introuvable" }, { status: 404 });
  return NextResponse.json({ ok: true });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { userId: clerkId } = await auth();
  if (!clerkId) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { clerkId }, select: { id: true } });
  if (!user) return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });

  const { id }   = await params;
  const body     = await req.json() as { isActive?: boolean; type?: "price" | "stock" };
  const alertType = body.type ?? "price";

  if (typeof body.isActive !== "boolean") {
    return NextResponse.json({ error: "isActive (boolean) requis" }, { status: 400 });
  }

  const updated = alertType === "stock"
    ? await toggleStockAlert(user.id, id, body.isActive)
    : await togglePriceAlert(user.id, id, body.isActive);

  if (!updated) return NextResponse.json({ error: "Alerte introuvable" }, { status: 404 });
  return NextResponse.json({ alert: updated });
}
