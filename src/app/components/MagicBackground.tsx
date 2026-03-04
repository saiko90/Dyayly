'use client';

import { motion, useSpring, useMotionValue, MotionValue } from 'framer-motion';
import { useEffect, useState, useRef } from 'react';

// 1. Petit composant interne pour UNE étoile fixe (optimisation)
const Star = ({ star }: { star: { id: number, x: string, y: string, color: string, size: number } }) => (
  <motion.div
    key={star.id}
    className="absolute rounded-full"
    style={{ 
      left: star.x, 
      top: star.y, 
      backgroundColor: star.color,
      width: star.size,
      height: star.size,
      boxShadow: `0 0 ${star.size * 4}px ${star.size}px ${star.color}80`
    }}
    animate={{ 
      opacity: [0.2, 1, 0.2], 
      scale: [1, 1.5, 1],
      rotate: [0, 180, 360] 
    }}
    transition={{ 
      duration: 2 + (star.id % 5), 
      repeat: Infinity, 
      ease: "easeInOut" 
    }}
  />
);

export default function MagicBackground() {
  const [mounted, setMounted] = useState(false);
  
  // Coordonnées exactes de la souris en pixels
  const mouseX = useMotionValue(-100);
  const mouseY = useMotionValue(-100);

  // État pour savoir si on survole un élément cliquable
  const [isHovering, setIsHovering] = useState(false);

  // Configuration du ressort (Spring) : 
  // stiffness très élevé (1000) et damping (40) pour une réactivité maximale (ZÉRO lag)
  const springX = useSpring(mouseX, { stiffness: 1000, damping: 40 });
  const springY = useSpring(mouseY, { stiffness: 1000, damping: 40 });

  useEffect(() => {
    setMounted(true);
    
    // Suivi de la souris
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };

    // Détection du survol des éléments interactifs
    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      // On vérifie si la cible est un lien, un bouton ou a la classe spécfique
      if (target.closest('a') || target.closest('button') || target.closest('.price-card-hover')) {
        setIsHovering(true);
      }
    };

    const handleMouseOut = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('a') || target.closest('button') || target.closest('.price-card-hover')) {
        setIsHovering(false);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseover', handleMouseOver);
    document.addEventListener('mouseout', handleMouseOut);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseover', handleMouseOver);
      document.removeEventListener('mouseout', handleMouseOut);
    };
  }, [mouseX, mouseY]);

  if (!mounted) return null;

  // On génère les étoiles de fond (statiques mais qui clignotent doucement)
  const stars = Array.from({ length: 150 }).map((_, i) => ({
    id: i,
    x: `${Math.random() * 100}%`,
    y: `${Math.random() * 100}%`,
    color: i % 3 === 0 ? '#ffffff' : (i % 2 === 0 ? '#fbbf24' : '#d8b4fe'), // Blanc, Or, Lila
    size: Math.random() * 3 + 2 // Taille entre 2px et 5px
  }));

  // Particules qui flottent de bas en haut (Confettis magiques blancs et lila)
  const particles = Array.from({ length: 50 }).map((_, i) => ({
    id: `p-${i}`,
    x: `${Math.random() * 100}vw`,
    color: i % 2 === 0 ? '#d8b4fe' : '#ffffff', // Lila ou Blanc
    duration: Math.random() * 8 + 8,
    delay: Math.random() * 5,
    size: Math.random() * 5 + 3
  }));

  // Définition des couleurs néon
  const neonLilac = "#d8b4fe"; // Lila clair
  const neonGold = "#fbbf24"; // Or/Ambre (couleur de base du site)

  return (
    // pointer-events-none obligatoire sur le parent pour ne pas bloquer les clics
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {/* 1. FOND ACCENTUÉ (Féerique) */}
      <div className="absolute inset-0 bg-[#f9f5eb]" />
      {/* Lumières d'ambiance plus fortes */}
      <div className="absolute inset-0 bg-gradient-to-tr from-amber-300/30 via-transparent to-purple-500/20" />
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-amber-200/40 blur-[150px] rounded-full mix-blend-multiply" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-purple-300/40 blur-[120px] rounded-full mix-blend-multiply" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-rose-200/30 blur-[100px] rounded-full mix-blend-multiply" />

      {/* 2. ÉTOILES DE FOND */}
      {stars.map((star) => (
        <Star key={star.id} star={star} />
      ))}

      {/* 2.5 PARTICULES FLOTTANTES */}
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: p.x,
            bottom: '-10%',
            backgroundColor: p.color,
            width: p.size,
            height: p.size,
            boxShadow: `0 0 ${p.size * 3}px ${p.size}px ${p.color}80`
          }}
          animate={{
            y: ['0vh', '-120vh'],
            x: ['0vw', `${(Math.random() - 0.5) * 20}vw`],
            opacity: [0, 0.8, 0]
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: "linear"
          }}
        />
      ))}

    </div>
  );
}