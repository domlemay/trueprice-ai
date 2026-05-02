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
    <section className="py-24 bg-white">
      <div className="container mx-auto px-4 max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-14"
        >
          <p className="text-brand-red font-semibold text-sm uppercase tracking-widest mb-3">
            Pourquoi TruePriceAI ?
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-brand-navy">
            Vous méritez de savoir le vrai prix
          </h2>
          <p className="mt-4 text-gray-500 max-w-xl mx-auto text-lg">
            Les Canadiens paient en moyenne{" "}
            <span className="font-bold text-brand-red">20 à 40% de plus</span>{" "}
            que les Américains pour les mêmes produits. On change ça.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {/* Without */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="rounded-3xl border-2 border-red-100 bg-red-50/50 p-8"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-2xl bg-red-100 flex items-center justify-center">
                <X className="w-5 h-5 text-red-500" />
              </div>
              <h3 className="font-bold text-lg text-gray-900">
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
                  <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center shrink-0 mt-0.5">
                    <X className="w-3 h-3 text-red-500" />
                  </div>
                  <span className="text-gray-600 text-sm">{problem}</span>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* With */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="rounded-3xl border-2 border-green-200 bg-green-50/50 p-8 relative overflow-hidden"
          >
            <div className="absolute top-4 right-4 text-xs bg-green-100 text-green-700 font-semibold px-3 py-1 rounded-full">
              ✓ Inclus
            </div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-2xl bg-green-100 flex items-center justify-center">
                <Check className="w-5 h-5 text-green-600" />
              </div>
              <h3 className="font-bold text-lg text-gray-900">
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
                  <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3 h-3 text-green-600" />
                  </div>
                  <span className="text-gray-700 text-sm font-medium">{solution}</span>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
