"use client";

import { useState, useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import Link from "next/link";
import { Sun, Moon, ArrowRight, Trash2, Settings } from "lucide-react";

export default function SettingsPage() {
  const { publicKey, connected } = useWallet();
  const [isDark, setIsDark] = useState(true);

  // Load saved preference
  useEffect(() => {
    const saved = localStorage.getItem("gazibo_theme");
    if (saved === "light") {
      setIsDark(false);
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    if (next) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("gazibo_theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("gazibo_theme", "light");
    }
  };

  if (!connected) {
    return (
      <div className="min-h-[70vh] bg-[#030712] flex items-center justify-center px-6">
        <div className="text-center">
          <p className="text-zinc-400 mb-4">Connect your wallet to access settings.</p>
          <Link href="/connect" className="px-6 py-3 rounded-full bg-[#85DABE] text-[#030712] text-sm font-bold hover:bg-[#A8E8D0] transition-colors">
            Connect Wallet
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#030712]">
      <div className="max-w-2xl mx-auto px-5 md:px-8 py-16">

        <div className="mb-10">
          <p className="text-xs font-bold tracking-[0.2em] text-[#85DABE] uppercase mb-2">
            Account
          </p>
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <Settings className="h-7 w-7 text-zinc-500" />
            Settings
          </h1>
        </div>

        <div className="space-y-4">

          {/* Wallet info */}
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6">
            <h2 className="text-sm font-bold text-zinc-300 mb-4">Wallet</h2>
            <div className="rounded-xl bg-black/20 border border-white/[0.06] px-4 py-3">
              <p className="text-[11px] text-zinc-600 font-mono uppercase tracking-wider mb-1">Connected address</p>
              <p className="text-sm font-mono text-zinc-200 break-all">
                {publicKey?.toBase58()}
              </p>
            </div>
          </div>

          {/* Appearance */}
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6">
            <h2 className="text-sm font-bold text-zinc-300 mb-4">Appearance</h2>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {isDark
                  ? <Moon className="h-5 w-5 text-[#85DABE]" />
                  : <Sun className="h-5 w-5 text-amber-400" />}
                <div>
                  <p className="text-sm font-medium text-white">
                    {isDark ? "Dark mode" : "Light mode"}
                  </p>
                  <p className="text-xs text-zinc-500">
                    {isDark ? "Easy on the eyes at night" : "Better in bright environments"}
                  </p>
                </div>
              </div>
              {/* Toggle switch */}
              <button
                onClick={toggleTheme}
                className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${
                  isDark ? "bg-[#174BD4]" : "bg-zinc-600"
                }`}
              >
                <span
                  className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200 ${
                    isDark ? "translate-x-6" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Navigation */}
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6">
            <h2 className="text-sm font-bold text-zinc-300 mb-4">Dashboard</h2>
            <div className="space-y-2">
              {[
                { label: "Client Dashboard", href: "/account/client" },
                { label: "Freelancer Dashboard", href: "/account/freelancer" },
              ].map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className="flex items-center justify-between px-4 py-3 rounded-xl hover:bg-white/[0.04] transition-colors group"
                >
                  <span className="text-sm text-zinc-300 group-hover:text-white">{l.label}</span>
                  <ArrowRight className="h-4 w-4 text-zinc-600 group-hover:text-zinc-300 transition-colors" />
                </Link>
              ))}
            </div>
          </div>

          {/* Danger zone */}
          <div className="rounded-2xl border border-red-500/20 bg-red-500/[0.03] p-6">
            <h2 className="text-sm font-bold text-red-400 mb-4">Danger Zone</h2>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-white">Delete Account</p>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Close your on-chain profiles and reclaim rent.
                </p>
              </div>
              <Link
                href="/account/settings/delete"
                className="flex items-center gap-2 px-4 py-2 rounded-xl border border-red-500/30 text-red-400 text-xs font-semibold hover:bg-red-500/10 transition-colors"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Delete
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}