import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma, markNotificationRead } from "@trueprice-ai/db";

export async function PATCH(
  _req: Request,
  { params }: { params: { id: string } },
) {
  const { userId: clerkId } = await auth();
  if (!clerkId) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { clerkId }, select: { id: true } });
  if (!user) return NextResponse.json({ error: "Introuvable" }, { status: 404 });

  await markNotificationRead(user.id, params.id);
  return NextResponse.json({ ok: true });
}
