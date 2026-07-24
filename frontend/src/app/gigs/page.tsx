"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useConnection } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import {
    buildProgram,
    ratingAvg,
    shortAddress,
    type GigOnChain,
    type FreelancerProfileAccount,
} from "@/lib/program";
import { GigCard } from "@/components/gigs/GigCard";
import type { BN } from "@coral-xyz/anchor";
import { Loader2, Search, RefreshCw } from "lucide-react";

interface GigItem {
    publicKey: PublicKey;
    account: GigOnChain;
    profile: FreelancerProfileAccount | null;
}

export default function GigsPage() {
    const { connection } = useConnection();
    const [gigs, setGigs] = useState<GigItem[] | null>(null);
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");

    const load = useCallback(async () => {
    setError("");
    try {
      // No wallet passed — read-only, anyone can browse
        const program = buildProgram(connection);

        const [allGigs, allProfiles] = await Promise.all([
            program.account.gigAccount.all(),
            program.account.freelancerProfile.all(),
        ]);

        const profileMap = new Map<string, FreelancerProfileAccount>();
        for (const { account } of allProfiles) {
            profileMap.set(account.freelancer.toBase58(), account);
        }

        const items: GigItem[] = allGigs
            .filter((g) => g.account.isActive)
            .sort((a, b) => b.account.createdAt.toNumber() - a.account.createdAt.toNumber())
            .map((g) => ({
                publicKey: g.publicKey,
                account: g.account,
                profile: profileMap.get(g.account.freelancer.toBase58()) ?? null,
            }));

        setGigs(items);
    } catch {
        setError("Could not load gigs. Is solana-test-validator running?");
        setGigs([]);
    }
}, [connection]);

useEffect(() => { void load(); }, [load]);

    const visible = useMemo(() => {
        if (!gigs) return [];
        if (!search.trim()) return gigs;
        const q = search.toLowerCase();
        return gigs.filter((g) => g.account.title.toLowerCase().includes(q));
    }, [gigs, search]);

    return (
        <div className="min-h-screen bg-[#030712]">
            <div className="pointer-events-none fixed inset-0 z-0">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-[radial-gradient(ellipse_at_center,rgba(23,75,212,0.10)_0%,transparent_70%)]" />
            </div>

            <div className="relative z-10 max-w-6xl mx-auto px-5 md:px-8 py-16 md:py-20">

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
                <div>
                    <p className="text-xs font-bold tracking-[0.2em] text-[#85DABE] uppercase mb-3">
                        Marketplace
                    </p>

                    <h1
                        className="text-3xl md:text-4xl font-extrabold tracking-tight text-white"
                        style={{ fontFamily: "var(--font-heading, var(--font-sans))" }}
                    >
                        Browse Gigs
                    </h1>

                    <p className="mt-2 text-zinc-400 text-sm">
                        Browse freelancer services. No wallet needed to look around.
                    </p>
                </div>

                <button onClick={() => void load()}
                    className="h-8 w-8 flex items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.02] text-zinc-400 hover:text-white hover:bg-white/[0.06] transition-colors"
                    aria-label="Refresh"
                >
                    <RefreshCw className="h-3.5 w-3.5" />
                </button>
            </div>

            {/* Search */}
            <div className="relative mb-8">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 pointer-events-none" />
                <input
                    type="text"
                    placeholder="Search gigs…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full max-w-md pl-11 pr-4 py-3 rounded-full bg-white/[0.04] border border-white/[0.08] text-white placeholder:text-zinc-600 text-sm focus:outline-none focus:border-[#174BD4]/50 focus:bg-white/[0.06] transition-colors"
            />
            </div>

            {error && (
                <div className="mb-8 rounded-xl border border-red-500/20 bg-red-500/[0.06] px-4 py-3 text-sm text-red-300">
                    {error}
                </div>
            )}

            {gigs === null ? (
                <div className="flex items-center justify-center gap-2 py-24 text-zinc-500">
                    <Loader2 className="h-4 w-4 animate-spin" />
                        Loading gigs from chain…
                </div>
            ) : visible.length === 0 ? (
                    <div className="flex flex-col items-center justify-center gap-3 py-24 text-center">
                        <p className="text-zinc-400 text-sm">
                            {search ? `No gigs match "${search}".` : "No gigs posted yet."}
                        </p>
                        
                        {!search && (
                            <p className="text-zinc-600 text-xs">
                                Connect a wallet as a Freelancer to post the first gig.
                            </p>
                        )}
                    </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {visible.map(({ publicKey, account, profile }) => (
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
                            ratingAvg: profile ? ratingAvg(profile.ratingSum, profile.ratingCount) : 0,
                            ratingCount: profile?.ratingCount ?? 0,
                            jobsCompleted: profile ? profile.jobsCompleted.toNumber() : 0,
                            }}
                        />
                    ))}
                </div>
            )}
        </div>
    </div>
    );
}