'use client';

import { motion } from 'framer-motion';
import { Mail, Phone, Instagram } from 'lucide-react';

const ContactItem = ({ icon: Icon, label, value }: { icon: any, label: string, value: string }) => (
  <motion.a 
    href="#"
    whileHover={{ x: 10 }}
    className="flex items-center gap-4 text-stone-700 hover:text-purple-700 transition-colors group"
  >
    <div className="p-2.5 rounded-full bg-amber-100/60 border border-amber-200/50 group-hover:bg-purple-100/60">
      <Icon className="w-5 h-5 text-amber-800/80 group-hover:text-purple-800" />
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
        <h3 className="text-3xl font-serif mb-10 text-center italic text-stone-800">Se connecter</h3>
        
        <ContactItem icon={Instagram} label="Instagram" value="@dyayly555" />
        <ContactItem icon={Phone} label="Téléphone" value="+41 78 729 36 56" />
        <ContactItem icon={Mail} label="Email" value="contact@dyayly.ch" />
      </div>

      {/* Reflet lumineux féerique */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-amber-300/10 blur-3xl -mr-20 -mt-20 rounded-full" />
    </motion.section>
  );
}