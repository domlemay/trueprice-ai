"use client";

import React from "react";
import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    name: "Sophie Tremblay",
    role: "Maman de 3 enfants",
    location: "Montréal, QC",
    avatar: "ST",
    color: "bg-tp-cyan-500/20 text-tp-cyan-500",
    rating: 5,
    text: "J'ai économisé 487 $ en un seul mois sur des achats électroniques. TruePriceAI m'a montré que la télé que je voulais coûtait 340 $ de moins aux États-Unis, tout inclus avec les douanes et la livraison. Incroyable !",
    savings: "487 $ économisés",
  },
  {
    name: "Marc-Antoine Gagnon",
    role: "Acheteur B2B",
    location: "Québec, QC",
    avatar: "MG",
    color: "bg-tp-warning/20 text-tp-warning",
    rating: 5,
    text: "Pour notre PME, le mode Entreprise est un game-changer. On importe notre liste de 200 produits et TruePriceAI compare nos 3 fournisseurs américains en moins de 2 minutes. On a réduit nos coûts d'approvisionnement de 22% le premier mois.",
    savings: "22% de réduction",
  },
  {
    name: "Jennifer Wu",
    role: "Photographe freelance",
    location: "Toronto, ON",
    avatar: "JW",
    color: "bg-tp-info/20 text-tp-info",
    rating: 5,
    text: "L'assistant IA est bluffant. Je lui ai demandé si ça valait la peine d'acheter mon objectif Canon aux USA avec les douanes, et il m'a expliqué exactement les règles ACEUM et calculé que j'économiserais 210 $ même après tout ça.",
    savings: "210 $ économisés",
  },
];

export function Testimonials() {
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
            Témoignages
          </p>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-white tracking-tight">
            Ils ont arrêté de payer trop cher
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.12 }}
              className="bg-tp-card rounded-2xl p-7 border border-tp-cyan-500/15 hover:border-tp-cyan-500/35 hover:shadow-tp-lg transition-all duration-300 flex flex-col relative"
            >
              <Quote className="absolute top-5 right-5 w-8 h-8 text-white/5" />

              <div className="flex items-center gap-1 mb-4">
                {[...Array(t.rating)].map((_, j) => (
                  <Star key={j} className="w-4 h-4 text-tp-warning fill-tp-warning" />
                ))}
              </div>

              <p className="text-white/70 text-sm leading-relaxed mb-6 flex-1">
                "{t.text}"
              </p>

              <div className="flex items-center justify-between pt-5 border-t border-tp-cyan-500/15">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full ${t.color} flex items-center justify-center font-bold text-sm`}>
                    {t.avatar}
                  </div>
                  <div>
                    <div className="font-semibold text-white text-sm">{t.name}</div>
                    <div className="text-xs text-white/40">
                      {t.role} · {t.location}
                    </div>
                  </div>
                </div>
                <div className="text-xs bg-tp-success/20 text-tp-success font-bold px-3 py-1.5 rounded-full whitespace-nowrap font-mono">
                  {t.savings}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
