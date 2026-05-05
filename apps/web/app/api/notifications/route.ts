import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma, getUserNotifications, getUnreadCount, markAllNotificationsRead } from "@trueprice-ai/db";

export async function GET() {
  const { userId: clerkId } = await auth();
  if (!clerkId) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { clerkId }, select: { id: true } });
  if (!user) return NextResponse.json({ error: "Introuvable" }, { status: 404 });

  const [notifications, unreadCount] = await Promise.all([
    getUserNotifications(user.id, 30),
    getUnreadCount(user.id),
  ]);

  return NextResponse.json({ notifications, unreadCount });
}

export async function PATCH() {
  const { userId: clerkId } = await auth();
  if (!clerkId) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { clerkId }, select: { id: true } });
  if (!user) return NextResponse.json({ error: "Introuvable" }, { status: 404 });

  await markAllNotificationsRead(user.id);
  return NextResponse.json({ ok: true });
}
