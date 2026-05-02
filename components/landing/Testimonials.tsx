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
    color: "bg-purple-500",
    rating: 5,
    text: "J'ai économisé 487 $ en un seul mois sur des achats électroniques pour la maison. TruePriceAI m'a montrée que la télé que je voulais coûtait 340 $ de moins aux États-Unis, tout inclus avec les douanes et la livraison. Incroyable !",
    savings: "487 $ économisés",
  },
  {
    name: "Marc-Antoine Gagnon",
    role: "Acheteur B2B",
    location: "Québec, QC",
    avatar: "MG",
    color: "bg-brand-red",
    rating: 5,
    text: "Pour notre PME, le mode Entreprise est un game-changer. On importe notre liste de 200 produits et TruePriceAI compare nos 3 fournisseurs américains en moins de 2 minutes. On a réduit nos coûts d'approvisionnement de 22% le premier mois.",
    savings: "22% de réduction",
  },
  {
    name: "Jennifer Wu",
    role: "Photographe freelance",
    location: "Toronto, ON",
    avatar: "JW",
    color: "bg-blue-500",
    rating: 5,
    text: "L'assistant IA est bluffant. Je lui ai demandé si ça valait la peine d'acheter mon objectif Canon aux USA avec les douanes, et il m'a expliqué exactement les règles ACEUM et calculé que j'économiserais 210 $ même après tout ça.",
    savings: "210 $ économisés",
  },
];

export function Testimonials() {
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
            Témoignages
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-brand-navy">
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
              className="bg-white rounded-3xl p-7 border border-gray-100 hover:shadow-xl transition-all duration-300 flex flex-col relative"
            >
              <Quote className="absolute top-5 right-5 w-8 h-8 text-gray-100" />

              <div className="flex items-center gap-1 mb-4">
                {[...Array(t.rating)].map((_, j) => (
                  <Star key={j} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                ))}
              </div>

              <p className="text-gray-600 text-sm leading-relaxed mb-6 flex-1">
                "{t.text}"
              </p>

              <div className="flex items-center justify-between pt-5 border-t border-gray-100">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-full ${t.color} flex items-center justify-center text-white font-bold text-sm`}
                  >
                    {t.avatar}
                  </div>
                  <div>
                    <div className="font-semibold text-brand-navy text-sm">{t.name}</div>
                    <div className="text-xs text-gray-400">
                      {t.role} · {t.location}
                    </div>
                  </div>
                </div>
                <div className="text-xs bg-green-100 text-green-700 font-bold px-3 py-1.5 rounded-full whitespace-nowrap">
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
