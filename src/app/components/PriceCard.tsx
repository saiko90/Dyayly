'use client';
import { motion } from 'framer-motion';

interface PriceCardProps {
  title: string;
  price: string;
}

export default function PriceCard({ title, price }: PriceCardProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -10 }}
      className="group bg-white/20 backdrop-blur-md border border-white/40 p-8 rounded-[2rem] shadow-sm hover:shadow-xl transition-all duration-500 text-center"
    >
      <h3 className="text-stone-700 font-light uppercase tracking-widest text-sm mb-4">{title}</h3>
      <div className="text-3xl font-serif text-stone-900 group-hover:text-amber-700 transition-colors">
        {price} <span className="text-lg">CHF</span>
      </div>
    </motion.div>
  );
}