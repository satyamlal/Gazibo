"use client";

import dynamic from "next/dynamic";
import { useWallet } from "@solana/wallet-adapter-react";
import { useEffect } from 'react';
import { useRouter } from "next/navigation";
import { ShieldCheck, Wallet, Zap } from "lucide-react";

const WalletMultiButton = dynamic(
  async() => (await import("@solana/wallet-adapter-react-ui")).WalletMultiButton,
  {ssr: false}
)

export default function ConnectPage() {
  const { connected } = useWallet();
  const router  = useRouter();

  useEffect(() => {
    if (connected) {
      router.push("/account");
    }
  },[connected, router])

  return (
    <div className="min-h-[90vh] bg-[#030712] flex items-center justify-center px-5">
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-[radial-gradient(ellipse_at_center,rgba(23,75,212,0.12)_0%,transparent_70%)]" />
      </div>

      <div className="relative z-10 w-full max-w-md text-center">

        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="h-14 w-14 rounded-2xl bg-[#174BD4]/15 border border-[#174BD4]/30 flex items-center justify-center text-[#85DABE]">
            <Wallet className="h-7 w-7" />
          </div>
        </div>

        <h1
          className="text-3xl font-extrabold text-white tracking-tight mb-3"
          style={{ fontFamily: "var(--font-heading, var(--font-sans))" }}
        >
          Connect your wallet
        </h1>
        <p className="text-zinc-400 text-sm mb-8 max-w-xs mx-auto leading-relaxed">
          Your Solana wallet is your identity on Gazibo. No email, no password.
        </p>

        <div className="flex justify-center mb-10">
          <WalletMultiButton />
        </div>

        {/* Steps */}
        <div className="space-y-4 text-left">
          {[
            {
              icon: Wallet,
              title: "Connect wallet",
              body: "Click the button above. Choose Phantom, Solflare, or any Solana wallet.",
            },
            {
              icon: ShieldCheck,
              title: "Choose your role",
              body: "First-time visitors pick Client or Freelancer. One transaction, then done.",
            },
            {
              icon: Zap,
              title: "Start working",
              body: "Post jobs, browse gigs, or accept work. Payments are locked in escrow automatically.",
            },
          ].map((step, i) => (
            <div key={i} className="flex items-start gap-4 rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
              <div className="h-8 w-8 rounded-lg bg-[#174BD4]/15 border border-[#174BD4]/20 flex items-center justify-center text-[#85DABE] shrink-0">
                <step.icon className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">{step.title}</p>
                <p className="text-xs text-zinc-500 mt-0.5 leading-relaxed">{step.body}</p>
              </div>
            </div>
          ))}
        </div>

        <p className="mt-8 text-[11px] text-zinc-700">
          Make sure Phantom is set to <span className="text-zinc-500">Localhost</span> (127.0.0.1:8899)
        </p>
      </div>
    </div>
  );
}