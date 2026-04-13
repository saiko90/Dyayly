-- ============================================================
-- MIGRATION — CODES PROMOS & ÉVOLUTION TABLE ORDERS
-- À exécuter dans l'éditeur SQL de Supabase
-- ============================================================

-- ─────────────────────────────────────────
-- 1. TABLE DES CODES PROMOS
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.promo_codes (
  id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at  timestamp with time zone DEFAULT timezone('utc', now()) NOT NULL,
  code        text UNIQUE NOT NULL,
  percentage  integer NOT NULL CHECK (percentage > 0 AND percentage <= 100),
  is_active   boolean DEFAULT true
);

ALTER TABLE public.promo_codes ENABLE ROW LEVEL SECURITY;

-- Lecture publique (le checkout doit pouvoir vérifier un code)
CREATE POLICY "Tout le monde peut lire les codes promos actifs" ON public.promo_codes
  FOR SELECT USING (true);

-- Seul l'admin peut créer / modifier / supprimer
CREATE POLICY "Admin gère les codes promos" ON public.promo_codes
  FOR ALL USING (auth.role() = 'authenticated');


-- ─────────────────────────────────────────
-- 2. ÉVOLUTION DE LA TABLE ORDERS
-- ─────────────────────────────────────────
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS promo_code      text,
  ADD COLUMN IF NOT EXISTS discount_amount numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS shipping_cost   numeric DEFAULT 5,
  ADD COLUMN IF NOT EXISTS country         text    DEFAULT 'CH';


-- ─────────────────────────────────────────
-- 3. DONNÉES DE BASE — CODES PROMOS
-- ─────────────────────────────────────────
INSERT INTO public.promo_codes (code, percentage)
VALUES
  ('BIENVENUE15', 15),   -- Code de bienvenue newsletter
  ('DYAYLY10',    10)    -- Code fidélité
ON CONFLICT (code) DO NOTHING;
