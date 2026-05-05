"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { useClerk } from "@clerk/nextjs";
import {
  Sun, Moon, Globe, LogOut, ChevronDown,
  LayoutDashboard, Search, Heart, Bell, CreditCard,
  Shield, Building2, User, Check, Tag,
  Package, AlertCircle, X,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ── Types ─────────────────────────────────────────────────────────────────────

type OrgSummary = {
  id:      string;
  name:    string;
  logoUrl: string | null;
  plan:    string;
  role:    string;
};

type AppNotification = {
  id:        string;
  type:      string;
  title:     string;
  body:      string;
  link:      string | null;
  isRead:    boolean;
  createdAt: string;
};

type Props = {
  orgs: OrgSummary[];
};

// ── Nav links ─────────────────────────────────────────────────────────────────

const navLinks = [
  { href: "/dashboard",            label: "Tableau de bord", icon: LayoutDashboard },
  { href: "/dashboard/recherche",  label: "Recherche",       icon: Search          },
  { href: "/dashboard/favoris",    label: "Favoris",         icon: Heart           },
  { href: "/dashboard/alertes",    label: "Alertes",         icon: Bell            },
  { href: "/dashboard/abonnement", label: "Abonnement",      icon: CreditCard      },
  { href: "/dashboard/securite",   label: "Sécurité",        icon: Shield          },
];

// Icône par type de notification
const NOTIF_ICONS: Record<string, React.ComponentType<{ size?: number; className?: string; strokeWidth?: number }>> = {
  price_alert:  Tag,
  stock_alert:  Package,
  trial_ending: AlertCircle,
  invitation:   User,
  default:      Bell,
};

// ── Component ─────────────────────────────────────────────────────────────────

export function DashboardNav({ orgs }: Props) {
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
  const [notifOpen,   setNotifOpen]   = useState(false);
  const [notifs,      setNotifs]      = useState<AppNotification[]>([]);
  const [unread,      setUnread]      = useState(0);

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

  // Fetch notifications
  const fetchNotifs = useCallback(async () => {
    try {
      const res = await fetch("/api/notifications");
      if (!res.ok) return;
      const data = await res.json() as { notifications: AppNotification[]; unreadCount: number };
      setNotifs(data.notifications);
      setUnread(data.unreadCount);
    } catch {
      // silently ignore
    }
  }, []);

  useEffect(() => {
    fetchNotifs();
    // Rafraîchir toutes les 60 secondes
    const id = setInterval(fetchNotifs, 60_000);
    return () => clearInterval(id);
  }, [fetchNotifs]);

  async function openNotifPanel() {
    setNotifOpen(true);
    setOrgOpen(false);
    setUserOpen(false);
    // Marquer tout comme lu
    if (unread > 0) {
      setUnread(0);
      setNotifs((prev) => prev.map((n) => ({ ...n, isRead: true })));
      await fetch("/api/notifications", { method: "PATCH" }).catch(() => {});
    }
  }

  function closeAll() {
    setOrgOpen(false);
    setUserOpen(false);
    setNotifOpen(false);
  }

  return (
    <header className="border-b border-tp-cyan-500/10 bg-tp-navy-700/80 dark:bg-tp-navy-700/80 backdrop-blur-sm sticky top-0 z-40">
      <div className="container mx-auto px-6 h-16 flex items-center justify-between gap-4">

        {/* Logo */}
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
                onClick={() => { setOrgOpen(!orgOpen); setUserOpen(false); setNotifOpen(false); }}
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
                      onClick={() => { router.push(`/dashboard/organisation/${org.id}`); setOrgOpen(false); }}
                      className="w-full flex items-center gap-3 px-3 py-2 hover:bg-white/5 transition-colors text-left"
                    >
                      <div className="w-7 h-7 rounded-lg bg-tp-cyan-500/10 border border-tp-cyan-500/20 flex items-center justify-center shrink-0">
                        {org.logoUrl
                          ? <img src={org.logoUrl} alt="" className="w-full h-full object-cover rounded-lg" />
                          : <Building2 size={13} className="text-tp-cyan-500" />}
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
                      onClick={() => { router.push("/dashboard/organisation"); setOrgOpen(false); }}
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
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors whitespace-nowrap"
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
              : <Moon size={16} strokeWidth={1.75} />}
          </button>

          {/* Cloche notifications */}
          <div className="relative">
            <button
              onClick={notifOpen ? closeAll : openNotifPanel}
              title="Notifications"
              aria-label="Notifications"
              className={cn(
                "relative p-2 rounded-lg transition-colors",
                notifOpen
                  ? "text-tp-cyan-500 bg-tp-cyan-500/10"
                  : "text-slate-400 hover:text-white hover:bg-white/5",
              )}
            >
              <Bell size={16} strokeWidth={1.75} />
              {unread > 0 && (
                <span className="absolute top-1 right-1 min-w-[14px] h-[14px] flex items-center justify-center rounded-full bg-tp-cyan-500 text-tp-navy-700 text-[9px] font-bold leading-none px-0.5">
                  {unread > 9 ? "9+" : unread}
                </span>
              )}
            </button>

            {notifOpen && (
              <div className="absolute top-full mt-2 right-0 w-80 bg-tp-navy-600 border border-tp-cyan-500/15 rounded-xl shadow-tp-lg z-50 overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-tp-cyan-500/10">
                  <p className="text-sm font-semibold text-white">Notifications</p>
                  <button
                    onClick={closeAll}
                    className="p-1 rounded-lg text-slate-500 hover:text-white hover:bg-white/5 transition-colors"
                  >
                    <X size={13} />
                  </button>
                </div>

                {/* Liste */}
                <div className="max-h-80 overflow-y-auto">
                  {notifs.length === 0 ? (
                    <div className="px-4 py-8 text-center">
                      <Bell size={24} className="text-slate-600 mx-auto mb-2" strokeWidth={1.5} />
                      <p className="text-slate-500 text-sm">Aucune notification</p>
                    </div>
                  ) : (
                    notifs.map((n) => {
                      const Icon = NOTIF_ICONS[n.type] ?? NOTIF_ICONS.default;
                      const content = (
                        <div
                          className={cn(
                            "flex gap-3 px-4 py-3 border-b border-tp-cyan-500/5 hover:bg-white/5 transition-colors text-left w-full",
                            !n.isRead && "bg-tp-cyan-500/5",
                          )}
                        >
                          <div className="mt-0.5 shrink-0 w-7 h-7 rounded-lg bg-tp-navy-700 flex items-center justify-center">
                            <Icon size={13} className="text-tp-cyan-500" strokeWidth={1.75} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-white font-medium leading-snug">{n.title}</p>
                            <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{n.body}</p>
                            <p className="text-[10px] text-slate-600 mt-1">
                              {new Date(n.createdAt).toLocaleDateString("fr-CA", {
                                day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
                              })}
                            </p>
                          </div>
                          {!n.isRead && (
                            <div className="mt-1.5 shrink-0 w-1.5 h-1.5 rounded-full bg-tp-cyan-500" />
                          )}
                        </div>
                      );

                      return n.link ? (
                        <Link key={n.id} href={n.link} onClick={closeAll}>
                          {content}
                        </Link>
                      ) : (
                        <div key={n.id}>{content}</div>
                      );
                    })
                  )}
                </div>

                {/* Footer */}
                {notifs.length > 0 && (
                  <div className="px-4 py-2 border-t border-tp-cyan-500/10">
                    <Link
                      href="/dashboard/alertes"
                      onClick={closeAll}
                      className="text-xs text-tp-cyan-500 hover:underline"
                    >
                      Voir toutes les alertes →
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* User menu */}
          <div className="relative">
            <button
              onClick={() => { setUserOpen(!userOpen); setOrgOpen(false); setNotifOpen(false); }}
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
