"use client";

import { ShieldCheck } from "lucide-react";

const FEATURES = [
    "Instant Smart Contract Escrow Release",
    "0% Platform Commission — Ever",
    "Decentralized Dispute Resolution",
    "Immutable Professional Reputation",
] as const;

const ROWS = [
    { rank: "01", name: "Gazibo (Solana)",               speed: "Instant",  fees: "≈ 0.00005 SOL", active: true  },
    { rank: "02", name: "Other Blockchain dApps",         speed: "~15 Min",  fees: "$15–$40 Gas",   active: false },
    { rank: "03", name: "Traditional Freelance Platforms",speed: "3–5 Days", fees: "Up to 20%",      active: false },
    { rank: "04", name: "Bank Wire Transfer",             speed: "3–7 Days", fees: "$25–$50 Fee",    active: false },
] as const;

export function CompetitiveComparision() {
    return (
        <section className="max-w-7xl mx-auto px-5 md:px-8 py-20 md:py-28">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">

                {/* ── Left: Text ───────────────────────────────────────────── */}
                <div>
                    <div className="text-xs font-bold tracking-[0.2em] text-[#85DABE] uppercase mb-4">
                        Why Gazibo
                    </div>
                    <h2
                        className="text-3xl md:text-4xl lg:text-[2.75rem] font-extrabold tracking-tight g-text mb-6 leading-tight"
                        style={{ fontFamily: "var(--font-heading, var(--font-sans))" }}
                    >
                        Finally, a Work Protocol
                        <br />
                        That Works{" "}
                        <span className="text-[#85DABE]">For You</span>
                    </h2>
                    <p className="g-text-4 text-base md:text-lg mb-8 leading-relaxed max-w-lg">
                        Traditional platforms take up to 20% of your earnings and hold
                        your money hostage for days. Gazibo uses Solana smart contracts
                        to deliver instant, zero-fee settlements with full transparency.
                    </p>
                    <div className="space-y-3.5">
                        {FEATURES.map((item) => (
                        <div key={item} className="flex items-center gap-3">
                            <div className="h-5 w-5 rounded-full shrink-0 bg-[#85DABE]/10 border border-[#85DABE]/20 flex items-center justify-center">
                            <ShieldCheck className="h-3 w-3 text-[#85DABE]" />
                            </div>
                            <span className="text-sm font-medium g-text-2">{item}</span>
                        </div>
                        ))}
                    </div>
                </div>

                {/* ── Right: Comparison Table ──────────────────────────────── */}
                <div className="rounded-2xl border g-border g-card p-5 md:p-7 space-y-3">
                {/* Header */}
                <div className="flex justify-between items-center pb-4 border-b g-border">
                    <span className="text-[11px] font-mono font-bold g-text-4 uppercase tracking-wider">
                    Platform Comparison
                    </span>
                    <span className="text-[11px] font-mono font-semibold text-[#85DABE] tracking-wide">
                    Solana L1
                    </span>
                </div>

                {ROWS.map((row) => (
                    <div
                        key={row.rank}
                        className={`flex items-center justify-between p-4 rounded-xl border transition-all duration-250 ${
                            row.active
                            ? "bg-[#174BD4]/[0.06] border-[#174BD4]/25 animate-border-glow"
                            : "g-bg-surface g-border hover:g-border-mid"
                        }`}>
                        <div className="flex items-center gap-3.5">
                            <span className={`text-[11px] font-mono font-bold ${row.active ? "text-[#85DABE]" : "g-text-5"}`}>
                                {row.rank}
                            </span>
                            <span className={`text-sm font-semibold ${row.active ? "text-[#174BD4]" : "g-text-2"}`}>
                                {row.name}
                            </span>
                            {row.active && (
                                <span className="hidden sm:inline-flex text-[9px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full bg-[#85DABE]/10 text-[#85DABE] border border-[#85DABE]/20">
                                    Best
                                </span>
                            )}
                        </div>
                        <div className="text-right shrink-0 ml-4">
                            <div className={`text-xs font-bold ${row.active ? "text-[#174BD4]" : "g-text"}`}>
                                {row.speed}
                            </div>
                            <div className="text-[10px] font-mono g-text-5">{row.fees}</div>
                        </div>
                    </div>
                    ))}
                </div>
            </div>
        </section>
    );
}