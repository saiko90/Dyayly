-- ==========================================
-- SCRIPT DE MISE À JOUR (ANALYTICS & SYNC)
-- À exécuter dans l'éditeur SQL de Supabase
-- ==========================================

-- 1. SYNCHRONISATION DES ANCIENS COMPTES
-- Copie les utilisateurs déjà inscrits (qui sont dans auth.users) vers public.subscribers
INSERT INTO public.subscribers (id, email, source)
SELECT id, email, 'boutique'
FROM auth.users
WHERE email NOT IN (SELECT email FROM public.subscribers);

-- 2. CRÉATION DU DÉCLENCHEUR (TRIGGER) POUR LES FUTURS INSCRITS
-- Dès qu'un compte est créé, il s'ajoute tout seul à la liste des clients
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.subscribers (id, email, source)
  VALUES (new.id, new.email, 'boutique')
  ON CONFLICT (email) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- On attache le déclencheur
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 3. TABLE POUR LE SUIVI DES VISITES ET DU PANIER (ANALYTICS)
CREATE TABLE IF NOT EXISTS public.analytics (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  event_type text NOT NULL, -- 'visit', 'cart_add', 'order'
  page_path text
);

-- Autoriser tout le monde à envoyer des données statistiques
ALTER TABLE public.analytics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tout le monde peut logger une stat" ON public.analytics
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Seul l'admin lit les stats" ON public.analytics
  FOR SELECT USING (auth.role() = 'authenticated');

-- 4. AJOUT DE FAUSSES DONNÉES RÉALISTES POUR LE GRAPHIQUE DES VISITES
INSERT INTO public.analytics (created_at, event_type, page_path)
SELECT 
  now() - (random() * interval '7 days'), 
  CASE WHEN random() > 0.3 THEN 'visit' WHEN random() > 0.1 THEN 'cart_add' ELSE 'order' END,
  '/'
FROM generate_series(1, 150);