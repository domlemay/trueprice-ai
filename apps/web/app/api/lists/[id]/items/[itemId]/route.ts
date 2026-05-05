import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma, removeItemFromList } from "@trueprice-ai/db";

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string; itemId: string } },
) {
  const { userId: clerkId } = await auth();
  if (!clerkId) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { clerkId }, select: { id: true } });
  if (!user) return NextResponse.json({ error: "Introuvable" }, { status: 404 });

  try {
    await removeItemFromList(params.itemId, user.id);
    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Erreur" }, { status: 400 });
  }
}
