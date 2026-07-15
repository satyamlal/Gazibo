"use client";

import Link from "next/link";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";

export function Navbar() {
  return (
    <nav className="border-b bg-white">
      <div className="flex items-center justify-between mx-auto max-w-7xl px-4 py-4">
        <Link href="/">
          <span className="text-2xl font-bold text-slate-900 cursor-pointer">Gazibo</span>
        </Link>
        <div className="flex items-center gap-6">
          <Link href="/jobs" className="text-sm font-medium text-slate-600 hover:text-slate-900">
            Browse Jobs
          </Link>
          <Link href="/account" className="text-sm font-medium text-slate-600 hover:text-slate-900">
            Dashboard
          </Link>
          <WalletMultiButton className="bg-slate-900 hover:bg-slate-800" />
        </div>
      </div>
    </nav>
  );
}