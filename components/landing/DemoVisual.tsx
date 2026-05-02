"use client";

import React from "react";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2, Info } from "lucide-react";
import { Button } from "@/components/ui/button";

const priceRows = [
  {
    store: "Best Buy Canada",
    flag: "🇨🇦",
    priceLabel: "1 498,99 $",
    realCad: 1498.99,
    breakdown: null,
    isBest: false,
    note: "Prix affiché",
  },
  {
    store: "Costco Canada",
    flag: "🇨🇦",
    priceLabel: "1 349,99 $",
    realCad: 1349.99,
    breakdown: null,
    isBest: false,
    note: "Prix affiché",
  },
  {
    store: "Amazon.com",
    flag: "🇺🇸",
    priceLabel: "997,00 USD",
    realCad: 1142.45,
    breakdown: { base: 1068, duty: 0, shipping: 29, taxes: 45 },
    isBest: true,
    note: "Vrai coût calculé",
  },
  {
    store: "Walmart US",
    flag: "🇺🇸",
    priceLabel: "1 049,00 USD",
    realCad: 1198.32,
    breakdown: null,
    isBest: false,
    note: "Vrai coût calculé",
  },
];

export function DemoVisual() {
  return (
    <section className="py-24 bg-white overflow-hidden">
      <div className="container mx-auto px-4 max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-14"
        >
          <p className="text-brand-red font-semibold text-sm uppercase tracking-widest mb-3">
            Démo
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-brand-navy">
            Voyez la différence en temps réel
          </h2>
          <p className="mt-4 text-gray-500 max-w-xl mx-auto text-lg">
            Un Samsung QLED 65" — voici ce que TruePriceAI vous révèle en
            quelques secondes.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-10 items-start max-w-5xl mx-auto">
          {/* Browser mockup */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="rounded-3xl border border-gray-200 shadow-2xl overflow-hidden"
          >
            {/* Browser chrome */}
            <div className="bg-gray-100 px-4 py-3 flex items-center gap-3 border-b border-gray-200">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-yellow-400" />
                <div className="w-3 h-3 rounded-full bg-green-400" />
              </div>
              <div className="flex-1 h-7 bg-white rounded-lg border border-gray-200 flex items-center px-3">
                <span className="text-xs text-gray-400">trueprice.ai/produit/samsung-qled-65</span>
              </div>
            </div>

            {/* App content */}
            <div className="bg-white p-5">
              {/* Product header */}
              <div className="flex items-center gap-4 mb-5 p-4 bg-gray-50 rounded-2xl">
                <div className="w-14 h-14 bg-gray-100 rounded-xl flex items-center justify-center text-2xl">
                  📺
                </div>
                <div>
                  <div className="font-bold text-brand-navy text-sm">Samsung QLED 65" QN65Q80C</div>
                  <div className="text-xs text-gray-400 mt-0.5">UPC: 887276700663 · Électronique</div>
                  <div className="flex items-center gap-1 mt-1">
                    <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                    <span className="text-xs text-green-600 font-medium">En stock · Dernière mise à jour il y a 4 min</span>
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
                        ? "border-green-300 bg-green-50"
                        : "border-gray-100 hover:border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-base">{row.flag}</span>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{row.store}</div>
                        <div className="text-xs text-gray-400">{row.priceLabel}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-sm font-bold ${row.isBest ? "text-green-700" : "text-gray-800"}`}>
                        {row.realCad.toLocaleString("fr-CA", { style: "currency", currency: "CAD" })}
                      </div>
                      {row.isBest && (
                        <span className="text-xs bg-green-200 text-green-800 px-2 py-0.5 rounded-full font-semibold">
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
            <div className="p-5 bg-green-50 border border-green-200 rounded-2xl">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                <span className="font-bold text-green-800 text-sm">Économisez 356 $ sur ce produit</span>
              </div>
              <p className="text-green-700 text-sm">
                Amazon.com à{" "}
                <span className="font-bold">1 142 $ CAD</span> tout inclus,
                vs Best Buy Canada à 1 499 $. TruePriceAI calcule
                automatiquement les douanes (0% ACEUM), la livraison et les
                taxes de votre province.
              </p>
            </div>

            <div className="space-y-4">
              {[
                {
                  num: "01",
                  title: "Conversion en temps réel",
                  desc: "997 USD × 1,071 = 1 068 $ CAD (taux Bank of Canada du jour)",
                  color: "text-blue-600",
                  bg: "bg-blue-50 border-blue-100",
                },
                {
                  num: "02",
                  title: "Douanes ACEUM : 0 $",
                  desc: "Produit < 150 $ CAD de valeur hors taxe qualifie pour l'exemption CUSMA/ACEUM. Ici valeur > 150 $, mais catégorie Électronique = 0% de droit.",
                  color: "text-purple-600",
                  bg: "bg-purple-50 border-purple-100",
                },
                {
                  num: "03",
                  title: "Livraison estimée : 29 $",
                  desc: "Calculé selon le poids du produit et votre province (Québec par défaut).",
                  color: "text-orange-600",
                  bg: "bg-orange-50 border-orange-100",
                },
                {
                  num: "04",
                  title: "TPS + TVQ : 45 $",
                  desc: "15% applicable sur la valeur totale (prix + livraison) pour le Québec.",
                  color: "text-brand-red",
                  bg: "bg-red-50 border-red-100",
                },
              ].map((item) => (
                <div
                  key={item.num}
                  className={`flex gap-4 p-4 rounded-2xl border ${item.bg}`}
                >
                  <span className={`text-xl font-extrabold ${item.color} leading-none shrink-0`}>
                    {item.num}
                  </span>
                  <div>
                    <div className="font-semibold text-gray-900 text-sm">{item.title}</div>
                    <div className="text-xs text-gray-500 mt-1">{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>

            <Button size="lg" className="w-full bg-brand-red hover:bg-brand-red-dark text-white gap-2 rounded-2xl">
              Essayer avec mon produit
              <ArrowRight className="w-5 h-5" />
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
