"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Loader2 } from "lucide-react";

export function AcceptButton({ token, orgId }: { token: string; orgId: string }) {
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const router = useRouter();

  async function accept() {
    setLoading(true);
    const res = await fetch(`/api/invitations/${token}/accept`, { method: "POST" });
    const data = await res.json() as { ok?: boolean; error?: string };
    if (data.ok) {
      setDone(true);
      setTimeout(() => router.push(`/dashboard/organisation/${orgId}`), 1200);
    } else {
      alert(data.error ?? "Erreur lors de l'acceptation.");
      setLoading(false);
    }
  }

  return (
    <button
      onClick={accept}
      disabled={loading || done}
      className="w-full flex items-center justify-center gap-2 bg-tp-cyan-500 text-tp-navy-700 font-semibold py-3 rounded-xl hover:-translate-y-0.5 hover:shadow-tp-glow transition-all disabled:opacity-70 disabled:translate-y-0"
    >
      {done ? (
        <><CheckCircle2 size={18} /> Invitation acceptée !</>
      ) : loading ? (
        <><Loader2 size={18} className="animate-spin" /> Acceptation…</>
      ) : (
        "Rejoindre l'organisation"
      )}
    </button>
  );
}
