'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import Image from 'next/image';

export default function AnimatedLogo() {
  const { scrollYProgress } = useScroll();
  
  // Augmentation massive de la rotation (2 tours complets sur toute la page)
  const rotateSunflower = useTransform(scrollYProgress, [0, 1], [0, 720]);
  const scaleSunflower = useTransform(scrollYProgress, [0, 0.3], [1, 1.15]);

  return (
    <div className="relative w-72 h-72 md:w-96 md:h-96 flex items-center justify-center">
      
      {/* Halo de lumière */}
      <motion.div 
        animate={{ 
          scale: [1, 1.2, 1],
          opacity: [0.4, 0.7, 0.4] 
        }}
        transition={{ 
          duration: 6, 
          repeat: Infinity, 
          ease: "easeInOut" 
        }}
        className="absolute inset-0 bg-gradient-to-r from-amber-300 via-purple-300 to-amber-300 blur-[100px] rounded-full"
      />

      {/* Le Logo Tournesol */}
      <motion.div 
        style={{ rotate: rotateSunflower, scale: scaleSunflower }} 
        className="relative z-10 w-full h-full drop-shadow-2xl"
      >
        <Image 
          src="/logo-sunflower.jpeg" 
          alt="Dyayly Logo"
          fill
          sizes="(max-width: 768px) 100vw, 50vw" /* Correction de l'avertissement console */
          className="object-contain rounded-full"
          priority
        />
      </motion.div>

      {/* Texte subtil */}
      <div className="absolute z-20 top-[45%] left-1/2 -translate-x-1/2 text-center pointer-events-none">
        <p className="text-[10px] uppercase font-light tracking-[0.3em] text-amber-900/60 leading-tight">
          L'amour tissé<br/>en bijoux
        </p>
      </div>
    </div>
  );
}