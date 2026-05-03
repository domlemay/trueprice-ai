"use client";

import React from "react";
import { motion } from "framer-motion";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const faqs = [
  {
    q: "Comment fonctionne le calcul des douanes ?",
    a: "TruePriceAI utilise les codes HS (Harmonized System) de chaque catégorie de produits pour déterminer le taux de droit de douane applicable au Canada. Pour les produits qui qualifient sous l'Accord Canada–États-Unis–Mexique (ACEUM/CUSMA), le taux peut être 0%. Le montant de seuil d'exemption actuel est de 150 $ CAD pour les achats aux États-Unis. Tous ces calculs sont automatiques — vous n'avez rien à faire.",
  },
  {
    q: "Les prix sont-ils en temps réel ?",
    a: "Oui, TruePriceAI scrape les boutiques en arrière-plan et maintient un cache mis à jour toutes les heures. Quand vous lancez une recherche, vous obtenez des prix qui ont au maximum 1 heure d'ancienneté. Le taux de change provient de l'API de la Banque du Canada, actualisé toutes les heures les jours ouvrables.",
  },
  {
    q: "Quelles boutiques sont supportées ?",
    a: "Côté Canada : Amazon.ca, Best Buy Canada, Walmart Canada, Costco Canada, Canadian Tire, The Source, Bureau en Gros, Leon's et Home Depot Canada. Côté USA : Amazon.com, Best Buy US, Walmart US, Costco US, Home Depot US et B&H Photo. D'autres s'ajoutent régulièrement.",
  },
  {
    q: "Qu'est-ce que l'exemption ACEUM/CUSMA ?",
    a: "L'Accord Canada–États-Unis–Mexique (ACEUM, anciennement ALENA) prévoit que certaines marchandises fabriquées en Amérique du Nord peuvent être importées sans droits de douane. Le seuil de minimis pour les achats personnels aux USA est de 150 $ CAD : en dessous, aucun droit ni TPS/TVH fédérale ne s'applique. TruePriceAI applique automatiquement ces exemptions dans son calcul de coût réel.",
  },
  {
    q: "Mode Entreprise : qu'est-ce que ça inclut exactement ?",
    a: "Le mode Entreprise offre deux sous-modes : (1) Veille concurrentielle — surveillez les prix de vos concurrents sur des centaines de produits avec historique sur 90 jours et alertes. (2) Procurement B2B — importez votre liste d'achats en CSV/Excel, TruePriceAI compare vos fournisseurs, calcule le coût total réel et suggère le plan d'achat optimal. Exports vers WooCommerce, Shopify et formats personnalisés inclus.",
  },
  {
    q: "Puis-je annuler à tout moment ?",
    a: "Absolument. Aucun engagement, aucun frais d'annulation. Vous pouvez annuler votre abonnement à tout moment depuis votre portail client. Votre accès Premium reste actif jusqu'à la fin de la période de facturation en cours.",
  },
];

export function FAQ() {
  return (
    <section id="faq" className="py-24 bg-tp-card">
      <div className="container mx-auto px-4 max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-14"
        >
          <p className="text-tp-cyan-500 font-medium text-xs uppercase tracking-[0.12em] mb-3">
            Questions fréquentes
          </p>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-white tracking-tight">
            Tout ce que vous voulez savoir
          </h2>
          <p className="mt-4 text-white/60">
            Une question non couverte ? Écrivez-nous à{" "}
            <a
              href="mailto:bonjour@trueprice.ai"
              className="text-tp-cyan-500 hover:underline font-medium"
            >
              bonjour@trueprice.ai
            </a>
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-tp-navy-700 rounded-2xl border border-tp-cyan-500/15 shadow-tp-md overflow-hidden px-6"
        >
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, i) => (
              <AccordionItem key={i} value={`item-${i}`}>
                <AccordionTrigger>{faq.q}</AccordionTrigger>
                <AccordionContent>{faq.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  );
}
