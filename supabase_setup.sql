-- ==========================================
-- SCRIPT DE CRÉATION DE LA BASE DE DONNÉES DYAYLY
-- À exécuter dans l'éditeur SQL de Supabase
-- ==========================================

-- 1. TABLE DES PRODUITS (Boutique)
CREATE TABLE IF NOT EXISTS public.products (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  title text NOT NULL,
  description text,
  price numeric NOT NULL,
  image_url text,
  is_online boolean DEFAULT true
);

-- Ajout de données de test pour voir le dashboard fonctionner immédiatement
INSERT INTO public.products (title, description, price, is_online)
VALUES 
  ('Bracelet simple', 'Tissé à la main, taille ajustable', 12.00, true),
  ('Bracelet breloque & pierre', 'Pierre naturelle, taille ajustable', 18.00, true),
  ('Collier simple', 'Tissé à la main, taille ajustable', 28.00, true),
  ('Collier prestige', 'Chaîne, pierres naturelles et breloques', 38.00, true);

-- 2. TABLE DES ABONNÉS (Newsletter Ateliers / Clients)
CREATE TABLE IF NOT EXISTS public.subscribers (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  email text UNIQUE NOT NULL,
  source text DEFAULT 'newsletter' -- 'newsletter' ou 'boutique'
);

-- Ajout de quelques faux clients pour le test
INSERT INTO public.subscribers (email, source)
VALUES 
  ('marie.lumiere@mail.ch', 'newsletter'),
  ('claire.doux@mail.com', 'boutique'),
  ('stefanie.dyayly@outlook.com', 'admin');

-- 3. POLITIQUES DE SÉCURITÉ (Row Level Security - RLS)
-- Par défaut, Supabase bloque tout. On doit autoriser la lecture et l'écriture.

-- Activer RLS sur les tables
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscribers ENABLE ROW LEVEL SECURITY;

-- Autoriser la LECTURE publique des produits (pour que les clients voient la boutique)
CREATE POLICY "Produits visibles par tous" ON public.products
  FOR SELECT USING (true);

-- Autoriser TOUT (Lecture, Écriture, Suppression) pour les utilisateurs authentifiés (L'admin) sur les produits
CREATE POLICY "Admin peut tout faire sur les produits" ON public.products
  FOR ALL USING (auth.role() = 'authenticated');

-- Autoriser l'INSERTION publique d'emails (pour que les gens puissent s'inscrire aux ateliers)
CREATE POLICY "Tout le monde peut s'inscrire" ON public.subscribers
  FOR INSERT WITH CHECK (true);

-- Autoriser la LECTURE des emails uniquement pour l'admin
CREATE POLICY "Seul l'admin voit les abonnés" ON public.subscribers
  FOR SELECT USING (auth.role() = 'authenticated');

-- ==========================================
-- 4. POLITIQUES DE STOCKAGE (Bucket "images")
-- ==========================================
-- (Assurez-vous que le bucket "images" est bien créé en mode PUBLIC dans Storage)

-- Autoriser la LECTURE publique des images
CREATE POLICY "Images visibles par tous" ON storage.objects
  FOR SELECT USING (bucket_id = 'images');

-- Autoriser l'AJOUT d'images pour les administrateurs (ou tout utilisateur authentifié)
CREATE POLICY "Admin peut ajouter des images" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'images' AND auth.role() = 'authenticated');

-- Autoriser la MODIFICATION d'images pour les administrateurs
CREATE POLICY "Admin peut modifier des images" ON storage.objects
  FOR UPDATE USING (bucket_id = 'images' AND auth.role() = 'authenticated');

-- Autoriser la SUPPRESSION d'images pour les administrateurs
CREATE POLICY "Admin peut supprimer des images" ON storage.objects
  FOR DELETE USING (bucket_id = 'images' AND auth.role() = 'authenticated');
