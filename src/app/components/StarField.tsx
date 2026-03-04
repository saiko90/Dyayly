'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

export default function StarField() {
  const [mounted, setMounted] = useState(false);
  const [stars, setStars] = useState<{ x: string, y: string, color: string }[]>([]);

  useEffect(() => {
    // Génération une seule fois sur le client pour éviter le mismatch
    const generatedStars = Array.from({ length: 80 }).map((_, i) => ({
      x: Math.random() * 100 + "%",
      y: Math.random() * 100 + "%",
      color: i % 2 === 0 ? '#fbbf24' : '#a78bfa' // Or ou Violet
    }));
    setStars(generatedStars);
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {stars.map((star, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 rounded-full shadow-"
          style={{ left: star.x, top: star.y, backgroundColor: star.color }}
          animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1, 0.8] }}
          transition={{
            duration: 3 + (i % 4),
            repeat: Infinity,
            delay: i % 2 === 0 ? 0 : 1,
            ease: "easeInOut"
          }}
        />
      ))}
    </div>
  );
}