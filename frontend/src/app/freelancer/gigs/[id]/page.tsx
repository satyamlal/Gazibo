"use client";

import { useState, useEffect, useCallback } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { useParams } from "next/navigation";
import Link from "next/link";
import { buildProgram, type GigOnChain } from "@/lib/program";
import {
    ArrowLeft, Loader2, ExternalLink, Copy, CheckCircle2,
    Clock, RefreshCw,
} from "lucide-react";

export default function GigManagePage() {
    const params = useParams();
    const { connection } = useConnection();
    const { publicKey } = useWallet();

    const gigAddress = params.id as string;

    const [gig, setGig] = useState<GigOnChain | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [copied, setCopied] = useState(false);

    const load = useCallback(async () => {
        setError("");
        try {
        const program = buildProgram(connection);
        const gigPubkey = new PublicKey(gigAddress);
        const data = await program.account.gigAccount.fetch(gigPubkey);
        setGig(data);
        } catch {
        setError("Gig not found on this validator.");
        } finally {
        setLoading(false);
        }
    }, [connection, gigAddress]);

    useEffect(() => { void load(); }, [load]);

    const copyLink = async () => {
        await navigator.clipboard.writeText(
        `${window.location.origin}/gigs/${gigAddress}`
        );
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const isOwner = gig && publicKey ? gig.freelancer.equals(publicKey) : false;

    if (loading) {
        return (
        <div className="min-h-[70vh] bg-[#030712] flex items-center justify-center">
            <Loader2 className="h-5 w-5 animate-spin text-zinc-500" />
        </div>
        );
    }

    if (!gig || error) {
        return (
        <div className="min-h-[70vh] bg-[#030712] flex items-center justify-center px-6">
            <div className="text-center">
                <p className="text-red-400 text-sm mb-4">{error || "Gig not found."}</p>
                <Link href="/account/freelancer/gigs" className="text-[#85DABE] text-sm hover:underline">
                    ← My Gigs
                </Link>
            </div>
        </div>
        );
    }

    const plans = [
        { name: "Basic",    price: gig.basicPrice.toNumber(),    color: "text-zinc-300" },
        { name: "Standard", price: gig.standardPrice.toNumber(), color: "text-[#174BD4]" },
        { name: "Premium",  price: gig.premiumPrice.toNumber(),  color: "text-[#85DABE]" },
    ];

    return (
        <div className="min-h-screen bg-[#030712]">
            <div className="max-w-2xl mx-auto px-5 md:px-8 py-16">

                {/* Header */}
                <div className="flex items-center gap-3 mb-8">
                    <Link href="/account/freelancer/gigs" className="text-zinc-500 hover:text-white transition-colors">
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                    <div>
                        <h1 className="text-xl font-extrabold text-white tracking-tight">Manage Gig</h1>
                        <p className="text-zinc-600 text-xs font-mono truncate mt-0.5">{gigAddress}</p>
                    </div>
                </div>

                {!isOwner && (
                <div className="mb-6 rounded-xl border border-amber-500/20 bg-amber-500/[0.06] px-4 py-3 text-sm text-amber-300">
                    You are not the owner of this gig.
                </div>
                )}

                {/* Gig card */}
                <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6 mb-4">
                    <div className="flex items-center gap-2 mb-4">
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                        gig.isActive
                            ? "text-[#85DABE] bg-[#85DABE]/10 border-[#85DABE]/20"
                            : "text-zinc-500 bg-zinc-500/10 border-zinc-500/20"
                        }`}>
                        {gig.isActive ? "Active" : "Paused"}
                        </span>
                        <span className="text-[11px] font-mono text-zinc-600">
                            Gig #{gig.gigId.toString()}
                        </span>
                    </div>

                    <h2 className="text-xl font-bold text-white mb-6">{gig.title}</h2>

                    {/* Plans */}
                    <div className="grid grid-cols-3 gap-3 mb-6">
                        {plans.map((plan) => (
                        <div key={plan.name}
                            className="rounded-xl border border-white/[0.06] bg-black/20 p-3 text-center"
                        >
                            <p className="text-[11px] text-zinc-500 font-semibold uppercase tracking-wider mb-2">
                            {plan.name}
                            </p>
                            <p className={`text-base font-bold ${plan.color}`}>
                            {(plan.price / LAMPORTS_PER_SOL).toFixed(3)}
                            </p>
                            <p className="text-[10px] text-zinc-600 mt-0.5">SOL</p>
                        </div>
                        ))}
                    </div>

                    {/* IPFS URI */}
                    {gig.metadataUri && (
                        <div>
                            <p className="text-[11px] text-zinc-600 uppercase tracking-wider mb-1">
                                Metadata URI
                            </p>
                            <p className="text-xs font-mono text-zinc-400 break-all">
                                {gig.metadataUri || "No IPFS metadata set"}
                            </p>
                        </div>
                    )}
                </div>

                {/* Share gig */}
                <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 mb-4">
                    <h3 className="text-sm font-bold text-white mb-3">Share your gig</h3>
                    <div className="flex items-center gap-2">
                        <div className="flex-1 rounded-xl bg-black/20 border border-white/[0.06] px-3 py-2 text-xs font-mono text-zinc-400 truncate">
                            {typeof window !== "undefined"
                                ? `${window.location.origin}/gigs/${gigAddress}`
                                : `/gigs/${gigAddress}`}
                        </div>
                        <button
                        onClick={() => void copyLink()}
                        className="shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl border border-white/[0.08] text-zinc-400 text-xs font-medium hover:text-white hover:bg-white/[0.06] transition-colors"
                        >
                            {copied ? (
                                <><CheckCircle2 className="h-3.5 w-3.5 text-[#85DABE]" /> Copied</>
                            ) : (
                                <><Copy className="h-3.5 w-3.5" /> Copy</>
                            )}
                        </button>
                        <Link
                        href={`/gigs/${gigAddress}`}
                        target="_blank"
                        className="shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl border border-white/[0.08] text-zinc-400 text-xs font-medium hover:text-white hover:bg-white/[0.06] transition-colors"
                        >
                            <ExternalLink className="h-3.5 w-3.5" /> View
                        </Link>
                    </div>
                </div>

                {/* Edit notice */}
                <div className="rounded-xl border border-[#174BD4]/15 bg-[#174BD4]/[0.04] p-4 text-xs text-zinc-400 leading-relaxed">
                    <p className="font-semibold text-white mb-1 flex items-center gap-2">
                        <Clock className="h-3.5 w-3.5 text-[#85DABE]" />
                        Price editing coming soon
                    </p>
                    <p>
                        Updating gig prices requires a new <code className="text-zinc-300 bg-white/[0.06] px-1 rounded">update_gig</code> on-chain
                        instruction. For now, create a new gig with updated pricing and pause
                        the old one (when pause instruction is live).
                    </p>
                    <Link href="/account/freelancer/gigs/new" className="mt-2 inline-flex items-center gap-1.5 text-[#85DABE] hover:underline">
                        <RefreshCw className="h-3 w-3" /> Create updated gig
                    </Link>
                </div>
            </div>
        </div>
    );
}