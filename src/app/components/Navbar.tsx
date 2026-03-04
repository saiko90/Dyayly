'use client';

import { motion, useScroll, useMotionValueEvent, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X, ShoppingBag, User } from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';

export default function Navbar() {
  const { toggleDrawer, items } = useCartStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  const { scrollY } = useScroll();
  const [hidden, setHidden] = useState(false);
  const [isOpen, setIsOpen] = useState(false); // État pour le menu mobile

  // Cache la barre au scroll vers le bas (uniquement sur desktop)
  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = scrollY.getPrevious() ?? 0;
    if (latest > previous && latest > 150 && !isOpen) {
      setHidden(true);
    } else {
      setHidden(false);
    }
  });

  const links = [
    { name: 'Accueil', path: '/' },
    { name: 'Histoire', path: '/histoire' },
    { name: 'Boutique', path: '/boutique' },
    { name: 'Ateliers', path: '/ateliers' },
  ];

  return (
    <>
      {/* NAVBAR DESKTOP & HEADER MOBILE */}
      <motion.nav
        variants={{
          visible: { y: 0 },
          hidden: { y: "-150%" },
        }}
        animate={hidden ? "hidden" : "visible"}
        transition={{ duration: 0.4, ease: "easeInOut" }}
        className="fixed top-4 md:top-6 inset-x-4 md:inset-x-0 mx-auto z-50 max-w-5xl md:max-w-fit px-6 py-4 rounded-full border border-white/40 bg-white/20 backdrop-blur-2xl shadow-lg flex justify-between items-center"
      >
        {/* Logo Mobile (visible uniquement sur petit écran) */}
        <div className="md:hidden font-serif italic text-xl text-stone-800 tracking-widest">
          Dyayly
        </div>

        {/* Liens Desktop */}
        <ul className="hidden md:flex items-center gap-10 text-xs uppercase tracking-[0.2em] font-light text-stone-800">
          <li className="hover:text-amber-600 transition-colors"><Link href="/">Accueil</Link></li>
          <li className="hover:text-amber-600 transition-colors"><Link href="/histoire">Histoire</Link></li>
          <li className="text-lg font-serif italic lowercase tracking-normal px-4 border-x border-stone-400">Dyayly</li>
          <li className="hover:text-amber-600 transition-colors"><Link href="/boutique">Boutique</Link></li>
          <li className="hover:text-amber-600 transition-colors"><Link href="/ateliers">Ateliers</Link></li>
        </ul>

        <div className="flex items-center gap-4 md:gap-6">
          {/* Compte Utilisateur */}
          <Link href="/profile" className="p-2 text-stone-800 hover:text-amber-600 transition">
            <User className="w-5 h-5" />
          </Link>

          {/* Panier (Desktop & Mobile) */}
          <button 
            onClick={toggleDrawer} 
            className="relative p-2 text-stone-800 hover:text-amber-600 transition"
          >
            <ShoppingBag className="w-5 h-5" />
            {mounted && items.length > 0 && (
              <span className="absolute top-0 right-0 bg-amber-500 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {items.length}
              </span>
            )}
          </button>

          {/* Bouton Hamburger Mobile */}
          <button 
            className="md:hidden text-stone-800 p-1"
            onClick={() => setIsOpen(true)}
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </motion.nav>

      {/* MENU FULLSCREEN MOBILE */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[60] bg-[#FDFBF7]/95 backdrop-blur-3xl flex flex-col items-center justify-center"
          >
            <button 
              className="absolute top-8 right-8 text-stone-800 p-2"
              onClick={() => setIsOpen(false)}
            >
              <X className="w-8 h-8" />
            </button>

            <div className="flex flex-col gap-8 text-center">
              {links.map((link, i) => (
                <motion.div
                  key={link.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 + 0.1 }}
                >
                  <Link 
                    href={link.path} 
                    onClick={() => setIsOpen(false)}
                    className="text-4xl font-serif italic text-stone-800 hover:text-amber-600 transition-colors"
                  >
                    {link.name}
                  </Link>
                </motion.div>
              ))}
            </div>
            
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="absolute bottom-12 text-xs uppercase tracking-[0.3em] text-amber-800/60"
            >
              L'amour tissé en bijoux
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}