"use client";

import { useState, useEffect, useCallback } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import type { AnchorWallet } from "@solana/wallet-adapter-react";
import { PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";
import Link from "next/link";
import { buildProgram, type GigOnChain } from "@/lib/program";
import { Plus, Loader2, Zap, ExternalLink } from "lucide-react";

interface GigItem { publicKey: PublicKey; account: GigOnChain }

export default function MyGigsPage() {
    const { connection } = useConnection();
    const wallet = useWallet();
    const [gigs, setGigs] = useState<GigItem[] | null>(null);
    const [filter, setFilter] = useState<"all" | "active">("active");
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
        const all = await program.account.gigAccount.all();
        setGigs(
            all
            .filter((g) => g.account.freelancer.equals(wallet.publicKey!))
            .sort((a, b) => b.account.createdAt.toNumber() - a.account.createdAt.toNumber())
        );
        } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load.");
        setGigs([]);
        }
    }, [connection, wallet.publicKey, wallet.signTransaction, wallet.signAllTransactions]);

    useEffect(() => { void load(); }, [load]);

    if (!wallet.connected) {
        return (
        <div className="min-h-[70vh] bg-[#030712] flex items-center justify-center px-6">
            <div className="text-center">
            <p className="text-zinc-400 mb-4">Connect your wallet to manage your gigs.</p>
            <Link href="/connect" className="px-6 py-3 rounded-full bg-[#85DABE] text-[#030712] text-sm font-bold hover:bg-[#A8E8D0] transition-colors">
                Connect Wallet
            </Link>
            </div>
        </div>
    );
    }

    const visible = gigs
        ? filter === "active"
        ? gigs.filter((g) => g.account.isActive)
        : gigs
        : [];

    return (
        <div className="min-h-screen bg-[#030712]">
            <div className="pointer-events-none fixed inset-0 z-0">
                <div className="absolute top-0 left-[10%] w-[600px] h-[400px] bg-[radial-gradient(circle,rgba(133,218,190,0.05)_0%,transparent_70%)]" />
            </div>

            <div className="relative z-10 max-w-4xl mx-auto px-5 md:px-8 py-16 md:py-20">

                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-10">
                    <div>
                        <p className="text-xs font-bold tracking-[0.2em] text-[#85DABE] uppercase mb-2">
                        Freelancer
                        </p>
                        <h1 className="text-3xl font-extrabold text-white tracking-tight"
                            style={{ fontFamily: "var(--font-heading, var(--font-sans))" }}>
                            My Gigs
                        </h1>
                        <p className="mt-1 text-zinc-500 text-sm">
                            {gigs?.length ?? 0} total · {gigs?.filter(g => g.account.isActive).length ?? 0} active
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Filter */}
                        <div className="flex rounded-full border border-white/[0.08] bg-white/[0.02] p-1">
                            {(["active", "all"] as const).map((f) => (
                                <button key={f} onClick={() => setFilter(f)}
                                    className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                                        filter === f ? "bg-[#174BD4] text-white" : "text-zinc-400 hover:text-white"
                                    }`}
                                    >
                                    {f === "active" ? "Active" : "All"}
                                </button>
                            ))}
                        </div>
                        <Link href="/account/freelancer/gigs/new"
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#85DABE] text-[#030712] text-sm font-bold hover:bg-[#A8E8D0] transition-colors"
                            >
                            <Plus className="h-4 w-4" /> New Gig
                        </Link>
                    </div>
                </div>

                {error && (
                <div className="mb-6 rounded-xl border border-red-500/20 bg-red-500/[0.06] px-4 py-3 text-sm text-red-300">
                    {error}
                </div>
                )}

                {gigs === null ? (
                    <div className="flex items-center justify-center gap-2 py-24 text-zinc-500">
                        <Loader2 className="h-4 w-4 animate-spin" /> Loading gigs…
                    </div>
                ) : visible.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-4 py-24 text-center rounded-2xl border border-white/[0.05] bg-white/[0.01]">
                    <div className="h-12 w-12 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center text-zinc-600">
                        <Zap className="h-5 w-5" />
                    </div>
                    <div>
                        <p className="text-zinc-300 font-medium mb-1">No gigs yet</p>
                        <p className="text-zinc-600 text-sm">Create a gig so clients can hire you.</p>
                    </div>
                    <Link href="/account/freelancer/gigs/new" className="mt-2 px-6 py-2.5 rounded-full bg-[#85DABE] text-[#030712] text-sm font-bold hover:bg-[#A8E8D0] transition-colors">
                        Create your first gig
                    </Link>
                </div>
                ) : (
                <div className="space-y-3">
                    {visible.map(({ publicKey, account }) => (
                        <div key={publicKey.toBase58()}
                            className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 md:p-6 hover:border-white/[0.10] transition-colors"
                        >
                            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                                            account.isActive
                                            ? "text-[#85DABE] bg-[#85DABE]/10 border-[#85DABE]/20"
                                            : "text-zinc-500 bg-zinc-500/10 border-zinc-500/20"
                                        }`}>
                                            {account.isActive ? "Active" : "Paused"}
                                        </span>
                                        <span className="text-[11px] font-mono text-zinc-600">
                                            Gig #{account.gigId.toString()}
                                        </span>
                                    </div>
                                    <h3 className="text-base font-bold text-white truncate">
                                        {account.title}
                                    </h3>
                                    <div className="mt-2 flex items-center gap-4 text-xs text-zinc-500">
                                        <span>Basic: {(account.basicPrice.toNumber() / LAMPORTS_PER_SOL).toFixed(3)} SOL</span>
                                        <span>Standard: {(account.standardPrice.toNumber() / LAMPORTS_PER_SOL).toFixed(3)} SOL</span>
                                        <span>Premium: {(account.premiumPrice.toNumber() / LAMPORTS_PER_SOL).toFixed(3)} SOL</span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 shrink-0">
                                    {/* Public gig page */}
                                    <Link
                                    href={`/gigs/${publicKey.toBase58()}`}
                                    target="_blank"
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/[0.10] text-zinc-400 text-xs font-medium hover:text-white hover:bg-white/[0.06] transition-colors"
                                    >
                                    <ExternalLink className="h-3 w-3" />
                                        Preview
                                    </Link>
                                    {/* Edit gig */}
                                    <Link
                                    href={`/account/freelancer/gigs/${publicKey.toBase58()}`}
                                    className="px-4 py-1.5 rounded-full border border-white/[0.10] text-white text-xs font-semibold hover:bg-white/[0.06] transition-colors"
                                    >
                                    Manage →
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                )}
                <p className="mt-8 text-center text-xs text-zinc-700">
                    Pause/edit prices requires a new on-chain instruction — coming soon.
                    For now, create a new gig with updated pricing.
                </p>
            </div>
        </div>
    );
}