import type { Metadata, Viewport } from "next";
import { Cinzel, Cormorant_Garamond, Inter } from "next/font/google";
import "./globals.css";

const cinzel = Cinzel({
  subsets: ["latin"],
  variable: "--font-gothic",
  display: "swap",
  weight: ["400", "600", "700", "800", "900"]
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-serif-italic",
  display: "swap",
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"]
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap"
});

export const metadata: Metadata = {
  title: "MLN STUDIO — Gothic AI Digital Wardrobe & Haute Atelier",
  description: "Curate your wardrobe, discover dark luxury outfits, and transform your garments with MLN Studio AI.",
  applicationName: "MLN STUDIO",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "MLN STUDIO"
  },
  formatDetection: {
    telephone: false
  }
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
  themeColor: "#d8dbe5"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${cinzel.variable} ${cormorant.variable} ${inter.variable}`}>
      <head>
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="theme-color" content="#d8dbe5" />
      </head>
      <body className="antialiased bg-[#d8dbe5] text-[#0a0b10] selection:bg-[#0a0b10] selection:text-[#ffffff]">
        {children}
      </body>
    </html>
  );
}
