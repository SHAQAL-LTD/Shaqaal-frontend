import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'Shaqal TradeOS | Enterprise Commodity Platform',
  description: 'Global Deal Management and Compliance OS',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang= "en" className = {`${inter.variable} antialiased dark`
}>
  <body className="min-h-screen bg-dark-950 text-white selection:bg-gold-500 selection:text-dark-950 font-sans flex flex-col" >
    { children }
    </body>
    </html>
  );
}
