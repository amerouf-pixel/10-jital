import Script from 'next/script';
import { Suspense } from 'react';

import WhatsAppButton from "@/components/layout/WhatsAppButton";
import "./globals.css";
import JitalSpider from "@/components/layout/JitalSpider";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Navbar from "@/components/layout/Navbar";
import { CurrencyProvider } from "@/context/CurrencyContext";
import { Analytics } from "@vercel/analytics/next";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "10-JITAL | Boutique, Blog, Tendances et Suivi des Prix",
  description:
    "Plateforme professionnelle avec boutique, blog, dÃ©tection de tendances, suivi des prix, alertes et sÃ©lecteur de devises MAD/EUR/USD.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="fr"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Suspense fallback={null}>
          <Navbar />
        </Suspense>
        <main className="flex-1">{children}</main>
        <JitalSpider />
        <WhatsAppButton />
        <Analytics />
              <Suspense fallback={null}><Script src="https://10jital-cosmic-monitor.vercel.app/10jital_store_sensor.js" strategy="afterInteractive" /></Suspense>
      </body>
    </html>
  );
}