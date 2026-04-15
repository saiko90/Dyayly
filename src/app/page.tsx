'use client';

import MagicBackground from './components/MagicBackground';
import AnimatedLogo from './components/AnimatedLogo';
import GlassContacts from './components/GlassContacts';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from './components/Navbar';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

export default function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [products, setProducts] = useState<any[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  // Bannière promotionnelle dynamique
  const [bannerText,   setBannerText]   = useState('✨ −15% sur votre première commande en vous inscrivant à la newsletter ✨');
  const [bannerActive, setBannerActive] = useState(true);

  useEffect(() => {
    // Best sellers filtrés
    supabase
      .from('products')
      .select('id, title, price, images, image_url, description')
      .eq('is_online', true)
      .eq('is_bestseller', true)
      .limit(6)
      .then(({ data }) => {
        if (data) setProducts(data);
        setLoadingProducts(false);
      });

    // Paramètres bannière
    fetch('/api/admin/settings')
      .then(r => r.json())
      .then(data => {
        if (data.promo_banner_text)   setBannerText(data.promo_banner_text);
        if (typeof data.promo_banner_active === 'boolean') setBannerActive(data.promo_banner_active);
      })
      .catch(() => {}); // garde les valeurs par défaut en cas d'erreur
  }, []);

  const handleSubscribe = async (e: { preventDefault(): void }) => {
    e.preventDefault();
    if (!email) return;
    try {
      const res = await fetch('/api/welcome-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.error === 'already_subscribed') {
          toast('Cet e-mail est déjà inscrit à notre newsletter ! ✨', {
            icon: '💌',
            style: { background: '#FDF3E8', color: '#7A4E2D', border: '1px solid #C4956A' },
          });
        } else {
          toast.error('Une erreur est survenue. Réessayez dans un instant.');
        }
        return; // Dans tous les cas d'erreur : ne pas fermer le modal
      }

      toast.success('Inscrit(e) avec succès ! Votre code BIENVENUE15 vous a été envoyé par email.', {
        icon: '✨',
        duration: 5000,
      });
      setIsModalOpen(false);
      setEmail('');
    } catch {
      toast.error('Une erreur est survenue. Réessayez dans un instant.');
    }
  };

  return (
    <main className="relative min-h-screen text-stone-900 selection:bg-purple-100 overflow-hidden">
      {/* TOP BAR — Bannière double */}
      <div className="fixed top-0 inset-x-0 z-[60] flex flex-col">
        {/* Ligne promo (cliquable) — conditionnelle */}
        {bannerActive && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center justify-center py-1.5 bg-purple-400/25 backdrop-blur-sm hover:bg-purple-400/35 transition-colors w-full cursor-pointer border-b border-purple-300/20"
          >
            <p className="text-[10px] md:text-xs tracking-[0.25em] uppercase font-light text-white">
              {bannerText}
            </p>
          </button>
        )}
        {/* Ligne mots-clés */}
        <div className="flex items-center justify-center py-2 bg-white/75 backdrop-blur-sm border-b border-purple-100/60">
          <p
            className="text-base md:text-lg font-light text-purple-500 tracking-wide"
            style={{ fontFamily: 'var(--font-el-messiri), serif' }}
          >
            🧚‍♀️ Créativité&nbsp;&nbsp;·&nbsp;&nbsp;✨ Eveil&nbsp;&nbsp;·&nbsp;&nbsp;Positivité 🌝
          </p>
        </div>
      </div>

      <Navbar />
      
      {/* 1. L'univers magique unifié (Fond profond & Étoiles) */}
      <MagicBackground />

      {/* 2. Section Féerique d'Accueil (WOW) */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-6 pt-20">
        <AnimatedLogo />
        
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.5, delay: 0.5, ease: "easeOut" }}
          className="text-center mt-12 z-20"
        >
          <p
            className="text-3xl md:text-4xl font-light text-[#8B5E3C] mb-6"
            style={{ fontFamily: 'var(--font-el-messiri), serif' }}
          >
            L'amour tissé en bijoux
          </p>
          <p className="text-sm md:text-base font-light text-[#7A4E2D] max-w-md mx-auto leading-relaxed mb-12">
            DYAYLY c'est des bijoux et un univers créé pour aider chacune à reprendre la clé de sa propre énergie ✨
          </p>
          {/* Ligne magique */}
          <div className="h-px w-32 bg-purple-400 mx-auto rounded-full" />
        </motion.div>
      </section>

      {/* 3. Section Philosophie (Texte centré élégant) */}
      <section id="histoire" className="py-32 px-6 max-w-4xl mx-auto text-center z-10 relative">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="space-y-12"
        >
          <h2
            className="text-4xl font-serif italic text-stone-800 text-center mx-auto"
            style={{ fontFamily: 'var(--font-el-messiri), serif' }}
          >
            ✨ Révéler votre<br className="block md:hidden" /> propre lumière ✨
          </h2>
          <p className="text-xl md:text-2xl leading-relaxed font-light text-stone-600">
            "Chaque création porte une intention : celle de déposer un éclat de douceur, d’amour et de clarté. Des bijoux faits à la main pour accompagner les renaissances intérieures."
          </p>
          <div className="h-px w-24 bg-purple-300 mx-auto" />
        </motion.div>
      </section>

      {/* 4. Section Créations — données Supabase */}
      <section className="py-24 px-6 max-w-7xl mx-auto z-10 relative">
        <div className="text-center mb-16">
          <h2
            className="text-5xl italic text-[#A1887F] mb-6"
            style={{ fontFamily: 'var(--font-el-messiri), serif' }}
          >
            Best sellers
          </h2>
        </div>

        {loadingProducts ? (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 rounded-full border-4 border-amber-300 border-t-transparent animate-spin" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {products.map((product) => {
                const thumb =
                  (Array.isArray(product.images) && product.images[0]) ||
                  product.image_url ||
                  null;
                return (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    whileHover={{ y: -8 }}
                    className="group bg-white/20 backdrop-blur-md border border-white/40 rounded-[2rem] shadow-sm hover:shadow-xl transition-all duration-500 overflow-hidden flex flex-col"
                  >
                    {/* Image */}
                    <div className="relative w-full aspect-square bg-stone-100/50 overflow-hidden">
                      {thumb ? (
                        <img
                          src={thumb}
                          alt={product.title}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-stone-300">
                          <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                    </div>

                    {/* Infos */}
                    <div className="p-6 flex flex-col flex-1 justify-between">
                      <div>
                        <h3 className="font-light uppercase tracking-widest text-sm text-stone-700 mb-1">
                          {product.title}
                        </h3>
                        {product.description && (
                          <p className="text-sm text-stone-900 font-light leading-relaxed line-clamp-2">
                            {product.description}
                          </p>
                        )}
                      </div>
                      <div className="flex items-end justify-between mt-4 pt-4 border-t border-white/40">
                        <span className="text-3xl font-serif text-[#8D6E63] transition-colors">
                          {product.price} <span className="text-lg">CHF</span>
                        </span>
                        <Link
                          href="/boutique"
                          className="text-xs uppercase tracking-widest text-purple-500 hover:text-amber-800 transition-colors font-medium"
                        >
                          Voir →
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {products.length > 0 && (
              <div className="text-center mt-12">
                <Link
                  href="/boutique"
                  className="inline-block px-10 py-4 border border-purple-300/60 text-[#7A4E2D] rounded-full text-xs tracking-widest uppercase hover:bg-purple-50 transition-colors"
                >
                  Voir toutes les créations
                </Link>
              </div>
            )}
          </>
        )}
      </section>

      {/* MODAL INSCRIPTION NEWSLETTER */}
      <AnimatePresence>
        {isModalOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="fixed inset-0 bg-stone-900/40 backdrop-blur-md z-[100]"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-[#FDFBF7] p-8 rounded-[2rem] shadow-2xl z-[101]"
            >
              <h3 className="text-3xl font-serif italic text-stone-800 mb-4">Être informé(e)</h3>
              <p className="text-stone-600 font-light mb-8">Laissez votre email pour être tenu(e) au courant des prochaines dates d'ateliers créatifs.</p>
              
              <form onSubmit={handleSubscribe} className="space-y-4">
                <input 
                  type="email" 
                  required
                  placeholder="Votre adresse email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-4 rounded-xl border border-stone-200 bg-white/50 focus:outline-none focus:ring-2 focus:ring-purple-300"
                />
                <div className="flex gap-4 pt-4">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 text-stone-500 hover:bg-stone-100 rounded-full transition">Annuler</button>
                  <button type="submit" className="flex-1 py-3 bg-stone-900 text-amber-100 rounded-full shadow-lg hover:bg-stone-800 transition">S'inscrire</button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* 6. Contacts (Glassmorphism ultime) */}
      <section id="contacts" className="pt-24 pb-16 px-6 z-10 relative">
        <GlassContacts />
      </section>

      <footer className="py-12 border-t border-purple-200/40 relative z-10 flex flex-col items-center justify-center space-y-4">
        <p className="text-stone-400 text-[10px] tracking-[0.5em] uppercase">Dyayly — L'amour tissé en bijoux</p>
        <div className="flex items-center gap-6 text-xs text-stone-500 font-light hover:text-stone-700 transition-colors">
          <a href="/cgv" className="hover:text-purple-500 transition">CGV (Suisse)</a>
          <span>|</span>
          <a href="/mentions-legales" className="hover:text-purple-500 transition">Mentions Légales</a>
        </div>
        <p className="text-stone-400 text-[10px] tracking-widest mt-8">
          Site web créé par <span className="font-semibold text-stone-600">Swiss Digital Studio © 2026</span>
        </p>
      </footer>
    </main>
  );
}