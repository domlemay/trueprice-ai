import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-tp-navy-700 flex flex-col items-center justify-center px-4 py-12">
      <Link
        href="/"
        className="mb-8 font-display text-2xl font-bold text-white tracking-tight hover:text-tp-cyan-500 transition-colors"
      >
        TruePriceAI
      </Link>

      {children}

      <p className="mt-8 text-sm text-slate-500">
        © 2026 TruePriceAI — Tous droits réservés
      </p>
    </div>
  );
}
