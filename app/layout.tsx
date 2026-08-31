import type { Metadata, Viewport } from "next";
import { Barlow_Condensed, Inter, JetBrains_Mono } from "next/font/google";
import { PageViewTracker } from "@/components/analytics/PageViewTracker";
import { ServiceWorkerRegistration } from "@/components/pwa/ServiceWorkerRegistration";
import { AffiliateClickTracker } from "@/components/affiliate/AffiliateClickTracker";
import { APP_NAME, APP_TAGLINE } from "@/lib/app-config";
import { SITE_URL } from "@/lib/seo";
import "./globals.css";

const display = Barlow_Condensed({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
});

const body = Inter({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

// Micro-labels techniques (chronos, unités, kickers mono) dans toute l'app —
// voir app/globals.css pour le mapping en utilitaire `font-mono`.
const mono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "600"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${APP_NAME} — ${APP_TAGLINE}`,
    template: `%s | ${APP_NAME}`,
  },
  description: APP_TAGLINE,
  applicationName: APP_NAME,
  manifest: "/manifest.webmanifest",
  // Preuve de propriété du site pour Monetag (régie pub) — même principe
  // que le fichier de vérification Google déjà dans public/, mais via
  // balise meta plutôt que fichier statique (Monetag propose les deux;
  // celle-ci évite tout conflit avec le vrai service worker PWA du site,
  // contrairement à leur fichier sw.js de vérification par défaut).
  verification: {
    other: {
      monetag: "35cf54a59a282436c0bc8d85e1f7db16",
    },
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: APP_NAME,
  },
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  openGraph: {
    type: "website",
    locale: "fr_FR",
    siteName: APP_NAME,
    title: `${APP_NAME} — ${APP_TAGLINE}`,
    description: APP_TAGLINE,
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
    title: `${APP_NAME} — ${APP_TAGLINE}`,
    description: APP_TAGLINE,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#ffffff",
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="fr" className={`${display.variable} ${body.variable} ${mono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-[var(--color-bg)] text-[var(--color-text)]">
        <PageViewTracker />
        <ServiceWorkerRegistration />
        <AffiliateClickTracker />
        {children}
      </body>
    </html>
  );
}
