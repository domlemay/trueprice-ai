"use client";

import React from "react";
import { motion } from "framer-motion";
import { ArrowRight, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CTAFinal() {
  return (
    <section className="py-24 bg-hero-pattern relative overflow-hidden">
      {/* Glow decorations */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-64 h-64 bg-tp-cyan-500/15 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-tp-cyan-500/10 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 max-w-4xl relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, type: "spring" }}
            className="w-16 h-16 bg-tp-cyan-500/15 border border-tp-cyan-500/30 rounded-2xl flex items-center justify-center mx-auto mb-6 animate-glow-pulse"
          >
            <Zap className="w-8 h-8 text-tp-cyan-500" />
          </motion.div>

          <h2 className="font-display text-3xl sm:text-5xl font-bold text-white mb-4 leading-tight tracking-tight">
            Prêt à arrêter de payer
            <br />
            <span className="text-tp-cyan-500">trop cher ?</span>
          </h2>

          <p className="text-white/60 text-lg mb-8 max-w-xl mx-auto">
            Rejoignez 2 400+ acheteurs qui économisent déjà grâce à TruePriceAI.
            Essai gratuit, aucune carte requise.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
            <Button size="xl" className="gap-3 rounded-2xl shadow-tp-glow-strong">
              Commencer gratuitement
              <ArrowRight className="w-5 h-5" />
            </Button>
            <Button
              variant="outline"
              size="xl"
              className="rounded-2xl"
            >
              Voir les tarifs
            </Button>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 text-white/40 text-sm">
            {["✓ Sans carte de crédit", "✓ Annulation facile", "✓ 5 recherches gratuites/jour"].map((item) => (
              <span key={item} className="font-medium">{item}</span>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
