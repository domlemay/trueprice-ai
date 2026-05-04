import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@trueprice-ai/db";

export async function POST() {
  const { userId: clerkId } = await auth();
  if (!clerkId) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { clerkId }, select: { id: true } });
  if (!user) return NextResponse.json({ error: "Introuvable" }, { status: 404 });

  await prisma.user.update({
    where: { id: user.id },
    data:  { gdprDataExportedAt: new Date() },
  });

  await prisma.usageLog.create({
    data: { userId: user.id, action: "gdpr.data_export_requested" },
  });

  return NextResponse.json({ ok: true });
}
