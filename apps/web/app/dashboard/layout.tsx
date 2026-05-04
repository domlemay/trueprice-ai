import { auth } from "@clerk/nextjs/server";
import { UserButton } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma, getUserOrgs } from "@trueprice-ai/db";
import { CookieBanner } from "@/components/CookieBanner";
import { Building2 } from "lucide-react";

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
  const firstOrg = orgs[0];

  return (
    <div className="min-h-screen bg-tp-navy-700 text-white">
      <header className="border-b border-tp-cyan-500/10 bg-tp-navy-700/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <Link
            href="/"
            className="font-display text-lg font-bold text-white hover:text-tp-cyan-500 transition-colors shrink-0"
          >
            TruePriceAI
          </Link>

          <nav className="hidden md:flex items-center gap-1 text-sm text-slate-400 mx-6 flex-1">
            <Link href="/dashboard" className="px-3 py-1.5 rounded-lg hover:text-white hover:bg-white/5 transition-colors">
              Tableau de bord
            </Link>
            <Link href="/dashboard/recherche" className="px-3 py-1.5 rounded-lg hover:text-white hover:bg-white/5 transition-colors">
              Recherche
            </Link>
            <Link href="/dashboard/favoris" className="px-3 py-1.5 rounded-lg hover:text-white hover:bg-white/5 transition-colors">
              Favoris
            </Link>
            <Link href="/dashboard/abonnement" className="px-3 py-1.5 rounded-lg hover:text-white hover:bg-white/5 transition-colors">
              Abonnement
            </Link>
            <Link href="/dashboard/securite" className="px-3 py-1.5 rounded-lg hover:text-white hover:bg-white/5 transition-colors">
              Sécurité
            </Link>

            {/* Switcher org */}
            {firstOrg && (
              <Link
                href={`/dashboard/organisation/${firstOrg.organization.id}`}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:text-white hover:bg-white/5 transition-colors"
              >
                <Building2 size={13} strokeWidth={1.75} />
                {firstOrg.organization.name}
              </Link>
            )}
            <Link href="/dashboard/organisation" className="px-3 py-1.5 rounded-lg hover:text-white hover:bg-white/5 transition-colors">
              {firstOrg ? "Orgs" : "Organisation"}
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <UserButton />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">{children}</main>

      <CookieBanner />
    </div>
  );
}
