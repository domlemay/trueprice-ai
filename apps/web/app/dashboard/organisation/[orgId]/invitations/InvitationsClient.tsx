"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Mail, Plus, Copy, Trash2, Loader2, Check } from "lucide-react";
import type { OrgRole } from "@prisma/client";

type Invite = { id: string; email: string; role: OrgRole; expiresAt: string; createdAt: string };

const ROLE_LABEL: Record<OrgRole, string> = { ADMIN: "Admin", MANAGER: "Manager", MEMBER: "Membre" };

export function InvitationsClient({ orgId, pending, isAdmin, appUrl }: {
  orgId: string; pending: Invite[]; isAdmin: boolean; appUrl: string;
}) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<OrgRole>("MEMBER");
  const [newToken, setNewToken] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [sending, startSend] = useTransition();
  const [canceling, startCancel] = useTransition();

  function sendInvite() {
    if (!email.includes("@")) return;
    startSend(async () => {
      const res = await fetch(`/api/org/${orgId}/invite`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, role }),
      });
      const data = await res.json() as { token?: string; error?: string };
      if (data.token) {
        setNewToken(data.token);
        setEmail("");
        router.refresh();
      } else {
        alert(data.error ?? "Erreur lors de l'invitation.");
      }
    });
  }

  function copyLink(token: string) {
    navigator.clipboard.writeText(`${appUrl}/invitations/${token}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function cancelInvite(id: string) {
    startCancel(async () => {
      await fetch(`/api/org/${orgId}/invitations/${id}`, { method: "DELETE" });
      router.refresh();
    });
  }

  return (
    <div className="space-y-6">
      {/* Formulaire d'invitation */}
      {isAdmin && (
        <div className="rounded-xl border border-tp-cyan-500/15 bg-tp-navy-card p-5">
          <h3 className="text-white font-semibold text-sm mb-4 flex items-center gap-2">
            <Plus size={15} className="text-tp-cyan-500" /> Envoyer une invitation
          </h3>
          <div className="flex gap-3">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendInvite()}
              placeholder="courriel@exemple.com"
              className="flex-1 bg-tp-navy-600/40 border border-slate-700 rounded-lg px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-tp-cyan-500/50"
            />
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as OrgRole)}
              className="bg-tp-navy-600/40 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-tp-cyan-500/50"
            >
              {(["MEMBER", "MANAGER", "ADMIN"] as OrgRole[]).map((r) => (
                <option key={r} value={r}>{ROLE_LABEL[r]}</option>
              ))}
            </select>
            <button
              onClick={sendInvite}
              disabled={sending || !email.includes("@")}
              className="flex items-center gap-2 bg-tp-cyan-500 text-tp-navy-700 font-semibold text-sm px-4 py-2.5 rounded-lg hover:-translate-y-0.5 hover:shadow-tp-glow transition-all disabled:opacity-60 disabled:translate-y-0 shrink-0"
            >
              {sending ? <Loader2 size={15} className="animate-spin" /> : <Mail size={15} />}
              Inviter
            </button>
          </div>

          {newToken && (
            <div className="mt-4 flex items-center gap-3 bg-tp-navy-600/30 border border-tp-cyan-500/20 rounded-lg px-4 py-3">
              <code className="text-xs text-slate-300 flex-1 truncate">
                {appUrl}/invitations/{newToken}
              </code>
              <button
                onClick={() => copyLink(newToken)}
                className="shrink-0 flex items-center gap-1.5 text-xs text-tp-cyan-500 hover:text-tp-cyan-400 transition-colors"
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
                {copied ? "Copié !" : "Copier"}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Invitations en attente */}
      {pending.length > 0 ? (
        <div className="rounded-xl border border-tp-cyan-500/15 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-800 bg-tp-navy-600/20">
                {["Email", "Rôle", "Expire le", isAdmin ? "Actions" : ""].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs text-slate-500 uppercase tracking-wider font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {pending.map((inv) => (
                <tr key={inv.id} className="hover:bg-tp-navy-600/10 transition-colors">
                  <td className="px-4 py-3 text-white">{inv.email}</td>
                  <td className="px-4 py-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400 border border-slate-600 px-2 py-0.5 rounded-full">
                      {ROLE_LABEL[inv.role]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-400 text-xs">
                    {new Date(inv.expiresAt).toLocaleDateString("fr-CA")}
                  </td>
                  {isAdmin && (
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => copyLink(inv.id)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-tp-cyan-500 hover:bg-tp-cyan-500/10 transition-colors"
                          aria-label="Copier le lien"
                        >
                          <Copy size={14} />
                        </button>
                        <button
                          onClick={() => cancelInvite(inv.id)}
                          disabled={canceling}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-400/10 transition-colors"
                          aria-label="Annuler l'invitation"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-slate-500 text-sm text-center py-8">Aucune invitation en attente.</p>
      )}
    </div>
  );
}
