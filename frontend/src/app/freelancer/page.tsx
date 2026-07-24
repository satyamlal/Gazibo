"use client";

import { useState, useEffect, useCallback } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import type { AnchorWallet } from "@solana/wallet-adapter-react";
import { PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";
import Link from "next/link";
import {
    buildProgram, freelancerProfilePda, lamportsToSol, ratingAvg,
    type FreelancerProfileAccount, type GigOnChain, type JobOnChain,
} from "@/lib/program";
import { Zap, Plus, Loader2, Star, Briefcase, TrendingUp, CheckCircle2 } from "lucide-react";

interface GigItem { publicKey: PublicKey; account: GigOnChain }
interface JobItem { publicKey: PublicKey; account: JobOnChain }

function statusKey(s: Record<string, Record<string, never>>) {
    return Object.keys(s)[0] ?? "open";
}

export default function FreelancerDashboard() {
    const { connection } = useConnection();
    const wallet = useWallet();
    const [profile, setProfile] = useState<FreelancerProfileAccount | null>(null);
    const [gigs, setGigs] = useState<GigItem[] | null>(null);
    const [jobs, setJobs] = useState<JobItem[] | null>(null);
    const [error, setError] = useState("");

    const load = useCallback(async () => {
        if (!wallet.publicKey) return;
        setError("");
        try {
            const anchorWallet: AnchorWallet = {
            publicKey: wallet.publicKey,
            signTransaction: wallet.signTransaction!,
            signAllTransactions: wallet.signAllTransactions!,
            };
            const program = buildProgram(connection, anchorWallet);
            const pda = freelancerProfilePda(wallet.publicKey);

            const [prof, allGigs, allJobs] = await Promise.all([
                program.account.freelancerProfile.fetch(pda).catch(() => null),
                program.account.gigAccount.all(),
                program.account.jobAccount.all(),
            ]);

            setProfile(prof);
            setGigs(
                allGigs
                .filter((g) => g.account.freelancer.equals(wallet.publicKey!))
                .sort((a, b) => b.account.createdAt.toNumber() - a.account.createdAt.toNumber())
            );
            setJobs(
                allJobs.filter((j) => {
                const fl = j.account.freelancer;
                if (!fl || fl.equals(PublicKey.default)) return false;
                if (!fl.equals(wallet.publicKey!)) return false;
                const s = statusKey(j.account.status);
                return s === "inProgress" || s === "delivered";
                })
            );
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to load.");
            setGigs([]);
            setJobs([]);
        }
}, [connection, wallet.publicKey, wallet.signTransaction, wallet.signAllTransactions]);

useEffect(() => { void load(); }, [load]);

if (!wallet.connected) {
    return (
        <div className="min-h-[70vh] bg-[#030712] flex items-center justify-center px-6">
            <div className="text-center">
                <p className="text-zinc-400 mb-4">Connect your wallet to view your dashboard.</p>
                <Link href="/connect" className="px-6 py-3 rounded-full bg-[#85DABE] text-[#030712] text-sm font-bold hover:bg-[#A8E8D0] transition-colors">
                    Connect Wallet
                </Link>
            </div>
        </div>
    );
}

const avg = profile ? ratingAvg(profile.ratingSum, profile.ratingCount) : 0;

    return (
    <div className="min-h-screen bg-[#030712]">
        <div className="pointer-events-none fixed inset-0 z-0">
            <div className="absolute top-0 left-[10%] w-[600px] h-[400px] bg-[radial-gradient(circle,rgba(133,218,190,0.06)_0%,transparent_70%)]" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-5 md:px-8 py-16 md:py-20">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-10">
                <div>
                    <p className="text-xs font-bold tracking-[0.2em] text-[#85DABE] uppercase mb-2">
                    Freelancer Dashboard
                    </p>
                    <h1
                    className="text-3xl font-extrabold text-white tracking-tight"
                    style={{ fontFamily: "var(--font-heading, var(--font-sans))" }}
                    >
                    My Workspace
                    </h1>
                </div>
                <Link
                    href="/account/freelancer/gigs/new"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#85DABE] text-[#030712] text-sm font-bold hover:bg-[#A8E8D0] transition-colors"
                >
                    <Plus className="h-4 w-4" /> New Gig
                </Link>
            </div>

        {error && (
            <div className="mb-6 rounded-xl border border-red-500/20 bg-red-500/[0.06] px-4 py-3 text-sm text-red-300">
                {error}
            </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
            {[
                { icon: Zap, label: "My Gigs", value: String(gigs?.length ?? 0), color: "text-[#85DABE]" },
                { icon: Briefcase, label: "Active Jobs", value: String(jobs?.filter(j => statusKey(j.account.status) === "inProgress").length ?? 0), color: "text-[#174BD4]" },
                { icon: CheckCircle2, label: "Completed", value: profile ? profile.jobsCompleted.toString() : "0", color: "text-amber-400" },
                { icon: TrendingUp, label: "Total Earned", value: `${profile ? lamportsToSol(profile.totalEarned) : "0.000"} SOL`, color: "text-[#85DABE]" },
            ].map((stat) => (
            <div key={stat.label} className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4 md:p-5">
                <div className={`flex items-center gap-2 mb-3 ${stat.color}`}>
                    <stat.icon className="h-4 w-4" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">{stat.label}</span>
                </div>
            <div className="text-xl font-bold text-white">{stat.value}</div>
            </div>
            ))}
        </div>

        {/* Rating */}
        {profile && profile.ratingCount > 0 && (
            <div className="mb-8 flex items-center gap-3 rounded-2xl border border-amber-500/20 bg-amber-500/[0.04] px-5 py-4">
                <Star className="h-5 w-5 text-amber-400 fill-amber-400 shrink-0" />
                <span className="text-white font-bold">{avg.toFixed(1)}</span>
                <span className="text-zinc-400 text-sm">/ 5.0 from </span>
                <span className="text-white font-bold">{profile.ratingCount}</span>
                <span className="text-zinc-400 text-sm">review{profile.ratingCount !== 1 ? "s" : ""}</span>
            </div>
        )}

        {/* My Gigs */}
        <section className="mb-12">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-white">My Gigs</h2>
                <Link href="/account/freelancer/gigs" className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors">
                    View all →
            </Link>
            </div>
            {gigs === null ? (
                <div className="flex items-center gap-2 py-8 text-zinc-500 text-sm">
                    <Loader2 className="h-4 w-4 animate-spin" /> Loading…
                </div>
            ) : gigs.length === 0 ? (
                    <div className="rounded-2xl border border-white/[0.05] bg-white/[0.01] p-8 text-center">
                        <p className="text-zinc-400 text-sm mb-3">No gigs yet.</p>
                        <Link href="/account/freelancer/gigs/new" className="text-[#85DABE] text-sm font-semibold hover:underline">
                            Create your first gig →
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {gigs.slice(0, 5).map(({ publicKey, account }) => (
                            <div key={publicKey.toBase58()} className="flex items-center justify-between rounded-2xl border border-white/[0.06] bg-white/[0.02] px-5 py-4 hover:border-white/[0.10] transition-colors">
                                <div className="flex-1 min-w-0 mr-4">
                                    <p className="text-sm font-semibold text-white truncate">{account.title}</p>
                                    <p className="text-xs text-zinc-500 mt-0.5">
                                        From {(account.basicPrice.toNumber() / LAMPORTS_PER_SOL).toFixed(3)} SOL
                                        {" · "}
                                        {account.isActive ? <span className="text-[#85DABE]">Active</span> : <span className="text-red-400">Paused</span>}
                                    </p>
                                </div>
                                <Link href={`/account/freelancer/gigs/${publicKey.toBase58()}`} className="shrink-0 text-xs text-zinc-500 hover:text-white transition-colors">
                                    Edit →
                                </Link>
                            </div>
                        ))}
                    </div>
                    )}
        </section>

        {/* Active Jobs */}
        <section>
            <h2 className="text-lg font-bold text-white mb-4">Active Jobs</h2>
            {jobs === null ? (
                <div className="flex items-center gap-2 py-8 text-zinc-500 text-sm">
                    <Loader2 className="h-4 w-4 animate-spin" /> Loading…
                </div>
            ) : jobs.length === 0 ? (
                    <div className="rounded-2xl border border-white/[0.05] bg-white/[0.01] p-8 text-center">
                        <p className="text-zinc-400 text-sm mb-3">No active jobs.</p>
                        <Link href="/jobs" className="text-[#85DABE] text-sm font-semibold hover:underline">
                            Browse open jobs →
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {jobs.map(({ publicKey, account }) => {
                            const s = statusKey(account.status);
                            return (
                                <div key={publicKey.toBase58()} className="flex items-center justify-between rounded-2xl border border-white/[0.06] bg-white/[0.02] px-5 py-4 hover:border-white/[0.10] transition-colors">
                                    <div className="flex-1 min-w-0 mr-4">
                                        <p className="text-sm font-semibold text-white truncate">{account.title}</p>
                                        <p className="text-xs text-zinc-500 mt-0.5">
                                            {(account.amount.toNumber() / LAMPORTS_PER_SOL).toFixed(3)} SOL in escrow
                                            {" · "}
                                            {s === "inProgress"
                                            ? <span className="text-[#174BD4]">In Progress</span>
                                            : <span className="text-amber-400">Delivered — Awaiting Approval</span>}
                                        </p>
                                    </div>
                                    <Link
                                    href={`/jobs/${publicKey.toBase58()}`}
                                    className={`shrink-0 text-xs font-semibold transition-colors ${s === "inProgress" ? "text-[#85DABE] hover:text-[#A8E8D0]" : "text-zinc-500 hover:text-white"}`}
                                    >
                                    {s === "inProgress" ? "Deliver →" : "View →"}
                                    </Link>
                                </div>
                            );
                        })}
                    </div>
                )}
        </section>
    </div>
</div>
);
}