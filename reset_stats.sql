-- ==========================================
-- SCRIPT DE NETTOYAGE DES STATISTIQUES
-- À exécuter dans l'éditeur SQL de Supabase
-- ==========================================

-- Ce script va effacer toutes les fausses données générées pour la démonstration du graphique.
-- Les compteurs (Visiteurs, Paniers, Commandes, CA) retomberont à ZÉRO.
-- Ensuite, seules les vraies visites de vos clients feront monter les chiffres !

DELETE FROM public.analytics;
