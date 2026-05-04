import Link from "next/link";

export const metadata = { title: "Conditions d'utilisation — TruePriceAI" };

export default function CGUPage() {
  return (
    <div className="min-h-screen bg-tp-navy-700 py-16 px-6">
      <div className="max-w-3xl mx-auto">
        <Link href="/" className="text-tp-cyan-500 text-sm hover:underline mb-8 block">← Retour à l'accueil</Link>
        <h1 className="font-display text-4xl font-bold text-white mb-2">Conditions d'utilisation</h1>
        <p className="text-slate-400 text-sm mb-10">Version 1.0.0 — Mai 2026</p>

        <div className="prose prose-invert prose-sm max-w-none space-y-8 text-slate-300">
          <section>
            <h2 className="text-white font-display text-xl font-semibold mb-3">1. Acceptation des conditions</h2>
            <p>En utilisant TruePriceAI, vous acceptez les présentes conditions d'utilisation. Si vous n'acceptez pas ces conditions, veuillez ne pas utiliser le service.</p>
          </section>

          <section>
            <h2 className="text-white font-display text-xl font-semibold mb-3">2. Description du service</h2>
            <p>TruePriceAI est une plateforme SaaS de comparaison de prix Canada/États-Unis qui calcule le coût total réel d'un produit incluant le taux de change, les taxes provinciales, les droits de douane CUSMA et les frais de livraison.</p>
          </section>

          <section>
            <h2 className="text-white font-display text-xl font-semibold mb-3">3. Abonnements et facturation</h2>
            <p>Les abonnements sont facturés mensuellement ou annuellement. La résiliation prend effet à la fin de la période en cours. Aucun remboursement partiel n'est accordé sauf disposition légale contraire.</p>
          </section>

          <section>
            <h2 className="text-white font-display text-xl font-semibold mb-3">4. Limitation de responsabilité</h2>
            <p>Les informations de prix fournies sont à titre indicatif. TruePriceAI ne peut être tenu responsable des décisions d'achat prises sur la base des données affichées. Les prix peuvent varier selon les conditions du marché.</p>
          </section>

          <section>
            <h2 className="text-white font-display text-xl font-semibold mb-3">5. Propriété intellectuelle</h2>
            <p>Tout le contenu de la plateforme (textes, code, design, algorithmes) est la propriété exclusive de TruePriceAI et est protégé par les lois canadiennes sur le droit d'auteur.</p>
          </section>

          <section>
            <h2 className="text-white font-display text-xl font-semibold mb-3">6. Droit applicable</h2>
            <p>Les présentes conditions sont régies par les lois de la province de Québec et du Canada. Tout litige sera soumis à la juridiction des tribunaux du Québec.</p>
          </section>
        </div>
      </div>
    </div>
  );
}
