import type { Metadata } from "next";
import { AppWalletProvider } from "@/components/WalletProvider";
import { Navbar } from "@/components/layout/Navbar";
import { Inter } from "next/font/google";

import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Gazibo — Freelance Escrow on Solana",
  description:
    "Post jobs, lock payments in escrow, release on delivery. Powered by Solana + Anchor.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AppWalletProvider>
          <div className="min-h-screen bg-slate-50 flex flex-col">
            <Navbar />
            <main className="flex-1 w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
              {children}
            </main>
          </div>
        </AppWalletProvider>
      </body>
    </html>
  );
}
