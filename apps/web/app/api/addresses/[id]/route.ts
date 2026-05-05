import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma, updateAddress, deleteAddress } from "@trueprice-ai/db";

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } },
) {
  const { userId: clerkId } = await auth();
  if (!clerkId) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { clerkId }, select: { id: true } });
  if (!user) return NextResponse.json({ error: "Introuvable" }, { status: 404 });

  const body = await req.json();
  const address = await updateAddress(user.id, params.id, body);
  return NextResponse.json({ address });
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } },
) {
  const { userId: clerkId } = await auth();
  if (!clerkId) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { clerkId }, select: { id: true } });
  if (!user) return NextResponse.json({ error: "Introuvable" }, { status: 404 });

  await deleteAddress(user.id, params.id);
  return NextResponse.json({ ok: true });
}
