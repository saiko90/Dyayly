'use client';

import { useEffect, useState } from 'react';
import { motion, useSpring, useMotionValue } from 'framer-motion';

export default function MagicCursor() {
  const [isDesktop, setIsDesktop] = useState(false);
  const [isHovering, setIsHovering] = useState(false);

  const mouseX = useMotionValue(-100);
  const mouseY = useMotionValue(-100);

  // Ressort ultra-rapide sans latence (mass faible, stiffness élevée)
  const springX = useSpring(mouseX, { stiffness: 2000, damping: 25, mass: 0.1 });
  const springY = useSpring(mouseY, { stiffness: 2000, damping: 25, mass: 0.1 });

  useEffect(() => {
    if (window.innerWidth >= 768) {
      setIsDesktop(true);
    }

    const updateMousePosition = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
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

    window.addEventListener('mousemove', updateMousePosition);
    document.addEventListener('mouseover', handleMouseOver);
    document.addEventListener('mouseout', handleMouseOut);

    return () => {
      window.removeEventListener('mousemove', updateMousePosition);
      document.removeEventListener('mouseover', handleMouseOver);
      document.removeEventListener('mouseout', handleMouseOut);
    };
  }, [mouseX, mouseY]);

  if (!isDesktop) return null;

  const neonLilac = "#d8b4fe"; // Lila clair
  const neonGold = "#fbbf24"; // Or/Ambre

  return (
    <motion.div
      className="fixed top-0 left-0 rounded-full z-[9999] pointer-events-none flex items-center justify-center"
      style={{
        x: springX,
        y: springY,
        translateX: "-50%",
        translateY: "-50%",
        // Cercle évidé en hover pour bien voir en dessous, petit point solide sinon
        backgroundColor: isHovering ? "transparent" : neonLilac,
        border: isHovering ? `1.5px solid ${neonGold}` : "none",
        width: isHovering ? 40 : 8,
        height: isHovering ? 40 : 8,
      }}
      transition={{ duration: 0.2, ease: "easeOut" }}
    >
      {/* Halo léger */}
      <motion.div 
        className="absolute inset-0 rounded-full blur-[8px] opacity-60"
        style={{
          backgroundColor: isHovering ? neonGold : neonLilac,
          scale: isHovering ? 1.2 : 2.5,
        }}
      />
      {/* Petit point central quand on hover pour garder la précision */}
      {isHovering && (
        <div className="w-1 h-1 rounded-full bg-white opacity-90 shadow-[0_0_10px_#fbbf24]" />
      )}
    </motion.div>
  );
}