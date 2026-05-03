"use client";

import React from "react";
import Link from "next/link";
import { TrendingUp, Mail, MessageCircle, Rss } from "lucide-react";

const footerLinks = {
  Produit: [
    { label: "Fonctionnalités", href: "#fonctionnalites" },
    { label: "Tarifs", href: "#tarifs" },
    { label: "Boutiques supportées", href: "/boutiques" },
    { label: "Feuille de route", href: "/roadmap" },
  ],
  Entreprises: [
    { label: "Veille concurrentielle", href: "#entreprises" },
    { label: "Procurement B2B", href: "#entreprises" },
    { label: "Intégrations", href: "/integrations" },
    { label: "Nous contacter", href: "/contact" },
  ],
  Ressources: [
    { label: "Blog", href: "/blog" },
    { label: "Guide des douanes CA", href: "/guide-douanes" },
    { label: "Calculateur ACEUM", href: "/calculateur" },
    { label: "FAQ", href: "#faq" },
  ],
  Légal: [
    { label: "Conditions d'utilisation", href: "/cgu" },
    { label: "Politique de confidentialité", href: "/confidentialite" },
    { label: "Politique des cookies", href: "/cookies" },
  ],
};

export function Footer() {
  return (
    <footer className="bg-tp-navy-600 border-t border-tp-cyan-500/10">
      <div className="container mx-auto px-4 max-w-7xl py-16">
        <div className="grid lg:grid-cols-5 gap-10 mb-12">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4 group">
              <div className="w-8 h-8 bg-tp-cyan-500/15 border border-tp-cyan-500/30 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                <TrendingUp className="w-4 h-4 text-tp-cyan-500" />
              </div>
              <span className="font-display font-bold text-xl text-white">
                TruePrice<span className="text-tp-cyan-500">AI</span>
              </span>
            </Link>
            <p className="text-white/40 text-sm leading-relaxed mb-4">
              Comparez les vrais coûts. Trouvez le meilleur prix, tous marchés confondus.
            </p>
            <div className="flex items-center gap-2 text-xs text-white/30">
              <span>🍁</span>
              <span>Fait au Québec, Canada</span>
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="font-semibold text-xs text-white/50 uppercase tracking-[0.12em] mb-4">
                {category}
              </h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-white/40 hover:text-tp-cyan-500 transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="border-t border-tp-cyan-500/10 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-white/30">
            © {new Date().getFullYear()} TruePriceAI. Tous droits réservés.
          </p>
          <div className="flex items-center gap-3">
            <a
              href="mailto:bonjour@trueprice.ai"
              className="w-9 h-9 bg-white/5 border border-tp-cyan-500/15 rounded-lg flex items-center justify-center hover:bg-tp-cyan-500/10 hover:border-tp-cyan-500/40 transition-all"
              aria-label="Email"
            >
              <Mail className="w-4 h-4 text-white/50" />
            </a>
            <a
              href="#"
              className="w-9 h-9 bg-white/5 border border-tp-cyan-500/15 rounded-lg flex items-center justify-center hover:bg-tp-cyan-500/10 hover:border-tp-cyan-500/40 transition-all"
              aria-label="Twitter / X"
            >
              <MessageCircle className="w-4 h-4 text-white/50" />
            </a>
            <a
              href="#"
              className="w-9 h-9 bg-white/5 border border-tp-cyan-500/15 rounded-lg flex items-center justify-center hover:bg-tp-cyan-500/10 hover:border-tp-cyan-500/40 transition-all"
              aria-label="Blog RSS"
            >
              <Rss className="w-4 h-4 text-white/50" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
