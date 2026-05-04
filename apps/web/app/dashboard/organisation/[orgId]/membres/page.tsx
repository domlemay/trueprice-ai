import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma, getOrgWithMembers, isOrgAdmin } from "@trueprice-ai/db";
import { MembersClient } from "./MembersClient";

export default async function MembresPage({ params }: { params: { orgId: string } }) {
  const { userId: clerkId } = await auth();
  if (!clerkId) redirect("/sign-in");

  const user = await prisma.user.findUnique({ where: { clerkId }, select: { id: true } });
  if (!user) redirect("/dashboard");

  const [org, isAdmin] = await Promise.all([
    getOrgWithMembers(params.orgId),
    isOrgAdmin(params.orgId, user.id),
  ]);
  if (!org) redirect("/dashboard/organisation");

  const members = org.memberships.filter((m) => !m.removedAt).map((m) => ({
    userId:    m.userId,
    name:      m.user.name ?? m.user.email,
    email:     m.user.email,
    avatarUrl: m.user.avatarUrl,
    role:      m.role,
    branch:    m.branch?.name ?? null,
    joinedAt:  m.joinedAt.toISOString(),
  }));

  return (
    <div>
      <div className="mb-6">
        <h2 className="font-display text-xl font-bold text-white">Membres</h2>
        <p className="text-slate-400 text-sm mt-0.5">
          {members.length} membre{members.length !== 1 ? "s" : ""} actif{members.length !== 1 ? "s" : ""} · {org.maxSeats} sièges
        </p>
      </div>
      <MembersClient
        orgId={params.orgId}
        members={members}
        currentUserId={user.id}
        isAdmin={isAdmin}
      />
    </div>
  );
}
