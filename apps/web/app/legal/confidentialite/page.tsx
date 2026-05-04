import Link from "next/link";

export const metadata = { title: "Politique de confidentialité — TruePriceAI" };

export default function ConfidentialitePage() {
  return (
    <div className="min-h-screen bg-tp-navy-700 py-16 px-6">
      <div className="max-w-3xl mx-auto">
        <Link href="/" className="text-tp-cyan-500 text-sm hover:underline mb-8 block">← Retour à l'accueil</Link>
        <h1 className="font-display text-4xl font-bold text-white mb-2">Politique de confidentialité</h1>
        <p className="text-slate-400 text-sm mb-10">Version 1.0.0 — Mai 2026</p>

        <div className="prose prose-invert prose-sm max-w-none space-y-8 text-slate-300">
          <section>
            <h2 className="text-white font-display text-xl font-semibold mb-3">1. Responsable du traitement</h2>
            <p>TruePriceAI (truepricai.ca) est responsable du traitement de vos données personnelles. Courriel : privacy@truepricai.ca</p>
          </section>

          <section>
            <h2 className="text-white font-display text-xl font-semibold mb-3">2. Données collectées</h2>
            <p>Nous collectons les données suivantes : nom, adresse courriel, adresse postale (optionnelle), données d'usage et préférences de notification. Aucune donnée de carte de crédit n'est stockée sur nos serveurs (traitement délégué à Stripe Inc.).</p>
          </section>

          <section>
            <h2 className="text-white font-display text-xl font-semibold mb-3">3. Finalités du traitement</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>Fourniture du service de comparaison de prix</li>
              <li>Gestion de votre abonnement et facturation</li>
              <li>Envoi d'alertes de prix et rapports (avec consentement)</li>
              <li>Amélioration du service via l'analyse anonymisée (avec consentement)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-white font-display text-xl font-semibold mb-3">4. Vos droits (Loi 25 / RGPD)</h2>
            <p>Vous disposez d'un droit d'accès, de rectification, d'effacement, de portabilité et d'opposition. Exercez ces droits depuis votre tableau de bord ou par courriel à privacy@truepricai.ca.</p>
          </section>

          <section>
            <h2 className="text-white font-display text-xl font-semibold mb-3">5. Conservation des données</h2>
            <p>Vos données sont conservées pendant la durée de votre abonnement, plus 30 jours après suppression du compte.</p>
          </section>

          <section>
            <h2 className="text-white font-display text-xl font-semibold mb-3">6. Témoins (cookies)</h2>
            <p>Nous utilisons des témoins fonctionnels (essentiels) et, avec votre consentement, des témoins analytiques. Aucun témoin publicitaire tiers n'est utilisé sans consentement explicite.</p>
          </section>
        </div>
      </div>
    </div>
  );
}
