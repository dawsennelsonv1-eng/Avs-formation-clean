import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Outfit } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/components/ui-toast";

const display = Bricolage_Grotesque({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  variable: "--font-display",
});
const body = Outfit({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-body",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: {
    default: "AVS Formation — Forme-toi. Réussis.",
    template: "%s — AVS Formation",
  },
  description: "Formations en marketing, ventes, e-commerce et finance. Apprends à ton rythme.",
  manifest: "/manifest.webmanifest",
  applicationName: "AVS Formation",
  appleWebApp: { capable: true, statusBarStyle: "black-translucent", title: "AVS Formation" },
  icons: {
    icon: "/icon-192.png",
    apple: "/icon-192.png",
  },
  openGraph: {
    title: "AVS Formation — Forme-toi. Réussis.",
    description: "Formations en marketing, ventes, e-commerce et finance.",
    type: "website",
    locale: "fr_FR",
    siteName: "AVS Formation",
  },
  twitter: {
    card: "summary_large_image",
    title: "AVS Formation",
    description: "Forme-toi. Réussis.",
  },
};

export const viewport: Viewport = {
  themeColor: "#0B0E14",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${display.variable} ${body.variable}`}>
      <body className="font-sans">
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
