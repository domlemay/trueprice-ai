import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma, getUserLists, createList } from "@trueprice-ai/db";
import type { ListType } from "@prisma/client";

export async function GET() {
  const { userId: clerkId } = await auth();
  if (!clerkId) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { clerkId }, select: { id: true } });
  if (!user) return NextResponse.json({ error: "Introuvable" }, { status: 404 });

  const lists = await getUserLists(user.id);
  return NextResponse.json(lists);
}

export async function POST(req: Request) {
  const { userId: clerkId } = await auth();
  if (!clerkId) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { clerkId }, select: { id: true } });
  if (!user) return NextResponse.json({ error: "Introuvable" }, { status: 404 });

  const body = await req.json() as { name?: string; type?: string; description?: string; tags?: string[] };
  if (!body.name?.trim()) return NextResponse.json({ error: "Nom requis" }, { status: 400 });

  const list = await createList({
    userId:      user.id,
    name:        body.name.trim(),
    type:        (body.type as ListType) ?? "STANDARD",
    description: body.description,
    tags:        body.tags,
  });
  return NextResponse.json(list, { status: 201 });
}
