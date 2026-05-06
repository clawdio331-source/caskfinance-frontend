import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans"
});

const fraunces = Fraunces({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-serif",
  axes: ["SOFT", "WONK", "opsz"]
});

export const metadata: Metadata = {
  title: "Cask — It's just a cask bro",
  description: "A sealed Cask whitelist landing. Telegram access and Twitter updates.",
  openGraph: {
    title: "Cask — It's just a cask bro",
    description: "A sealed Cask whitelist landing. Telegram access and Twitter updates.",
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "Cask — It's just a cask bro",
    description: "A sealed Cask whitelist landing."
  }
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable} ${fraunces.variable}`}>
      <body>{children}</body>
    </html>
  );
}
