'use client';

import Navbar from '../components/Navbar';
import MagicBackground from '../components/MagicBackground';

export default function MentionsLegalesPage() {
  return (
    <main className="relative min-h-screen text-stone-900 bg-[#FDFBF7] pb-24">
      <Navbar />
      <MagicBackground />

      <section className="relative pt-32 md:pt-48 px-6 max-w-4xl mx-auto z-10">
        <h1 className="text-4xl md:text-5xl font-serif italic mb-12 text-center">Mentions Légales</h1>
        
        <div className="bg-white/50 backdrop-blur-md p-8 md:p-12 rounded-[2rem] border border-white/60 shadow-sm space-y-8 font-light text-stone-700 leading-relaxed">
          <section>
            <h2 className="text-2xl font-serif italic text-stone-800 mb-4">Éditeur du site</h2>
            <p><strong>Dyayly</strong><br/>
            L'amour tissé en bijoux<br/>
            Suisse<br/>
            Email : dyayly@outlook.com<br/>
            Instagram : @dyayly555</p>
          </section>

          <section>
            <h2 className="text-2xl font-serif italic text-stone-800 mb-4">Réalisation du site</h2>
            <p><strong>Swiss Digital Studio 2026</strong><br/>
            Site web créé, développé et conçu par Swiss Digital Studio.<br/>
            © 2026 Swiss Digital Studio. Tous droits réservés.</p>
          </section>

          <section>
            <h2 className="text-2xl font-serif italic text-stone-800 mb-4">Hébergement</h2>
            <p>Le site est hébergé par Vercel Inc.<br/>
            440 N Barranca Ave #4133<br/>
            Covina, CA 91723<br/>
            États-Unis</p>
          </section>

          <section>
            <h2 className="text-2xl font-serif italic text-stone-800 mb-4">Propriété intellectuelle</h2>
            <p>Le contenu de ce site web (textes, images, logos, design) est la propriété exclusive de Dyayly et Swiss Digital Studio, sauf mention contraire explicite. Toute reproduction partielle ou totale est strictement interdite sans autorisation préalable.</p>
          </section>

          <section>
            <h2 className="text-2xl font-serif italic text-stone-800 mb-4">Protection des données (LPD)</h2>
            <p>Dyayly s'engage à respecter la loi fédérale suisse sur la protection des données (LPD). Les données personnelles récoltées dans le cadre de la boutique sont utilisées uniquement pour le traitement de votre commande. Elles ne sont ni vendues, ni transmises à des tiers sans votre accord. Les paiements sont sécurisés via la plateforme Stripe et/ou Twint, assurant une protection bancaire maximale.</p>
          </section>

          <section>
            <h2 className="text-2xl font-serif italic text-stone-800 mb-4">Limitation de responsabilité</h2>
            <p>Le site de Dyayly peut inclure des liens vers des sites tiers. Dyayly n'exerce aucun contrôle sur le contenu de ces sites externes et décline toute responsabilité s'agissant des informations ou des offres qui y sont proposées.</p>
          </section>
        </div>
      </section>
    </main>
  );
}