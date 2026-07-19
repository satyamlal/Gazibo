import type { Metadata } from "next";
import { AppWalletProvider } from "@/components/WalletProvider";
import { Navbar } from "@/components/layout/Navbar";
import { Inter, Space_Grotesk } from "next/font/google";

import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Gazibo — Trustless Freelance Escrow on Solana",
  description:
    "The decentralized workspace protocol for elite engineering talent. Zero platform fees, instant smart-contract escrow, on-chain reputation. Built on Solana.",
  keywords: [
    "Solana",
    "freelance",
    "escrow",
    "Web3",
    "decentralized",
    "smart contract",
    "dApp",
    "gig",
    "gig workers",
    "freelancers",
    "developers",
    "video editors",
    "top freelancers",
    "cheap freelancers",
    "web3 developers",
    "web3 freelancers",
    "solana freelancers",
    "solana based freelancers",
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${inter.variable} ${spaceGrotesk.variable} font-sans antialiased`}
      >
        <AppWalletProvider>
          <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-1">{children}</main>
          </div>
        </AppWalletProvider>
      </body>
    </html>
  );
}
