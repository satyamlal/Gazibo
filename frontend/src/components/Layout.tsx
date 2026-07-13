import type { Metadata } from "next";
import { Geist_Mono } from "next/font/google";
import { SolanaWalletProvider } from "@/components/WalletProvider";
import "./globals.css";

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Gazibo — Freelance Escrow on Solana",
  description: "Post jobs, lock payments in escrow, release on delivery. Powered by Solana + Anchor.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistMono.variable} h-full`}>
      <body className="min-h-full bg-slate-950">
        <SolanaWalletProvider>
          {children}
        </SolanaWalletProvider>
      </body>
    </html>
  );
}