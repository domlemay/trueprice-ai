"use client";

import React from "react";
import { motion } from "framer-motion";
import { Star, Users, TrendingDown, Award } from "lucide-react";

const stats = [
  {
    icon: <Users className="w-5 h-5 text-brand-red" />,
    value: "2 400+",
    label: "Canadiens ce mois-ci",
  },
  {
    icon: <Star className="w-5 h-5 text-yellow-500" />,
    value: "4.9 / 5",
    label: "Satisfaction moyenne",
  },
  {
    icon: <TrendingDown className="w-5 h-5 text-green-600" />,
    value: "340 $",
    label: "Économies moyennes / an",
  },
  {
    icon: <Award className="w-5 h-5 text-blue-500" />,
    value: "15+",
    label: "Boutiques comparées",
  },
];

const logos = [
  { name: "r/Quebec", bg: "bg-orange-500", text: "reddit" },
  { name: "r/PersoFinance", bg: "bg-orange-400", text: "reddit" },
  { name: "Les Affaires", bg: "bg-blue-700", text: "media" },
  { name: "Tech Québec", bg: "bg-teal-600", text: "org" },
];

export function SocialProof() {
  return (
    <section className="py-12 bg-white border-b border-gray-100">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Stats bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-10"
        >
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="flex items-center gap-3 p-4 rounded-2xl bg-gray-50 border border-gray-100 hover:shadow-md transition-shadow"
            >
              <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center shrink-0">
                {stat.icon}
              </div>
              <div>
                <div className="text-xl font-extrabold text-brand-navy leading-none">
                  {stat.value}
                </div>
                <div className="text-xs text-gray-500 mt-0.5">{stat.label}</div>
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
          <span className="text-xs text-gray-400 font-medium uppercase tracking-wider whitespace-nowrap">
            Vu sur
          </span>
          <div className="flex items-center gap-4 flex-wrap justify-center">
            {logos.map((logo) => (
              <div
                key={logo.name}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl ${logo.bg} text-white text-sm font-semibold opacity-80 hover:opacity-100 transition-opacity`}
              >
                <span>🍁</span>
                {logo.name}
              </div>
            ))}
          </div>
          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
            ))}
            <span className="text-sm font-semibold text-gray-700 ml-1">4.9</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
