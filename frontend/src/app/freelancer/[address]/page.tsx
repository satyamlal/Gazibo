"use client";

import { useState, useEffect, useCallback } from "react";
import { useConnection } from "@solana/wallet-adapter-react";
import { PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  buildProgram, ratingAvg, PROGRAM_ID,
  type FreelancerProfileAccount, type GigOnChain,
} from "@/lib/program";
import { GigCard } from "@/components/gigs/GigCard";
import type { BN } from "@coral-xyz/anchor";
import {
  ArrowLeft, Star, Loader2, Zap,
  CheckCircle2, Briefcase,
} from "lucide-react";

interface GigItem { publicKey: PublicKey; account: GigOnChain }

function shortAddress(pk: PublicKey): string {
  const s = pk.toBase58();
  return `${s.slice(0, 6)}…${s.slice(-6)}`;
}

export default function FreelancerProfilePage() {
  const params = useParams();
  const { connection } = useConnection();

  const address = params.address as string;

  const [profile, setProfile] = useState<FreelancerProfileAccount | null>(null);
  const [gigs, setGigs] = useState<GigItem[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setError("");
    try {
      const freelancerPubkey = new PublicKey(address);
      const program = buildProgram(connection);

      // Derive FreelancerProfile PDA
      const [profilePda] = PublicKey.findProgramAddressSync(
        [Buffer.from("freelancer_profile"), freelancerPubkey.toBuffer()],
        PROGRAM_ID
      );

      const [prof, allGigs] = await Promise.all([
        program.account.freelancerProfile.fetch(profilePda).catch(() => null),
        program.account.gigAccount.all(),
      ]);

      setProfile(prof);
      setGigs(
        allGigs
          .filter((g) => g.account.freelancer.equals(freelancerPubkey) && g.account.isActive)
          .sort((a, b) => b.account.createdAt.toNumber() - a.account.createdAt.toNumber())
      );
    } catch {
      setError("Freelancer profile not found on this validator.");
    } finally {
      setLoading(false);
    }
  }, [connection, address]);

  useEffect(() => { void load(); }, [load]);

  if (loading) {
    return (
      <div className="min-h-[70vh] bg-[#030712] flex items-center justify-center">
        <Loader2 className="h-5 w-5 animate-spin text-zinc-500" />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-[70vh] bg-[#030712] flex items-center justify-center px-6">
        <div className="text-center">
          <p className="text-red-400 text-sm mb-4">
            {error || "This freelancer doesn't have a profile on this validator."}
          </p>
          <Link href="/freelancers" className="text-[#85DABE] text-sm hover:underline">
            ← Browse Freelancers
          </Link>
        </div>
      </div>
    );
  }

  const avg = ratingAvg(profile.ratingSum, profile.ratingCount);
  let freelancerPubkey: PublicKey;
  try {
    freelancerPubkey = new PublicKey(address);
  } catch {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#030712]">
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-[radial-gradient(ellipse_at_center,rgba(133,218,190,0.06)_0%,transparent_70%)]" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-5 md:px-8 py-16">

        {/* Back */}
        <div className="mb-8">
          <Link href="/freelancers" className="flex items-center gap-2 text-zinc-500 hover:text-white transition-colors w-fit">
            <ArrowLeft className="h-4 w-4" />
            <span className="text-sm">Browse Freelancers</span>
          </Link>
        </div>

        {/* Profile header */}
        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6 md:p-8 mb-6">
          <div className="flex items-start gap-5">
            {/* Avatar */}
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-[#174BD4]/30 to-[#85DABE]/20 border border-white/[0.08] flex items-center justify-center text-2xl font-bold text-white shrink-0">
              {address.charAt(0).toUpperCase()}
            </div>

            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-extrabold text-white mb-1 truncate"
                style={{ fontFamily: "var(--font-heading, var(--font-sans))" }}>
                {shortAddress(freelancerPubkey)}
              </h1>
              <p className="text-xs font-mono text-zinc-600 break-all mb-3">
                {address}
              </p>

              {/* Rating */}
              {profile.ratingCount > 0 ? (
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
                  <span className="font-bold text-white">{avg.toFixed(1)}</span>
                  <span className="text-zinc-500 text-sm">
                    ({profile.ratingCount} review{profile.ratingCount !== 1 ? "s" : ""})
                  </span>
                </div>
              ) : (
                <p className="text-xs text-zinc-600">No reviews yet</p>
              )}
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-white/[0.06]">
            {[
              { icon: Zap, label: "Active Gigs", value: String(gigs?.length ?? 0) },
              { icon: CheckCircle2, label: "Jobs Completed", value: profile.jobsCompleted.toString() },
              { icon: Briefcase, label: "Active Jobs", value: profile.gigCounter.toString() },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <stat.icon className="h-4 w-4 text-zinc-600 mx-auto mb-1" />
                <p className="text-lg font-bold text-white">{stat.value}</p>
                <p className="text-[11px] text-zinc-600">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Gigs */}
        <div>
          <h2 className="text-lg font-bold text-white mb-4">Active Gigs</h2>

          {gigs === null ? (
            <div className="flex items-center gap-2 py-8 text-zinc-500 text-sm">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading…
            </div>
          ) : gigs.length === 0 ? (
            <div className="rounded-2xl border border-white/[0.05] bg-white/[0.01] p-8 text-center">
              <p className="text-zinc-400 text-sm">This freelancer has no active gigs yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {gigs.map(({ publicKey, account }) => (
                <GigCard
                  key={publicKey.toBase58()}
                  gig={{
                    publicKey,
                    freelancer: account.freelancer,
                    gigId: account.gigId as BN,
                    title: account.title,
                    basicPrice: account.basicPrice as BN,
                    standardPrice: account.standardPrice as BN,
                    premiumPrice: account.premiumPrice as BN,
                    isActive: account.isActive,
                    createdAt: account.createdAt as BN,
                  }}
                  freelancer={{
                    name: shortAddress(account.freelancer),
                    ratingAvg: avg,
                    ratingCount: profile.ratingCount,
                    jobsCompleted: profile.jobsCompleted.toNumber(),
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}