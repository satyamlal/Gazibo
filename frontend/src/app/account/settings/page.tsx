"use client";

import { useState, useEffect, useCallback } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import type { AnchorWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Sun, Moon, Briefcase, Zap, Settings,
  Trash2, Loader2, ArrowRight, CheckCircle2,
} from "lucide-react";
import IDL from "@/idl/gazibo.json";
import { buildProgram } from "@/lib/program";

const CLIENT_SEED = Buffer.from("client_profile");
const FREELANCER_PROFILE_SEED = Buffer.from("freelancer_profile");
const PROGRAM_ID = new PublicKey(IDL.address);

type ProfileState = "loading" | "none" | "client" | "freelancer" | "both";

export default function SettingsPage() {
  const { publicKey, connected } = useWallet();
  const { connection } = useConnection();
  const wallet = useWallet();
  const router = useRouter();

  const [isDark, setIsDark] = useState(true);
  const [profileState, setProfileState] = useState<ProfileState>("loading");
  const [switching, setSwitching] = useState(false);
  const [switchError, setSwitchError] = useState("");

  // Read saved theme on mount
  useEffect(() => {
    const saved = localStorage.getItem("gazibo_theme");
    setIsDark(saved !== "light");
  }, []);

  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    if (next) {
      document.documentElement.classList.remove("light");
      document.documentElement.classList.add("dark");
      localStorage.setItem("gazibo_theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      document.documentElement.classList.add("light");
      localStorage.setItem("gazibo_theme", "light");
    }
  };

  const detectProfiles = useCallback(async () => {
    if (!publicKey) return;
    setProfileState("loading");
    const [clientPda] = PublicKey.findProgramAddressSync([CLIENT_SEED, publicKey.toBuffer()], PROGRAM_ID);
    const [freelancerPda] = PublicKey.findProgramAddressSync([FREELANCER_PROFILE_SEED, publicKey.toBuffer()], PROGRAM_ID);
    const [ci, fi] = await Promise.all([
      connection.getAccountInfo(clientPda),
      connection.getAccountInfo(freelancerPda),
    ]);
    if (ci && fi) setProfileState("both");
    else if (ci) setProfileState("client");
    else if (fi) setProfileState("freelancer");
    else setProfileState("none");
  }, [publicKey, connection]);

  useEffect(() => { void detectProfiles(); }, [detectProfiles]);

  // Add the missing profile type (client if only freelancer, vice versa)
  const addProfile = async (type: "client" | "freelancer") => {
    if (!wallet.publicKey || !wallet.signTransaction || !wallet.signAllTransactions) return;
    setSwitching(true);
    setSwitchError("");
    try {
      const anchorWallet: AnchorWallet = {
        publicKey: wallet.publicKey,
        signTransaction: wallet.signTransaction,
        signAllTransactions: wallet.signAllTransactions,
      };
      const program = buildProgram(connection, anchorWallet);
      if (type === "client") {
        await program.methods.initializeClient().rpc();
      } else {
        await program.methods.initializeFreelancer().rpc();
      }
      // Refresh and redirect to the new profile
      await detectProfiles();
      localStorage.setItem(`role_set_${wallet.publicKey.toBase58()}`, "true");
      router.push(type === "client" ? "/account/client" : "/account/freelancer");
    } catch (err) {
      setSwitchError(err instanceof Error ? err.message : "Transaction failed.");
    } finally {
      setSwitching(false);
    }
  };

  if (!connected) {
    return (
      <div className="min-h-[70vh] bg-[#030712] flex items-center justify-center px-6">
        <div className="text-center">
          <p className="text-zinc-400 mb-4">Connect your wallet to access settings.</p>
          <Link href="/connect" className="px-6 py-3 rounded-full bg-[#85DABE] text-[#030712] text-sm font-bold hover:bg-[#A8E8D0] transition-colors">Connect Wallet</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#030712]">
      <div className="max-w-2xl mx-auto px-5 md:px-8 py-16">

        <div className="mb-10">
          <p className="text-xs font-bold tracking-[0.2em] text-[#85DABE] uppercase mb-2">Account</p>
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <Settings className="h-7 w-7 text-zinc-500" /> Settings
          </h1>
        </div>

        <div className="space-y-4">

          {/* Wallet */}
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6">
            <h2 className="text-sm font-bold text-zinc-300 mb-4">Wallet</h2>
            <div className="rounded-xl bg-black/20 border border-white/[0.06] px-4 py-3">
              <p className="text-[11px] text-zinc-600 font-mono uppercase tracking-wider mb-1">Connected address</p>
              <p className="text-sm font-mono text-zinc-200 break-all">{publicKey?.toBase58()}</p>
            </div>
          </div>

          {/* Active Profiles */}
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6">
            <h2 className="text-sm font-bold text-zinc-300 mb-1">My Profiles</h2>
            <p className="text-xs text-zinc-600 mb-5">
              You can have both Client and Freelancer profiles on the same wallet.
            </p>

            {profileState === "loading" ? (
              <div className="flex items-center gap-2 text-zinc-500 text-sm py-4">
                <Loader2 className="h-4 w-4 animate-spin" /> Checking on-chain profiles…
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 gap-3">

                {/* Client profile card */}
                <div className={`rounded-xl border p-4 ${
                  profileState === "client" || profileState === "both"
                    ? "border-[#174BD4]/30 bg-[#174BD4]/[0.06]"
                    : "border-white/[0.06] bg-white/[0.01]"
                }`}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Briefcase className={`h-4 w-4 ${profileState === "client" || profileState === "both" ? "text-[#174BD4]" : "text-zinc-600"}`} />
                      <span className="text-sm font-semibold text-white">Client</span>
                    </div>
                    {(profileState === "client" || profileState === "both") ? (
                      <span className="flex items-center gap-1 text-[10px] font-bold text-[#85DABE] bg-[#85DABE]/10 border border-[#85DABE]/20 px-2 py-0.5 rounded-full">
                        <CheckCircle2 className="h-3 w-3" /> Active
                      </span>
                    ) : (
                      <span className="text-[10px] text-zinc-600 font-medium">Not set up</span>
                    )}
                  </div>
                  <p className="text-xs text-zinc-500 mb-3">Post jobs, hire freelancers, release payments.</p>
                  {(profileState === "client" || profileState === "both") ? (
                    <Link href="/account/client" className="text-xs text-[#174BD4] font-semibold hover:underline flex items-center gap-1">
                      Go to Client Dashboard <ArrowRight className="h-3 w-3" />
                    </Link>
                  ) : (
                    <button
                      onClick={() => void addProfile("client")}
                      disabled={switching}
                      className="text-xs text-[#85DABE] font-semibold hover:underline flex items-center gap-1 disabled:opacity-50"
                    >
                      {switching ? <Loader2 className="h-3 w-3 animate-spin" /> : <span>+ Set up Client Profile</span>}
                    </button>
                  )}
                </div>

                {/* Freelancer profile card */}
                <div className={`rounded-xl border p-4 ${
                  profileState === "freelancer" || profileState === "both"
                    ? "border-[#85DABE]/30 bg-[#85DABE]/[0.06]"
                    : "border-white/[0.06] bg-white/[0.01]"
                }`}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Zap className={`h-4 w-4 ${profileState === "freelancer" || profileState === "both" ? "text-[#85DABE]" : "text-zinc-600"}`} />
                      <span className="text-sm font-semibold text-white">Freelancer</span>
                    </div>
                    {(profileState === "freelancer" || profileState === "both") ? (
                      <span className="flex items-center gap-1 text-[10px] font-bold text-[#85DABE] bg-[#85DABE]/10 border border-[#85DABE]/20 px-2 py-0.5 rounded-full">
                        <CheckCircle2 className="h-3 w-3" /> Active
                      </span>
                    ) : (
                      <span className="text-[10px] text-zinc-600 font-medium">Not set up</span>
                    )}
                  </div>
                  <p className="text-xs text-zinc-500 mb-3">Post gigs, accept jobs, get paid instantly.</p>
                  {(profileState === "freelancer" || profileState === "both") ? (
                    <Link href="/account/freelancer" className="text-xs text-[#85DABE] font-semibold hover:underline flex items-center gap-1">
                      Go to Freelancer Dashboard <ArrowRight className="h-3 w-3" />
                    </Link>
                  ) : (
                    <button
                      onClick={() => void addProfile("freelancer")}
                      disabled={switching}
                      className="text-xs text-[#85DABE] font-semibold hover:underline flex items-center gap-1 disabled:opacity-50"
                    >
                      {switching ? <Loader2 className="h-3 w-3 animate-spin" /> : <span>+ Set up Freelancer Profile</span>}
                    </button>
                  )}
                </div>
              </div>
            )}

            {switchError && (
              <div className="mt-4 rounded-xl border border-red-500/20 bg-red-500/[0.06] px-4 py-3 text-xs text-red-300">
                {switchError}
              </div>
            )}
          </div>

          {/* Appearance */}
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6">
            <h2 className="text-sm font-bold text-zinc-300 mb-4">Appearance</h2>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {isDark ? <Moon className="h-5 w-5 text-[#85DABE]" /> : <Sun className="h-5 w-5 text-amber-400" />}
                <div>
                  <p className="text-sm font-medium text-white">{isDark ? "Dark mode" : "Light mode"}</p>
                  <p className="text-xs text-zinc-500">{isDark ? "Easy on the eyes at night" : "Better in bright environments"}</p>
                </div>
              </div>
              <button
                onClick={toggleTheme}
                className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${isDark ? "bg-[#174BD4]" : "bg-zinc-600"}`}
              >
                <span className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200 ${isDark ? "translate-x-6" : "translate-x-0"}`} />
              </button>
            </div>
          </div>

          {/* Danger zone */}
          <div className="rounded-2xl border border-red-500/20 bg-red-500/[0.03] p-6">
            <h2 className="text-sm font-bold text-red-400 mb-4">Danger Zone</h2>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-white">Delete Account</p>
                <p className="text-xs text-zinc-500 mt-0.5">Disconnect and clear your local session.</p>
              </div>
              <Link href="/account/settings/delete"
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