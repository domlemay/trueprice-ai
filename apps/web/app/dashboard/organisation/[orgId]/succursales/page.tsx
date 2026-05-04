import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma, isOrgAdmin } from "@trueprice-ai/db";
import { BranchesClient } from "./BranchesClient";

export default async function SuccursalesPage({ params }: { params: { orgId: string } }) {
  const { userId: clerkId } = await auth();
  if (!clerkId) redirect("/sign-in");

  const user = await prisma.user.findUnique({ where: { clerkId }, select: { id: true } });
  if (!user) redirect("/dashboard");

  const [branches, isAdmin] = await Promise.all([
    prisma.branch.findMany({
      where:   { organizationId: params.orgId },
      orderBy: { createdAt: "asc" },
    }),
    isOrgAdmin(params.orgId, user.id),
  ]);

  return (
    <div>
      <div className="mb-6">
        <h2 className="font-display text-xl font-bold text-white">Succursales</h2>
        <p className="text-slate-400 text-sm mt-0.5">
          Organisez vos membres par lieu. Chaque succursale peut avoir sa propre devise et timezone.
        </p>
      </div>
      <BranchesClient orgId={params.orgId} branches={branches.map((b) => ({
        id: b.id, name: b.name, country: b.country,
        province: b.province, city: b.city,
        timezone: b.timezone, currency: b.currency,
        isHeadquarters: b.isHeadquarters,
      }))} isAdmin={isAdmin} />
    </div>
  );
}
