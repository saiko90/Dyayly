# 🚀 Guide de Déploiement en Production (Dyayly)

Ce guide t'explique comment mettre le site de Stéfanie en ligne sur internet.

## 1. Déploiement sur Vercel
Vercel est l'hébergeur idéal pour Next.js.
1. Va sur [Vercel.com](https://vercel.com/) et connecte-toi avec ton compte GitHub.
2. Clique sur **"Add New Project"** et sélectionne le dépôt Git `dyayly`.
3. Avant de cliquer sur "Deploy", ouvre la section **Environment Variables** et ajoute TOUTES les variables présentes dans ton fichier `.env.example` avec leurs vraies valeurs (clés Stripe de production, clés Supabase, et clé API Resend).
4. Clique sur **Deploy**. En 2 minutes, le site est en ligne sur un lien `.vercel.app`.

## 2. Configuration du Nom de Domaine Personnalisé
Pour avoir `dyayly.ch` :
1. Dans le tableau de bord Vercel du projet, va dans **Settings > Domains**.
2. Tape `dyayly.ch` et clique sur **Add**.
3. Vercel va te donner des valeurs DNS (Type `A` et/ou `CNAME`).
4. Va chez le vendeur de ton nom de domaine (ex: Infomaniak ou Swisscom), dans la "Zone DNS", et ajoute/modifie les enregistrements pour qu'ils pointent vers les valeurs fournies par Vercel.
5. Vercel générera automatiquement un certificat SSL (le cadenas HTTPS) !

## 3. Configuration des Emails (Resend)
Pour que l'onglet "Newsletter" du Dashboard puisse réellement envoyer des mails :
1. Va sur [Resend.com](https://resend.com) et crée un compte.
2. Dans **Domains**, ajoute ton domaine (`dyayly.ch`) et vérifie-le en ajoutant les entrées DNS fournies dans ta zone DNS (chez Infomaniak/Swisscom).
3. Va dans **API Keys**, crée une clé et copie-la.
4. Va dans les variables d'environnement sur Vercel, ajoute `RESEND_API_KEY` avec cette clé, puis relance un déploiement ("Redeploy").

## 4. Paiements réels (Stripe)
1. Va sur [Stripe.com](https://stripe.com).
2. Dans l'interface développeur, passe du "Mode Test" au "Mode En direct".
3. Récupère les nouvelles clés secrètes et mets à jour les variables d'environnement sur Vercel.

🎉 **C'est tout ! Le site est 100% prêt pour accueillir ses premières clientes.**