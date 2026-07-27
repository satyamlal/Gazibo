"use client";

import { useState, useEffect, useCallback } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import type { AnchorWallet } from "@solana/wallet-adapter-react";
import { PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";
import Link from "next/link";
import { buildProgram, clientProfilePda, lamportsToSol, type ClientProfileAccount, type JobOnChain, } from "@/lib/program";
import { Briefcase, Plus, Loader2, Clock, CheckCircle2, DollarSign } from "lucide-react";

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

export default function ClientDashboard() {
    const { connection } = useConnection();
    const wallet = useWallet();
    const [profile, setProfile] = useState<ClientProfileAccount | null>(null);
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

    const activeCount = jobs?.filter(j => ["open","inProgress","delivered"].includes(statusKey(j.account.status))).length ?? 0;
    const completedCount = jobs?.filter(j => statusKey(j.account.status) === "completed").length ?? 0;
    const totalSpent = profile ? lamportsToSol(profile.totalSpent) : "0.000";

    return (
        <div className="min-h-screen bg-[#030712]">
        <div className="pointer-events-none fixed inset-0 z-0">
            <div className="absolute top-0 right-[15%] w-[600px] h-[400px] bg-[radial-gradient(circle,rgba(23,75,212,0.08)_0%,transparent_70%)]" />
        </div>
        
        <div className="relative z-10 max-w-5xl mx-auto px-5 md:px-8 py-16 md:py-20">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-10">
            <div>
                <p className="text-xs font-bold tracking-[0.2em] text-[#174BD4] uppercase mb-2">
                Client Dashboard
                </p>
                <h1
                className="text-3xl font-extrabold text-white tracking-tight"
                style={{ fontFamily: "var(--font-heading, var(--font-sans))" }}
                >
                My Jobs
                </h1>
            </div>
            <Link
                href="/account/client/jobs/new"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#85DABE] text-[#030712] text-sm font-bold hover:bg-[#A8E8D0] transition-colors"
            >
                <Plus className="h-4 w-4" /> Post a Job
            </Link>
            </div>

            {error && (
            <div className="mb-6 rounded-xl border border-red-500/20 bg-red-500/[0.06] px-4 py-3 text-sm text-red-300">
                {error}
            </div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-10">
            {[
                { icon: Clock, label: "Active", value: String(activeCount), color: "text-[#174BD4]" },
                { icon: CheckCircle2, label: "Completed", value: String(completedCount), color: "text-[#85DABE]" },
                { icon: DollarSign, label: "Total Escrowed", value: `${totalSpent} SOL`, color: "text-amber-400", note: "Refunds go back to wallet." },
            ].map((stat) => (
                <div key={stat.label} className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
                    <div className={`flex items-center gap-2 mb-3 ${stat.color}`}>
                        <stat.icon className="h-4 w-4" />
                        <span className="text-xs font-semibold uppercase tracking-wider">{stat.label}</span>
                    </div>
                    <div className="text-2xl font-bold text-white">{stat.value}</div>
                    {"note" in stat && stat.note && (
                        <p className="text-[10px] text-zinc-600 mt-1">{stat.note as string}</p>
                    )}
                </div>
            ))}
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
                <p className="text-zinc-600 text-sm">Post a job and freelancers can apply.</p>
                </div>
                <Link href="/account/client/jobs/new" className="mt-2 px-6 py-2.5 rounded-full bg-[#85DABE] text-[#030712] text-sm font-bold hover:bg-[#A8E8D0] transition-colors">
                Post your first job
                </Link>
            </div>
            ) : (
            <div className="space-y-3">
                {jobs.map(({ publicKey, account }) => {
                const key = statusKey(account.status);
                const needsAction = key === "delivered";
                return (
                    <div
                    key={publicKey.toBase58()}
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
                            className="px-4 py-1.5 rounded-full border border-white/[0.10] text-white text-xs font-semibold hover:bg-white/[0.06] transition-colors whitespace-nowrap"
                        >
                            {needsAction ? "Review & Pay" : "Manage"}
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