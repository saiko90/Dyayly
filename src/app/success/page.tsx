'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Navbar from '../components/Navbar';
import MagicBackground from '../components/MagicBackground';

interface OrderInfo {
  firstName: string | null;
  email:     string | null;
  orderRef:  string | null;
}

function SuccessContent() {
  const searchParams = useSearchParams();
  const sessionId    = searchParams.get('session_id');

  const [info,    setInfo]    = useState<OrderInfo | null>(null);
  const [loading, setLoading] = useState(!!sessionId);

  useEffect(() => {
    if (!sessionId) return;
    fetch(`/api/order-success?session_id=${sessionId}`)
      .then(r => r.json())
      .then(setInfo)
      .catch(() => setInfo(null))
      .finally(() => setLoading(false));
  }, [sessionId]);

  const greeting = info?.firstName ? `Merci, ${info.firstName} !` : 'Merci pour votre commande !';

  return (
    <main className="relative min-h-screen bg-[#FDFBF7] text-stone-900 selection:bg-purple-100">
      <Navbar />
      <MagicBackground />

      <section className="relative z-10 min-h-screen flex items-center justify-center px-6 pt-24 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="w-full max-w-lg"
        >
          {/* Carte principale */}
          <div className="bg-white/60 backdrop-blur-xl border border-white/70 rounded-[2.5rem] shadow-2xl p-10 md:p-14 text-center">

            {/* Checkmark animé */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', damping: 14, stiffness: 200, delay: 0.2 }}
              className="mx-auto mb-8 w-20 h-20 rounded-full bg-gradient-to-br from-purple-200 to-purple-400 flex items-center justify-center shadow-lg"
            >
              <motion.svg
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.5, ease: 'easeOut' }}
                className="w-10 h-10 text-stone-800"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2.5}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <motion.path
                  d="M4.5 12.75l6 6 9-13.5"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.6, delay: 0.5 }}
                />
              </motion.svg>
            </motion.div>

            {/* Titre */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              {loading ? (
                <div className="h-10 w-48 mx-auto rounded-xl bg-stone-100 animate-pulse mb-4" />
              ) : (
                <h1 className="text-3xl md:text-4xl font-serif italic text-stone-800 mb-3 leading-tight">
                  {greeting} ✨
                </h1>
              )}
              <div className="h-px w-20 bg-purple-300 mx-auto mt-4 mb-6" />
            </motion.div>

            {/* Infos commande */}
            {!loading && info?.orderRef && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="mb-6 inline-block px-5 py-2.5 bg-purple-400/10 border border-purple-300/50 rounded-full"
              >
                <p className="text-xs font-mono tracking-widest text-[#7A4E2D] uppercase">
                  Commande #{info.orderRef}
                </p>
              </motion.div>
            )}

            {/* Message principal */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="space-y-4 text-stone-600 font-light leading-relaxed mb-10"
            >
              <p className="text-base">
                Votre commande a bien été reçue et est en cours de préparation avec soin.
              </p>
              <p className="text-sm">
                {info?.email
                  ? <>Un email de confirmation avec votre facture vous a été envoyé à <span className="font-medium text-[#7A4E2D]">{info.email}</span> d'ici quelques minutes.</>
                  : "Un email de confirmation avec votre facture vous sera envoyé d'ici quelques minutes."
                }
              </p>
              <p className="text-sm text-stone-400 italic">
                Chaque bijou est préparé à la main, avec amour et intention. 🌸
              </p>
            </motion.div>

            {/* CTA */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="space-y-3"
            >
              <Link
                href="/boutique"
                className="block w-full py-4 bg-stone-900 text-amber-100 rounded-full text-xs tracking-widest uppercase font-semibold hover:bg-stone-800 transition-colors shadow-lg"
              >
                Retourner à la boutique
              </Link>
              <Link
                href="/"
                className="block w-full py-3.5 border border-stone-200 text-stone-600 rounded-full text-xs tracking-widest uppercase font-medium hover:bg-stone-50 transition-colors"
              >
                Revenir à l'accueil
              </Link>
            </motion.div>
          </div>

          {/* Étoiles décoratives */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="text-center text-[10px] text-stone-400 uppercase tracking-[0.3em] mt-8"
          >
            Dyayly — L'amour tissé en bijoux
          </motion.p>
        </motion.div>
      </section>
    </main>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-[#FDFBF7] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-4 border-purple-300 border-t-transparent animate-spin" />
      </main>
    }>
      <SuccessContent />
    </Suspense>
  );
}
