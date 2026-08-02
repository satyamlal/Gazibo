"use client";

import Link from "next/link";
import {
    ArrowRight,
} from "lucide-react";

export function HeroSection() {
    return (
        <>
            <section className="max-w-7xl mx-auto px-5 md:px-8 pt-20 pb-16 md:pt-28 md:pb-24 text-center">
                <div
                    className="
                    inline-flex items-center gap-2 px-4 py-1.5 rounded-full
                    border border-white/8 bg-white/3 backdrop-blur-sm
                    text-xs font-medium tracking-wide text-zinc-300
                    mb-8 animate-fade-in-up
                    "
                >
                    <span className="flex h-2 w-2 rounded-full bg-[#85DABE] animate-glow-pulse" />
                    <span className="text-[#85DABE] font-semibold">Built on Solana</span>
                    <span className="text-zinc-600">•</span>
                    <span>400ms Finality · Zero Custody</span>
                </div>

                <h1
                    className="
                    text-4xl sm:text-5xl md:text-6xl lg:text-7xl
                    font-extrabold tracking-tight
                    max-w-5xl mx-auto leading-[1.08] mb-7
                    animate-fade-in-up
                    "
                    style={{ fontFamily: "var(--font-heading, var(--font-sans))" }}
                >
                The Trustless Workspace
                    <br className="hidden sm:block" />{" "}
                    For{" "}
                    <span
                    className="
                        bg-gradient-to-r from-white via-[#85DABE] to-[#174BD4]
                        bg-clip-text text-transparent
                    "
                    >
                    Elite dApp Builders
                    </span>
                </h1>
                <p
                    className="
                    text-zinc-400 text-base sm:text-lg md:text-xl
                    max-w-2xl mx-auto mb-10 leading-relaxed
                    animate-fade-in-up animation-delay-200
                    "
                >
                Eliminate 20% platform fees forever. Secure instant smart-contract
                    escrow payments, gas-free milestones, and immutable on-chain
                    reputation — all on Solana.
                </p>
                <div
                    className="
                    flex flex-col sm:flex-row items-center justify-center gap-4
                    animate-fade-in-up animation-delay-400
                    "
                >
                    <Link
                    href="/connect"
                    className="
                        group w-full sm:w-auto px-8 py-3.5 rounded-full
                        bg-[#85DABE] text-[#030712] font-semibold text-[15px]
                        flex items-center justify-center gap-2
                        hover:bg-[#A8E8D0] hover:shadow-[0_0_24px_rgba(133,218,190,0.35)]
                        active:scale-[0.97]
                        transition-all duration-300
                    "
                    >
                    Get Started Free
                    <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                    </Link>
                    <Link
                    href="/jobs"
                    className="
                        w-full sm:w-auto px-8 py-3.5 rounded-full
                        border border-white/[0.1] bg-white/3 text-white font-semibold text-[15px]
                        flex items-center justify-center gap-2
                        hover:bg-white/[0.07] hover:border-white/[0.18]
                        transition-all duration-300
                    "
                    >
                    Browse Active Jobs
                    </Link>
                </div>
        </section>
        </>
    );
}