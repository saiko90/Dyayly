import type { Metadata } from "next";
import { Cormorant_Garamond, Montserrat } from "next/font/google";
import "./globals.css";
import CartDrawer from "./components/cart/CartDrawer";
import MagicCursor from "./components/MagicCursor";
import CookieBanner from "./components/CookieBanner";
import Tracker from "./components/Tracker";
import { Toaster } from 'react-hot-toast';

// 1. Configuration de la police Serif (Titres élégants)
const cormorant = Cormorant_Garamond({ 
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-cormorant", // Variable CSS personnalisée
  display: "swap",
});

// 2. Configuration de la police Sans-Serif (Textes clairs et modernes)
const montserrat = Montserrat({ 
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  variable: "--font-montserrat",
  display: "swap",
});

// 3. SEO et Métadonnées (Ce qui s'affiche sur Google et quand on partage le lien)
export const metadata: Metadata = {
  title: "Dyayly | L'amour tissé en bijoux",
  description: "Créations artisanales de bijoux avec intention. Passage de l'ombre à la lumière. Ateliers de création et cercles de parole en Suisse.",
  keywords: ["bijoux artisanaux", "fait main", "spiritualité", "pierres naturelles", "ateliers création", "Suisse", "Dyayly"],
  icons: {
    icon: '/logo-sunflower.jpeg',
    shortcut: '/logo-sunflower.jpeg',
    apple: '/logo-sunflower.jpeg',
  },
  openGraph: {
    title: "Dyayly | L'amour tissé en bijoux",
    description: "Des bijoux faits à la main pour accompagner les renaissances intérieures et faire briller les âmes.",
    type: "website",
    locale: "fr_CH",
    images: [
      {
        url: '/logo-sunflower.jpeg',
        width: 800,
        height: 800,
        alt: 'Dyayly - L\'amour tissé en bijoux',
      }
    ],
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="scroll-smooth">
      <body
        className={`${cormorant.variable} ${montserrat.variable} font-sans bg-[#FDFBF7] text-stone-900 antialiased selection:bg-purple-200 selection:text-purple-900`}
      >
        <CookieBanner />
        <Toaster
          position="bottom-center"
          toastOptions={{
            style: {
              background: 'rgba(255, 255, 255, 0.5)',
              backdropFilter: 'blur(12px)',
              color: '#44403c',
              border: '1px solid rgba(255, 255, 255, 0.5)',
              borderRadius: '999px',
              boxShadow: '0 10px 30px -10px rgba(0,0,0,0.1)',
              padding: '12px 24px',
            },
            iconTheme: {
              primary: '#fbbf24',
              secondary: '#fff',
            },
          }}
        />
        {children}
        <CartDrawer />
        <MagicCursor />
        <Tracker />
      </body>
    </html>
  );
}
