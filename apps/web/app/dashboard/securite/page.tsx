import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { clerkClient } from "@clerk/nextjs/server";
import { ShieldCheck, Monitor, Smartphone, Globe } from "lucide-react";

export default async function SecuritePage() {
  const { userId: clerkId } = await auth();
  if (!clerkId) redirect("/sign-in");

  const client = await clerkClient();
  const sessions = await client.sessions.getSessionList({ userId: clerkId, status: "active" });

  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-white mb-2">Sécurité</h1>
        <p className="text-slate-400 text-sm">
          Gérez vos sessions actives et les appareils connectés à votre compte.
        </p>
      </div>

      {/* Sessions actives */}
      <div className="mb-8">
        <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
          <ShieldCheck size={16} className="text-tp-cyan-500" strokeWidth={1.75} />
          Sessions actives ({sessions.data.length})
        </h2>

        <div className="space-y-3">
          {sessions.data.map((session) => {
            const activity = session.latestActivity;
            const isMobile = activity?.isMobile ?? false;
            const Icon = isMobile ? Smartphone : Monitor;
            const browser = [activity?.browserName, activity?.browserVersion].filter(Boolean).join(" ") || "Navigateur inconnu";
            const location = [activity?.city, activity?.country].filter(Boolean).join(", ") || "Localisation inconnue";

            return (
              <div
                key={session.id}
                className="flex items-center gap-4 px-4 py-3.5 rounded-xl border border-tp-cyan-500/15 bg-tp-navy-card"
              >
                <div className="p-2 rounded-lg bg-tp-navy-600/40 shrink-0">
                  <Icon size={18} className="text-slate-400" strokeWidth={1.75} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium truncate">{browser}</p>
                  <p className="text-slate-500 text-xs">{location}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs text-slate-500">
                    {session.lastActiveAt
                      ? new Date(session.lastActiveAt).toLocaleDateString("fr-CA")
                      : "Récemment"}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recommandations */}
      <div className="rounded-xl border border-tp-cyan-500/15 bg-tp-navy-card p-5">
        <h3 className="text-white font-semibold text-sm mb-3 flex items-center gap-2">
          <Globe size={15} className="text-tp-cyan-500" strokeWidth={1.75} />
          Recommandations de sécurité
        </h3>
        <ul className="space-y-2 text-sm text-slate-400">
          <li className="flex items-start gap-2">
            <span className="text-tp-cyan-500 mt-0.5">·</span>
            Activez l'authentification à deux facteurs depuis les paramètres de votre compte Clerk.
          </li>
          <li className="flex items-start gap-2">
            <span className="text-tp-cyan-500 mt-0.5">·</span>
            Si vous reconnaisez une session suspecte, changez immédiatement votre mot de passe.
          </li>
          <li className="flex items-start gap-2">
            <span className="text-tp-cyan-500 mt-0.5">·</span>
            Ne partagez jamais vos identifiants ou vos clés API.
          </li>
        </ul>
      </div>
    </div>
  );
}
