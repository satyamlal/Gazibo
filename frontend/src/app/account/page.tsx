"use client";

import Link from "next/link";
import { useWallet } from "@solana/wallet-adapter-react";
import { ArrowRight, CircleUserRound, ShieldCheck, WalletCards } from "lucide-react";

export default function AccountPage() {
  const { connected, publicKey } = useWallet();

  return (
    <section className="min-h-full bg-[#030712] px-5 py-16 text-zinc-100 md:px-8 md:py-24">
      <div className="mx-auto max-w-4xl">
        <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-[#85DABE]">Your workspace</p>
        <h1 className="text-4xl font-bold tracking-tight text-white md:text-5xl">Dashboard</h1>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-zinc-400 md:text-lg">
          Manage your Gazibo identity, escrow work, and on-chain reputation from one place.
        </p>

        {connected && publicKey ? (
          <div className="mt-10 rounded-2xl border border-[#85DABE]/20 bg-[#85DABE]/[0.06] p-6 md:p-8">
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#85DABE]/15 text-[#85DABE]">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">Wallet connected</h2>
                <p className="mt-1 text-sm text-zinc-400">Your public address is ready for Gazibo.</p>
              </div>
            </div>
            <code className="mt-6 block overflow-x-auto rounded-lg border border-white/[0.08] bg-black/20 p-3 text-xs text-zinc-300">
              {publicKey.toBase58()}
            </code>
          </div>
        ) : (
          <div className="mt-10 rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6 md:p-8">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#174BD4]/20 text-[#85DABE]">
              <CircleUserRound className="h-6 w-6" />
            </div>
            <h2 className="mt-5 text-xl font-semibold text-white">Connect to unlock your dashboard</h2>
            <p className="mt-2 max-w-xl text-sm leading-6 text-zinc-400">
              A Solana wallet is your secure sign-in for managing your profile and work.
            </p>
          </div>
        )}

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <Link href="/connect" className="group rounded-2xl border border-white/[0.08] bg-white/[0.03] p-5 transition hover:border-[#85DABE]/30 hover:bg-white/[0.05]">
            <WalletCards className="h-5 w-5 text-[#85DABE]" />
            <h2 className="mt-4 font-semibold text-white">Set up your profile</h2>
            <p className="mt-1 text-sm text-zinc-400">Register your identity with the Gazibo program.</p>
            <span className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-[#85DABE]">
              Continue <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
            </span>
          </Link>
          <Link href="/jobs" className="group rounded-2xl border border-white/[0.08] bg-white/[0.03] p-5 transition hover:border-[#85DABE]/30 hover:bg-white/[0.05]">
            <ShieldCheck className="h-5 w-5 text-[#85DABE]" />
            <h2 className="mt-4 font-semibold text-white">Explore verified jobs</h2>
            <p className="mt-1 text-sm text-zinc-400">Review the marketplace and its escrow protections.</p>
            <span className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-[#85DABE]">
              Browse jobs <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}
