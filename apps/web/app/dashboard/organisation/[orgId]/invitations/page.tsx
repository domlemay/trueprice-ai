import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma, getOrgWithMembers, isOrgAdmin } from "@trueprice-ai/db";
import { InvitationsClient } from "./InvitationsClient";

export default async function InvitationsPage({ params }: { params: { orgId: string } }) {
  const { userId: clerkId } = await auth();
  if (!clerkId) redirect("/sign-in");

  const user = await prisma.user.findUnique({ where: { clerkId }, select: { id: true } });
  if (!user) redirect("/dashboard");

  const [org, isAdmin] = await Promise.all([
    getOrgWithMembers(params.orgId),
    isOrgAdmin(params.orgId, user.id),
  ]);
  if (!org) redirect("/dashboard/organisation");

  const pending = org.invitations.map((inv) => ({
    id:        inv.id,
    email:     inv.email,
    role:      inv.role,
    expiresAt: inv.expiresAt.toISOString(),
    createdAt: inv.createdAt.toISOString(),
  }));

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  return (
    <div>
      <div className="mb-6">
        <h2 className="font-display text-xl font-bold text-white">Invitations</h2>
        <p className="text-slate-400 text-sm mt-0.5">
          Invitez des membres par courriel. Le lien expire après 7 jours.
        </p>
      </div>
      <InvitationsClient orgId={params.orgId} pending={pending} isAdmin={isAdmin} appUrl={appUrl} />
    </div>
  );
}
