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
  title: "Cask — A stablecoin that fights for its peg",
  description:
    "Cask ships peg defense inside the swap. Atomic, in-block, every trade. Early access on Telegram.",
  openGraph: {
    title: "Cask — A stablecoin that fights for its peg",
    description:
      "Atomic peg defense. In-block profit splits. Engineered to age. Early access on Telegram.",
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "Cask — A stablecoin that fights for its peg",
    description:
      "Atomic peg defense. In-block profit splits. Engineered to age."
  }
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable} ${fraunces.variable}`}>
      <body>{children}</body>
    </html>
  );
}
