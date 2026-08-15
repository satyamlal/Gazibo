"use client";

import { useState, useEffect } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { AnchorProvider, Program } from "@coral-xyz/anchor";
import type { Idl } from "@coral-xyz/anchor";
import type { AnchorWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { Briefcase, Zap, Loader2, ShieldAlert } from "lucide-react";
import IDL from "@/idl/gazibo.json";
import {
  fetchProfileState,
  deriveProfilePDAs,
  deriveRoleRegistryPDA,
} from "@/lib/rpc";

const roleSetKey = (address: string) => `role_set_${address}`;

interface MethodBuilder {
  accounts(a: Record<string, PublicKey>): { rpc(): Promise<string> };
  rpc(): Promise<string>;
}
interface GaziboProgram {
  methods: {
    initializeClient(): MethodBuilder;
    initializeFreelancer(): MethodBuilder;
  };
}

type AsyncStep = "idle" | "checking" | "show" | "loading";

export function RoleModal() {
  const { connection } = useConnection();
  const wallet         = useWallet();
  const [asyncStep, setAsyncStep] = useState<AsyncStep>("idle");
  const [error, setError]         = useState("");

  useEffect(() => {
    if (!wallet.connected || !wallet.publicKey) return;

    const address = wallet.publicKey.toBase58();
    const cached  = localStorage.getItem(roleSetKey(address)) === "true";

    if (cached) {
      setAsyncStep("idle");
      return;
    }

    setAsyncStep("checking");

    // Single batched RPC call — checks role_registry + both profile PDAs
    fetchProfileState(connection, wallet.publicKey)
      .then((state) => {
        if (state !== "none") {
          localStorage.setItem(roleSetKey(address), "true");
          setAsyncStep("idle");
        } else {
          setAsyncStep("show");
        }
      })
      .catch(() => {
        // RPC failed after retries — don't block the user
        setAsyncStep("idle");
      });
  }, [wallet.connected, wallet.publicKey, connection]);

  const getProgram = (): GaziboProgram => {
    const aw: AnchorWallet = {
      publicKey:           wallet.publicKey!,
      signTransaction:     wallet.signTransaction!,
      signAllTransactions: wallet.signAllTransactions!,
    };
    const provider = new AnchorProvider(connection, aw, { commitment: "confirmed" });
    return new Program(IDL as unknown as Idl, provider) as unknown as GaziboProgram;
  };

  const choose = async (role: "client" | "freelancer") => {
    if (!wallet.publicKey) return;
    setAsyncStep("loading");
    setError("");
    try {
      const program       = getProgram();
      const roleRegistry  = deriveRoleRegistryPDA(wallet.publicKey);
      const { clientPda, freelancerPda } = deriveProfilePDAs(wallet.publicKey);

      if (role === "client") {
        await program.methods
          .initializeClient()
          .accounts({
            client:        wallet.publicKey,
            clientProfile: clientPda,
            roleRegistry,
          })
          .rpc();
      } else {
        await program.methods
          .initializeFreelancer()
          .accounts({
            freelancer:        wallet.publicKey,
            freelancerProfile: freelancerPda,
            roleRegistry,
          })
          .rpc();
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

  if (asyncStep === "idle" || asyncStep === "checking") return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#030712]/90 backdrop-blur-md px-4">
      <div className="w-full max-w-2xl">

        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/[0.08] bg-white/[0.03] text-xs font-medium text-zinc-400 mb-6">
            <span className="h-2 w-2 rounded-full bg-[#85DABE] animate-pulse" />
            Wallet connected — choose your role
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight mb-3">
            How do you want to use Gazibo?
          </h2>
          <p className="text-zinc-400 text-sm max-w-md mx-auto">
            This creates your on-chain profile and permanently binds this wallet to one role.
          </p>
        </div>

        <div className="flex items-start gap-3 rounded-xl border border-amber-500/20 bg-amber-500/[0.05] px-4 py-3.5 mb-6">
          <ShieldAlert className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-bold text-amber-300 mb-0.5">
              This choice is permanent and recorded on-chain
            </p>
            <p className="text-xs text-amber-200/60 leading-relaxed">
              Once you select a role, this wallet address is locked to it forever.
              You need to create second wallet in Phantom for different role — it takes just 10 seconds.
            </p>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4 mb-6">
          <button
            onClick={() => void choose("client")}
            disabled={asyncStep === "loading"}
            className="group text-left rounded-2xl border border-[#174BD4]/20 bg-[#174BD4]/[0.04] p-6 hover:border-[#174BD4]/50 hover:bg-[#174BD4]/[0.10] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 cursor-pointer"
          >
            <div className="h-10 w-10 rounded-xl bg-[#174BD4]/20 border border-[#174BD4]/30 flex items-center justify-center text-[#174BD4] mb-4">
              <Briefcase className="h-5 w-5" />
            </div>
            <div className="text-xs font-bold uppercase tracking-[0.15em] text-[#174BD4] mb-2">I&apos;m a Client</div>
            <div className="text-lg font-bold text-white mb-2">Hire Talent</div>
            <p className="text-sm text-zinc-400 leading-relaxed">
              Browse freelancer gigs, create jobs, and lock payment in escrow.
              Pay only when satisfied with the delivered work.
            </p>
            <div className="mt-5 flex items-center gap-2 text-[#174BD4] text-sm font-semibold">
              Select Client <span className="group-hover:translate-x-0.5 transition-transform">→</span>
            </div>
          </button>

          <button
            onClick={() => void choose("freelancer")}
            disabled={asyncStep === "loading"}
            className="group text-left rounded-2xl border border-[#85DABE]/20 bg-[#85DABE]/[0.04] p-6 hover:border-[#85DABE]/50 hover:bg-[#85DABE]/[0.10] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 cursor-pointer"
          >
            <div className="h-10 w-10 rounded-xl bg-[#85DABE]/15 border border-[#85DABE]/20 flex items-center justify-center text-[#85DABE] mb-4">
              <Zap className="h-5 w-5" />
            </div>
            <div className="text-xs font-bold uppercase tracking-[0.15em] text-[#85DABE] mb-2">I&apos;m a Freelancer</div>
            <div className="text-lg font-bold text-white mb-2">Find Work</div>
            <p className="text-sm text-zinc-400 leading-relaxed">
              Post your gigs, accept jobs, deliver work, and get paid instantly
              to your wallet. No invoices, no delays.
            </p>
            <div className="mt-5 flex items-center gap-2 text-[#85DABE] text-sm font-semibold">
              Select Freelancer <span className="group-hover:translate-x-0.5 transition-transform">→</span>
            </div>
          </button>
        </div>

        <div className="flex items-start gap-3 rounded-xl border border-amber-500/20 bg-amber-500/[0.05] px-4 py-3.5 mb-6">
          <ShieldAlert className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-bold text-amber-300 mb-0.5">
              Example:
            </p>
            <p className="text-xs text-amber-200/60 leading-relaxed">
              If you select 'Hire Talent': this wallet will permanently work as a client profile.
              <br/>You need to create another wallet in phantom to work as a 'Freelancer'.
            </p>
          </div>
        </div>

        {asyncStep === "loading" && (
          <div className="flex items-center justify-center gap-2 text-zinc-400 text-sm py-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            Creating your on-chain profile — approve in your wallet…
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