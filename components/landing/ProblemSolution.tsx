"use client";

import React from "react";
import { motion } from "framer-motion";
import { X, Check } from "lucide-react";

const problems = [
  "Payer 40% de plus sans le savoir",
  "Mauvaise surprise à la douane",
  "Conversions manuelles approximatives",
  "Heures de recherche sur plusieurs sites",
  "Ignorer les exemptions ACEUM/CUSMA",
  "Frais cachés découverts à la livraison",
];

const solutions = [
  "Vrai coût total affiché en 3 secondes",
  "Calcul douanes automatique (ACEUM inclus)",
  "Taux de change Bank of Canada en direct",
  "Tous les sites comparés en un seul clic",
  "Exemptions automatiquement appliquées",
  "Zéro surprise — tout calculé à l'avance",
];

export function ProblemSolution() {
  return (
    <section className="py-24 bg-tp-navy-700">
      <div className="container mx-auto px-4 max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-14"
        >
          <p className="text-tp-cyan-500 font-medium text-xs uppercase tracking-[0.12em] mb-3">
            Pourquoi TruePriceAI ?
          </p>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-white tracking-tight">
            Vous méritez de savoir le vrai prix
          </h2>
          <p className="mt-4 text-white/60 max-w-xl mx-auto text-lg">
            Les Canadiens paient en moyenne{" "}
            <span className="font-bold text-tp-cyan-500">20 à 40% de plus</span>{" "}
            que les Américains pour les mêmes produits. On change ça.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {/* Sans */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="rounded-2xl border border-tp-error/20 bg-tp-error/5 p-8"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-tp-error/15 flex items-center justify-center">
                <X className="w-5 h-5 text-tp-error" />
              </div>
              <h3 className="font-display font-bold text-lg text-white tracking-tight">
                Sans TruePriceAI
              </h3>
            </div>
            <ul className="space-y-3.5">
              {problems.map((problem, i) => (
                <motion.li
                  key={problem}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  className="flex items-start gap-3"
                >
                  <div className="w-5 h-5 rounded-full bg-tp-error/20 flex items-center justify-center shrink-0 mt-0.5">
                    <X className="w-3 h-3 text-tp-error" />
                  </div>
                  <span className="text-white/60 text-sm">{problem}</span>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Avec */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="rounded-2xl border border-tp-success/30 bg-tp-success/5 p-8 relative overflow-hidden"
          >
            <div className="absolute top-4 right-4 text-xs bg-tp-success/20 text-tp-success font-semibold px-3 py-1 rounded-full">
              ✓ Inclus
            </div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-tp-success/15 flex items-center justify-center">
                <Check className="w-5 h-5 text-tp-success" />
              </div>
              <h3 className="font-display font-bold text-lg text-white tracking-tight">
                Avec TruePriceAI
              </h3>
            </div>
            <ul className="space-y-3.5">
              {solutions.map((solution, i) => (
                <motion.li
                  key={solution}
                  initial={{ opacity: 0, x: 10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  className="flex items-start gap-3"
                >
                  <div className="w-5 h-5 rounded-full bg-tp-success/20 flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3 h-3 text-tp-success" />
                  </div>
                  <span className="text-white/80 text-sm font-medium">{solution}</span>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
