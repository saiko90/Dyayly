'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import MagicBackground from '../components/MagicBackground';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import Link from 'next/link';

const ADMIN_EMAIL = 'contact@dyayly.ch';

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const isAdmin = user?.email === ADMIN_EMAIL;

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
      } else {
        setUser(session.user);
      }
      setLoading(false);
    };
    checkUser();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success('Déconnecté avec succès', { icon: '👋' });
    router.push('/login');
  };

  if (loading) return null;

  return (
    <main className="relative min-h-screen text-stone-900 bg-[#FDFBF7] selection:bg-purple-100 flex flex-col items-center pt-32 px-6">
      <Navbar />
      <MagicBackground />

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-2xl bg-white/40 backdrop-blur-md p-10 rounded-[3rem] shadow-2xl border border-white/50"
      >
        <h1 className="text-4xl font-serif italic text-stone-800 mb-2">Mon Compte</h1>
        <p className="text-stone-500 font-light mb-8">
          Bienvenue, {user?.email}
        </p>

        <div className="space-y-6">
          <div className="p-6 bg-white/60 rounded-2xl border border-stone-100">
            <h2 className="text-xl font-serif text-stone-800 mb-4">Historique des commandes</h2>
            <p className="text-stone-500 font-light">Vous n'avez pas encore passé de commande.</p>
          </div>

          <div className="p-6 bg-white/60 rounded-2xl border border-stone-100">
            <h2 className="text-xl font-serif text-stone-800 mb-4">Ateliers inscrits</h2>
            <p className="text-stone-500 font-light">Aucun atelier prévu pour le moment.</p>
          </div>
        </div>

        {isAdmin && (
          <div className="mt-8">
            <Link
              href="/admin"
              className="flex items-center justify-center gap-3 w-full py-4 bg-[#5C3D1E] text-amber-100 rounded-2xl text-xs tracking-widest uppercase font-medium hover:bg-[#7A4E2D] transition shadow-lg"
            >
              <span>⚙</span>
              Accéder au Dashboard
            </Link>
          </div>
        )}

        <div className="mt-6 text-center">
          <button
            onClick={handleLogout}
            className="px-8 py-3 bg-stone-200 text-stone-700 hover:bg-stone-300 rounded-full text-xs tracking-widest uppercase font-medium transition"
          >
            Se déconnecter
          </button>
        </div>
      </motion.div>
    </main>
  );
}