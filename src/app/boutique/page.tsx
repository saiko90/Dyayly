'use client';

import { motion, Variants, AnimatePresence } from 'framer-motion';
import { Droplet, Wind, Flame, HeartHandshake, ShieldAlert, Sparkles } from 'lucide-react';
import MagicBackground from '../components/MagicBackground';
import Navbar from '../components/Navbar';
import GlassContacts from '../components/GlassContacts';
import ProductModal, { type ProductForModal } from '../components/ProductModal';
import { supabase } from '@/lib/supabase';
import { useEffect, useState } from 'react';

export default function BoutiquePage() {
  const [products,         setProducts]         = useState<ProductForModal[]>([]);
  const [selectedProduct,  setSelectedProduct]  = useState<ProductForModal | null>(null);
  const [loading,          setLoading]          = useState(true);

  useEffect(() => {
    supabase
      .from('products')
      .select('*, product_variants(*)')
      .then(({ data, error }) => {
        if (error) console.error('Erreur fetch produits:', error);
        if (data)  setProducts(data as ProductForModal[]);
        setLoading(false);
      });
  }, []);

  const fadeUp: Variants = {
    hidden: { opacity: 0, y: 30 },
    show:   { opacity: 1, y: 0, transition: { duration: 0.8, ease: 'easeOut' } },
  };
  const staggerContainer: Variants = {
    hidden: { opacity: 0 },
    show:   { opacity: 1, transition: { staggerChildren: 0.2 } },
  };

  return (
    <main className="relative min-h-screen text-stone-900 selection:bg-purple-100 overflow-hidden pb-24">
      <Navbar />
      <MagicBackground />

      {/* HEADER */}
      <section className="relative pt-32 pb-16 md:pt-48 md:pb-24 px-6 max-w-4xl mx-auto text-center z-10">
        <motion.div initial="hidden" animate="show" variants={staggerContainer}>
          <motion.span variants={fadeUp} className="text-amber-600 uppercase tracking-[0.3em] text-xs font-medium mb-4 block">
            L'Atelier
          </motion.span>
          <motion.h1 variants={fadeUp} className="text-5xl md:text-7xl font-serif italic mb-8 leading-tight">
            Les Créations
          </motion.h1>
          <motion.div variants={fadeUp} className="h-px w-24 bg-purple-300 mx-auto mb-8" />
          <motion.p variants={fadeUp} className="text-lg md:text-xl font-light text-stone-600 leading-relaxed max-w-2xl mx-auto">
            Chaque bijou est une création artisanale, réalisée à la main avec intention et amour.
          </motion.p>
        </motion.div>
      </section>

      {/* GRILLE PRODUITS */}
      <section className="relative z-10 px-4 md:px-6 max-w-6xl mx-auto mb-24">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="w-8 h-8 rounded-full border-4 border-amber-300 border-t-transparent animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {products.map((product, i) => {
              const thumb =
                (Array.isArray(product.images) && product.images[0]) ||
                product.image_url ||
                '/logo-sunflower.jpeg';
              const hasVariants = (product.product_variants?.length ?? 0) > 0;

              return (
                <motion.div
                  key={product.id}
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true }}
                  variants={fadeUp}
                  custom={i}
                  transition={{ delay: i * 0.08 }}
                  whileHover={{ y: -8, scale: 1.02 }}
                  onClick={() => setSelectedProduct(product)}
                  className="cursor-pointer bg-white/40 backdrop-blur-xl border border-white/60 rounded-[2rem] shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group overflow-hidden"
                >
                  {/* Image */}
                  <div className="relative w-full aspect-square rounded-t-[2rem] overflow-hidden bg-stone-100">
                    <img
                      src={thumb}
                      alt={product.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    {/* Badge variantes */}
                    {hasVariants && (
                      <div className="absolute bottom-2 left-2 bg-white/90 text-stone-700 text-[9px] uppercase tracking-widest px-2.5 py-1 rounded-full font-medium shadow-sm">
                        Options disponibles
                      </div>
                    )}
                    {/* Overlay "Aperçu rapide" */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-stone-900/30">
                      <span className="bg-white/90 text-stone-800 text-xs uppercase tracking-widest px-5 py-2.5 rounded-full font-medium shadow-lg">
                        Aperçu rapide
                      </span>
                    </div>
                  </div>

                  {/* Infos */}
                  <div className="p-6 flex flex-col flex-1 justify-between">
                    <div>
                      <h3 className="text-xl font-serif italic text-stone-800 mb-1">{product.title}</h3>
                      {product.description && (
                        <p className="text-xs text-stone-500 font-light uppercase tracking-widest leading-relaxed line-clamp-2">
                          {product.description}
                        </p>
                      )}
                    </div>
                    <div className="flex items-end justify-between border-t border-amber-200/50 pt-4 mt-4">
                      <div>
                        <span className="text-3xl font-serif text-amber-700">{product.price}</span>
                        <span className="text-sm font-medium text-amber-900/60 ml-1">CHF</span>
                      </div>
                      <span className="text-xs text-stone-400 uppercase tracking-wider">Voir →</span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </section>

      {/* PERSONNALISATION & MATÉRIAUX */}
      <section className="relative z-10 px-4 md:px-6 max-w-5xl mx-auto mb-24">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="bg-stone-900 text-stone-100 p-8 md:p-16 rounded-[2rem] md:rounded-[3rem] shadow-2xl relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 blur-[100px] rounded-full pointer-events-none" />
          <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16">
            <div className="space-y-6">
              <Sparkles className="w-8 h-8 text-amber-300 mb-6" />
              <h3 className="text-3xl font-serif italic text-amber-200">Personnalisation</h3>
              <p className="font-light text-stone-300 leading-relaxed">
                Les bijoux sont ajustables et peuvent être entièrement personnalisés (couleurs, pierres, intention). Pour toute demande particulière, je suis à ton écoute pour créer le bijou qui fera briller ton âme.
              </p>
            </div>
            <div className="space-y-6 border-t md:border-t-0 md:border-l border-stone-700 pt-8 md:pt-0 md:pl-12">
              <h3 className="text-3xl font-serif italic text-amber-200">Matériaux choisis</h3>
              <ul className="space-y-4 font-light text-stone-300">
                <li className="flex items-start gap-3"><span className="text-amber-400 mt-1">•</span> Fil Lithanisa ciré ou nylon polyester (tissage solide et confortable).</li>
                <li className="flex items-start gap-3"><span className="text-amber-400 mt-1">•</span> Pierres naturelles soigneusement sélectionnées.</li>
                <li className="flex items-start gap-3"><span className="text-amber-400 mt-1">•</span> Perles en verre, bois, acier inoxydable et laiton.</li>
              </ul>
            </div>
          </div>
        </motion.div>
      </section>

      {/* SOIN & ENVOI */}
      <section className="relative z-10 px-4 md:px-6 max-w-6xl mx-auto mb-32">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-serif italic text-stone-800">Le Soin & L'Envoi</h2>
          <div className="h-px w-16 bg-amber-300 mx-auto mt-6" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} className="bg-white/40 backdrop-blur-md p-8 rounded-[2rem] border border-white/50 shadow-sm">
            <h4 className="text-xl font-serif italic text-stone-800 mb-6 flex items-center gap-3">
              <HeartHandshake className="text-amber-600 w-5 h-5" /> Conseils d'entretien
            </h4>
            <ul className="space-y-5 text-sm font-light text-stone-600">
              <li className="flex items-center gap-3"><Droplet className="w-4 h-4 text-purple-400 shrink-0" /> Évite le contact avec l'eau (douche, piscine).</li>
              <li className="flex items-center gap-3"><Wind className="w-4 h-4 text-purple-400 shrink-0" /> Évite parfum, crèmes et produits chimiques.</li>
              <li className="flex items-center gap-3"><Flame className="w-4 h-4 text-purple-400 shrink-0" /> Préférable de ne pas le porter lors de forte transpiration.</li>
            </ul>
          </motion.div>

          <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} transition={{ delay: 0.2 }} className="bg-white/40 backdrop-blur-md p-8 rounded-[2rem] border border-white/50 shadow-sm">
            <h4 className="text-xl font-serif italic text-stone-800 mb-6 flex items-center gap-3">
              <Wind className="text-amber-600 w-5 h-5" /> Expédition Douce
            </h4>
            <p className="text-sm font-light text-stone-600 leading-relaxed mb-4">Chaque bijou est soigneusement emballé dans du papier bulle pour voyager en toute sécurité jusqu'à toi.</p>
            <div className="bg-amber-100/50 rounded-xl p-4 mt-4">
              <p className="text-xs font-medium text-stone-700 uppercase tracking-wider mb-2">Frais de port</p>
              <p className="text-sm text-stone-600">Suisse : 5 CHF · Europe : 12 CHF<br/>Gratuit dès 150 CHF d'achat ✓</p>
            </div>
          </motion.div>

          <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} transition={{ delay: 0.4 }} className="bg-white/40 backdrop-blur-md p-8 rounded-[2rem] border border-white/50 shadow-sm">
            <h4 className="text-xl font-serif italic text-stone-800 mb-6 flex items-center gap-3">
              <ShieldAlert className="text-amber-600 w-5 h-5" /> Politique
            </h4>
            <p className="text-sm font-light text-stone-600 leading-relaxed mb-6">Mes bijoux sont faits main avec soin et passion. Pour cette raison, et pour garantir l'unicité de chaque pièce, je n'accepte ni retour ni échange.</p>
            <p className="text-sm font-medium text-purple-800/70 italic text-center mt-auto">Merci de soutenir l'artisanat local et le fait main.</p>
          </motion.div>
        </div>
      </section>

      {/* CONTACT */}
      <section className="relative z-10 px-4">
        <GlassContacts />
      </section>

      {/* ── Quick View Modal ── */}
      <AnimatePresence>
        {selectedProduct && (
          <ProductModal
            key={selectedProduct.id}
            product={selectedProduct}
            onClose={() => setSelectedProduct(null)}
          />
        )}
      </AnimatePresence>
    </main>
  );
}
