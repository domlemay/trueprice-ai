"use client";

import React from "react";
import { motion } from "framer-motion";
import { BarChart2, Calculator, Building2, Bell, Bot, Heart } from "lucide-react";

const features = [
  {
    icon: <BarChart2 className="w-6 h-6" />,
    accent: "text-tp-cyan-500",
    bg: "bg-tp-cyan-500/10",
    title: "Comparaison temps réel",
    description: "Tous les prix Canada et USA actualisés en temps réel depuis 15+ boutiques majeures.",
  },
  {
    icon: <Calculator className="w-6 h-6" />,
    accent: "text-tp-error",
    bg: "bg-tp-error/10",
    title: "Coût total réel",
    description: "Taxes, douanes, livraison et taux de change intégrés automatiquement. Aucune surprise.",
  },
  {
    icon: <Building2 className="w-6 h-6" />,
    accent: "text-tp-warning",
    bg: "bg-tp-warning/10",
    title: "Mode Entreprise",
    description: "Veille concurrentielle et comparaison fournisseurs B2B. Importez vos listes CSV/Excel.",
  },
  {
    icon: <Bell className="w-6 h-6" />,
    accent: "text-tp-warning",
    bg: "bg-tp-warning/10",
    title: "Alertes de prix",
    description: "Recevez une notification instantanée quand le prix d'un produit descend sous votre seuil.",
  },
  {
    icon: <Bot className="w-6 h-6" />,
    accent: "text-tp-cyan-400",
    bg: "bg-tp-cyan-500/10",
    title: "Assistant IA",
    description: "Posez vos questions en français. Notre IA connaît les règles douanières canadiennes sur le bout des doigts.",
  },
  {
    icon: <Heart className="w-6 h-6" />,
    accent: "text-tp-error",
    bg: "bg-tp-error/10",
    title: "Boutiques favorites",
    description: "Sauvegardez vos boutiques préférées et voyez-les en priorité dans chaque résultat.",
  },
];

export function Features() {
  return (
    <section id="fonctionnalites" className="py-24 bg-tp-card">
      <div className="container mx-auto px-4 max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-14"
        >
          <p className="text-tp-cyan-500 font-medium text-xs uppercase tracking-[0.12em] mb-3">
            Fonctionnalités
          </p>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-white tracking-tight">
            Tout ce dont vous avez besoin
          </h2>
          <p className="mt-4 text-white/60 max-w-xl mx-auto text-lg">
            De la recherche simple à la gestion d'achats B2B complexes, TruePriceAI
            couvre tous vos besoins.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="group bg-tp-navy-700 rounded-2xl p-7 border border-tp-cyan-500/15 hover:border-tp-cyan-500/35 hover:shadow-tp-lg hover:-translate-y-1 transition-all duration-300"
            >
              <div
                className={`w-12 h-12 rounded-2xl ${feature.bg} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform`}
              >
                {React.cloneElement(feature.icon, { className: `w-6 h-6 ${feature.accent}` })}
              </div>
              <h3 className="font-display font-bold text-white text-lg mb-2 tracking-tight">
                {feature.title}
              </h3>
              <p className="text-white/60 text-sm leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
