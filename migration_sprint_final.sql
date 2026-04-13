-- ============================================================
-- MIGRATION SPRINT FINAL — DYAYLY
-- À exécuter dans l'éditeur SQL de Supabase
-- ============================================================

-- ─────────────────────────────────────────
-- 1. TABLE DES COMMANDES (avec customer_note)
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.orders (
  id            uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at    timestamp with time zone DEFAULT timezone('utc', now()) NOT NULL,
  user_email    text NOT NULL,
  full_name     text,
  address       text,
  city          text,
  postal_code   text,
  items         jsonb NOT NULL,         -- snapshot du panier au moment de la commande
  total_price   numeric NOT NULL,
  customer_note text,                   -- commentaire libre du client (optionnel)
  status        text DEFAULT 'pending'  -- pending | paid | shipped | cancelled
);

-- RLS
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Le client peut créer sa propre commande (anonyme ou connecté)
CREATE POLICY "Tout le monde peut créer une commande" ON public.orders
  FOR INSERT WITH CHECK (true);

-- Seul l'admin (authentifié) peut lire toutes les commandes
CREATE POLICY "Admin voit toutes les commandes" ON public.orders
  FOR SELECT USING (auth.role() = 'authenticated');

-- Seul l'admin peut modifier le statut d'une commande
CREATE POLICY "Admin peut modifier les commandes" ON public.orders
  FOR UPDATE USING (auth.role() = 'authenticated');


-- ─────────────────────────────────────────
-- 2. TABLE DES VARIANTES PRODUITS
-- ─────────────────────────────────────────
-- Modèle : chaque ligne = une option disponible sur un produit
-- Exemple : produit "Bracelet simple" → variantes Couleur:Turquoise, Couleur:Dorée
CREATE TABLE IF NOT EXISTS public.product_variants (
  id               uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at       timestamp with time zone DEFAULT timezone('utc', now()) NOT NULL,
  product_id       uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  label            text NOT NULL,          -- ex: "Couleur", "Taille", "Matière"
  value            text NOT NULL,          -- ex: "Turquoise", "S / M", "Argent"
  price_adjustment numeric DEFAULT 0,      -- surcoût (+3.00) ou réduction (-2.00)
  is_available     boolean DEFAULT true    -- pour désactiver sans supprimer
);

-- RLS
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;

-- Lecture publique des variantes (pour la boutique)
CREATE POLICY "Variantes visibles par tous" ON public.product_variants
  FOR SELECT USING (true);

-- Seul l'admin peut gérer les variantes
CREATE POLICY "Admin gère les variantes" ON public.product_variants
  FOR ALL USING (auth.role() = 'authenticated');


-- ─────────────────────────────────────────
-- 3. DONNÉES DE TEST — Variantes
-- ─────────────────────────────────────────
-- À adapter avec les vrais IDs de tes produits (visible dans le Dashboard Supabase)
-- Exemple avec les produits insérés au départ :

INSERT INTO public.product_variants (product_id, label, value, price_adjustment)
SELECT id, 'Couleur', 'Naturel', 0 FROM public.products WHERE title = 'Bracelet simple'
UNION ALL
SELECT id, 'Couleur', 'Turquoise', 0 FROM public.products WHERE title = 'Bracelet simple'
UNION ALL
SELECT id, 'Couleur', 'Doré', 2 FROM public.products WHERE title = 'Bracelet simple'
UNION ALL
SELECT id, 'Couleur', 'Naturel', 0 FROM public.products WHERE title = 'Bracelet breloque & pierre'
UNION ALL
SELECT id, 'Couleur', 'Améthyste', 0 FROM public.products WHERE title = 'Bracelet breloque & pierre'
UNION ALL
SELECT id, 'Longueur', 'Court (40 cm)', 0 FROM public.products WHERE title = 'Collier simple'
UNION ALL
SELECT id, 'Longueur', 'Long (60 cm)', 3 FROM public.products WHERE title = 'Collier simple';
