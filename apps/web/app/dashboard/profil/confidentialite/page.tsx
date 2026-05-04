import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@trueprice-ai/db";
import { PrivacyClient } from "./PrivacyClient";

export default async function ConfidentialitePage() {
  const { userId: clerkId } = await auth();
  if (!clerkId) redirect("/sign-in");

  const user = await prisma.user.findUnique({
    where:   { clerkId },
    select:  { id: true, gdprDeleteRequestedAt: true, gdprDataExportedAt: true },
  });
  if (!user) redirect("/dashboard");

  const consents = await prisma.consentLog.findMany({
    where:   { userId: user.id, type: { in: ["ANALYTICS", "MARKETING"] } },
    orderBy: { createdAt: "desc" },
    take:    2,
  });

  const latestAnalytics = consents.find((c) => c.type === "ANALYTICS");
  const latestMarketing = consents.find((c) => c.type === "MARKETING");

  return (
    <div className="max-w-xl">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-white mb-2">Confidentialité</h1>
        <p className="text-slate-400 text-sm">
          Gérez vos consentements et vos données personnelles (Loi 25 / RGPD).
        </p>
      </div>
      <PrivacyClient
        userId={user.id}
        consentAnalytics={latestAnalytics?.granted ?? false}
        consentMarketing={latestMarketing?.granted ?? false}
        deleteRequestedAt={user.gdprDeleteRequestedAt?.toISOString() ?? null}
        dataExportedAt={user.gdprDataExportedAt?.toISOString() ?? null}
      />
    </div>
  );
}
