"use client";

import React, { useState } from "react";
import { motion, type Variants } from "framer-motion";
import { Search, ArrowRight, Sparkles, Shield, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.15, delayChildren: 0.2 } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } },
};

export function Hero() {
  const [searchValue, setSearchValue] = useState("");

  return (
    <section className="relative min-h-screen bg-hero-pattern overflow-hidden flex items-center">
      {/* Background decorations — cyan glow blurs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-tp-cyan-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-tp-cyan-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-tp-navy-600/30 rounded-full blur-3xl" />
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage:
              "linear-gradient(rgba(0,212,200,0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(0,212,200,0.2) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      <div className="container mx-auto px-4 max-w-7xl pt-24 pb-16 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left — Text */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="text-center lg:text-left"
          >
            <motion.div variants={itemVariants} className="mb-6">
              <span className="inline-flex items-center gap-2 bg-tp-cyan-500/10 border border-tp-cyan-500/30 text-tp-cyan-500 text-xs font-medium px-3 py-1.5 rounded-full uppercase tracking-[0.12em]">
                <span>🌎</span><span>Comparez le vrai prix, partout</span>
              </span>
            </motion.div>

            <motion.h1
              variants={itemVariants}
              className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-[1.05] tracking-tight mb-6"
            >
              Comparez les{" "}
              <span className="relative">
                <span className="text-tp-cyan-500">vrais coûts.</span>
                <motion.span
                  className="absolute -bottom-2 left-0 w-full h-1 bg-tp-cyan-500/40 rounded-full"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: 0.8, duration: 0.6 }}
                />
              </span>
              <br />
              Trouvez le meilleur prix, tous marchés confondus.
            </motion.h1>

            <motion.p
              variants={itemVariants}
              className="text-lg text-white/70 leading-relaxed mb-8 max-w-xl mx-auto lg:mx-0"
            >
              Calculez le vrai coût total d'un produit sur n'importe quel marché —
              taux de change, taxes locales, droits de douane et livraison inclus.{" "}
              <span className="text-white font-medium">En temps réel.</span>
            </motion.p>

            {/* Search bar */}
            <motion.div variants={itemVariants} className="mb-4">
              <div className="relative max-w-xl mx-auto lg:mx-0 group">
                <div className="absolute inset-0 bg-gradient-to-r from-tp-cyan-500/30 to-tp-cyan-300/30 rounded-2xl blur-xl group-focus-within:opacity-100 opacity-0 transition-opacity" />
                <div className="relative flex items-center bg-tp-card border border-tp-cyan-500/20 rounded-2xl p-2 gap-2 focus-within:border-tp-cyan-500 transition-all">
                  <Search className="w-5 h-5 text-white/50 ml-3 shrink-0" />
                  <input
                    type="text"
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    placeholder="Entrez un code UPC, modèle ou nom de produit…"
                    className="flex-1 bg-transparent text-white placeholder-white/40 text-sm outline-none py-2"
                  />
                  <Button size="sm" className="rounded-xl gap-2 shrink-0">
                    Comparer
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </motion.div>

            <motion.p variants={itemVariants} className="text-sm text-white/50 mb-8">
              ✓ Essai gratuit &nbsp;·&nbsp; ✓ Aucune carte requise &nbsp;·&nbsp; ✓ Résultats en 3 secondes
            </motion.p>

            {/* Trust pills */}
            <motion.div variants={itemVariants} className="flex flex-wrap gap-3 justify-center lg:justify-start">
              {[
                { icon: <Zap className="w-3.5 h-3.5" />, text: "Taux de change en direct" },
                { icon: <Shield className="w-3.5 h-3.5" />, text: "Calcul douanes automatique" },
                { icon: <Sparkles className="w-3.5 h-3.5" />, text: "Assistant IA inclus" },
              ].map((pill) => (
                <div
                  key={pill.text}
                  className="flex items-center gap-1.5 bg-white/5 border border-tp-cyan-500/20 rounded-full px-3 py-1.5 text-xs text-white/80"
                >
                  <span className="text-tp-cyan-500">{pill.icon}</span>
                  {pill.text}
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* Right — App mockup */}
          <motion.div
            initial={{ opacity: 0, x: 60 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="relative hidden lg:block"
          >
            <div className="relative">
              <div className="bg-tp-card border border-tp-cyan-500/20 rounded-3xl p-6 shadow-tp-lg">
                <div className="flex items-center gap-3 mb-5">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-tp-error/70" />
                    <div className="w-3 h-3 rounded-full bg-tp-warning/70" />
                    <div className="w-3 h-3 rounded-full bg-tp-success/70" />
                  </div>
                  <div className="flex-1 h-7 bg-white/5 rounded-lg" />
                </div>

                <div className="flex items-start gap-4 mb-5 p-4 bg-white/5 rounded-2xl">
                  <div className="w-16 h-16 bg-tp-cyan-500/10 rounded-xl flex items-center justify-center text-3xl shrink-0">📺</div>
                  <div className="flex-1 min-w-0">
                    <div className="text-white font-semibold text-sm mb-1">Samsung QLED 65" QN65Q80C</div>
                    <div className="text-white/50 text-xs font-mono">UPC: 887276700663</div>
                  </div>
                </div>

                <div className="space-y-3">
                  {[
                    { store: "Best Buy Canada", flag: "🇨🇦", price: "1 498 $", real: "1 498 $", savings: null, best: false },
                    { store: "Amazon.com", flag: "🇺🇸", price: "997 USD", real: "1 142 $", savings: "356 $", best: true },
                    { store: "Walmart US", flag: "🇺🇸", price: "1 049 USD", real: "1 198 $", savings: "300 $", best: false },
                  ].map((item) => (
                    <div
                      key={item.store}
                      className={`flex items-center justify-between p-3 rounded-xl transition-all ${
                        item.best
                          ? "bg-tp-cyan-500/10 border border-tp-cyan-500/40 shadow-tp-glow"
                          : "bg-white/5 border border-white/10"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-lg">{item.flag}</span>
                        <div>
                          <div className="text-white text-xs font-medium">{item.store}</div>
                          <div className="text-white/50 text-xs font-mono">{item.price}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`text-sm font-mono font-bold ${item.best ? "text-tp-cyan-500" : "text-white"}`}>
                          {item.real} CAD
                        </div>
                        {item.savings && (
                          <div className="text-tp-success font-medium text-xs">Économisez {item.savings}</div>
                        )}
                        {item.best && (
                          <span className="text-[10px] bg-tp-cyan-500 text-tp-navy-700 px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                            Meilleur
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 p-4 bg-tp-cyan-500/10 border border-tp-cyan-500/30 rounded-xl">
                  <div className="text-tp-cyan-500 text-xs font-semibold mb-2 uppercase tracking-[0.08em]">Détail du vrai coût</div>
                  <div className="space-y-1 font-mono">
                    {[
                      ["Prix USD converti", "1 068 $"],
                      ["Douanes (0% ACEUM)", "0 $"],
                      ["Livraison estimée", "29 $"],
                      ["TPS + TVQ (Qc)", "45 $"],
                    ].map(([label, val]) => (
                      <div key={label} className="flex justify-between text-xs text-white/70">
                        <span>{label}</span>
                        <span className="font-medium text-white">{val}</span>
                      </div>
                    ))}
                    <div className="border-t border-white/10 pt-1 mt-1 flex justify-between text-sm font-bold text-white">
                      <span>Total réel</span>
                      <span className="text-tp-cyan-500">1 142 $ CAD</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating — exchange rate */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1, y: [0, -6, 0] }}
                transition={{ opacity: { delay: 1, duration: 0.5 }, scale: { delay: 1, duration: 0.5 }, y: { delay: 1.5, duration: 3, repeat: Infinity, ease: "easeInOut" } }}
                className="absolute -top-4 -right-4 bg-white rounded-2xl px-4 py-3 shadow-tp-lg flex items-center gap-3"
              >
                <div className="w-8 h-8 bg-tp-cyan-500/15 rounded-full flex items-center justify-center">
                  <Zap className="w-4 h-4 text-tp-cyan-700" />
                </div>
                <div>
                  <div className="text-xs text-tp-navy-700/60 font-medium uppercase tracking-[0.08em]">Taux de change</div>
                  <div className="text-sm font-mono font-bold text-tp-navy-700">1 USD = 1.38 CAD</div>
                </div>
              </motion.div>

            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
