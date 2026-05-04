import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma, getSearchById } from "@trueprice-ai/db";

export async function GET(
  _req: Request,
  { params }: { params: { id: string } },
) {
  const { userId: clerkId } = await auth();
  if (!clerkId) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { clerkId }, select: { id: true } });
  if (!user) return NextResponse.json({ error: "Introuvable" }, { status: 404 });

  const search = await getSearchById(params.id);
  if (!search) return NextResponse.json({ error: "Recherche introuvable" }, { status: 404 });
  if (search.userId !== user.id) return NextResponse.json({ error: "Accès refusé" }, { status: 403 });

  const status = search.offers.length > 0 ? "completed" : "pending";

  return NextResponse.json({ status, search });
}
