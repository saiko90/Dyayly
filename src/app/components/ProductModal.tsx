'use client';

import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';
import toast from 'react-hot-toast';
import { supabase } from '@/lib/supabase';

interface Variant {
  id: string;
  label: string;
  value: string;
  price_adjustment: number;
}

export interface ProductForModal {
  id: string;
  title: string;
  price: number;
  description?: string;
  images?: string[];
  image_url?: string;
  product_variants?: Variant[];
}

interface Props {
  product: ProductForModal;
  onClose: () => void;
}

export default function ProductModal({ product, onClose }: Props) {
  const { addItem, toggleDrawer } = useCartStore();

  // ── Images ─────────────────────────────────────────────────────────────
  const images = useMemo(() => {
    if (Array.isArray(product.images) && product.images.length > 0) return product.images;
    if (product.image_url) return [product.image_url];
    return ['/logo-sunflower.jpeg'];
  }, [product]);

  const [activeImg,  setActiveImg]  = useState(0);
  const [lightbox,   setLightbox]   = useState(false);

  // ── Variantes ──────────────────────────────────────────────────────────
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});

  const variantGroups = useMemo(() => {
    const groups: Record<string, Variant[]> = {};
    for (const v of product.product_variants ?? []) {
      if (!groups[v.label]) groups[v.label] = [];
      groups[v.label].push(v);
    }
    return groups;
  }, [product.product_variants]);

  const groupLabels  = Object.keys(variantGroups);
  const allSelected  = groupLabels.every(label => selectedVariants[label]);
  const canAdd       = groupLabels.length === 0 || allSelected;

  // Prix dynamique (base + ajustements des variantes sélectionnées)
  const finalPrice = useMemo(() => {
    let adj = 0;
    for (const [label, value] of Object.entries(selectedVariants)) {
      const found = variantGroups[label]?.find(x => x.value === value);
      if (found) adj += found.price_adjustment ?? 0;
    }
    return product.price + adj;
  }, [selectedVariants, variantGroups, product.price]);

  // Clé composite panier: productId si pas de variante, productId::sig sinon
  const cartItemId = useMemo(() => {
    if (groupLabels.length === 0) return product.id;
    const sig = Object.entries(selectedVariants)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${k}=${v}`)
      .join('&');
    return sig ? `${product.id}::${sig}` : product.id;
  }, [product.id, selectedVariants, groupLabels.length]);

  const variantSummary = Object.entries(selectedVariants)
    .map(([k, v]) => `${k} : ${v}`)
    .join(' · ');

  // ── Ajout panier ───────────────────────────────────────────────────────
  const handleAdd = async () => {
    addItem({
      id: cartItemId,
      productId: product.id,
      title: product.title,
      price: finalPrice,
      image: images[0],
      selectedVariants: Object.keys(selectedVariants).length > 0 ? { ...selectedVariants } : undefined,
    });
    toast(`✨ ${product.title} ajouté au panier !`);
    await supabase.from('analytics').insert([{ event_type: 'cart_add', page_path: '/boutique' }]);
    onClose();
    setTimeout(() => toggleDrawer(), 300);
  };

  // ── Keyboard ───────────────────────────────────────────────────────────
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { lightbox ? setLightbox(false) : onClose(); }
      if (lightbox && e.key === 'ArrowLeft')  setActiveImg(i => (i - 1 + images.length) % images.length);
      if (lightbox && e.key === 'ArrowRight') setActiveImg(i => (i + 1) % images.length);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [lightbox, images.length, onClose]);

  // ── Render ─────────────────────────────────────────────────────────────
  return (
    <>
      {/* ── Backdrop ── */}
      <motion.div
        key="modal-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-stone-900/60 backdrop-blur-md z-[200]"
      />

      {/* ── Modal ── */}
      <motion.div
        key="modal-panel"
        initial={{ opacity: 0, scale: 0.93, y: 28 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.93, y: 28 }}
        transition={{ type: 'spring', damping: 28, stiffness: 280 }}
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[95vw] max-w-3xl max-h-[90vh] overflow-y-auto bg-[#FDFBF7] rounded-[2rem] shadow-2xl z-[201]"
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/90 shadow hover:bg-white text-stone-500 hover:text-stone-900 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid md:grid-cols-2">

          {/* ─── Galerie ─── */}
          <div className="bg-stone-100 rounded-t-[2rem] md:rounded-t-none md:rounded-l-[2rem] overflow-hidden flex flex-col">

            {/* Image principale */}
            <div
              className="relative flex-1 aspect-square cursor-zoom-in group"
              onClick={() => setLightbox(true)}
            >
              <img
                src={images[activeImg]}
                alt={product.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
              />
              {/* Overlay zoom hint */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/10">
                <div className="bg-white/85 rounded-full p-3 shadow-lg">
                  <ZoomIn className="w-5 h-5 text-stone-700" />
                </div>
              </div>
              {/* Nav arrows si plusieurs images */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={e => { e.stopPropagation(); setActiveImg(i => (i - 1 + images.length) % images.length); }}
                    className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/80 hover:bg-white shadow transition"
                  >
                    <ChevronLeft className="w-4 h-4 text-stone-700" />
                  </button>
                  <button
                    onClick={e => { e.stopPropagation(); setActiveImg(i => (i + 1) % images.length); }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/80 hover:bg-white shadow transition"
                  >
                    <ChevronRight className="w-4 h-4 text-stone-700" />
                  </button>
                </>
              )}
            </div>

            {/* Miniatures */}
            {images.length > 1 && (
              <div className="flex gap-2 p-3 bg-stone-50/80 overflow-x-auto">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImg(idx)}
                    className={`shrink-0 w-14 h-14 rounded-xl overflow-hidden border-2 transition ${
                      activeImg === idx
                        ? 'border-amber-400 shadow-md'
                        : 'border-transparent hover:border-amber-200'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ─── Détails produit ─── */}
          <div className="p-8 flex flex-col">
            <div className="flex-1 space-y-5">

              {/* Titre */}
              <div>
                <p className="text-[10px] uppercase tracking-[0.3em] text-amber-600 mb-1.5 font-medium">
                  Dyayly — Création artisanale
                </p>
                <h2 className="text-3xl font-serif italic text-stone-800 leading-tight">{product.title}</h2>
              </div>

              {/* Description */}
              {product.description && (
                <p className="text-sm font-light text-amber-900/80 leading-relaxed">{product.description}</p>
              )}

              {/* ── Sélecteurs de variantes ── */}
              {groupLabels.map(label => (
                <div key={label}>
                  <p className="text-[10px] uppercase tracking-widest text-[#8B5E3C] mb-2.5 font-semibold">
                    {label}
                    {!selectedVariants[label] && (
                      <span className="ml-2 text-amber-500 normal-case tracking-normal font-light">— sélectionner</span>
                    )}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {variantGroups[label].map(v => {
                      const isActive = selectedVariants[label] === v.value;
                      return (
                        <button
                          key={v.id}
                          onClick={() => setSelectedVariants(prev => ({ ...prev, [label]: v.value }))}
                          className={`px-4 py-2 rounded-full text-xs font-medium border transition-all ${
                            isActive
                              ? 'bg-stone-900 text-amber-100 border-stone-900 shadow-md scale-[1.03]'
                              : 'bg-white border-stone-200 text-stone-700 hover:border-purple-400 hover:text-purple-600'
                          }`}
                        >
                          {v.value}
                          {v.price_adjustment > 0 && <span className="ml-1 opacity-60">+{v.price_adjustment}</span>}
                          {v.price_adjustment < 0 && <span className="ml-1 opacity-60">{v.price_adjustment}</span>}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}

              {/* Résumé variantes sélectionnées */}
              {variantSummary && (
                <p className="text-xs text-stone-400 italic">{variantSummary}</p>
              )}
            </div>

            {/* ── Prix + CTA ── */}
            <div className="mt-6 pt-6 border-t border-stone-100">
              <div className="flex items-end justify-between mb-5">
                <div>
                  <span className="text-4xl font-serif text-amber-700">{finalPrice.toFixed(2)}</span>
                  <span className="text-lg text-amber-900/50 ml-1.5">CHF</span>
                </div>
                {groupLabels.length > 0 && !allSelected && (
                  <p className="text-xs text-stone-400 text-right max-w-[130px] leading-relaxed">
                    Choisir toutes les options pour continuer
                  </p>
                )}
              </div>

              <button
                onClick={handleAdd}
                disabled={!canAdd}
                className="w-full py-4 bg-stone-900 text-amber-100 rounded-full text-xs tracking-widest uppercase font-semibold hover:bg-stone-800 transition-colors shadow-lg disabled:opacity-35 disabled:cursor-not-allowed"
              >
                Ajouter au panier
              </button>

              <p className="text-center text-[10px] text-stone-400 mt-3 uppercase tracking-wider">
                Fait main avec amour · Valleyres-sous-montagny
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── Lightbox ── */}
      <AnimatePresence>
        {lightbox && (
          <>
            <motion.div
              key="lb-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setLightbox(false)}
              className="fixed inset-0 bg-black/92 z-[300] cursor-zoom-out"
            />
            <motion.div
              key="lb-content"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="fixed inset-0 z-[301] flex items-center justify-center p-6 pointer-events-none"
            >
              {/* Close */}
              <button
                onClick={() => setLightbox(false)}
                className="absolute top-4 right-4 p-2.5 rounded-full bg-white/10 hover:bg-white/25 text-white transition pointer-events-auto"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Arrows */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={() => setActiveImg(i => (i - 1 + images.length) % images.length)}
                    className="absolute left-4 p-3 rounded-full bg-white/10 hover:bg-white/25 text-white transition pointer-events-auto"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <button
                    onClick={() => setActiveImg(i => (i + 1) % images.length)}
                    className="absolute right-4 p-3 rounded-full bg-white/10 hover:bg-white/25 text-white transition pointer-events-auto"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                </>
              )}

              <img
                src={images[activeImg]}
                alt={product.title}
                className="max-w-full max-h-[88vh] object-contain rounded-2xl shadow-2xl pointer-events-auto cursor-default"
                onClick={e => e.stopPropagation()}
              />

              {/* Compteur */}
              {images.length > 1 && (
                <p className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/50 text-xs tracking-widest pointer-events-none">
                  {activeImg + 1} / {images.length}
                </p>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
