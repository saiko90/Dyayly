'use client';

import { useCartStore } from '@/store/useCartStore';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import MagicBackground from '../components/MagicBackground';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function CheckoutPage() {
  const { items, totalPrice } = useCartStore();
  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => setMounted(true), []);

  const handleCheckout = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items }),
      });
      
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!mounted) return null;

  return (
    <main className="relative min-h-screen text-stone-900 bg-[#FDFBF7] selection:bg-purple-100 pb-24">
      <Navbar />
      <MagicBackground />

      <section className="relative pt-32 md:pt-48 px-6 max-w-4xl mx-auto z-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16">
          <h1 className="text-5xl font-serif italic mb-6">Finaliser ma commande</h1>
          <div className="h-px w-24 bg-amber-300 mx-auto" />
        </motion.div>

        {items.length === 0 ? (
          <div className="text-center p-12 bg-white/40 backdrop-blur-md rounded-3xl border border-white/50">
            <p className="text-xl font-light text-stone-600 mb-6">Ton panier est vide.</p>
            <Link href="/boutique" className="inline-block px-8 py-3 bg-stone-900 text-amber-100 rounded-full text-xs tracking-widest uppercase hover:bg-stone-800 transition">
              Retour à la boutique
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-12">
            {/* Formulaire de livraison */}
            <div className="bg-white/40 backdrop-blur-md p-8 rounded-[2rem] border border-white/50 shadow-sm space-y-6">
              <h2 className="text-2xl font-serif italic text-stone-800">Mes coordonnées</h2>
              
              <div className="space-y-4">
                <input type="text" placeholder="Nom complet" className="w-full p-4 rounded-xl border border-stone-200 bg-white/50 focus:outline-none focus:ring-2 focus:ring-amber-300" />
                <input type="email" placeholder="Adresse email" className="w-full p-4 rounded-xl border border-stone-200 bg-white/50 focus:outline-none focus:ring-2 focus:ring-amber-300" />
                <input type="text" placeholder="Adresse de livraison" className="w-full p-4 rounded-xl border border-stone-200 bg-white/50 focus:outline-none focus:ring-2 focus:ring-amber-300" />
                <div className="grid grid-cols-2 gap-4">
                  <input type="text" placeholder="NPA" className="w-full p-4 rounded-xl border border-stone-200 bg-white/50 focus:outline-none focus:ring-2 focus:ring-amber-300" />
                  <input type="text" placeholder="Ville" className="w-full p-4 rounded-xl border border-stone-200 bg-white/50 focus:outline-none focus:ring-2 focus:ring-amber-300" />
                </div>
              </div>
            </div>

            {/* Récapitulatif de commande */}
            <div className="bg-stone-900 text-stone-100 p-8 rounded-[2rem] shadow-2xl flex flex-col">
              <h2 className="text-2xl font-serif italic text-amber-200 mb-8">Récapitulatif</h2>
              
              <div className="space-y-4 flex-1">
                {items.map(item => (
                  <div key={item.id} className="flex justify-between items-center text-stone-300 font-light pb-4 border-b border-stone-800">
                    <span>{item.quantity}x {item.title}</span>
                    <span>{item.price * item.quantity} CHF</span>
                  </div>
                ))}
              </div>

              <div className="mt-8 pt-8 border-t border-stone-700">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-stone-400 font-light">Sous-total</span>
                  <span>{totalPrice()} CHF</span>
                </div>
                <div className="flex justify-between items-center mb-8">
                  <span className="text-stone-400 font-light">Livraison (Suisse)</span>
                  <span>5 CHF</span>
                </div>
                <div className="flex justify-between items-center mb-8">
                  <span className="text-lg font-serif italic text-amber-200">Total</span>
                  <span className="text-2xl font-serif text-amber-400">{totalPrice() + 5} CHF</span>
                </div>

                <button 
                  onClick={handleCheckout}
                  disabled={isLoading}
                  className="w-full py-4 bg-amber-200 text-stone-900 rounded-full text-xs tracking-widest uppercase font-bold hover:bg-white transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? "Redirection..." : "Procéder au paiement"}
                </button>
                <p className="text-center text-[10px] text-stone-500 mt-4 uppercase tracking-wider">
                  Paiement sécurisé via Stripe 
                </p>
              </div>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}