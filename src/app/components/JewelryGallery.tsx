'use client';

import { motion } from 'framer-motion';
import { Instagram } from 'lucide-react';

export default function JewelryGallery() {
  const images = [
    '/WhatsApp Image 2026-01-29 at 17.05.36.jpeg',
    '/WhatsApp Image 2026-01-29 at 17.05.36 (1).jpeg',
    '/WhatsApp Image 2026-01-29 at 17.05.37.jpeg',
    '/WhatsApp Image 2026-01-29 at 17.05.37 (1).jpeg',
  ];

  return (
    <div className="w-full max-w-7xl mx-auto py-24 px-6">
      <div className="text-center mb-16 space-y-4">
        <h2 className="text-4xl md:text-5xl font-serif italic text-stone-800">Galerie d'Inspirations</h2>
        <a 
          href="https://instagram.com/dyayly555" 
          target="_blank" 
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-stone-500 hover:text-amber-600 transition-colors"
        >
          <Instagram className="w-4 h-4" />
          <span className="text-sm font-light uppercase tracking-widest">@dyayly555</span>
        </a>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {images.map((src, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ delay: i * 0.1, duration: 0.8 }}
            className="group relative aspect-[4/5] rounded-[2rem] overflow-hidden shadow-xl"
          >
            <img 
              src={src} 
              alt={`Dyayly création ${i+1}`}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-stone-900/0 group-hover:bg-stone-900/20 transition-colors duration-500" />
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500">
              <Instagram className="w-8 h-8 text-white drop-shadow-lg" />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}