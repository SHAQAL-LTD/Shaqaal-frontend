import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import { AuthProvider } from "@/contexts/AuthContext";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit", display: "swap" });

export const metadata: Metadata = {
  title: "Shaqal TradeOS — Audited Commodity Deal Infrastructure",
  description:
    "Shaqal TradeOS runs gold and mineral trades through ten compliance-gated stages with KYC onboarding, encrypted document vaults and UTID-sealed settlement.",
  openGraph: {
    title: "Shaqal TradeOS",
    description: "Compliance-gated deal rooms, encrypted vaults and cryptographic settlement for high-value commodity trading.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${outfit.variable} antialiased dark`}>
      <body className="min-h-screen font-sans antialiased">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
