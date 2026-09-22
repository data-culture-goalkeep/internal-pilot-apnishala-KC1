import type { Metadata } from "next";
import { Inter, Manrope, Noto_Sans_Devanagari } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

// Matches the design handoff mockup: Manrope for headings, the top-bar
// wordmark, nav active state, and big stat/KPI numerics — Inter everywhere
// else. See `--font-heading` in globals.css.
const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

// SEL Assessment Form's SJT/Student Response modes have an EN/हिं
// bilingual toggle — Hindi copy needs a Devanagari-covering face, per the
// mockup (Observation mode has no Hindi copy, so this is scoped to those
// two modes only via the `font-devanagari` utility).
const notoSansDevanagari = Noto_Sans_Devanagari({
  variable: "--font-devanagari",
  subsets: ["devanagari"],
});

export const metadata: Metadata = {
  title: "Khoj Dashboard",
  description: "School analytics for teachers and leadership — assessments, SEL, attendance and growth.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${manrope.variable} ${notoSansDevanagari.variable}`}>
      <body className="antialiased">{children}</body>
    </html>
  );
}
