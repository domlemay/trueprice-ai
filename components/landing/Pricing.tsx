"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Check, Zap, Building2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const plans = [
  {
    name: "Gratuit",
    icon: <Zap className="w-5 h-5" />,
    color: "text-gray-600",
    monthly: 0,
    yearly: 0,
    description: "Pour essayer TruePriceAI sans risque.",
    cta: "Commencer gratuitement",
    ctaVariant: "outlineNavy" as const,
    popular: false,
    features: [
      { text: "5 recherches par jour", included: true },
      { text: "Comparaison CA vs USA", included: true },
      { text: "Calcul coût réel de base", included: true },
      { text: "Boutiques favorites", included: false },
      { text: "Alertes de prix", included: false },
      { text: "Assistant IA", included: false },
      { text: "Export données", included: false },
    ],
  },
  {
    name: "Premium",
    icon: <Sparkles className="w-5 h-5" />,
    color: "text-brand-red",
    monthly: 5,
    yearly: 29,
    description: "Tout ce qu'il vous faut pour économiser au quotidien.",
    cta: "Démarrer Premium",
    ctaVariant: "default" as const,
    popular: true,
    features: [
      { text: "Recherches illimitées", included: true },
      { text: "Comparaison CA vs USA", included: true },
      { text: "Calcul coût réel complet", included: true },
      { text: "Boutiques favorites", included: true },
      { text: "Alertes de prix illimitées", included: true },
      { text: "Assistant IA inclus", included: true },
      { text: "Export données (CSV)", included: false },
    ],
  },
  {
    name: "Entreprise",
    icon: <Building2 className="w-5 h-5" />,
    color: "text-brand-navy",
    monthly: 49,
    yearly: 399,
    description: "Veille concurrentielle et procurement B2B avancé.",
    cta: "Contacter l'équipe",
    ctaVariant: "navy" as const,
    popular: false,
    features: [
      { text: "Tout le plan Premium", included: true },
      { text: "Jusqu'à 500 produits/mois", included: true },
      { text: "Mode veille concurrentielle", included: true },
      { text: "Import CSV/Excel produits", included: true },
      { text: "Export WooCommerce/Shopify", included: true },
      { text: "5 membres d'équipe", included: true },
      { text: "Support prioritaire", included: true },
    ],
  },
];

export function Pricing() {
  const [isYearly, setIsYearly] = useState(false);

  return (
    <section id="tarifs" className="py-24 bg-gray-50">
      <div className="container mx-auto px-4 max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <p className="text-brand-red font-semibold text-sm uppercase tracking-widest mb-3">
            Tarifs
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-brand-navy mb-6">
            Simple, transparent, canadien
          </h2>

          {/* Toggle */}
          <div className="inline-flex items-center gap-3 bg-white border border-gray-200 rounded-full p-1 shadow-sm">
            <button
              onClick={() => setIsYearly(false)}
              className={cn(
                "px-4 py-2 rounded-full text-sm font-semibold transition-all",
                !isYearly
                  ? "bg-brand-navy text-white shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              )}
            >
              Mensuel
            </button>
            <button
              onClick={() => setIsYearly(true)}
              className={cn(
                "px-4 py-2 rounded-full text-sm font-semibold transition-all flex items-center gap-2",
                isYearly
                  ? "bg-brand-navy text-white shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              )}
            >
              Annuel
              <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold">
                -40%
              </span>
            </button>
          </div>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className={cn(
                "relative rounded-3xl p-8 flex flex-col border-2 transition-all",
                plan.popular
                  ? "border-brand-red bg-white shadow-2xl shadow-brand-red/10 scale-105"
                  : "border-gray-100 bg-white hover:shadow-xl hover:-translate-y-1"
              )}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <Badge className="bg-brand-red text-white text-xs px-4 py-1.5 shadow-lg">
                    ⭐ Populaire
                  </Badge>
                </div>
              )}

              <div className="mb-6">
                <div className={`w-10 h-10 rounded-2xl bg-gray-100 flex items-center justify-center mb-4 ${plan.color}`}>
                  {plan.icon}
                </div>
                <h3 className="text-xl font-extrabold text-brand-navy">{plan.name}</h3>
                <p className="text-sm text-gray-500 mt-1">{plan.description}</p>
              </div>

              <div className="mb-6">
                {plan.monthly === 0 ? (
                  <div className="text-4xl font-extrabold text-brand-navy">
                    Gratuit
                  </div>
                ) : (
                  <div className="flex items-end gap-1">
                    <span className="text-4xl font-extrabold text-brand-navy">
                      {isYearly
                        ? Math.round((isYearly ? plan.yearly : plan.monthly * 12) / 12)
                        : plan.monthly}
                      $
                    </span>
                    <span className="text-gray-400 text-sm mb-1.5">/mois</span>
                  </div>
                )}
                {isYearly && plan.yearly > 0 && (
                  <div className="text-sm text-green-600 font-medium mt-1">
                    Facturé {plan.yearly} $ /an
                  </div>
                )}
              </div>

              <ul className="space-y-3 flex-1 mb-8">
                {plan.features.map((feature) => (
                  <li key={feature.text} className="flex items-center gap-3">
                    <div
                      className={cn(
                        "w-5 h-5 rounded-full flex items-center justify-center shrink-0",
                        feature.included
                          ? "bg-green-100"
                          : "bg-gray-100"
                      )}
                    >
                      <Check
                        className={cn(
                          "w-3 h-3",
                          feature.included ? "text-green-600" : "text-gray-300"
                        )}
                      />
                    </div>
                    <span
                      className={cn(
                        "text-sm",
                        feature.included ? "text-gray-700" : "text-gray-300 line-through"
                      )}
                    >
                      {feature.text}
                    </span>
                  </li>
                ))}
              </ul>

              <Button
                variant={plan.ctaVariant}
                size="lg"
                className={cn(
                  "w-full rounded-xl",
                  plan.popular && "shadow-lg shadow-brand-red/30"
                )}
              >
                {plan.cta}
              </Button>
            </motion.div>
          ))}
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="text-center text-sm text-gray-400 mt-8"
        >
          Tous les prix en CAD · Annulez à tout moment · Aucun frais caché
        </motion.p>
      </div>
    </section>
  );
}
