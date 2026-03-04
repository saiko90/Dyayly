'use client';

import { motion, Variants } from 'framer-motion';
import { Droplet, Wind, Flame, HeartHandshake, ShieldAlert, Sparkles, ShoppingBag } from 'lucide-react';
import MagicBackground from '../components/MagicBackground';
import Navbar from '../components/Navbar';
import GlassContacts from '../components/GlassContacts';
import { useCartStore } from '@/store/useCartStore';
import toast from 'react-hot-toast';
import { supabase } from '@/lib/supabase';
import { useEffect, useState } from 'react';
import Image from 'next/image';

export default function BoutiquePage() {
  const addItem = useCartStore((state) => state.addItem);
  const toggleDrawer = useCartStore((state) => state.toggleDrawer);
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    const fetchProducts = async () => {
      // On retire le filtre is_online au cas où la colonne serait absente ou null dans Supabase
      const { data, error } = await supabase.from('products').select('*');
      if (error) {
        console.error("Erreur de récupération des produits:", error);
      }
      if (data) {
        setProducts(data);
      }
    };
    fetchProducts();
  }, []);

  // Typage strict avec ": Variants"
  const fadeUp: Variants = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
  };

  const staggerContainer: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.2 }
    }
  };

  return (
    <main className="relative min-h-screen text-stone-900 selection:bg-purple-100 overflow-hidden pb-24">
      <Navbar />
      <MagicBackground />

      {/* HEADER DE LA BOUTIQUE */}
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

      {/* SECTION TARIFS (Grille de produits) */}
      <section className="relative z-10 px-4 md:px-6 max-w-6xl mx-auto mb-24">
        {products.length === 0 ? (
          <div className="flex justify-center items-center py-20">
            <div className="w-8 h-8 rounded-full border-4 border-amber-300 border-t-transparent animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {products.map((item, i) => (
              <motion.div 
                key={item.id || i} 
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                variants={fadeUp}
                custom={i}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -8, scale: 1.02 }}
                className="bg-white/40 backdrop-blur-xl border border-white/60 p-6 rounded-[2rem] shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group overflow-hidden"
              >
              {/* IMAGE DU PRODUIT */}
              <div className="relative w-full aspect-square mb-6 rounded-2xl overflow-hidden bg-stone-100">
                <img 
                  src={item.image_url || '/logo-sunflower.jpeg'} 
                  alt={item.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
              </div>

              <div>
                <h3 className="text-xl font-serif italic text-stone-800 mb-2">{item.title}</h3>
                <p className="text-xs text-stone-500 font-light uppercase tracking-widest mb-6 leading-relaxed">{item.description || "Création unique Dyayly"}</p>
              </div>

              <div className="flex items-end justify-between border-t border-amber-200/50 pt-4 mt-auto relative z-10">
                <div>
                  <span className="text-3xl font-serif text-amber-700">{item.price}</span>
                  <span className="text-sm font-medium text-amber-900/60 ml-1 mb-1">CHF</span>
                </div>
                <button 
                  onClick={async () => {
                    addItem({ id: item.id, title: item.title, price: item.price });
                    toast(`✨ ${item.title} ajouté au panier !`);
                    // Tracking
                    await supabase.from('analytics').insert([{ event_type: 'cart_add', page_path: '/boutique' }]);
                  }}
                  className="p-3 bg-stone-900 text-amber-100 rounded-full hover:bg-stone-800 transition-colors shadow-lg"
                >
                  <ShoppingBag className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
            ))}
          </div>
        )}
      </section>

      {/* SECTION PERSONNALISATION & MATÉRIAUX */}
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
                <li className="flex items-start gap-3">
                  <span className="text-amber-400 mt-1">•</span>
                  Fil Lithanisa ciré ou nylon polyester (tissage solide et confortable).
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-amber-400 mt-1">•</span>
                  Pierres naturelles soigneusement sélectionnées.
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-amber-400 mt-1">•</span>
                  Perles en verre, bois, acier inoxydable et laiton.
                </li>
              </ul>
            </div>
          </div>
        </motion.div>
      </section>

      {/* SECTION ENTRETIEN, LIVRAISON ET POLITIQUES (Cartes de réassurance) */}
      <section className="relative z-10 px-4 md:px-6 max-w-6xl mx-auto mb-32">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-serif italic text-stone-800">Le Soin & L'Envoi</h2>
          <div className="h-px w-16 bg-amber-300 mx-auto mt-6" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          
          {/* Carte Entretien */}
          <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} className="bg-white/40 backdrop-blur-md p-8 rounded-[2rem] border border-white/50 shadow-sm">
            <h4 className="text-xl font-serif italic text-stone-800 mb-6 flex items-center gap-3">
              <HeartHandshake className="text-amber-600 w-5 h-5" />
              Conseils d'entretien
            </h4>
            <ul className="space-y-5 text-sm font-light text-stone-600">
              <li className="flex items-center gap-3"><Droplet className="w-4 h-4 text-purple-400 shrink-0"/> Évite le contact avec l'eau (douche, piscine).</li>
              <li className="flex items-center gap-3"><Wind className="w-4 h-4 text-purple-400 shrink-0"/> Évite parfum, crèmes et produits chimiques.</li>
              <li className="flex items-center gap-3"><Flame className="w-4 h-4 text-purple-400 shrink-0"/> Préférable de ne pas le porter lors de forte transpiration (sport).</li>
            </ul>
          </motion.div>

          {/* Carte Livraison */}
          <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} transition={{ delay: 0.2 }} className="bg-white/40 backdrop-blur-md p-8 rounded-[2rem] border border-white/50 shadow-sm">
            <h4 className="text-xl font-serif italic text-stone-800 mb-6 flex items-center gap-3">
              <Wind className="text-amber-600 w-5 h-5" />
              Expédition Douce
            </h4>
            <p className="text-sm font-light text-stone-600 leading-relaxed mb-4">
              Chaque bijou est soigneusement emballé dans du papier bulle (format 14x15cm) pour voyager en toute sécurité jusqu'à toi.
            </p>
            <div className="bg-amber-100/50 rounded-xl p-4 mt-4">
              <p className="text-xs font-medium text-stone-700 uppercase tracking-wider mb-2">Frais de port</p>
              <p className="text-sm text-stone-600">Suisse : ~5 CHF<br/>France / Belgique : Sur demande (frais de douane possibles)</p>
            </div>
          </motion.div>

          {/* Carte Politique */}
          <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} transition={{ delay: 0.4 }} className="bg-white/40 backdrop-blur-md p-8 rounded-[2rem] border border-white/50 shadow-sm">
            <h4 className="text-xl font-serif italic text-stone-800 mb-6 flex items-center gap-3">
              <ShieldAlert className="text-amber-600 w-5 h-5" />
              Politique
            </h4>
            <p className="text-sm font-light text-stone-600 leading-relaxed mb-6">
              Mes bijoux sont faits main avec soin et passion. Pour cette raison, et pour garantir l'unicité de chaque pièce, je n'accepte ni retour ni échange.
            </p>
            <p className="text-sm font-medium text-purple-800/70 italic text-center mt-auto">
              Merci de soutenir l'artisanat local et le fait main.
            </p>
          </motion.div>

        </div>
      </section>

      {/* RAPPEL CONTACT EN BAS */}
      <section className="relative z-10 px-4">
        <GlassContacts />
      </section>
    </main>
  );
}