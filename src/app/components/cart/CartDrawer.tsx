'use client';

import { useCartStore } from '@/store/useCartStore';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, X, Plus, Minus, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function CartDrawer() {
  const { items, isDrawerOpen, toggleDrawer, updateQuantity, removeItem, totalPrice } = useCartStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <AnimatePresence>
      {isDrawerOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={toggleDrawer}
            className="fixed inset-0 bg-stone-900/40 backdrop-blur-sm z-40"
          />

          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full max-w-md bg-[#FDFBF7] shadow-2xl z-50 flex flex-col"
          >
            <div className="flex items-center justify-between p-6 border-b border-stone-200">
              <h2 className="text-2xl font-serif italic text-stone-800 flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-amber-600" />
                Ton Panier
              </h2>
              <button onClick={toggleDrawer} className="p-2 hover:bg-stone-100 rounded-full transition">
                <X className="w-5 h-5 text-stone-600" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-stone-500 space-y-4">
                  <ShoppingBag className="w-12 h-12 opacity-20" />
                  <p className="font-light">Ton panier est vide pour le moment.</p>
                </div>
              ) : (
                items.map((item) => (
                  <div key={item.id} className="flex gap-4 items-center bg-white p-4 rounded-2xl shadow-sm border border-stone-100">
                    <div className="flex-1">
                      <h3 className="font-serif italic text-lg text-stone-800">{item.title}</h3>
                      <p className="text-amber-700 font-medium">{item.price} CHF</p>
                    </div>

                    <div className="flex items-center gap-3 bg-stone-50 rounded-full px-2 py-1 border border-stone-200">
                      <button 
                        onClick={() => item.quantity > 1 ? updateQuantity(item.id, item.quantity - 1) : removeItem(item.id)}
                        className="p-1 hover:text-amber-600 transition"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="text-sm font-medium w-4 text-center">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="p-1 hover:text-amber-600 transition"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>

                    <button 
                      onClick={() => removeItem(item.id)}
                      className="p-2 text-stone-400 hover:text-red-500 transition"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                ))
              )}
            </div>

            {items.length > 0 && (
              <div className="p-6 border-t border-stone-200 bg-white">
                <div className="flex justify-between items-center mb-6">
                  <span className="text-stone-600 font-light uppercase tracking-widest text-xs">Total estimé</span>
                  <span className="text-2xl font-serif text-amber-800">{totalPrice()} CHF</span>
                </div>
                <Link 
                  href="/checkout" 
                  onClick={toggleDrawer}
                  className="w-full py-4 bg-stone-900 text-amber-100 rounded-full text-xs tracking-[0.2em] uppercase font-medium hover:bg-stone-800 transition-colors shadow-xl flex justify-center items-center gap-2"
                >
                  <ShoppingBag className="w-4 h-4" /> Valider ma commande
                </Link>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}