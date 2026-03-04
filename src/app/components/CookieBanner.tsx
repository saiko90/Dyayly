'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Vérifie si l'utilisateur a déjà accepté
    const consent = localStorage.getItem('dyayly_cookie_consent');
    if (!consent) {
      // Petit délai pour ne pas agresser l'utilisateur dès la première seconde
      const timer = setTimeout(() => setIsVisible(true), 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('dyayly_cookie_consent', 'true');
    setIsVisible(false);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className="fixed bottom-6 left-6 right-6 md:left-auto md:right-6 md:w-96 z-[90] bg-white/60 backdrop-blur-xl border border-white/50 p-6 rounded-3xl shadow-2xl"
        >
          <div className="flex flex-col gap-4">
            <h3 className="font-serif italic text-lg text-stone-800">Douceur & Confidentialité</h3>
            <p className="text-xs font-light text-stone-600 leading-relaxed">
              Pour assurer le bon fonctionnement de la boutique et la magie de votre expérience, nous utilisons des cookies essentiels (LPD).
            </p>
            <div className="flex gap-3 mt-2">
              <button 
                onClick={handleAccept}
                className="flex-1 py-3 bg-stone-900 text-amber-100 text-xs tracking-widest uppercase font-medium rounded-xl hover:bg-stone-800 transition"
              >
                J'accepte
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}