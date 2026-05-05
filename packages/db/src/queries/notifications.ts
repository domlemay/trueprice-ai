import { prisma } from "../index";

export async function createNotification(data: {
  userId: string;
  type:   string;
  title:  string;
  body:   string;
  link?:  string;
}) {
  return prisma.notification.create({ data });
}

export async function getUserNotifications(userId: string, limit = 30) {
  return prisma.notification.findMany({
    where:   { userId },
    orderBy: { createdAt: "desc" },
    take:    limit,
  });
}

export async function getUnreadCount(userId: string): Promise<number> {
  return prisma.notification.count({ where: { userId, isRead: false } });
}

export async function markNotificationRead(userId: string, notificationId: string) {
  return prisma.notification.updateMany({
    where: { id: notificationId, userId },
    data:  { isRead: true },
  });
}

export async function markAllNotificationsRead(userId: string) {
  return prisma.notification.updateMany({
    where: { userId, isRead: false },
    data:  { isRead: true },
  });
}

export async function deleteOldNotifications(userId: string, keepDays = 30) {
  const cutoff = new Date(Date.now() - keepDays * 24 * 60 * 60 * 1_000);
  return prisma.notification.deleteMany({
    where: { userId, createdAt: { lt: cutoff }, isRead: true },
  });
}
