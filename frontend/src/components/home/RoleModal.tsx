"use client";

import { useState, useEffect } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { AnchorProvider, Program } from "@coral-xyz/anchor";
import type { Idl } from "@coral-xyz/anchor";
import type { AnchorWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { Briefcase, Zap, Loader2 } from "lucide-react";
import IDL from "@/idl/gazibo.json";

const CLIENT_PROFILE_SEED = Buffer.from("client_profile");
const FREELANCER_PROFILE_SEED = Buffer.from("freelancer_profile");
const PROGRAM_ID = new PublicKey(IDL.address);

const roleSetKey = (address: string) => `role_set_${address}`;

interface GaziboProgram {
  methods: {
    initializeClient(): { rpc(): Promise<string> };
    initializeFreelancer(): { rpc(): Promise<string> };
  };
}

type AsyncStep = "idle" | "checking" | "show" | "loading" | "done";

export function RoleModal() {
  const { connection } = useConnection();
  const wallet = useWallet();
  const [asyncStep, setAsyncStep] = useState<AsyncStep>("idle");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!wallet.connected || !wallet.publicKey) return;

    const address = wallet.publicKey.toBase58();

    // Fast path: localStorage already cached
    if (localStorage.getItem(roleSetKey(address)) === "true") return;

    // Slow path: all setState calls live inside the async function (after awaits)
    const runCheck = async () => {
      const [clientPda] = PublicKey.findProgramAddressSync(
        [CLIENT_PROFILE_SEED, wallet.publicKey!.toBuffer()],
        PROGRAM_ID
      );
      const [freelancerPda] = PublicKey.findProgramAddressSync(
        [FREELANCER_PROFILE_SEED, wallet.publicKey!.toBuffer()],
        PROGRAM_ID
      );

      // setAsyncStep is called AFTER the first await — satisfies the lint rule
      const [clientInfo, freelancerInfo] = await Promise.all([
        connection.getAccountInfo(clientPda),
        connection.getAccountInfo(freelancerPda),
      ]);

      if (clientInfo !== null || freelancerInfo !== null) {
        localStorage.setItem(roleSetKey(address), "true");
        setAsyncStep("idle"); // Already has a role
      } else {
        setAsyncStep("show"); // No role — show the picker
      }
    };

    // Show checking indicator then run
    setAsyncStep("checking");
    runCheck().catch(() => setAsyncStep("idle"));
  }, [wallet.connected, wallet.publicKey, connection]);

  const getProgram = (): GaziboProgram => {
    const anchorWallet: AnchorWallet = {
      publicKey: wallet.publicKey!,
      signTransaction: wallet.signTransaction!,
      signAllTransactions: wallet.signAllTransactions!,
    };
    const provider = new AnchorProvider(connection, anchorWallet, {
      commitment: "confirmed",
    });
    return new Program(
      IDL as unknown as Idl,
      provider
    ) as unknown as GaziboProgram;
  };

  const choose = async (role: "client" | "freelancer") => {
    if (!wallet.publicKey) return;
    setAsyncStep("loading");
    setError("");
    try {
      const program = getProgram();
      if (role === "client") {
        await program.methods.initializeClient().rpc();
      } else {
        await program.methods.initializeFreelancer().rpc();
      }
      localStorage.setItem(roleSetKey(wallet.publicKey.toBase58()), "true");
      setAsyncStep("idle");
      window.location.href =
        role === "client" ? "/account/client" : "/account/freelancer";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Transaction failed.");
      setAsyncStep("show");
    }
  };

  // visibility: modal only shows during "show" or "loading" steps
  if (asyncStep === "idle" || asyncStep === "checking") return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#030712]/90 backdrop-blur-md px-4">
      <div className="w-full max-w-2xl">

        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/[0.08] bg-white/[0.03] text-xs font-medium text-zinc-400 mb-6">
            <span className="h-2 w-2 rounded-full bg-[#85DABE] animate-pulse" />
            Wallet connected — one more step
          </div>
          <h2
            className="text-3xl md:text-4xl font-extrabold text-white tracking-tight mb-3"
            style={{ fontFamily: "var(--font-heading, var(--font-sans))" }}
          >
            How do you want to use this platform?
          </h2>
          <p className="text-zinc-400 text-sm max-w-sm mx-auto">
            This creates your on-chain profile. You can switch roles anytime
            from Account Settings.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-4 mb-6">

          <button
            onClick={() => void choose("client")}
            disabled={asyncStep === "loading"}
            className="group text-left rounded-2xl border border-[#174BD4]/20 bg-[#174BD4]/[0.04] p-6 hover:border-[#174BD4]/40 hover:bg-[#174BD4]/[0.08] disabled:opacity-50 transition-all duration-200 cursor-pointer"
          >
            <div className="h-10 w-10 rounded-xl bg-[#174BD4]/20 border border-[#174BD4]/30 flex items-center justify-center text-[#174BD4] mb-4">
              <Briefcase className="h-5 w-5" />
            </div>
            <div className="text-xs font-bold uppercase tracking-[0.15em] text-[#174BD4] mb-2">
              I&apos;m a Client
            </div>
            <div className="text-lg font-bold text-white mb-2">Hire Talent</div>
            <p className="text-sm text-zinc-400 leading-relaxed">
              Browse freelancer gigs, chat to negotiate, and lock payment in
              escrow before work starts. Pay only when you&apos;re satisfied.
            </p>
            <div className="mt-5 flex items-center gap-2 text-[#174BD4] text-sm font-semibold">
              Get Started
              <span className="group-hover:translate-x-0.5 transition-transform duration-200">→</span>
            </div>
          </button>

          <button
            onClick={() => void choose("freelancer")}
            disabled={asyncStep === "loading"}
            className="group text-left rounded-2xl border border-[#85DABE]/20 bg-[#85DABE]/[0.04] p-6 hover:border-[#85DABE]/40 hover:bg-[#85DABE]/[0.08] disabled:opacity-50 transition-all duration-200 cursor-pointer"
          >
            <div className="h-10 w-10 rounded-xl bg-[#85DABE]/15 border border-[#85DABE]/20 flex items-center justify-center text-[#85DABE] mb-4">
              <Zap className="h-5 w-5" />
            </div>
            <div className="text-xs font-bold uppercase tracking-[0.15em] text-[#85DABE] mb-2">
              I&apos;m a Freelancer
            </div>
            <div className="text-lg font-bold text-white mb-2">Find Work</div>
            <p className="text-sm text-zinc-400 leading-relaxed">
              Post your gigs, accept jobs, deliver work, and get paid instantly
              to your wallet. No invoices, no payment delays.
            </p>
            <div className="mt-5 flex items-center gap-2 text-[#85DABE] text-sm font-semibold">
              Start Earning
              <span className="group-hover:translate-x-0.5 transition-transform duration-200">→</span>
            </div>
          </button>
        </div>

        {asyncStep === "loading" && (
          <div className="flex items-center justify-center gap-2 text-zinc-400 text-sm py-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            Creating your on-chain profile — approve the transaction in your wallet…
          </div>
        )}

        {error && (
          <div className="rounded-xl border border-red-500/20 bg-red-500/[0.06] px-4 py-3 text-sm text-red-300 text-center">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}