import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@trueprice-ai/db";

export async function POST(req: Request) {
  const { userId: clerkId } = await auth();
  if (!clerkId) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { clerkId }, select: { id: true } });
  if (!user) return NextResponse.json({ error: "Introuvable" }, { status: 404 });

  const { updates } = await req.json() as {
    updates: { type: string; channel: string; enabled: boolean }[];
  };

  for (const { type, channel, enabled } of updates) {
    await prisma.notificationPreference.updateMany({
      where: { userId: user.id, type, channel: channel as "EMAIL" | "IN_APP" },
      data:  { enabled },
    });
  }

  return NextResponse.json({ ok: true });
}
