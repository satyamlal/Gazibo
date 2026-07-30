"use client";

import { useState, useEffect, useCallback } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import type { AnchorWallet } from "@solana/wallet-adapter-react";
import { PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";
import Link from "next/link";
import {
    buildProgram, clientProfilePda, lamportsToSol,
    type ClientProfileAccount, type JobOnChain,
} from "@/lib/program";
import {
    Briefcase, Plus, Loader2, Clock, CheckCircle2,
    DollarSign, X, ChevronRight, TrendingUp, RefreshCw,
} from "lucide-react";

interface JobItem { publicKey: PublicKey; account: JobOnChain }

function statusKey(s: Record<string, Record<string, never>>) {
    return Object.keys(s)[0] ?? "open";
}

const STATUS_LABEL: Record<string, string> = {
    open: "Open",
    inProgress: "In Progress",
    delivered: "Delivered — Review Needed",
    completed: "Completed",
    cancelled: "Cancelled",
};

const STATUS_CLS: Record<string, string> = {
    open: "text-[#85DABE] bg-[#85DABE]/10 border-[#85DABE]/20",
    inProgress: "text-[#174BD4] bg-[#174BD4]/10 border-[#174BD4]/20",
    delivered: "text-amber-400 bg-amber-500/10 border-amber-500/20",
    completed: "text-zinc-400 bg-zinc-500/10 border-zinc-500/20",
    cancelled: "text-red-400 bg-red-500/10 border-red-500/20",
};

function formatDate(timestamp: number): string {
  return new Date(timestamp * 1000).toLocaleDateString("en-US", {
        month: "short", day: "numeric", year: "numeric",
    });
}

export default function ClientDashboard() {
    const { connection } = useConnection();
    const wallet = useWallet();
    const [profile, setProfile] = useState<ClientProfileAccount | null>(null);
    const [jobs, setJobs] = useState<JobItem[] | null>(null);
    const [error, setError] = useState("");
    const [showHistory, setShowHistory] = useState(false);

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
            const pda = clientProfilePda(wallet.publicKey);
            const [prof, allJobs] = await Promise.all([
                program.account.clientProfile.fetch(pda).catch(() => null),
                program.account.jobAccount.all(),
            ]);
            setProfile(prof);
            setJobs(
                allJobs
                .filter((j) => j.account.client.equals(wallet.publicKey!))
                .sort((a, b) => b.account.createdAt.toNumber() - a.account.createdAt.toNumber())
            );
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
            <p className="text-zinc-400 mb-4">Connect your wallet to view your dashboard.</p>
            <Link href="/connect" className="px-6 py-3 rounded-full bg-[#174BD4] text-white text-sm font-semibold hover:bg-[#174BD4]/90 transition-colors">
                Connect Wallet
            </Link>
            </div>
        </div>
        );
    }

    const activeCount = jobs?.filter(j =>
        ["open", "inProgress", "delivered"].includes(statusKey(j.account.status))
    ).length ?? 0;

    const completedCount = jobs?.filter(j =>
        statusKey(j.account.status) === "completed"
    ).length ?? 0;

    // Real current escrow = sum of active (non-cancelled, non-completed) jobs
    const currentEscrow = jobs
        ?.filter(j => ["open", "inProgress", "delivered"].includes(statusKey(j.account.status)))
        .reduce((sum, j) => sum + j.account.amount.toNumber(), 0) ?? 0;

    // Historical totals for the spending history modal
    const totalPaid = jobs
        ?.filter(j => statusKey(j.account.status) === "completed")
        .reduce((sum, j) => sum + j.account.amount.toNumber(), 0) ?? 0;

    const totalRefunded = jobs
        ?.filter(j => statusKey(j.account.status) === "cancelled")
        .reduce((sum, j) => sum + j.account.amount.toNumber(), 0) ?? 0;

    const totalEverEscrowed = profile
        ? profile.totalSpent.toNumber()
        : 0;

    return (
    <div className="min-h-screen bg-[#030712]">
        <div className="pointer-events-none fixed inset-0 z-0">
            <div className="absolute top-0 right-[15%] w-[600px] h-[400px] bg-[radial-gradient(circle,rgba(23,75,212,0.08)_0%,transparent_70%)]" />
        </div>

        {/* Spending History Modal */}
        {showHistory && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#030712]/90 backdrop-blur-md px-4">
            <div className="w-full max-w-lg bg-[#0A0F1E] border border-white/[0.08] rounded-2xl overflow-hidden shadow-2xl">

                {/* Modal header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
                <h2 className="text-base font-bold text-white">Spending History</h2>
                <button
                    onClick={() => setShowHistory(false)}
                    className="h-7 w-7 flex items-center justify-center rounded-full hover:bg-white/[0.08] text-zinc-400 hover:text-white transition-colors"
                >
                    <X className="h-4 w-4" />
                </button>
                </div>

                {/* Summary row */}
                <div className="grid grid-cols-3 gap-px bg-white/[0.04] border-b border-white/[0.06]">
                {[
                    { label: "Currently Locked", value: `${(currentEscrow / LAMPORTS_PER_SOL).toFixed(3)} SOL`, color: "text-amber-400" },
                    { label: "Total Paid Out",   value: `${(totalPaid / LAMPORTS_PER_SOL).toFixed(3)} SOL`, color: "text-[#85DABE]" },
                    { label: "Total Refunded",   value: `${(totalRefunded / LAMPORTS_PER_SOL).toFixed(3)} SOL`, color: "text-zinc-300" },
                ].map((s) => (
                    <div key={s.label} className="bg-[#0A0F1E] px-4 py-3 text-center">
                    <p className={`text-sm font-bold ${s.color}`}>{s.value}</p>
                    <p className="text-[10px] text-zinc-600 mt-0.5">{s.label}</p>
                    </div>
                ))}
                </div>

                {/* Transaction list */}
                <div className="max-h-96 overflow-y-auto divide-y divide-white/[0.04]">
                {jobs && jobs.length > 0 ? (
                    jobs.map(({ publicKey, account }) => {
                    const sk = statusKey(account.status);
                    const isRefund = sk === "cancelled";
                    const isPaid = sk === "completed";
                    const isActive = ["open", "inProgress", "delivered"].includes(sk);

                    return (
                        <div key={publicKey.toBase58()} className="px-6 py-3.5 hover:bg-white/[0.02] transition-colors">
                        <div className="flex items-center justify-between gap-4">
                            <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                                <span className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full border ${STATUS_CLS[sk] ?? STATUS_CLS.open}`}>
                                {STATUS_LABEL[sk] ?? sk}
                                </span>
                            </div>
                            <p className="text-sm font-medium text-white truncate">{account.title}</p>
                            <p className="text-[11px] text-zinc-600 mt-0.5">
                                {formatDate(account.createdAt.toNumber())}
                                {" · "}
                                {isRefund ? "Refunded" : isPaid ? "Payment released" : isActive ? "In escrow" : ""}
                            </p>
                            </div>
                            <div className="text-right shrink-0">
                            <p className={`text-sm font-bold ${
                                isRefund ? "text-zinc-400 line-through" :
                                isPaid  ? "text-[#85DABE]" :
                                "text-amber-400"
                            }`}>
                                {isRefund ? "-" : isActive ? "🔒 " : "✓ "}
                                {(account.amount.toNumber() / LAMPORTS_PER_SOL).toFixed(3)} SOL
                            </p>
                            </div>
                        </div>
                        </div>
                    );
                    })
                ) : (
                    <div className="px-6 py-8 text-center text-zinc-600 text-sm">
                    No transactions yet.
                    </div>
                )}
                </div>

                {/* Footer note */}
                <div className="px-6 py-3 border-t border-white/[0.06]">
                <p className="text-[10px] text-zinc-700">
                    Gas fees ≈ 0.000005 SOL per transaction · not shown above
                </p>
                </div>
            </div>
            </div>
        )}

        <div className="relative z-10 max-w-5xl mx-auto px-5 md:px-8 py-16 md:py-20">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-10">
                <div>
                    <p className="text-xs font-bold tracking-[0.2em] text-[#174BD4] uppercase mb-2">
                    Client Dashboard
                    </p>
                    <h1 className="text-3xl font-extrabold text-white tracking-tight"
                    style={{ fontFamily: "var(--font-heading, var(--font-sans))" }}>
                    My Jobs
                    </h1>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={() => void load()}
                    className="h-9 w-9 flex items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.02] text-zinc-400 hover:text-white hover:bg-white/[0.06] transition-colors"
                    aria-label="Refresh"
                    >
                    <RefreshCw className="h-3.5 w-3.5" />
                    </button>
                    <Link href="/account/client/jobs/new"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#85DABE] text-[#030712] text-sm font-bold hover:bg-[#A8E8D0] transition-colors"
                    >
                    <Plus className="h-4 w-4" /> Post a Job
                    </Link>
                </div>
            </div>

        {error && (
            <div className="mb-6 rounded-xl border border-red-500/20 bg-red-500/[0.06] px-4 py-3 text-sm text-red-300">
                {error}
            </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-10">
            <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
                <div className="flex items-center gap-2 mb-3 text-[#174BD4]">
                <Clock className="h-4 w-4" />
                <span className="text-xs font-semibold uppercase tracking-wider">Active</span>
                </div>
                <div className="text-2xl font-bold text-white">{activeCount}</div>
            </div>

            <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
                <div className="flex items-center gap-2 mb-3 text-[#85DABE]">
                    <CheckCircle2 className="h-4 w-4" />
                    <span className="text-xs font-semibold uppercase tracking-wider">Completed</span>
                </div>
                <div className="text-2xl font-bold text-white">{completedCount}</div>
            </div>

            {/* Total Escrowed card with View History */}
            <div className="col-span-2 md:col-span-1 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2 text-amber-400">
                        <DollarSign className="h-4 w-4" />
                        <span className="text-xs font-semibold uppercase tracking-wider">In Escrow</span>
                    </div>
                <button
                    onClick={() => setShowHistory(true)}
                    className="flex items-center gap-1 text-[10px] text-zinc-500 hover:text-[#85DABE] transition-colors font-medium"
                >
                    <TrendingUp className="h-3 w-3" />
                    View history
                </button>
                </div>
                <div className="text-2xl font-bold text-white">
                    {(currentEscrow / LAMPORTS_PER_SOL).toFixed(3)} SOL
                </div>
                <p className="text-[10px] text-zinc-600 mt-1">
                    Currently locked · refunds go back to wallet
                </p>
            </div>
        </div>

        {/* Jobs list */}
            {jobs === null ? (
            <div className="flex items-center justify-center gap-2 py-16 text-zinc-500">
                <Loader2 className="h-4 w-4 animate-spin" /> Loading jobs…
            </div>
            ) : jobs.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-4 py-20 text-center rounded-2xl border border-white/[0.05] bg-white/[0.01]">
                <div className="h-12 w-12 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center text-zinc-600">
                <Briefcase className="h-5 w-5" />
                </div>
                <div>
                <p className="text-zinc-300 font-medium mb-1">No jobs posted yet</p>
                <p className="text-zinc-600 text-sm">Post a job and freelancers will apply.</p>
                </div>
                <Link href="/account/client/jobs/new"
                className="mt-2 px-6 py-2.5 rounded-full bg-[#85DABE] text-[#030712] text-sm font-bold hover:bg-[#A8E8D0] transition-colors"
                >
                Post your first job
                </Link>
            </div>
            ) : (
            <div className="space-y-3">
                {jobs.map(({ publicKey, account }) => {
                    const key = statusKey(account.status);
                    const needsAction = key === "delivered";
                return (
                    <div key={publicKey.toBase58()}
                    className={`rounded-2xl border bg-white/[0.02] p-5 md:p-6 transition-colors ${
                        needsAction ? "border-amber-500/30 bg-amber-500/[0.03]" : "border-white/[0.06] hover:border-white/[0.10]"
                    }`}
                    >
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2 flex-wrap">
                                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${STATUS_CLS[key] ?? STATUS_CLS.open}`}>
                                {STATUS_LABEL[key] ?? key}
                                </span>
                                {needsAction && (
                                <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full animate-pulse">
                                    Action needed
                                </span>
                                )}
                                <span className="text-[10px] text-zinc-700">
                                {formatDate(account.createdAt.toNumber())}
                                </span>
                            </div>
                            <h3 className="text-base font-bold text-white truncate mb-1">{account.title}</h3>
                            <p className="text-sm text-zinc-500 line-clamp-1">{account.description}</p>
                        </div>
                        <div className="flex md:flex-col items-center md:items-end gap-3 shrink-0">
                            <div className="text-base font-bold text-[#85DABE]">
                                {(account.amount.toNumber() / LAMPORTS_PER_SOL).toFixed(3)} SOL
                            </div>
                            <Link
                                href={`/account/client/jobs/${publicKey.toBase58()}`}
                                className="flex items-center gap-1 px-4 py-1.5 rounded-full border border-white/[0.10] text-white text-xs font-semibold hover:bg-white/[0.06] transition-colors whitespace-nowrap"
                            >
                                {needsAction ? "Review & Pay" : "Manage"}
                                <ChevronRight className="h-3 w-3" />
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