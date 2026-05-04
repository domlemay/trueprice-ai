"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { UserCircle2, Loader2, Trash2, ChevronDown } from "lucide-react";
import type { OrgRole } from "@prisma/client";

type Member = {
  userId: string; name: string; email: string;
  avatarUrl: string | null; role: OrgRole;
  branch: string | null; joinedAt: string;
};

const ROLES: OrgRole[] = ["ADMIN", "MANAGER", "MEMBER"];
const ROLE_LABEL: Record<OrgRole, string> = { ADMIN: "Admin", MANAGER: "Manager", MEMBER: "Membre" };
const ROLE_COLOR: Record<OrgRole, string> = {
  ADMIN:   "text-tp-cyan-500 border-tp-cyan-500/40",
  MANAGER: "text-amber-400 border-amber-400/40",
  MEMBER:  "text-slate-400 border-slate-600",
};

export function MembersClient({ orgId, members, currentUserId, isAdmin }: {
  orgId: string; members: Member[]; currentUserId: string; isAdmin: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [pending, start] = useTransition();

  async function changeRole(userId: string, role: OrgRole) {
    setLoading(`role-${userId}`);
    await fetch(`/api/org/${orgId}/members/${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role }),
    });
    setLoading(null);
    start(() => { router.refresh(); });
  }

  async function removeMember(userId: string, name: string) {
    if (!confirm(`Retirer ${name} de l'organisation ?`)) return;
    setLoading(`remove-${userId}`);
    await fetch(`/api/org/${orgId}/members/${userId}`, { method: "DELETE" });
    setLoading(null);
    start(() => { router.refresh(); });
  }

  return (
    <div className="rounded-xl border border-tp-cyan-500/15 overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-800 bg-tp-navy-600/20">
            {["Membre", "Rôle", "Succursale", "Depuis", isAdmin ? "Actions" : ""].map((h) => (
              <th key={h} className="text-left px-4 py-3 text-xs text-slate-500 uppercase tracking-wider font-medium">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800">
          {members.map((m) => {
            const isSelf = m.userId === currentUserId;
            const isRoleLoading = loading === `role-${m.userId}`;
            const isRemoveLoading = loading === `remove-${m.userId}`;

            return (
              <tr key={m.userId} className="hover:bg-tp-navy-600/10 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    {m.avatarUrl ? (
                      <img src={m.avatarUrl} alt="" className="w-8 h-8 rounded-full object-cover" />
                    ) : (
                      <UserCircle2 size={32} className="text-slate-600" />
                    )}
                    <div>
                      <p className="text-white font-medium">{m.name}</p>
                      <p className="text-slate-500 text-xs">{m.email}</p>
                    </div>
                  </div>
                </td>

                <td className="px-4 py-3">
                  {isAdmin && !isSelf ? (
                    <div className="relative inline-block">
                      <select
                        value={m.role}
                        onChange={(e) => changeRole(m.userId, e.target.value as OrgRole)}
                        disabled={isRoleLoading}
                        className="appearance-none bg-transparent border border-slate-700 rounded-lg px-3 py-1 text-xs font-bold uppercase tracking-wider pr-7 cursor-pointer hover:border-slate-600 focus:outline-none disabled:opacity-50"
                        style={{ color: m.role === "ADMIN" ? "#00D4C8" : m.role === "MANAGER" ? "#fbbf24" : "#94a3b8" }}
                      >
                        {ROLES.map((r) => <option key={r} value={r}>{ROLE_LABEL[r]}</option>)}
                      </select>
                      {isRoleLoading ? (
                        <Loader2 size={12} className="absolute right-2 top-1/2 -translate-y-1/2 animate-spin text-slate-400" />
                      ) : (
                        <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                      )}
                    </div>
                  ) : (
                    <span className={`text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${ROLE_COLOR[m.role]}`}>
                      {ROLE_LABEL[m.role]}
                    </span>
                  )}
                </td>

                <td className="px-4 py-3 text-slate-400 text-xs">{m.branch ?? "—"}</td>

                <td className="px-4 py-3 text-slate-500 text-xs">
                  {new Date(m.joinedAt).toLocaleDateString("fr-CA")}
                </td>

                {isAdmin && (
                  <td className="px-4 py-3">
                    {!isSelf && (
                      <button
                        onClick={() => removeMember(m.userId, m.name)}
                        disabled={isRemoveLoading || pending}
                        className="p-1.5 rounded-lg text-slate-600 hover:text-rose-400 hover:bg-rose-400/10 transition-colors disabled:opacity-50"
                        aria-label="Retirer le membre"
                      >
                        {isRemoveLoading ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
                      </button>
                    )}
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
