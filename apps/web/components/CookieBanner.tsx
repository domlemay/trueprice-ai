"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Cookie, X } from "lucide-react";

const STORAGE_KEY = "tp_cookie_consent";

export function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) setVisible(true);
  }, []);

  function accept() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ analytics: true, marketing: false, ts: Date.now() }));
    setVisible(false);
  }

  function decline() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ analytics: false, marketing: false, ts: Date.now() }));
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:max-w-sm z-50">
      <div className="bg-tp-navy-card border border-tp-cyan-500/20 rounded-2xl p-5 shadow-xl">
        <div className="flex items-start gap-3 mb-3">
          <Cookie size={18} className="text-tp-cyan-500 shrink-0 mt-0.5" strokeWidth={1.75} />
          <div className="flex-1">
            <p className="text-white font-semibold text-sm mb-1">Témoins de connexion</p>
            <p className="text-slate-400 text-xs leading-relaxed">
              Nous utilisons des témoins pour améliorer votre expérience. Consultez notre{" "}
              <Link href="/legal/confidentialite" className="text-tp-cyan-500/80 hover:text-tp-cyan-500 underline">
                politique de confidentialité
              </Link>.
            </p>
          </div>
          <button onClick={decline} className="text-slate-600 hover:text-slate-400 shrink-0" aria-label="Refuser">
            <X size={16} />
          </button>
        </div>
        <div className="flex gap-2">
          <button
            onClick={decline}
            className="flex-1 py-2 text-xs font-medium text-slate-400 border border-slate-700 rounded-lg hover:border-slate-600 hover:text-white transition-colors"
          >
            Refuser
          </button>
          <button
            onClick={accept}
            className="flex-1 py-2 text-xs font-semibold text-tp-navy-700 bg-tp-cyan-500 rounded-lg hover:shadow-tp-glow transition-shadow"
          >
            Accepter
          </button>
        </div>
      </div>
    </div>
  );
}
