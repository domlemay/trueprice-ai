"use client";

import React from "react";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const priceRows = [
  { store: "Best Buy Canada", flag: "🇨🇦", priceLabel: "1 498,99 $", realCad: 1498.99, isBest: false },
  { store: "Costco Canada", flag: "🇨🇦", priceLabel: "1 349,99 $", realCad: 1349.99, isBest: false },
  { store: "Amazon.com", flag: "🇺🇸", priceLabel: "997,00 USD", realCad: 1142.45, isBest: true },
  { store: "Walmart US", flag: "🇺🇸", priceLabel: "1 049,00 USD", realCad: 1198.32, isBest: false },
];

export function DemoVisual() {
  return (
    <section className="py-24 bg-tp-navy-700 overflow-hidden">
      <div className="container mx-auto px-4 max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-14"
        >
          <p className="text-tp-cyan-500 font-medium text-xs uppercase tracking-[0.12em] mb-3">Démo</p>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-white tracking-tight">
            Voyez la différence en temps réel
          </h2>
          <p className="mt-4 text-white/60 max-w-xl mx-auto text-lg">
            Un Samsung QLED 65" — voici ce que TruePriceAI vous révèle en quelques secondes.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-10 items-start max-w-5xl mx-auto">
          {/* Browser mockup */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="rounded-2xl border border-tp-cyan-500/20 shadow-tp-lg overflow-hidden"
          >
            {/* Browser chrome */}
            <div className="bg-tp-card px-4 py-3 flex items-center gap-3 border-b border-tp-cyan-500/15">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-tp-error/70" />
                <div className="w-3 h-3 rounded-full bg-tp-warning/70" />
                <div className="w-3 h-3 rounded-full bg-tp-success/70" />
              </div>
              <div className="flex-1 h-7 bg-tp-navy-700 rounded border border-tp-cyan-500/15 flex items-center px-3">
                <span className="font-mono text-xs text-white/30">trueprice.ai/produit/samsung-qled-65</span>
              </div>
            </div>

            {/* App content */}
            <div className="bg-tp-navy-700 p-5">
              {/* Product header */}
              <div className="flex items-center gap-4 mb-5 p-4 bg-tp-card border border-tp-cyan-500/15 rounded-xl">
                <div className="w-14 h-14 bg-tp-cyan-500/10 rounded-xl flex items-center justify-center text-2xl shrink-0">
                  📺
                </div>
                <div>
                  <div className="font-display font-bold text-white text-sm tracking-tight">Samsung QLED 65" QN65Q80C</div>
                  <div className="font-mono text-xs text-white/40 mt-0.5">UPC: 887276700663 · Électronique</div>
                  <div className="flex items-center gap-1 mt-1">
                    <div className="w-2 h-2 rounded-full bg-tp-success animate-pulse" />
                    <span className="text-xs text-tp-success font-medium">En stock · Mis à jour il y a 4 min</span>
                  </div>
                </div>
              </div>

              {/* Price table */}
              <div className="space-y-2">
                {priceRows.map((row, i) => (
                  <motion.div
                    key={row.store}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.1 + i * 0.08 }}
                    className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                      row.isBest
                        ? "border-tp-success/40 bg-tp-success/8"
                        : "border-tp-cyan-500/15 hover:border-tp-cyan-500/30 hover:bg-white/2"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-base">{row.flag}</span>
                      <div>
                        <div className="text-sm font-medium text-white">{row.store}</div>
                        <div className="font-mono text-xs text-white/40">{row.priceLabel}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`font-mono text-sm font-bold tabular-nums ${row.isBest ? "text-tp-success" : "text-white"}`}>
                        {row.realCad.toLocaleString("fr-CA", { style: "currency", currency: "CAD" })}
                      </div>
                      {row.isBest && (
                        <span className="text-xs bg-tp-success/20 text-tp-success px-2 py-0.5 rounded-full font-semibold">
                          🏆 Meilleur prix
                        </span>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Annotations */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-5"
          >
            <div className="p-5 bg-tp-success/8 border border-tp-success/30 rounded-2xl">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="w-5 h-5 text-tp-success" />
                <span className="font-bold text-tp-success text-sm">Économisez 356 $ sur ce produit</span>
              </div>
              <p className="text-white/70 text-sm">
                Amazon.com à{" "}
                <span className="font-mono font-bold text-white">1 142 $ CAD</span> tout inclus,
                vs Best Buy Canada à 1 499 $. Douanes 0% ACEUM, livraison et taxes calculés automatiquement.
              </p>
            </div>

            <div className="space-y-3">
              {[
                {
                  num: "01",
                  title: "Conversion en temps réel",
                  desc: "997 USD × 1,071 = 1 068 $ CAD (taux Bank of Canada du jour)",
                  accent: "text-tp-cyan-500",
                  bg: "bg-tp-cyan-500/8 border-tp-cyan-500/20",
                },
                {
                  num: "02",
                  title: "Douanes ACEUM : 0 $",
                  desc: "Catégorie Électronique qualifie pour 0% de droit douanier sous l'ACEUM.",
                  accent: "text-tp-info",
                  bg: "bg-tp-info/8 border-tp-info/20",
                },
                {
                  num: "03",
                  title: "Livraison estimée : 29 $",
                  desc: "Calculé selon le poids et votre province (Québec par défaut).",
                  accent: "text-tp-warning",
                  bg: "bg-tp-warning/8 border-tp-warning/20",
                },
                {
                  num: "04",
                  title: "TPS + TVQ : 45 $",
                  desc: "15% applicable sur la valeur totale pour le Québec.",
                  accent: "text-tp-error",
                  bg: "bg-tp-error/8 border-tp-error/20",
                },
              ].map((item) => (
                <div key={item.num} className={`flex gap-4 p-4 rounded-xl border ${item.bg}`}>
                  <span className={`font-mono text-xl font-bold ${item.accent} leading-none shrink-0`}>
                    {item.num}
                  </span>
                  <div>
                    <div className="font-semibold text-white text-sm">{item.title}</div>
                    <div className="font-mono text-xs text-white/50 mt-1">{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>

            <Button size="lg" className="w-full gap-2 rounded-xl">
              Essayer avec mon produit
              <ArrowRight className="w-5 h-5" />
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
