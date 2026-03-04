'use client';

import { motion, Variants, AnimatePresence } from 'framer-motion';
import MagicBackground from '../components/MagicBackground';
import GlassContacts from '../components/GlassContacts';
import Navbar from '../components/Navbar';
import { useState } from 'react';
import toast from 'react-hot-toast';

export default function AteliersPage() {
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

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.2 }
    }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
  };

  return (
    <main className="relative min-h-screen text-stone-900 selection:bg-purple-100 overflow-hidden pb-24">
      {/* Navigation et Fond Magique */}
      <Navbar />
      <MagicBackground />

      {/* HEADER DE LA PAGE */}
      <section className="relative pt-32 pb-16 md:pt-48 md:pb-24 px-6 max-w-4xl mx-auto text-center z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1 }}
        >
          <span className="text-amber-600 uppercase tracking-[0.3em] text-xs font-medium mb-4 block">
            Inscription & Partage
          </span>
          <h1 className="text-5xl md:text-7xl font-serif italic mb-8 leading-tight">
            Ateliers & Cercles
          </h1>
          <div className="h-px w-24 bg-purple-300 mx-auto mb-8" />
          <p className="text-lg md:text-xl font-light text-stone-600 leading-relaxed">
            Dyayly s’épanouira prochainement avec de nouvelles expériences.
          </p>
        </motion.div>
      </section>

      {/* CONTENU PRINCIPAL (Cartes de présentation) */}
      <section className="relative z-10 px-4 md:px-6 max-w-5xl mx-auto space-y-8 md:space-y-12">
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-1 md:grid-cols-2 gap-8"
        >
          {/* Carte 1 : Création de bijoux */}
          <motion.div variants={itemVariants} className="bg-white/40 backdrop-blur-xl border border-white/50 p-8 md:p-12 rounded-[2rem] md:rounded-[3rem] shadow-sm">
            <h3 className="text-2xl md:text-3xl font-serif italic mb-4 text-stone-800">Ateliers de création</h3>
            <p className="font-light text-stone-600 leading-relaxed">
              Pour se reconnecter à ses mains, à son intuition, et laisser la lumière s’exprimer à travers la matière.
            </p>
          </motion.div>

          {/* Carte 2 : Groupes de parole */}
          <motion.div variants={itemVariants} className="bg-white/40 backdrop-blur-xl border border-white/50 p-8 md:p-12 rounded-[2rem] md:rounded-[3rem] shadow-sm">
            <h3 className="text-2xl md:text-3xl font-serif italic mb-4 text-stone-800">Groupes de parole</h3>
            <p className="font-light text-stone-600 leading-relaxed">
              Des cercles bienveillants où chacun pourra déposer ce qu’il traverse, être écouté, soutenu, et avancer ensemble, en douceur.
            </p>
          </motion.div>
        </motion.div>

        {/* Section Cocooning (Pleine largeur) */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="bg-stone-900 text-stone-100 p-8 md:p-16 rounded-[2rem] md:rounded-[3rem] text-center shadow-2xl relative overflow-hidden"
        >
          <div className="relative z-10 max-w-2xl mx-auto">
            <p className="text-xl md:text-2xl font-serif italic mb-6 leading-relaxed">
              "Ces moments sont conçus comme des refuges pour l’âme et la créativité."
            </p>
            <p className="font-light text-stone-400 mb-10">
              Ces instants se vivront dans une ambiance cocooning et chaleureuse, autour d’un café ou d’un thé, pour accueillir la lumière et faire briller les âmes.
            </p>
            
            <button 
              onClick={() => setIsModalOpen(true)}
              className="w-full md:w-auto px-8 py-4 bg-amber-100 text-stone-900 rounded-full text-sm tracking-widest uppercase font-medium hover:bg-white transition-colors shadow-lg hover:shadow-xl hover:-translate-y-0.5 transform duration-300"
            >
              M'inscrire sur liste d'attente
            </button>
          </div>
          {/* Halo lumineux de la carte noire */}
          <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-amber-500/10 blur-[100px] rounded-full pointer-events-none" />
        </motion.div>
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

      {/* RAPPEL CONTACT EN BAS */}
      <section className="relative z-10 pt-24 px-4">
        <GlassContacts />
      </section>
    </main>
  );
}