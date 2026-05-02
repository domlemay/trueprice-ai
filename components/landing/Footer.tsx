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
    <footer className="bg-brand-navy text-white">
      <div className="container mx-auto px-4 max-w-7xl py-16">
        <div className="grid lg:grid-cols-5 gap-10 mb-12">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4 group">
              <div className="w-8 h-8 bg-brand-red rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl">
                TruePrice<span className="text-brand-red">AI</span>
              </span>
            </Link>
            <p className="text-white/50 text-sm leading-relaxed mb-4">
              Payez le vrai prix. Pas le prix canadien.
            </p>
            <div className="flex items-center gap-2 text-xs text-white/40">
              <span>🍁</span>
              <span>Fait au Québec, Canada</span>
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="font-semibold text-sm text-white/80 uppercase tracking-wider mb-4">
                {category}
              </h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-white/50 hover:text-white transition-colors"
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
        <div className="border-t border-white/10 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-white/40">
            © {new Date().getFullYear()} TruePriceAI. Tous droits réservés.
          </p>
          <div className="flex items-center gap-4">
            <a
              href="mailto:bonjour@trueprice.ai"
              className="w-9 h-9 bg-white/10 rounded-lg flex items-center justify-center hover:bg-white/20 transition-colors"
              aria-label="Email"
            >
              <Mail className="w-4 h-4 text-white/60" />
            </a>
            <a
              href="#"
              className="w-9 h-9 bg-white/10 rounded-lg flex items-center justify-center hover:bg-white/20 transition-colors"
              aria-label="Twitter / X"
            >
              <MessageCircle className="w-4 h-4 text-white/60" />
            </a>
            <a
              href="#"
              className="w-9 h-9 bg-white/10 rounded-lg flex items-center justify-center hover:bg-white/20 transition-colors"
              aria-label="LinkedIn"
            >
              <Rss className="w-4 h-4 text-white/60" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
