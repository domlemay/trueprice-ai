import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma, addItemToList } from "@trueprice-ai/db";

export async function POST(
  req: Request,
  { params }: { params: { id: string } },
) {
  const { userId: clerkId } = await auth();
  if (!clerkId) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { clerkId }, select: { id: true } });
  if (!user) return NextResponse.json({ error: "Introuvable" }, { status: 404 });

  const body = await req.json() as { query?: string; productId?: string; quantity?: number; notes?: string };
  if (!body.query?.trim() && !body.productId) {
    return NextResponse.json({ error: "query ou productId requis" }, { status: 400 });
  }

  try {
    const item = await addItemToList(params.id, user.id, {
      query:     body.query?.trim(),
      productId: body.productId,
      quantity:  body.quantity,
      notes:     body.notes,
    });
    return NextResponse.json(item, { status: 201 });
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Erreur" }, { status: 400 });
  }
}
