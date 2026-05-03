import { auth } from "@clerk/nextjs/server";
import { UserButton } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  return (
    <div className="min-h-screen bg-tp-navy-700 text-white">
      <header className="border-b border-tp-cyan-500/10 bg-tp-navy-700/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <Link
            href="/"
            className="font-display text-lg font-bold text-white hover:text-tp-cyan-500 transition-colors"
          >
            TruePriceAI
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-sm text-slate-400">
            <Link href="/dashboard" className="hover:text-white transition-colors">
              Tableau de bord
            </Link>
            <Link href="/dashboard/recherches" className="hover:text-white transition-colors">
              Recherches
            </Link>
            <Link href="/dashboard/abonnement" className="hover:text-white transition-colors">
              Abonnement
            </Link>
          </nav>

          <UserButton afterSignOutUrl="/" />
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">{children}</main>
    </div>
  );
}
