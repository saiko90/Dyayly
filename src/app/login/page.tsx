'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import MagicBackground from '../components/MagicBackground';
import toast from 'react-hot-toast';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        router.push('/profile');
      }
    };
    checkSession();
  }, [router]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success('Connexion réussie !', { icon: '✨' });
        router.push('/profile');
      } else {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        
        // Add to subscribers so it appears in Admin dashboard
        await supabase.from('subscribers').insert([{ email, source: 'boutique' }]);
        
        toast.success('Compte créé ! Veuillez vérifier vos emails.', { icon: '💌' });
      }
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return (
    <main className="relative min-h-screen text-stone-900 bg-[#FDFBF7] selection:bg-purple-100 flex flex-col justify-center items-center">
      <Navbar />
      <MagicBackground />

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-md bg-white/40 backdrop-blur-md p-10 rounded-[3rem] shadow-2xl border border-white/50"
      >
        <h1 className="text-4xl font-serif italic text-stone-800 mb-2 text-center">
          {isLogin ? 'Bon retour' : 'Créer un compte'}
        </h1>
        <p className="text-stone-500 font-light text-center mb-8">
          {isLogin ? 'Connectez-vous à votre espace personnel.' : 'Rejoignez la communauté Dyayly.'}
        </p>

        <form onSubmit={handleAuth} className="space-y-6">
          <div className="space-y-4">
            <input 
              type="email" 
              placeholder="Adresse email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-4 rounded-xl border border-stone-200 bg-white/50 focus:outline-none focus:ring-2 focus:ring-amber-300" 
            />
            <input 
              type="password" 
              placeholder="Mot de passe" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-4 rounded-xl border border-stone-200 bg-white/50 focus:outline-none focus:ring-2 focus:ring-amber-300" 
            />
          </div>

          <button 
            type="submit" 
            className="w-full py-4 bg-stone-900 text-amber-100 rounded-full text-xs tracking-widest uppercase font-medium hover:bg-stone-800 transition shadow-xl"
          >
            {isLogin ? 'Se connecter' : "S'inscrire"}
          </button>
        </form>

        <div className="mt-8 text-center">
          <button 
            onClick={() => setIsLogin(!isLogin)}
            className="text-sm font-light text-stone-500 hover:text-amber-600 transition"
          >
            {isLogin ? "Pas encore de compte ? S'inscrire" : 'Déjà un compte ? Se connecter'}
          </button>
        </div>
      </motion.div>
    </main>
  );
}