'use client';

import { motion } from 'framer-motion';

export default function Loading() {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#FDFBF7]">
      <div className="flex flex-col items-center justify-center gap-8">
        <motion.div
          animate={{
            scale: [1, 1.5, 1],
            rotate: [0, 180, 360],
            opacity: [0.5, 1, 0.5],
            boxShadow: [
              "0 0 20px 5px rgba(255, 0, 127, 0.3)",
              "0 0 40px 10px rgba(253, 224, 71, 0.6)",
              "0 0 20px 5px rgba(255, 0, 127, 0.3)"
            ]
          }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="w-12 h-12 rounded-full bg-gradient-to-tr from-amber-300 to-purple-400"
        />
        
        <motion.p
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="text-stone-500 font-serif italic text-xl tracking-widest"
        >
          Lumière en cours...
        </motion.p>
      </div>
    </div>
  );
}