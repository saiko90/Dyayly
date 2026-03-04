'use client';

import Navbar from '../components/Navbar';
import MagicBackground from '../components/MagicBackground';

export default function CGVPage() {
  return (
    <main className="relative min-h-screen text-stone-900 bg-[#FDFBF7] pb-24">
      <Navbar />
      <MagicBackground />

      <section className="relative pt-32 md:pt-48 px-6 max-w-4xl mx-auto z-10">
        <h1 className="text-4xl md:text-5xl font-serif italic mb-12 text-center">Conditions Générales de Vente (CGV)</h1>
        
        <div className="bg-white/50 backdrop-blur-md p-8 md:p-12 rounded-[2rem] border border-white/60 shadow-sm space-y-8 font-light text-stone-700 leading-relaxed">
          <section>
            <h2 className="text-2xl font-serif italic text-stone-800 mb-4">1. Champ d'application</h2>
            <p>Les présentes Conditions Générales de Vente (CGV) s'appliquent à tous les achats effectués sur le site internet de la marque Dyayly. Les offres s'adressent exclusivement à une clientèle domiciliée en Suisse.</p>
          </section>

          <section>
            <h2 className="text-2xl font-serif italic text-stone-800 mb-4">2. Prix et paiement</h2>
            <p>Tous les prix sont indiqués en Francs Suisses (CHF) et ne sont pas soumis à la TVA (art. 10 al. 2 let. a LTVA - franchise pour les entreprises réalisant un chiffre d'affaires inférieur à 100'000 CHF). Dyayly se réserve le droit de modifier ses prix à tout moment. Le paiement s'effectue au moment de la commande (Twint, Stripe, Cartes de crédit).</p>
          </section>

          <section>
            <h2 className="text-2xl font-serif italic text-stone-800 mb-4">3. Livraison</h2>
            <p>Les envois se font par La Poste Suisse. Un forfait de livraison (généralement 5 CHF) est appliqué lors du passage à la caisse. En cas de dégâts ou de retard imputable à La Poste, Dyayly ne saurait être tenu responsable.</p>
          </section>

          <section>
            <h2 className="text-2xl font-serif italic text-stone-800 mb-4">4. Retours et échanges</h2>
            <p>S'agissant de bijoux artisanaux fabriqués à la main, **les retours, remboursements et échanges ne sont pas acceptés**. En passant commande, l'acheteur accepte cette condition et soutient le commerce artisanal local. Chaque pièce est unique et peut présenter de légères variations.</p>
          </section>

          <section>
            <h2 className="text-2xl font-serif italic text-stone-800 mb-4">5. Garantie et réparation</h2>
            <p>Les bijoux sont conçus avec soin. Si toutefois un défaut de fabrication flagrant devait apparaître dans les 14 jours suivant la réception, veuillez prendre contact pour trouver une solution (réparation si possible). La garantie ne couvre pas l'usure normale, ni les dommages liés à un mauvais entretien (eau, parfum, transpiration).</p>
          </section>

          <section>
            <h2 className="text-2xl font-serif italic text-stone-800 mb-4">6. Protection des données</h2>
            <p>Les informations personnelles récoltées lors de la commande sont utilisées uniquement pour le traitement de l'achat et ne sont en aucun cas transmises à des tiers sans accord explicite, conformément à la LPD suisse.</p>
          </section>
        </div>
      </section>
    </main>
  );
}