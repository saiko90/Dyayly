'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function Tracker() {
  const pathname = usePathname();

  useEffect(() => {
    // Ne tracke pas les visites sur l'admin
    if (pathname.startsWith('/admin')) return;

    const trackVisit = async () => {
      // Pour éviter de spammer la BDD au développement, on peut utiliser sessionStorage
      const lastVisit = sessionStorage.getItem(`visited_${pathname}`);
      if (!lastVisit) {
        await supabase.from('analytics').insert([
          { event_type: 'visit', page_path: pathname }
        ]);
        sessionStorage.setItem(`visited_${pathname}`, 'true');
      }
    };

    trackVisit();
  }, [pathname]);

  return null; // Ne rend rien visuellement
}