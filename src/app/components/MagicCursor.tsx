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

  const violet = "#C084FC"; // Violet clair

  return (
    <motion.div
      className="fixed top-0 left-0 rounded-full z-[9999] pointer-events-none flex items-center justify-center"
      style={{
        x: springX,
        y: springY,
        translateX: "-50%",
        translateY: "-50%",
        backgroundColor: isHovering ? "transparent" : violet,
        border: isHovering ? `1.5px solid ${violet}` : "none",
        width: isHovering ? 26 : 6,
        height: isHovering ? 26 : 6,
      }}
      transition={{ duration: 0.2, ease: "easeOut" }}
    >
      {/* Halo léger */}
      <motion.div
        className="absolute inset-0 rounded-full blur-[6px] opacity-50"
        style={{
          backgroundColor: violet,
          scale: isHovering ? 1.1 : 2,
        }}
      />
      {/* Petit point central en hover */}
      {isHovering && (
        <div className="w-1 h-1 rounded-full bg-white opacity-80 shadow-[0_0_8px_#C084FC]" />
      )}
    </motion.div>
  );
}