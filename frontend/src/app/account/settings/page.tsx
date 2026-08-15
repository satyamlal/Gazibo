"use client";

import { useState, useEffect } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import Link from "next/link";
import {
  Sun, Moon, Briefcase, Zap, Trash2,
  Loader2, Lock, ArrowRight, Settings,
} from "lucide-react";
import { fetchProfileState } from "@/lib/rpc";
import type { ProfileState } from "@/lib/rpc";

export default function SettingsPage() {
  const { publicKey, connected } = useWallet();
  const { connection } = useConnection();

  const [isDark, setIsDark]           = useState(false);
  const [role, setRole]               = useState<ProfileState | "loading">("loading");

  // Read saved theme on mount
  useEffect(() => {
    setIsDark(document.documentElement.classList.contains("dark"));
  }, []);

  // Detect on-chain role — single RPC call via rpc.ts utility
  useEffect(() => {
    if (!publicKey) return;
    setRole("loading");
    fetchProfileState(connection, publicKey)
      .then(setRole)
      .catch(() => setRole("none"));
  }, [publicKey, connection]);

  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    if (next) {
      document.documentElement.classList.replace("light", "dark");
      localStorage.setItem("gazibo_theme", "dark");
    } else {
      document.documentElement.classList.replace("dark", "light");
      localStorage.setItem("gazibo_theme", "light");
    }
  };

  if (!connected) {
    return (
      <div className="min-h-[70vh] g-bg flex items-center justify-center px-6">
        <div className="text-center">
          <p className="g-text-4 mb-4">Connect your wallet to access settings.</p>
          <Link
            href="/connect"
            className="px-6 py-3 rounded-full bg-[#85DABE] text-[#030712] text-sm font-bold hover:bg-[#A8E8D0] transition-colors"
          >
            Connect Wallet
          </Link>
        </div>
      </div>
    );
  }

  const dashboardHref =
    role === "client" || role === "both" ? "/account/client" :
    role === "freelancer" ? "/account/freelancer" : null;

  const roleLabel =
    role === "client"     ? "Client" :
    role === "freelancer" ? "Freelancer" :
    role === "both"       ? "Client + Freelancer (legacy)" :
    role === "none"       ? "No role registered" : "…";

  return (
    <div className="min-h-screen g-bg">
      <div className="max-w-2xl mx-auto px-5 md:px-8 py-16">

        {/* Header */}
        <div className="mb-10">
          <p className="text-xs font-bold tracking-[0.2em] text-[#85DABE] uppercase mb-2">
            Account
          </p>
          <h1
            className="text-3xl font-extrabold g-text tracking-tight flex items-center gap-3"
            style={{ fontFamily: "var(--font-heading, var(--font-sans))" }}
          >
            <Settings className="h-7 w-7 g-text-5" /> Settings
          </h1>
        </div>

        <div className="space-y-4">

          {/* Wallet */}
          <div className="rounded-2xl border g-border g-card p-6">
            <h2 className="text-sm font-bold g-text-2 mb-4">Wallet</h2>
            <div className="rounded-xl g-bg-surface border g-border px-4 py-3">
              <p className="text-[11px] g-text-5 font-mono uppercase tracking-wider mb-1">
                Connected address
              </p>
              <p className="text-sm font-mono g-text-2 break-all">
                {publicKey?.toBase58()}
              </p>
            </div>
          </div>

          <div className="rounded-2xl border g-border g-card p-6">
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-sm font-bold g-text-2">Your Role</h2>
              <span className="flex items-center gap-1.5 text-[11px] g-text-5">
                <Lock className="h-3 w-3" /> Permanent
              </span>
            </div>
            <p className="text-xs g-text-5 mb-5 leading-relaxed">
              Your role was chosen when you first connected this wallet and is
              recorded permanently on-chain. It cannot be changed.
              To use a different role, create a new wallet.
            </p>

            {role === "loading" ? (
              <div className="flex items-center gap-2 g-text-5 text-sm py-3">
                <Loader2 className="h-4 w-4 animate-spin" /> Checking on-chain profile…
              </div>
            ) : role === "none" ? (
              <div className="rounded-xl border g-border g-bg-surface p-4 text-center">
                <p className="g-text-4 text-sm">No role registered for this wallet yet.</p>
                <p className="text-xs g-text-5 mt-1">
                  Disconnect and reconnect — you&apos;ll be prompted to choose.
                </p>
              </div>
            ) : (
              <div
                className={`rounded-xl border p-5 flex items-center justify-between gap-4 ${
                  role === "freelancer"
                    ? "border-[#85DABE]/25 bg-[#85DABE]/[0.04]"
                    : "border-[#174BD4]/25 bg-[#174BD4]/[0.04]"
                }`}
              >
                <div className="flex items-center gap-3">
                  {role === "freelancer" ? (
                    <div className="h-10 w-10 rounded-xl bg-[#85DABE]/15 border border-[#85DABE]/20 flex items-center justify-center text-[#85DABE]">
                      <Zap className="h-5 w-5" />
                    </div>
                  ) : (
                    <div className="h-10 w-10 rounded-xl bg-[#174BD4]/15 border border-[#174BD4]/20 flex items-center justify-center text-[#174BD4]">
                      <Briefcase className="h-5 w-5" />
                    </div>
                  )}
                  <div>
                    <p className={`text-base font-bold ${role === "freelancer" ? "text-[#85DABE]" : "text-[#174BD4]"}`}>
                      {roleLabel}
                    </p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <Lock className="h-3 w-3 g-text-5" />
                      <p className="text-[11px] g-text-5">
                        Permanently bound to this wallet
                      </p>
                    </div>
                  </div>
                </div>

                {dashboardHref && (
                  <Link
                    href={dashboardHref}
                    className={`shrink-0 inline-flex items-center gap-1.5 text-xs font-semibold transition-colors ${
                      role === "freelancer"
                        ? "text-[#85DABE] hover:text-[#A8E8D0]"
                        : "text-[#174BD4] hover:text-[#4A7AE8]"
                    }`}
                  >
                    Go to Dashboard <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                )}
              </div>
            )}
          </div>

          {/* Appearance*/}
          <div className="rounded-2xl border g-border g-card p-6">
            <h2 className="text-sm font-bold g-text-2 mb-4">Appearance</h2>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {isDark
                  ? <Moon className="h-5 w-5 text-[#85DABE]" />
                  : <Sun  className="h-5 w-5 text-amber-400" />}
                <div>
                  <p className="text-sm font-medium g-text">
                    {isDark ? "Dark mode" : "Light mode"}
                  </p>
                  <p className="text-xs g-text-5">
                    {isDark ? "Easy on the eyes at night" : "Better in bright environments"}
                  </p>
                </div>
              </div>
              <button
                onClick={toggleTheme}
                className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${
                  isDark ? "bg-[#174BD4]" : "bg-zinc-400"
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

          {/* Danger zone*/}
          <div className="rounded-2xl border border-red-500/20 bg-red-500/[0.03] p-6">
            <h2 className="text-sm font-bold text-red-400 mb-4">Danger Zone</h2>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium g-text">Delete Account</p>
                <p className="text-xs g-text-5 mt-0.5">
                  Disconnect and clear your local session.
                </p>
              </div>
              <Link
                href="/account/settings/delete"
                className="flex items-center gap-2 px-4 py-2 rounded-xl border border-red-500/30 text-red-400 text-xs font-semibold hover:bg-red-500/10 transition-colors"
              >
                <Trash2 className="h-3.5 w-3.5" /> Delete
              </Link>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}