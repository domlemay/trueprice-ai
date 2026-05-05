import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma, getListById, updateList, deleteList } from "@trueprice-ai/db";

export async function GET(
  _req: Request,
  { params }: { params: { id: string } },
) {
  const { userId: clerkId } = await auth();
  if (!clerkId) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { clerkId }, select: { id: true } });
  if (!user) return NextResponse.json({ error: "Introuvable" }, { status: 404 });

  const list = await getListById(params.id, user.id);
  if (!list) return NextResponse.json({ error: "Liste introuvable" }, { status: 404 });

  return NextResponse.json(list);
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } },
) {
  const { userId: clerkId } = await auth();
  if (!clerkId) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { clerkId }, select: { id: true } });
  if (!user) return NextResponse.json({ error: "Introuvable" }, { status: 404 });

  const body = await req.json() as { name?: string; description?: string; tags?: string[] };
  await updateList(params.id, user.id, body);
  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } },
) {
  const { userId: clerkId } = await auth();
  if (!clerkId) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { clerkId }, select: { id: true } });
  if (!user) return NextResponse.json({ error: "Introuvable" }, { status: 404 });

  await deleteList(params.id, user.id);
  return NextResponse.json({ ok: true });
}
