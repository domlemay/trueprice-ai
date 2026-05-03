"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Check, Zap, Building2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const plans = [
  {
    name: "Free",
    icon: <Zap className="w-5 h-5" />,
    accentClass: "text-white/50",
    iconBg: "bg-white/5",
    monthly: 0,
    yearly: 0,
    description: "Pour essayer TruePriceAI sans risque.",
    cta: "Commencer gratuitement",
    ctaVariant: "outline" as const,
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
    accentClass: "text-tp-cyan-500",
    iconBg: "bg-tp-cyan-500/15",
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
    accentClass: "text-tp-warning",
    iconBg: "bg-tp-warning/15",
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
    <section id="tarifs" className="py-24 bg-tp-navy-700">
      <div className="container mx-auto px-4 max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <p className="text-tp-cyan-500 font-medium text-xs uppercase tracking-[0.12em] mb-3">Tarifs</p>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-white tracking-tight mb-6">
            Simple, transparent, canadien
          </h2>

          {/* Toggle */}
          <div className="inline-flex items-center gap-1 bg-tp-card border border-tp-cyan-500/15 rounded-full p-1 shadow-tp-md">
            <button
              onClick={() => setIsYearly(false)}
              className={cn(
                "px-4 py-2 rounded-full text-sm font-semibold transition-all",
                !isYearly ? "bg-tp-cyan-500 text-tp-navy-700 shadow-tp-glow" : "text-white/60 hover:text-white"
              )}
            >
              Mensuel
            </button>
            <button
              onClick={() => setIsYearly(true)}
              className={cn(
                "px-4 py-2 rounded-full text-sm font-semibold transition-all flex items-center gap-2",
                isYearly ? "bg-tp-cyan-500 text-tp-navy-700 shadow-tp-glow" : "text-white/60 hover:text-white"
              )}
            >
              Annuel
              <span className="text-xs bg-tp-success/20 text-tp-success px-2 py-0.5 rounded-full font-bold">−40%</span>
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
                "relative rounded-2xl p-8 flex flex-col border transition-all",
                plan.popular
                  ? "border-tp-cyan-500/50 bg-gradient-to-b from-tp-cyan-500/8 to-tp-card shadow-tp-glow-strong scale-105"
                  : "border-tp-cyan-500/15 bg-tp-card hover:border-tp-cyan-500/35 hover:shadow-tp-lg hover:-translate-y-1"
              )}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-tp-cyan-500 text-tp-navy-700 text-[10px] font-bold uppercase tracking-[0.08em] px-3 py-1 rounded shadow-tp-glow">
                    ⭐ Populaire
                  </span>
                </div>
              )}

              <div className="mb-6">
                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center mb-4", plan.iconBg, plan.accentClass)}>
                  {plan.icon}
                </div>
                <h3 className="font-display text-xl font-bold text-white tracking-tight">{plan.name}</h3>
                <p className="text-sm text-white/60 mt-1">{plan.description}</p>
              </div>

              <div className="mb-6">
                {plan.monthly === 0 ? (
                  <div className="font-display text-4xl font-bold text-white">Gratuit</div>
                ) : (
                  <div className="flex items-end gap-1">
                    <span className="font-mono text-4xl font-bold text-white tabular-nums">
                      {isYearly ? Math.round(plan.yearly / 12) : plan.monthly}
                      <span className="text-2xl">&nbsp;$</span>
                    </span>
                    <span className="text-white/40 text-sm mb-1.5">/mois</span>
                  </div>
                )}
                {isYearly && plan.yearly > 0 && (
                  <div className="text-sm text-tp-success font-medium mt-1 font-mono">
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
                        feature.included ? "bg-tp-success/20" : "bg-white/5"
                      )}
                    >
                      <Check className={cn("w-3 h-3", feature.included ? "text-tp-success" : "text-white/20")} />
                    </div>
                    <span className={cn("text-sm", feature.included ? "text-white/80" : "text-white/30 line-through")}>
                      {feature.text}
                    </span>
                  </li>
                ))}
              </ul>

              <Button variant={plan.ctaVariant} size="lg" className="w-full">
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
          className="text-center text-sm text-white/40 mt-8"
        >
          Tous les prix en CAD · Annulez à tout moment · Aucun frais caché
        </motion.p>
      </div>
    </section>
  );
}
