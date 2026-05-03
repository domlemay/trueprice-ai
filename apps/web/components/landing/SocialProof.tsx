"use client";

import React from "react";
import { motion } from "framer-motion";
import { Star, Users, TrendingDown, Award } from "lucide-react";

const stats = [
  { icon: <Users className="w-5 h-5 text-tp-cyan-500" />, value: "2 400+", label: "Acheteurs ce mois-ci" },
  { icon: <Star className="w-5 h-5 text-tp-warning" />, value: "4.9 / 5", label: "Satisfaction moyenne" },
  { icon: <TrendingDown className="w-5 h-5 text-tp-success" />, value: "340 $", label: "Économies moyennes / an" },
  { icon: <Award className="w-5 h-5 text-tp-info" />, value: "15+", label: "Boutiques comparées" },
];

const logos = [
  { name: "r/Quebec", bg: "bg-orange-500/80" },
  { name: "r/PersoFinance", bg: "bg-orange-400/80" },
  { name: "Les Affaires", bg: "bg-tp-info/70" },
  { name: "Tech Québec", bg: "bg-teal-600/80" },
];

export function SocialProof() {
  return (
    <section className="py-12 bg-tp-card border-b border-tp-cyan-500/10">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Stats bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10"
        >
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="flex items-center gap-3 p-4 rounded-2xl bg-white/3 border border-tp-cyan-500/15 hover:border-tp-cyan-500/30 hover:shadow-tp-md transition-all"
            >
              <div className="w-10 h-10 rounded-xl bg-tp-navy-700 border border-tp-cyan-500/15 flex items-center justify-center shrink-0">
                {stat.icon}
              </div>
              <div>
                <div className="font-mono text-xl font-bold text-white tabular-nums leading-none">
                  {stat.value}
                </div>
                <div className="text-xs text-white/50 mt-0.5">{stat.label}</div>
              </div>
            </div>
          ))}
        </motion.div>

        {/* Logo bar */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <span className="text-xs text-white/30 font-medium uppercase tracking-wider whitespace-nowrap">
            Vu sur
          </span>
          <div className="flex items-center gap-3 flex-wrap justify-center">
            {logos.map((logo) => (
              <div
                key={logo.name}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${logo.bg} text-white text-xs font-semibold`}
              >
                <span>🍁</span>
                {logo.name}
              </div>
            ))}
          </div>
          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-4 h-4 text-tp-warning fill-tp-warning" />
            ))}
            <span className="font-mono text-sm font-semibold text-white ml-1">4.9</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
