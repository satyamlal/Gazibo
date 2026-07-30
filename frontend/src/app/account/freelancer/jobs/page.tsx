"use client";

import { useState, useEffect, useCallback } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import type { AnchorWallet } from "@solana/wallet-adapter-react";
import { PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";
import Link from "next/link";
import { buildProgram, type JobOnChain } from "@/lib/program";
import {
  Loader2, Briefcase, Truck, CheckCircle2,
  Clock, ArrowRight, RefreshCw,
} from "lucide-react";

interface JobItem { publicKey: PublicKey; account: JobOnChain }

function statusKey(s: Record<string, Record<string, never>>): string {
  return Object.keys(s)[0] ?? "open";
}

const STATUS_CONFIG: Record<string, { label: string; cls: string; icon: React.ElementType }> = {
    inProgress: { label: "In Progress",      cls: "text-[#174BD4] bg-[#174BD4]/10 border-[#174BD4]/20", icon: Truck },
    delivered:  { label: "Delivered",         cls: "text-amber-400 bg-amber-500/10 border-amber-500/20", icon: Clock },
    completed:  { label: "Completed",         cls: "text-[#85DABE] bg-[#85DABE]/10 border-[#85DABE]/20", icon: CheckCircle2 },
};

type FilterType = "active" | "completed" | "all";

export default function FreelancerJobsPage() {
    const { connection } = useConnection();
    const wallet = useWallet();

    const [jobs, setJobs] = useState<JobItem[] | null>(null);
    const [filter, setFilter] = useState<FilterType>("active");
    const [error, setError] = useState("");

    const load = useCallback(async () => {
    if (!wallet.publicKey) return;
    setError("");
    try {
        const aw: AnchorWallet = {
            publicKey: wallet.publicKey,
            signTransaction: wallet.signTransaction!,
            signAllTransactions: wallet.signAllTransactions!,
        };
        const program = buildProgram(connection, aw);
        const all = await program.account.jobAccount.all();

        // Only jobs where THIS wallet is the assigned freelancer
        const mine = all
            .filter((j) => {
                const fl = j.account.freelancer as PublicKey | null;
                if (!fl) return false;
                return fl.equals(wallet.publicKey!);
            })
            .sort((a, b) => b.account.createdAt.toNumber() - a.account.createdAt.toNumber());

        setJobs(mine);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to load.");
            setJobs([]);
        }
    }, [connection, wallet.publicKey, wallet.signTransaction, wallet.signAllTransactions]);

    useEffect(() => { void load(); }, [load]);

    if (!wallet.connected) {
        return (
        <div className="min-h-[70vh] bg-[#030712] flex items-center justify-center px-6">
            <div className="text-center">
            <p className="text-zinc-400 mb-4">Connect your wallet to see your jobs.</p>
            <Link href="/connect" className="px-6 py-3 rounded-full bg-[#85DABE] text-[#030712] text-sm font-bold hover:bg-[#A8E8D0] transition-colors">
                Connect Wallet
            </Link>
            </div>
        </div>
        );
    }

    const visible = jobs
        ? filter === "active"
            ? jobs.filter((j) => (["inProgress", "delivered"] as string[]).includes(statusKey(j.account.status)))
            : filter === "completed"
            ? jobs.filter((j) => statusKey(j.account.status) === "completed")
            : jobs
        : [];

    const activeCount = jobs?.filter(j => (["inProgress", "delivered"] as string[]).includes(statusKey(j.account.status))).length ?? 0;
    const completedCount = jobs?.filter(j => statusKey(j.account.status) === "completed").length ?? 0;
    const totalEarned   = jobs
        ?.filter(j => statusKey(j.account.status) === "completed")
        .reduce((sum, j) => sum + j.account.amount.toNumber(), 0) ?? 0;

    return (
        <div className="min-h-screen bg-[#030712]">
        <div className="pointer-events-none fixed inset-0 z-0">
            <div className="absolute top-0 left-[10%] w-[600px] h-[400px] bg-[radial-gradient(circle,rgba(133,218,190,0.05)_0%,transparent_70%)]" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-5 md:px-8 py-16 md:py-20">

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div>
                <p className="text-xs font-bold tracking-[0.2em] text-[#85DABE] uppercase mb-2">
                Freelancer
                </p>
                <h1 className="text-3xl font-extrabold text-white tracking-tight"
                style={{ fontFamily: "var(--font-heading, var(--font-sans))" }}>
                My Jobs
                </h1>
            </div>
            <button onClick={() => void load()}
                className="h-8 w-8 flex items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.02] text-zinc-400 hover:text-white hover:bg-white/[0.06] transition-colors self-start sm:self-auto"
                aria-label="Refresh"
            >
                <RefreshCw className="h-3.5 w-3.5" />
            </button>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-3 mb-8">
            {[
                { label: "Active",    value: String(activeCount),   color: "text-[#174BD4]" },
                { label: "Completed", value: String(completedCount), color: "text-[#85DABE]" },
                { label: "Earned",    value: `${(totalEarned / LAMPORTS_PER_SOL).toFixed(3)} SOL`, color: "text-amber-400" },
            ].map((s) => (
                <div key={s.label} className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 text-center">
                <p className={`text-lg font-bold ${s.color}`}>{s.value}</p>
                <p className="text-[11px] text-zinc-600 mt-0.5">{s.label}</p>
                </div>
            ))}
            </div>

            {/* Filter tabs */}
            <div className="flex rounded-full border border-white/[0.08] bg-white/[0.02] p-1 mb-6 w-fit">
            {(["active", "completed", "all"] as FilterType[]).map((f) => (
                <button key={f} onClick={() => setFilter(f)}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold capitalize transition-colors ${
                    filter === f ? "bg-[#174BD4] text-white" : "text-zinc-400 hover:text-white"
                }`}
                >
                {f}
                </button>
            ))}
            </div>

            {error && (
            <div className="mb-6 rounded-xl border border-red-500/20 bg-red-500/[0.06] px-4 py-3 text-sm text-red-300">
                {error}
            </div>
            )}

            {/* Job list */}
            {jobs === null ? (
            <div className="flex items-center justify-center gap-2 py-16 text-zinc-500">
                <Loader2 className="h-4 w-4 animate-spin" /> Loading…
            </div>
            ) : visible.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-4 py-20 text-center rounded-2xl border border-white/[0.05] bg-white/[0.01]">
                <div className="h-12 w-12 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center text-zinc-600">
                <Briefcase className="h-5 w-5" />
                </div>
                <div>
                <p className="text-zinc-300 font-medium mb-1">
                    {filter === "active" ? "No active jobs" : filter === "completed" ? "No completed jobs yet" : "No jobs yet"}
                </p>
                <p className="text-zinc-600 text-sm">
                    {filter === "active" ? "Accept a job from the marketplace to get started." : "Complete a job to see it here."}
                </p>
                </div>
                <Link href="/jobs"
                className="mt-2 inline-flex items-center gap-2 px-5 py-2 rounded-full bg-[#85DABE] text-[#030712] text-sm font-bold hover:bg-[#A8E8D0] transition-colors"
                >
                Browse Jobs <ArrowRight className="h-4 w-4" />
                </Link>
            </div>
            ) : (
            <div className="space-y-3">
                {visible.map(({ publicKey, account }) => {
                    const sk = statusKey(account.status);
                    const config = STATUS_CONFIG[sk as keyof typeof STATUS_CONFIG];
                    const StatusIcon = config?.icon ?? Clock;
                    const needsDelivery = sk === "inProgress";
                    const awaitingApproval = sk === "delivered";
                    

                return (
                    <div key={publicKey.toBase58()}
                    className={`rounded-2xl border bg-white/[0.02] p-5 md:p-6 transition-colors ${
                        needsDelivery ? "border-[#174BD4]/25 bg-[#174BD4]/[0.03]"
                        : awaitingApproval ? "border-amber-500/25 bg-amber-500/[0.03]"
                        : "border-white/[0.06] hover:border-white/[0.10]"
                    }`}
                    >
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                        <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                            {config && (
                            <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${config.cls}`}>
                                <StatusIcon className="h-3 w-3" />
                                {config.label}
                            </span>
                            )}
                            {awaitingApproval && (
                            <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full animate-pulse">
                                Awaiting client approval
                            </span>
                            )}
                        </div>
                        <h3 className="text-base font-bold text-white truncate">{account.title}</h3>
                        <p className="mt-0.5 text-sm text-zinc-500 line-clamp-1">{account.description}</p>
                        <p className="mt-2 text-[11px] font-mono text-zinc-600 truncate">
                            Client: {(account.client as PublicKey).toBase58()}
                        </p>
                        </div>

                        <div className="flex md:flex-col items-center md:items-end gap-3 shrink-0">
                        <div className="text-base font-bold text-[#85DABE]">
                            {(account.amount.toNumber() / LAMPORTS_PER_SOL).toFixed(3)} SOL
                        </div>
                        <Link
                            href={`/jobs/${publicKey.toBase58()}`}
                            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold transition-colors whitespace-nowrap ${
                            needsDelivery
                                ? "bg-[#85DABE] text-[#030712] hover:bg-[#A8E8D0]"
                                : "border border-white/[0.10] text-white hover:bg-white/[0.06]"
                            }`}
                        >
                            {needsDelivery ? "Deliver Work" : awaitingApproval ? "View Job" : "View"}
                            <ArrowRight className="h-3 w-3" />
                        </Link>
                        </div>
                    </div>
                    </div>
                );
                })}
            </div>
            )}
        </div>
        </div>
    );
}