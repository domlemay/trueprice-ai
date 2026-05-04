"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { useClerk } from "@clerk/nextjs";
import {
  Sun, Moon, Globe, LogOut, ChevronDown,
  LayoutDashboard, Search, Heart, Bell, CreditCard,
  Shield, Building2, User, Check,
} from "lucide-react";
import { cn } from "@/lib/utils";

type OrgSummary = {
  id:       string;
  name:     string;
  logoUrl:  string | null;
  plan:     string;
  role:     string;
};

type Props = {
  orgs:        OrgSummary[];
  currentPath: string;
};

const navLinks = [
  { href: "/dashboard",            label: "Tableau de bord", icon: LayoutDashboard },
  { href: "/dashboard/recherche",  label: "Recherche",       icon: Search     },
  { href: "/dashboard/favoris",    label: "Favoris",         icon: Heart      },
  { href: "/dashboard/alertes",    label: "Alertes",         icon: Bell       },
  { href: "/dashboard/abonnement", label: "Abonnement",      icon: CreditCard },
  { href: "/dashboard/securite",   label: "Sécurité",        icon: Shield     },
];

export function DashboardNav({ orgs, currentPath }: Props) {
  const { theme, setTheme } = useTheme();
  const { signOut }         = useClerk();
  const pathname            = usePathname();
  const router              = useRouter();

  const [lang,        setLang]        = useState<"fr" | "en">(() => {
    if (typeof window !== "undefined") {
      return (localStorage.getItem("lang") as "fr" | "en") ?? "fr";
    }
    return "fr";
  });
  const [orgOpen,     setOrgOpen]     = useState(false);
  const [userOpen,    setUserOpen]    = useState(false);

  const isActive = (href: string) =>
    href === "/dashboard" ? pathname === href : pathname.startsWith(href);

  function toggleLang() {
    const next = lang === "fr" ? "en" : "fr";
    setLang(next);
    localStorage.setItem("lang", next);
  }

  const inOrgSection = pathname.startsWith("/dashboard/organisation");
  const currentOrgId = inOrgSection
    ? pathname.split("/dashboard/organisation/")[1]?.split("/")[0]
    : null;
  const currentOrg = orgs.find((o) => o.id === currentOrgId);

  return (
    <header className="border-b border-tp-cyan-500/10 bg-tp-navy-700/80 dark:bg-tp-navy-700/80 backdrop-blur-sm sticky top-0 z-40">
      <div className="container mx-auto px-6 h-16 flex items-center justify-between gap-4">

        {/* Logo → accueil */}
        <Link
          href="/"
          className="font-display text-lg font-bold text-white hover:text-tp-cyan-500 transition-colors shrink-0"
        >
          TruePrice<span className="text-tp-cyan-500">AI</span>
        </Link>

        {/* Nav links */}
        <nav className="hidden lg:flex items-center gap-0.5 text-sm flex-1 overflow-x-auto">
          {navLinks.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap",
                isActive(href)
                  ? "text-tp-cyan-500 bg-tp-cyan-500/10"
                  : "text-slate-400 hover:text-white hover:bg-white/5",
              )}
            >
              <Icon size={13} strokeWidth={1.75} />
              {label}
            </Link>
          ))}

          {/* Org switcher */}
          {orgs.length > 0 && (
            <div className="relative">
              <button
                onClick={() => { setOrgOpen(!orgOpen); setUserOpen(false); }}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap",
                  inOrgSection
                    ? "text-tp-cyan-500 bg-tp-cyan-500/10"
                    : "text-slate-400 hover:text-white hover:bg-white/5",
                )}
              >
                <Building2 size={13} strokeWidth={1.75} />
                {currentOrg?.name ?? "Organisation"}
                <ChevronDown size={11} className={cn("transition-transform", orgOpen && "rotate-180")} />
              </button>

              {orgOpen && (
                <div className="absolute top-full mt-2 left-0 w-56 bg-tp-navy-600 border border-tp-cyan-500/15 rounded-xl shadow-tp-lg py-1 z-50">
                  <p className="px-3 py-2 text-[10px] text-slate-500 uppercase tracking-wider font-medium">
                    Organisations
                  </p>
                  {orgs.map((org) => (
                    <button
                      key={org.id}
                      onClick={() => {
                        router.push(`/dashboard/organisation/${org.id}`);
                        setOrgOpen(false);
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2 hover:bg-white/5 transition-colors text-left"
                    >
                      <div className="w-7 h-7 rounded-lg bg-tp-cyan-500/10 border border-tp-cyan-500/20 flex items-center justify-center shrink-0">
                        {org.logoUrl
                          ? <img src={org.logoUrl} alt="" className="w-full h-full object-cover rounded-lg" />
                          : <Building2 size={13} className="text-tp-cyan-500" />
                        }
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white truncate">{org.name}</p>
                        <p className="text-[10px] text-slate-500">{org.role}</p>
                      </div>
                      {org.id === currentOrgId && <Check size={13} className="text-tp-cyan-500 shrink-0" />}
                    </button>
                  ))}
                  <div className="border-t border-tp-cyan-500/10 mt-1 pt-1">
                    <button
                      onClick={() => {
                        router.push("/dashboard/organisation");
                        setOrgOpen(false);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-400 hover:text-white hover:bg-white/5 transition-colors text-left"
                    >
                      <Building2 size={13} strokeWidth={1.75} />
                      Gérer les organisations
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {orgs.length === 0 && (
            <Link
              href="/dashboard/organisation"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-white/5 transition-colors whitespace-nowrap text-xs"
            >
              <Building2 size={13} strokeWidth={1.75} />
              + Créer une org
            </Link>
          )}
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-1 shrink-0">

          {/* Langue */}
          <button
            onClick={toggleLang}
            title="Changer la langue"
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors text-xs font-medium"
          >
            <Globe size={14} strokeWidth={1.75} />
            {lang.toUpperCase()}
          </button>

          {/* Thème */}
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            title={theme === "dark" ? "Mode clair" : "Mode sombre"}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            {theme === "dark"
              ? <Sun  size={16} strokeWidth={1.75} />
              : <Moon size={16} strokeWidth={1.75} />
            }
          </button>

          {/* User menu */}
          <div className="relative">
            <button
              onClick={() => { setUserOpen(!userOpen); setOrgOpen(false); }}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
            >
              <User size={16} strokeWidth={1.75} />
              <ChevronDown size={11} className={cn("transition-transform", userOpen && "rotate-180")} />
            </button>

            {userOpen && (
              <div className="absolute top-full mt-2 right-0 w-48 bg-tp-navy-600 border border-tp-cyan-500/15 rounded-xl shadow-tp-lg py-1 z-50">
                <Link
                  href="/dashboard/profil"
                  onClick={() => setUserOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
                >
                  <User size={14} strokeWidth={1.75} />
                  Mon profil
                </Link>
                <Link
                  href="/dashboard/abonnement"
                  onClick={() => setUserOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
                >
                  <CreditCard size={14} strokeWidth={1.75} />
                  Abonnement
                </Link>
                <div className="border-t border-tp-cyan-500/10 mt-1 pt-1">
                  <button
                    onClick={() => signOut({ redirectUrl: "/" })}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors text-left"
                  >
                    <LogOut size={14} strokeWidth={1.75} />
                    Se déconnecter
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
