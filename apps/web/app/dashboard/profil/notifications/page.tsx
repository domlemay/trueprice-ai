import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@trueprice-ai/db";
import { NotificationsClient } from "./NotificationsClient";

export default async function NotificationsPage() {
  const { userId: clerkId } = await auth();
  if (!clerkId) redirect("/sign-in");

  const user = await prisma.user.findUnique({ where: { clerkId }, select: { id: true } });
  if (!user) redirect("/dashboard");

  const prefs = await prisma.notificationPreference.findMany({ where: { userId: user.id } });

  const map = Object.fromEntries(prefs.map((p) => [`${p.type}:${p.channel}`, p.enabled]));

  return (
    <div className="max-w-xl">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-white mb-2">Notifications</h1>
        <p className="text-slate-400 text-sm">Choisissez comment et quand vous souhaitez être informé.</p>
      </div>
      <NotificationsClient userId={user.id} prefMap={map} />
    </div>
  );
}
