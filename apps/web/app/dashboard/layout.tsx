import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { prisma, getUserOrgs } from "@trueprice-ai/db";
import { CookieBanner } from "@/components/CookieBanner";
import { DashboardNav } from "./DashboardNav";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const user = await prisma.user.findUnique({
    where:  { clerkId: userId },
    select: { id: true, onboardingCompletedAt: true },
  });
  if (user && !user.onboardingCompletedAt) redirect("/onboarding");

  const orgs = user ? await getUserOrgs(user.id) : [];

  const headersList = await headers();
  const currentPath = headersList.get("x-pathname") ?? "/dashboard";

  return (
    <div className="min-h-screen bg-tp-navy-700 dark:bg-tp-navy-700 text-white">
      <DashboardNav
        orgs={orgs.map((m) => ({
          id:      m.organization.id,
          name:    m.organization.name,
          logoUrl: m.organization.logoUrl,
          plan:    m.organization.plan,
          role:    m.role,
        }))}
        currentPath={currentPath}
      />

      <main className="container mx-auto px-6 py-8">{children}</main>

      <CookieBanner />
    </div>
  );
}
