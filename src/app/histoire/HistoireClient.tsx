'use client';

import { motion, Variants } from 'framer-motion';
import MagicBackground from '../components/MagicBackground';
import Navbar from '../components/Navbar';
import GlassContacts from '../components/GlassContacts';
import Link from 'next/link';

interface HistoireContent {
  title: string;
  intro_text: string;
  card_text: string;
}

export default function HistoireClient({ content }: { content: HistoireContent }) {
  const fadeUp: Variants = {
    hidden: { opacity: 0, y: 40 },
    show: { opacity: 1, y: 0, transition: { duration: 1, ease: 'easeOut' } },
  };

  const staggerContainer: Variants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.3 } },
  };

  return (
    <main className="relative min-h-screen text-stone-900 selection:bg-purple-100 overflow-hidden pb-24">
      <Navbar />
      <MagicBackground />

      {/* HEADER */}
      <section className="relative pt-40 pb-20 md:pt-52 md:pb-32 px-6 max-w-4xl mx-auto text-center z-10">
        <motion.div initial="hidden" animate="show" variants={staggerContainer}>
          <motion.h1
            variants={fadeUp}
            className="text-5xl md:text-7xl mb-10 text-stone-800 leading-tight"
            style={{ fontFamily: 'var(--font-el-messiri), serif' }}
          >
            {content.title}
          </motion.h1>
          <motion.div variants={fadeUp} className="h-px w-32 bg-purple-300 mx-auto mb-10" />
          <motion.p variants={fadeUp} className="text-xl md:text-2xl font-light text-stone-600 leading-relaxed max-w-2xl mx-auto">
            "{content.intro_text}"
          </motion.p>
        </motion.div>
      </section>

      {/* SECTION CENTRALE */}
      <section className="relative z-10 px-4 md:px-6 max-w-4xl mx-auto mb-32">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 1.2 }}
          className="relative bg-white/30 backdrop-blur-2xl border border-white/60 p-8 md:p-20 rounded-[3rem] shadow-2xl text-center overflow-hidden"
        >
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-amber-200/40 blur-[80px] rounded-full pointer-events-none" />
          <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-purple-300/30 blur-[80px] rounded-full pointer-events-none" />

          <div className="relative z-10 space-y-10">
            <p className="text-lg md:text-xl font-light text-stone-700 leading-relaxed whitespace-pre-line">
              {content.card_text}
            </p>

            <div className="pt-8">
              <p className="text-base md:text-lg font-medium text-purple-600/80 uppercase tracking-widest">
                C'est plus qu'un nom :
              </p>
              <p className="text-xl md:text-2xl font-serif italic text-stone-800 mt-2">
                "C'est une histoire que je tisse à la main, avec douceur, instinct, et liberté d'être."
              </p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* SECTION FINALE */}
      <section className="relative z-10 px-6 py-20 text-center max-w-2xl mx-auto">
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          variants={staggerContainer}
        >
          <motion.p variants={fadeUp} className="text-2xl md:text-4xl font-serif italic text-stone-800 mb-12">
            Ensemble, créons, rêvons, brillons.
          </motion.p>
          <motion.div variants={fadeUp}>
            <Link
              href="/boutique"
              className="inline-block px-10 py-4 bg-stone-900 text-purple-100 rounded-full text-xs tracking-[0.2em] uppercase font-medium hover:bg-stone-800 transition-colors shadow-xl hover:shadow-2xl hover:-translate-y-1 transform duration-300"
            >
              Découvrir les créations
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* CONTACT */}
      <section className="relative z-10 pt-16 px-4">
        <GlassContacts />
      </section>
    </main>
  );
}
