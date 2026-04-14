'use client';

import { useCartStore } from '@/store/useCartStore';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import MagicBackground from '../components/MagicBackground';
import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';

// ── Tarifs de livraison ──────────────────────────────────────
const SHIPPING_RATES: Record<string, number> = { CH: 5, EU: 12, WORLD: 19 };
const FREE_SHIPPING_THRESHOLD = 150;

export default function CheckoutPage() {
  const { items, totalPrice, clearCart } = useCartStore();
  const [mounted,       setMounted]       = useState(false);
  const [isLoading,     setIsLoading]     = useState(false);

  // Coordonnées
  const [fullName,     setFullName]     = useState('');
  const [email,        setEmail]        = useState('');
  const [address,      setAddress]      = useState('');
  const [postalCode,   setPostalCode]   = useState('');
  const [city,         setCity]         = useState('');
  const [country,      setCountry]      = useState<'CH' | 'EU' | 'WORLD'>('CH');
  const [customerNote, setCustomerNote] = useState('');

  // Code promo
  const [promoInput,    setPromoInput]    = useState('');
  const [appliedPromo,  setAppliedPromo]  = useState<{ code: string; percentage: number } | null>(null);
  const [checkingPromo, setCheckingPromo] = useState(false);

  useEffect(() => setMounted(true), []);

  // ── Calculs dynamiques ───────────────────────────────────────
  const subtotal = totalPrice();

  const shippingCost = useMemo(() => {
    if (subtotal >= FREE_SHIPPING_THRESHOLD) return 0;
    return SHIPPING_RATES[country];
  }, [subtotal, country]);

  const discountAmount = useMemo(() => {
    if (!appliedPromo) return 0;
    return Math.round((subtotal * appliedPromo.percentage / 100) * 100) / 100;
  }, [subtotal, appliedPromo]);

  const finalTotal = subtotal - discountAmount + shippingCost;

  // ── Validation code promo ────────────────────────────────────
  const handleApplyPromo = async () => {
    const code = promoInput.toUpperCase().trim();
    if (!code) return;
    if (!email) {
      toast.error('Saisissez d\'abord votre email pour valider un code promo.');
      return;
    }
    setCheckingPromo(true);
    try {
      const res = await fetch('/api/validate-promo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, email }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || 'Code promo invalide.');
        return;
      }

      setAppliedPromo({ code: data.code, percentage: data.percentage });
      toast.success(`Code "${data.code}" appliqué — −${data.percentage}% ! ✨`);
    } catch {
      toast.error('Impossible de vérifier le code. Réessayez.');
    } finally {
      setCheckingPromo(false);
    }
  };

  // ── Checkout ─────────────────────────────────────────────────
  const handleCheckout = async () => {
    if (!fullName || !email || !address || !city) {
      toast.error('Merci de remplir tous les champs obligatoires.');
      return;
    }
    setIsLoading(true);
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          // Données de commande (insertion Supabase côté serveur)
          userEmail:       email,
          fullName,
          address,
          city,
          postalCode,
          country,
          items,
          totalPrice:      finalTotal,
          shippingCost,
          discountAmount,
          promoCode:       appliedPromo?.code        || null,
          customerNote:    customerNote              || null,
          // Paramètres Stripe
          promoPercentage: appliedPromo?.percentage  || null,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        // Si le serveur rejette le code promo, on le retire visuellement
        if (data.error?.includes('code promo')) {
          setAppliedPromo(null);
          setPromoInput('');
        }
        throw new Error(data.error || 'Erreur lors de la commande');
      }

      clearCart();
      window.location.href = data.url;
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || 'Une erreur est survenue.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!mounted) return null;

  const inputCls = 'w-full p-4 rounded-xl border border-stone-200 bg-white/50 focus:outline-none focus:ring-2 focus:ring-amber-300';

  return (
    <main className="relative min-h-screen text-stone-900 bg-[#FDFBF7] selection:bg-purple-100 pb-24">
      <Navbar />
      <MagicBackground />

      <section className="relative pt-32 md:pt-48 px-6 max-w-5xl mx-auto z-10">
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

            {/* ── Formulaire ── */}
            <div className="bg-white/40 backdrop-blur-md p-8 rounded-[2rem] border border-white/50 shadow-sm space-y-5">

              {/* Section Contact */}
              <div>
                <h2 className="text-2xl font-serif italic text-stone-800 mb-4">Contact</h2>
                <input type="email" placeholder="Adresse email *" value={email}
                  onChange={e => setEmail(e.target.value)} className={inputCls} />
                <p className="text-[11px] text-stone-400 mt-1.5 font-light">
                  Nécessaire pour confirmer votre commande et valider un code promo.
                </p>
              </div>

              <h2 className="text-2xl font-serif italic text-stone-800">Mes coordonnées</h2>

              <input type="text" placeholder="Nom complet *" value={fullName}
                onChange={e => setFullName(e.target.value)} className={inputCls} />

              <input type="text" placeholder="Adresse de livraison *" value={address}
                onChange={e => setAddress(e.target.value)} className={inputCls} />

              <div className="grid grid-cols-2 gap-4">
                <input type="text" placeholder="NPA" value={postalCode}
                  onChange={e => setPostalCode(e.target.value)} className={inputCls} />
                <input type="text" placeholder="Ville *" value={city}
                  onChange={e => setCity(e.target.value)} className={inputCls} />
              </div>

              {/* Zone de livraison */}
              <div>
                <label className="block text-xs uppercase tracking-widest text-[#8B5E3C] mb-2 font-light">
                  Zone de livraison
                </label>
                <select
                  value={country}
                  onChange={e => setCountry(e.target.value as 'CH' | 'EU' | 'WORLD')}
                  className={`${inputCls} cursor-pointer`}
                >
                  <option value="CH">🇨🇭 Suisse — 5 CHF {subtotal >= FREE_SHIPPING_THRESHOLD ? '(GRATUIT ✓)' : ''}</option>
                  <option value="EU">🇪🇺 Europe — 12 CHF {subtotal >= FREE_SHIPPING_THRESHOLD ? '(GRATUIT ✓)' : ''}</option>
                  <option value="WORLD">🌍 Hors UE — 19 CHF {subtotal >= FREE_SHIPPING_THRESHOLD ? '(GRATUIT ✓)' : ''}</option>
                </select>
                {subtotal >= FREE_SHIPPING_THRESHOLD && (
                  <p className="text-xs text-green-600 mt-1.5 font-medium">
                    ✓ Livraison offerte dès 150 CHF d'achat !
                  </p>
                )}
              </div>

              {/* Code promo */}
              <div>
                <label className="block text-xs uppercase tracking-widest text-[#8B5E3C] mb-2 font-light">
                  Code promotionnel
                </label>
                {appliedPromo ? (
                  <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-xl">
                    <span className="text-green-700 font-medium text-sm">
                      ✓ {appliedPromo.code} — −{appliedPromo.percentage}% appliqué
                    </span>
                    <button onClick={() => { setAppliedPromo(null); setPromoInput(''); }}
                      className="text-xs text-stone-400 hover:text-red-500 transition">
                      Retirer
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="BIENVENUE15"
                      value={promoInput}
                      onChange={e => setPromoInput(e.target.value.toUpperCase())}
                      className={`${inputCls} flex-1 font-mono`}
                    />
                    <button
                      onClick={handleApplyPromo}
                      disabled={checkingPromo || !promoInput}
                      className="px-5 py-4 bg-[#7A4E2D] text-amber-100 rounded-xl text-xs tracking-wider uppercase font-medium hover:bg-[#5C3D1E] transition disabled:opacity-40"
                    >
                      {checkingPromo ? '…' : 'Appliquer'}
                    </button>
                  </div>
                )}
              </div>

              {/* Commentaire */}
              <div>
                <label className="block text-xs uppercase tracking-widest text-[#8B5E3C] mb-2 font-light">
                  Commentaire (optionnel)
                </label>
                <textarea
                  placeholder="Couleur souhaitée, message personnalisé…"
                  value={customerNote}
                  onChange={e => setCustomerNote(e.target.value)}
                  rows={2}
                  className={`${inputCls} resize-none text-sm font-light`}
                />
              </div>
            </div>

            {/* ── Récapitulatif ── */}
            <div className="bg-stone-900 text-stone-100 p-8 rounded-[2rem] shadow-2xl flex flex-col">
              <h2 className="text-2xl font-serif italic text-amber-200 mb-8">Récapitulatif</h2>

              <div className="space-y-3 flex-1">
                {items.map(item => (
                  <div key={item.id} className="pb-3 border-b border-stone-800">
                    <div className="flex justify-between items-start text-stone-300 font-light">
                      <span>{item.quantity}× {item.title}</span>
                      <span className="ml-4 shrink-0">{(item.price * item.quantity).toFixed(2)} CHF</span>
                    </div>
                    {item.selectedVariants && Object.keys(item.selectedVariants).length > 0 && (
                      <p className="text-[10px] text-stone-500 mt-0.5">
                        {Object.entries(item.selectedVariants).map(([k, v]) => `${k}: ${v}`).join(' · ')}
                      </p>
                    )}
                  </div>
                ))}
              </div>

              <div className="mt-8 pt-6 border-t border-stone-700 space-y-3">
                <div className="flex justify-between text-stone-400 font-light">
                  <span>Sous-total</span>
                  <span>{subtotal.toFixed(2)} CHF</span>
                </div>

                {discountAmount > 0 && (
                  <div className="flex justify-between text-green-400">
                    <span>Remise ({appliedPromo?.percentage}%)</span>
                    <span>−{discountAmount.toFixed(2)} CHF</span>
                  </div>
                )}

                <div className="flex justify-between text-stone-400 font-light">
                  <span>Livraison</span>
                  {shippingCost === 0
                    ? <span className="text-green-400">Gratuite ✓</span>
                    : <span>{shippingCost.toFixed(2)} CHF</span>
                  }
                </div>

                <div className="flex justify-between items-center pt-4 border-t border-stone-700">
                  <span className="text-lg font-serif italic text-amber-200">Total</span>
                  <span className="text-2xl font-serif text-amber-400">{finalTotal.toFixed(2)} CHF</span>
                </div>

                <button
                  onClick={handleCheckout}
                  disabled={isLoading}
                  className="w-full mt-4 py-4 bg-amber-200 text-stone-900 rounded-full text-xs tracking-widest uppercase font-bold hover:bg-white transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Redirection…' : 'Procéder au paiement'}
                </button>
                <p className="text-center text-[10px] text-stone-500 mt-3 uppercase tracking-wider">
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
