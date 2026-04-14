'use client';

import { motion } from 'framer-motion';
import { Mail, Phone, Instagram } from 'lucide-react';

const TikTokIcon = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V9.73a8.16 8.16 0 0 0 4.79 1.52V7.79a4.85 4.85 0 0 1-1.02-.1z" />
  </svg>
);

const ContactItem = ({ icon: Icon, label, value, href = '#' }: { icon: any, label: string, value: string, href?: string }) => (
  <motion.a
    href={href}
    target={href !== '#' ? '_blank' : undefined}
    rel={href !== '#' ? 'noopener noreferrer' : undefined}
    whileHover={{ x: 10 }}
    className="flex items-center gap-4 text-stone-700 hover:text-purple-600 transition-colors group"
  >
    <div className="p-2.5 rounded-full bg-transparent border border-purple-300/50 group-hover:bg-purple-100/30 transition-colors">
      <Icon className="w-5 h-5 text-purple-500 group-hover:text-purple-700" />
    </div>
    <div>
      <p className="text-xs uppercase tracking-widest text-stone-500">{label}</p>
      <p className="text-base font-medium">{value}</p>
    </div>
  </motion.a>
);

export default function GlassContacts() {
  return (
    <motion.section 
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      whileHover={{ y: -10 }} // Effet WOW au survol
      className="max-w-xl mx-auto p-12 md:p-16 rounded- shadow-2xl relative overflow-hidden transition-shadow hover:shadow-purple-200"
      style={{
        // Glassmorphisme accentué
        background: "rgba(255, 255, 255, 0.2)",
        backdropFilter: "blur(20px)",
        border: "1px solid rgba(255, 255, 255, 0.4)",
        boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.08)"
      }}
    >
      <div className="relative z-10 space-y-8">
        <h3
          className="text-3xl mb-10 text-center italic text-stone-800"
          style={{ fontFamily: 'var(--font-el-messiri), serif' }}
        >
          Se connecter
        </h3>
        
        <ContactItem icon={Instagram} label="Instagram" value="@dyayly555" href="https://www.instagram.com/dyayly555?igsh=MW91YXRwNWRzZ2k5bA==" />
        <ContactItem icon={TikTokIcon} label="TikTok" value="@dyayly555" href="https://www.tiktok.com/@dyayly555?is_from_webapp=1&sender_device=pc" />
        <ContactItem icon={Phone} label="Téléphone" value="+41 78 729 36 56" />
        <ContactItem icon={Mail} label="Email" value="contact@dyayly.ch" />
      </div>

      {/* Reflet lumineux féerique */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-amber-300/10 blur-3xl -mr-20 -mt-20 rounded-full" />
    </motion.section>
  );
}