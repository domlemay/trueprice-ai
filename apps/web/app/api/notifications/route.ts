import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma, getUserNotifications, getUnreadCount, markAllNotificationsRead } from "@trueprice-ai/db";

export async function GET() {
  const { userId: clerkId } = await auth();
  if (!clerkId) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { clerkId }, select: { id: true } });
  if (!user) return NextResponse.json({ notifications: [], unreadCount: 0 });

  const [notifications, unreadCount] = await Promise.all([
    getUserNotifications(user.id, 30),
    getUnreadCount(user.id),
  ]);

  return NextResponse.json({
    notifications: notifications.map((n) => ({
      id:        n.id,
      type:      n.type,
      title:     n.title,
      body:      n.body,
      link:      n.link,
      isRead:    n.isRead,
      createdAt: n.createdAt.toISOString(),
    })),
    unreadCount,
  });
}

export async function PATCH() {
  const { userId: clerkId } = await auth();
  if (!clerkId) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { clerkId }, select: { id: true } });
  if (!user) return NextResponse.json({ ok: true });

  await markAllNotificationsRead(user.id);
  return NextResponse.json({ ok: true });
}
