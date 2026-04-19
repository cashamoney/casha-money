import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Casha.money — Your AI Financial Companion",
  description:
    "Track every rupee, destroy debt, save Rs.20,000-50,000 in taxes, and get an AI financial advisor. Free forever.",
  keywords: [
    "AI financial advisor",
    "personal finance",
    "budget tracker",
    "money management",
    "tax optimizer India",
    "debt payoff planner",
    "free financial advisor",
  ],
  openGraph: {
    title: "Casha.money — Your AI Financial Companion",
    description:
      "Track every rupee, destroy debt, save taxes, and build wealth. AI-powered financial advisor for everyone.",
    url: "https://casha-money.vercel.app",
    siteName: "Casha.money",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Casha.money — Your AI Financial Companion",
    description:
      "Track every rupee, destroy debt, save taxes. AI-powered. Free forever.",
    creator: "@cashamoneyai",
  },
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
    shortcut: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/logo.png" type="image/png" />
        <link rel="apple-touch-icon" href="/logo.png" />
      </head>
      <body className={inter.variable} style={{ fontFamily: "Inter, system-ui, sans-serif" }}>
        {children}
      </body>
    </html>
  );
}