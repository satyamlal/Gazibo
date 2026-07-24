import Link from "next/link";
import { Star, Clock } from "lucide-react";
import { LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import type { BN } from "@coral-xyz/anchor";

export interface GigCardData {
    publicKey: PublicKey;
    freelancer: PublicKey;
    gigId: BN;
    title: string;
    basicPrice: BN;
    standardPrice: BN;
    premiumPrice: BN;
    isActive: boolean;
    createdAt: BN;
}

export interface FreelancerDisplay {
    name: string;
    ratingAvg: number;
    ratingCount: number;
    jobsCompleted: number;
    avatarInitial?: string;
}

interface GigCardProps {
    gig: GigCardData;
    freelancer: FreelancerDisplay;
}

function formatSol(lamports: BN): string {
    return (lamports.toNumber() / LAMPORTS_PER_SOL).toFixed(3);
}

function short(pubkey: PublicKey): string {
    const s = pubkey.toBase58();
    return `${s.slice(0, 4)}…${s.slice(-4)}`;
}

export function GigCard({ gig, freelancer }: GigCardProps) {
    const initial = freelancer.avatarInitial ?? freelancer.name[0]?.toUpperCase() ?? "?";

    return (
        <Link
            href={`/gigs/${gig.publicKey.toBase58()}`}
            className="group block rounded-2xl border border-white/[0.06] bg-white/[0.02] hover:border-white/[0.12] hover:bg-white/[0.04] transition-all duration-200 overflow-hidden"
        >
            {/* Thumbnail placeholder */}
            <div className="h-40 bg-gradient-to-br from-[#174BD4]/20 to-[#85DABE]/10 flex items-center justify-center">
                <div className="h-12 w-12 rounded-xl bg-white/[0.06] border border-white/[0.08] flex items-center justify-center text-white font-bold text-xl">
                    {initial}
                </div>
            </div>
            <div className="p-4 space-y-3">

            {/* Freelancer row */}
            <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-full bg-[#174BD4]/20 border border-[#174BD4]/30 flex items-center justify-center text-[#174BD4] text-[11px] font-bold shrink-0">
                    {initial}
                </div>
                <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-white truncate">
                        {freelancer.name}
                    </div>
                    <div className="text-[10px] font-mono text-zinc-600">
                        {short(gig.freelancer)}
                    </div>
                </div>
            </div>

            {/* Gig title */}
            <h3 className="text-sm font-medium text-zinc-200 line-clamp-2 leading-snug group-hover:text-white transition-colors">
                {gig.title}
            </h3>

            {/* Rating */}
            {freelancer.ratingCount > 0 && (
                <div className="flex items-center gap-1.5">
                    <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
                        <span className="text-sm font-bold text-white">
                            {freelancer.ratingAvg.toFixed(1)}
                        </span>
                        
                        <span className="text-xs text-zinc-500">
                            ({freelancer.ratingCount})
                        </span>
                        
                        {freelancer.jobsCompleted > 0 && (
                        <>
                            <span className="text-zinc-700">·</span>
                            <span className="text-xs text-zinc-500">
                                {freelancer.jobsCompleted} orders
                            </span>
                        </>
                )}
            </div>
        )}

            {/* Price row */}
            <div className="pt-2 border-t border-white/[0.05] flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-zinc-500">
                    <Clock className="h-3.5 w-3.5" />
                <span>From</span>
                </div>
                <div className="text-sm font-bold text-[#85DABE]">
                    {formatSol(gig.basicPrice)} SOL
                </div>
            </div>
        </div>
    </Link>
);
}