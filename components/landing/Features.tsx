"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  BarChart2,
  Calculator,
  Building2,
  Bell,
  Bot,
  Heart,
} from "lucide-react";

const features = [
  {
    icon: <BarChart2 className="w-6 h-6" />,
    color: "bg-blue-500",
    bg: "bg-blue-50",
    title: "Comparaison temps réel",
    description:
      "Tous les prix Canada et USA actualisés en temps réel depuis 15+ boutiques majeures.",
  },
  {
    icon: <Calculator className="w-6 h-6" />,
    color: "bg-brand-red",
    bg: "bg-red-50",
    title: "Coût total réel",
    description:
      "Taxes, douanes, livraison et taux de change intégrés automatiquement. Aucune surprise.",
  },
  {
    icon: <Building2 className="w-6 h-6" />,
    color: "bg-brand-navy",
    bg: "bg-indigo-50",
    title: "Mode Entreprise",
    description:
      "Veille concurrentielle et comparaison fournisseurs B2B. Importez vos listes CSV/Excel.",
  },
  {
    icon: <Bell className="w-6 h-6" />,
    color: "bg-orange-500",
    bg: "bg-orange-50",
    title: "Alertes de prix",
    description:
      "Recevez une notification instantanée quand le prix d'un produit descend sous votre seuil.",
  },
  {
    icon: <Bot className="w-6 h-6" />,
    color: "bg-purple-500",
    bg: "bg-purple-50",
    title: "Assistant IA",
    description:
      "Posez vos questions en français. Notre IA connaît les règles douanières canadiennes sur le bout des doigts.",
  },
  {
    icon: <Heart className="w-6 h-6" />,
    color: "bg-pink-500",
    bg: "bg-pink-50",
    title: "Boutiques favorites",
    description:
      "Sauvegardez vos boutiques préférées et voyez-les en priorité dans chaque résultat de recherche.",
  },
];

export function Features() {
  return (
    <section id="fonctionnalites" className="py-24 bg-gray-50/80">
      <div className="container mx-auto px-4 max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-14"
        >
          <p className="text-brand-red font-semibold text-sm uppercase tracking-widest mb-3">
            Fonctionnalités
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-brand-navy">
            Tout ce dont vous avez besoin
          </h2>
          <p className="mt-4 text-gray-500 max-w-xl mx-auto text-lg">
            De la recherche simple à la gestion d'achats B2B complexes, TruePriceAI
            couvre tous vos besoins.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="group bg-white rounded-3xl p-7 border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
            >
              <div
                className={`w-12 h-12 rounded-2xl ${feature.bg} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform`}
              >
                <span className={`text-white ${feature.color.replace("bg-", "text-").replace("bg-brand-", "text-brand-")}`}>
                  {React.cloneElement(feature.icon, {
                    className: `w-6 h-6 ${
                      feature.color === "bg-blue-500"
                        ? "text-blue-500"
                        : feature.color === "bg-brand-red"
                        ? "text-brand-red"
                        : feature.color === "bg-brand-navy"
                        ? "text-brand-navy"
                        : feature.color === "bg-orange-500"
                        ? "text-orange-500"
                        : feature.color === "bg-purple-500"
                        ? "text-purple-500"
                        : "text-pink-500"
                    }`,
                  })}
                </span>
              </div>
              <h3 className="font-bold text-brand-navy text-lg mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
