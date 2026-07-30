"use client";

import { useState, useEffect, useCallback } from "react";
import { useConnection } from "@solana/wallet-adapter-react";
import { PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";
import Link from "next/link";
import { buildProgram, ratingAvg, type FreelancerProfileAccount } from "@/lib/program";
import { Loader2, Star, Zap, RefreshCw, CheckCircle2 } from "lucide-react";

interface FreelancerItem {
    publicKey: PublicKey;
    walletAddress: PublicKey;
    profile: FreelancerProfileAccount;
    gigCount: number;
}

function shortAddress(pk: PublicKey): string {
    const s = pk.toBase58();
    return `${s.slice(0, 6)}…${s.slice(-6)}`;
}

export default function FreelancersPage() {
    const { connection } = useConnection();
    const [freelancers, setFreelancers] = useState<FreelancerItem[] | null>(null);
    const [error, setError] = useState("");

    const load = useCallback(async () => {
        setError("");
        try {
        const program = buildProgram(connection);
        const [allProfiles, allGigs] = await Promise.all([
            program.account.freelancerProfile.all(),
            program.account.gigAccount.all(),
        ]);

        // Count active gigs per freelancer
        const gigCounts = new Map<string, number>();
        for (const { account } of allGigs) {
            if (!account.isActive) continue;
            const key = account.freelancer.toBase58();
            gigCounts.set(key, (gigCounts.get(key) ?? 0) + 1);
        }

        const items: FreelancerItem[] = allProfiles.map(({ publicKey, account }) => ({
            publicKey,
            walletAddress: account.freelancer,
            profile: account,
            gigCount: gigCounts.get(account.freelancer.toBase58()) ?? 0,
        }));

        // Sort by rating desc, then by jobs completed
        items.sort((a, b) => {
            const rA = ratingAvg(a.profile.ratingSum, a.profile.ratingCount);
            const rB = ratingAvg(b.profile.ratingSum, b.profile.ratingCount);
            if (rB !== rA) return rB - rA;
            return b.profile.jobsCompleted.toNumber() - a.profile.jobsCompleted.toNumber();
        });

        setFreelancers(items);
        } catch {
        setError("Couldn't load freelancers. Is solana-test-validator running?");
        setFreelancers([]);
        }
    }, [connection]);

    useEffect(() => { void load(); }, [load]);

    return (
        <div className="min-h-screen bg-[#030712]">
            <div className="pointer-events-none fixed inset-0 z-0">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-[radial-gradient(ellipse_at_center,rgba(133,218,190,0.07)_0%,transparent_70%)]" />
            </div>
            <div className="relative z-10 max-w-6xl mx-auto px-5 md:px-8 py-16 md:py-20">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
                    <div>
                        <p className="text-xs font-bold tracking-[0.2em] text-[#85DABE] uppercase mb-3">
                        Talent Directory
                        </p>
                        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white"
                        style={{ fontFamily: "var(--font-heading, var(--font-sans))" }}>
                        Available Freelancers
                        </h1>
                        <p className="mt-2 text-zinc-400 text-sm">
                        All freelancers with on-chain profiles.
                        </p>
                    </div>
                    <button
                        onClick={() => void load()}
                        className="h-8 w-8 flex items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.02] text-zinc-400 hover:text-white hover:bg-white/[0.06] transition-colors shrink-0"
                        aria-label="Refresh"
                    >
                        <RefreshCw className="h-3.5 w-3.5" />
                    </button>
                </div>

                {error && (
                <div className="mb-8 rounded-xl border border-red-500/20 bg-red-500/[0.06] px-4 py-3 text-sm text-red-300">
                    {error}
                </div>
                )}

                {freelancers === null ? (
                <div className="flex items-center justify-center gap-2 py-24 text-zinc-500">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading freelancers from chain…
                </div>
                ) : freelancers.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-3 py-24 text-center">
                    <p className="text-zinc-400 text-sm">No freelancers have registered yet on this validator.</p>
                    <p className="text-zinc-600 text-xs">
                    {"Connect a wallet and choose \"I'm a Freelancer\" to be the first."}
                    </p>
                    <Link href="/jobs" className="mt-2 text-[#85DABE] text-sm hover:underline">
                        Browse open jobs instead →
                    </Link>
                </div>
                ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {freelancers.map(({ walletAddress, profile, gigCount }) => {
                    const avg = ratingAvg(profile.ratingSum, profile.ratingCount);
                    const profileUrl = `/freelancer/${walletAddress.toBase58()}`;
                    return (
                        <Link
                        key={walletAddress.toBase58()}
                        href={profileUrl}
                        className="group block rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 hover:border-white/[0.12] hover:bg-white/[0.04] transition-all duration-200"
                        >
                            {/* Avatar + address */}
                            <div className="flex items-center gap-3 mb-4">
                                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-[#174BD4]/20 to-[#85DABE]/15 border border-white/[0.08] flex items-center justify-center text-white font-bold shrink-0">
                                {walletAddress.toBase58().charAt(0).toUpperCase()}
                                </div>
                                <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-white truncate">
                                    {shortAddress(walletAddress)}
                                </p>
                                {profile.ratingCount > 0 ? (
                                    <div className="flex items-center gap-1 mt-0.5">
                                    <Star className="h-3 w-3 text-amber-400 fill-amber-400" />
                                    <span className="text-xs font-bold text-white">{avg.toFixed(1)}</span>
                                    <span className="text-[11px] text-zinc-500">
                                        ({profile.ratingCount})
                                    </span>
                                    </div>
                                ) : (
                                    <p className="text-[11px] text-zinc-600 mt-0.5">New freelancer</p>
                                )}
                                </div>
                            </div>
                            {/* Stats */}
                            <div className="grid grid-cols-3 gap-2 pt-3 border-t border-white/[0.05]">
                                <div className="text-center">
                                    <Zap className="h-3.5 w-3.5 text-[#85DABE] mx-auto mb-1" />
                                    <p className="text-sm font-bold text-white">{gigCount}</p>
                                    <p className="text-[10px] text-zinc-600">Gigs</p>
                                </div>
                                <div className="text-center">
                                    <CheckCircle2 className="h-3.5 w-3.5 text-amber-400 mx-auto mb-1" />
                                    <p className="text-sm font-bold text-white">
                                        {profile.jobsCompleted.toString()}
                                    </p>
                                    <p className="text-[10px] text-zinc-600">Done</p>
                                </div>
                                <div className="text-center">
                                    <Star className="h-3.5 w-3.5 text-zinc-500 mx-auto mb-1" />
                                    <p className="text-sm font-bold text-white">
                                        {profile.ratingCount > 0 ? avg.toFixed(1) : "—"}
                                    </p>
                                    <p className="text-[10px] text-zinc-600">Rating</p>
                                </div>
                            </div>
                            <div className="mt-3 text-right">
                                <span className="text-xs text-[#85DABE] font-medium group-hover:underline">
                                View profile →
                                </span>
                            </div>
                        </Link>
                    );
                    })}
                </div>
                )}
            </div>
        </div>
    );
}