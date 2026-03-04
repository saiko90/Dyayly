'use client';

import MagicBackground from './components/MagicBackground';
import AnimatedLogo from './components/AnimatedLogo';
import PriceCard from './components/PriceCard';
import GlassContacts from './components/GlassContacts';
import JewelryGallery from './components/JewelryGallery';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from './components/Navbar';
import { useState } from 'react';
import toast from 'react-hot-toast';

export default function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [email, setEmail] = useState('');

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      toast.success('Inscrit avec succès ! Vous serez averti(e) des prochains ateliers.', { icon: '✨' });
      setIsModalOpen(false);
      setEmail('');
    }
  };

  const jewelryPrices = [
    { title: "Bracelet simple", price: "12" },
    { title: "Bracelet breloque & pierre", price: "18" },
    { title: "Collier simple", price: "28" },
    { title: "Collier prestige", price: "38" },
  ];

  return (
    <main className="relative min-h-screen text-stone-900 selection:bg-purple-100 overflow-hidden">
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
          <h1 className="text-7xl md:text-8xl font-serif mb-6 tracking-tighter italic text-stone-950 leading-none drop-shadow-sm">
            DYAYLY
          </h1>
          <p className="text-sm md:text-base font-light uppercase tracking-widest text-amber-800/90 mb-12">
            L'amour tissé en bijoux
          </p>
          {/* Ligne magique or */}
          <div className="h-px w-32 bg-amber-400 mx-auto rounded-full" />
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
          <h2 className="text-4xl font-serif italic text-stone-800">Révéler votre propre lumière</h2>
          <p className="text-xl md:text-2xl leading-relaxed font-light text-stone-600">
            "Chaque création porte une intention : celle de déposer un éclat de douceur, d’amour et de clarté. Des bijoux faits à la main pour accompagner les renaissances intérieures."
          </p>
          <div className="h-px w-24 bg-amber-300 mx-auto" />
        </motion.div>
      </section>

      {/* 4. Section Tarifs (Grid de cartes Cristal) */}
      <section className="py-24 px-6 max-w-7xl mx-auto z-10 relative">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-serif italic text-stone-800 mb-6">Les Créations</h2>
          <p className="text-amber-500 uppercase tracking-widest text-xs">Fait hand with love</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {jewelryPrices.map((item, index) => (
            <PriceCard key={index} title={item.title} price={item.price} />
          ))}
        </div>
      </section>

      {/* 5. Section Ateliers (Appel à l'action magique) */}
      <section className="py-32 px-6 z-10 relative">
        <div className="max-w-5xl mx-auto bg-stone-900 rounded-[3rem] p-16 text-white relative overflow-hidden shadow-2xl">
          <div className="relative z-10 space-y-8">
            <h2 className="text-4xl md:text-5xl font-serif italic text-amber-200">Ateliers & Cercles</h2>
            <p className="text-lg font-light text-stone-300 max-w-2xl leading-relaxed">
              Des moments conçus comme des refuges pour l’âme. Se reconnecter à ses mains et à son intuition autour d’un thé ou d’un café, pour créer en toute douceur.
            </p>
            <motion.button 
              onClick={() => setIsModalOpen(true)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-10 py-4 bg-amber-100 text-stone-900 rounded-full text-xs tracking-widest uppercase font-medium hover:bg-white transition-colors"
            >
              Être informé de l'ouverture
            </motion.button>
          </div>
          <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/20 blur-[120px] rounded-full pointer-events-none" />
        </div>
      </section>

      {/* MODAL INSCRIPTION ATELIERS */}
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
                  className="w-full p-4 rounded-xl border border-stone-200 bg-white/50 focus:outline-none focus:ring-2 focus:ring-amber-300"
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

      {/* 6. Galerie Instagram */}
      <section className="relative z-10 bg-white/30 backdrop-blur-lg">
        <JewelryGallery />
      </section>

      {/* 7. Contacts (Glassmorphism ultime) */}
      <section id="contacts" className="pt-24 pb-16 px-6 z-10 relative">
        <GlassContacts />
      </section>

      <footer className="py-12 border-t border-amber-200/40 relative z-10 flex flex-col items-center justify-center space-y-4">
        <p className="text-stone-400 text-[10px] tracking-[0.5em] uppercase">Dyayly — L'amour tissé en bijoux</p>
        <div className="flex items-center gap-6 text-xs text-stone-500 font-light hover:text-stone-700 transition-colors">
          <a href="/cgv" className="hover:text-amber-600 transition">CGV (Suisse)</a>
          <span>|</span>
          <a href="/mentions-legales" className="hover:text-amber-600 transition">Mentions Légales</a>
        </div>
        <p className="text-stone-400 text-[10px] tracking-widest mt-8">
          Site web créé par <span className="font-semibold text-stone-600">Swiss Digital Studio © 2026</span>
        </p>
      </footer>
    </main>
  );
}