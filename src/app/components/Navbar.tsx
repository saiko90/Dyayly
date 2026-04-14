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
    // { name: 'Ateliers', path: '/ateliers' }, // temporairement masqué
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
        className="fixed top-[4.5rem] md:top-20 inset-x-4 md:inset-x-0 mx-auto z-50 max-w-5xl md:max-w-fit px-6 py-4 rounded-full border border-white/40 bg-white/20 backdrop-blur-2xl shadow-lg flex justify-between items-center"
      >
        {/* Logo Mobile (visible uniquement sur petit écran) */}
        <Link href="/" className="md:hidden font-serif italic text-lg text-stone-800 tracking-widest hover:text-purple-500 transition-colors">
          Dyayly
        </Link>

        {/* Liens Desktop */}
        <ul className="hidden md:flex items-center gap-10 text-xs uppercase tracking-[0.2em] font-light text-stone-800">
          <li className="hover:text-purple-500 transition-colors"><Link href="/">Accueil</Link></li>
          <li className="hover:text-purple-500 transition-colors"><Link href="/histoire">Histoire</Link></li>
          <li className="text-[15px] font-serif italic lowercase tracking-normal px-4 border-x border-stone-400 hover:text-purple-500 transition-colors">
            <Link href="/">Dyayly</Link>
          </li>
          <li className="hover:text-purple-500 transition-colors"><Link href="/boutique">Boutique</Link></li>
          {/* <li className="hover:text-purple-500 transition-colors"><Link href="/ateliers">Ateliers</Link></li> */}
        </ul>

        <div className="flex items-center gap-4 md:gap-6">
          {/* Compte Utilisateur */}
          <Link href="/profile" className="p-2 text-stone-800 hover:text-purple-500 transition">
            <User className="w-5 h-5" />
          </Link>

          {/* Panier (Desktop & Mobile) */}
          <button 
            onClick={toggleDrawer} 
            className="relative p-2 text-stone-800 hover:text-purple-500 transition"
          >
            <ShoppingBag className="w-5 h-5" />
            {mounted && items.length > 0 && (
              <span className="absolute top-0 right-0 bg-purple-400 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
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

      {/* MENU MOBILE ÉLÉGANT (Type Drawer) */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-stone-900/30 backdrop-blur-sm z-[60] md:hidden"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 h-full w-[85%] max-w-sm bg-[#FDFBF7] shadow-2xl z-[70] flex flex-col md:hidden"
            >
              <div className="p-6 flex justify-between items-center border-b border-stone-200">
                <Link href="/" onClick={() => setIsOpen(false)} className="font-serif italic text-xl text-stone-800 hover:text-purple-500 transition-colors">
                  Dyayly
                </Link>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="p-2 bg-stone-100 rounded-full text-stone-600 hover:bg-stone-200 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 flex flex-col gap-6">
                {links.map((link) => (
                  <Link 
                    key={link.name}
                    href={link.path} 
                    onClick={() => setIsOpen(false)}
                    className="text-3xl font-serif italic text-stone-800 hover:text-purple-500 transition-colors border-b border-stone-100 pb-4"
                  >
                    {link.name}
                  </Link>
                ))}
              </div>
              
              <div className="p-8 bg-stone-50 border-t border-stone-200 mt-auto">
                <p className="text-[10px] uppercase tracking-[0.3em] text-stone-500 mb-3">Suivez-nous</p>
                <div className="flex flex-col gap-2">
                  <a href="https://www.instagram.com/dyayly555?igsh=MW91YXRwNWRzZ2k5bA==" target="_blank" rel="noopener noreferrer" className="text-sm font-light text-stone-800 hover:text-purple-500 transition">
                    Instagram — @dyayly555
                  </a>
                  <a href="https://www.tiktok.com/@dyayly555?is_from_webapp=1&sender_device=pc" target="_blank" rel="noopener noreferrer" className="text-sm font-light text-stone-800 hover:text-purple-500 transition">
                    TikTok — @dyayly555
                  </a>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}