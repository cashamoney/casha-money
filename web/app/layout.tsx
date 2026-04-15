import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Casha.money — Your AI Financial Advisor",
  description:
    "AI that tracks your money, finds what you're losing, and builds a personalized plan to grow your wealth. Free for everyone.",
  keywords: [
    "AI financial advisor",
    "personal finance",
    "budget tracker",
    "money management",
    "free financial advisor",
  ],
  openGraph: {
    title: "Casha.money — Your AI Financial Advisor",
    description:
      "AI that tracks your money, finds what you're losing, and builds a personalized plan to grow your wealth.",
    url: "https://casha-money.vercel.app",
    siteName: "Casha.money",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Casha.money — Your AI Financial Advisor",
    description:
      "AI that tracks your money, finds what you're losing, and builds a personalized plan to grow your wealth.",
    creator: "@cashamoneyai",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.variable} style={{ fontFamily: "Inter, system-ui, sans-serif" }}>
        {children}
      </body>
    </html>
  );
}