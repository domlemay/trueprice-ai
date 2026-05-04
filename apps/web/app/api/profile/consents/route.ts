import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@trueprice-ai/db";
import { headers } from "next/headers";

export async function POST(req: Request) {
  const { userId: clerkId } = await auth();
  if (!clerkId) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { clerkId }, select: { id: true } });
  if (!user) return NextResponse.json({ error: "Introuvable" }, { status: 404 });

  const { analytics, marketing } = await req.json() as { analytics: boolean; marketing: boolean };
  const ip = headers().get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;

  await prisma.consentLog.createMany({
    data: [
      { userId: user.id, type: "ANALYTICS", granted: analytics, version: "1.0.0", ipAddress: ip },
      { userId: user.id, type: "MARKETING", granted: marketing, version: "1.0.0", ipAddress: ip },
    ],
  });

  return NextResponse.json({ ok: true });
}
