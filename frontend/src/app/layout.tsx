import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AppWalletProvider } from "@/components/WalletProvider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Gazibo — Freelance Escrow on Solana",
  description:
    "Post jobs, lock payments in escrow, release on delivery. Powered by Solana + Anchor.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-slate-950">
        <AppWalletProvider>{children}</AppWalletProvider>
      </body>
    </html>
  );
}
