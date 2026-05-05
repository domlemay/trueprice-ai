import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
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

  let user = await prisma.user.findUnique({
    where:  { clerkId: userId },
    select: { id: true, onboardingCompletedAt: true },
  });

  // En dev local le webhook Clerk ne se déclenche pas sans tunnel ngrok.
  // Si l'utilisateur existe dans Clerk mais pas en BD, on le crée automatiquement.
  if (!user) {
    const clerkUser = await currentUser();
    const email = clerkUser?.emailAddresses[0]?.emailAddress;
    if (clerkUser && email) {
      try {
        user = await prisma.user.upsert({
          where:  { clerkId: userId },
          create: {
            clerkId:              userId,
            email,
            name:                 [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ") || null,
            avatarUrl:            clerkUser.imageUrl || null,
            onboardingCompletedAt: new Date(), // compte déjà actif, skip onboarding
          },
          update: {},
          select: { id: true, onboardingCompletedAt: true },
        });
      } catch {
        // Race condition — re-lire
        user = await prisma.user.findUnique({
          where:  { clerkId: userId },
          select: { id: true, onboardingCompletedAt: true },
        });
      }
    }
  }

  if (user && !user.onboardingCompletedAt) redirect("/onboarding");

  const orgs = user ? await getUserOrgs(user.id) : [];

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
      />

      <main className="container mx-auto px-6 py-8">{children}</main>

      <CookieBanner />
    </div>
  );
}
