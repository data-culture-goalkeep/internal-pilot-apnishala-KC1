import type { Metadata } from "next";
import { Inter, Manrope } from "next/font/google";
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
    <html lang="en">
      <body className={`${inter.variable} ${manrope.variable} antialiased`}>{children}</body>
    </html>
  );
}
