"use client";

import Link from "next/link";
import { ArrowRight, Zap } from "lucide-react";

export function HeroSection() {
    return (
        <section className="max-w-7xl mx-auto px-5 md:px-8 pt-20 pb-16 md:pt-28 md:pb-24 text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border g-border g-bg-card g-shadow backdrop-blur-sm text-xs font-medium tracking-wide g-text-3 mb-8 animate-fade-in-up">
                <span className="flex h-2 w-2 rounded-full bg-[#85DABE] animate-glow-pulse" />
                <span className="text-[#174BD4] font-semibold">Built on Solana</span>
                <span className="g-text-6">•</span>
                <span>400ms Finality · Zero Custody</span>
            </div>

            {/* Headline */}
            <h1
                className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight max-w-5xl mx-auto leading-[1.08] mb-7 animate-fade-in-up g-text"
                style={{ fontFamily: "var(--font-heading, var(--font-sans))" }}
            >
                The Trustless Workspace
                <br className="hidden sm:block" />{" "}For{" "}
                <span className="bg-gradient-to-r from-[#174BD4] via-[#2E6AE6] to-[#85DABE] bg-clip-text text-transparent">
                Elite dApp Builders
                </span>
            </h1>

            {/* Subtext */}
            <p className="g-text-4 text-base sm:text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed animate-fade-in-up animation-delay-200">
                Eliminate 20% platform fees forever. Secure instant smart-contract
                escrow payments, gas-free milestones, and immutable on-chain
                reputation — all on Solana.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up animation-delay-400">
                <Link
                href="/connect"
                className="group w-full sm:w-auto px-8 py-3.5 rounded-full bg-[#85DABE] text-[#030712] font-semibold text-[15px] flex items-center justify-center gap-2 hover:bg-[#A8E8D0] hover:shadow-[0_0_24px_rgba(133,218,190,0.4)] active:scale-[0.97] transition-all duration-300"
                >
                Get Started Free
                <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                </Link>
                <Link
                href="/jobs"
                className="w-full sm:w-auto px-8 py-3.5 rounded-full border g-border-mid g-bg-card g-shadow g-text font-semibold text-[15px] flex items-center justify-center gap-2 hover:border-[#174BD4]/30 hover:text-[#174BD4] transition-all duration-300"
                >
                Browse Active Jobs
                </Link>
            </div>

            {/* Trust indicators */}
            <div className="mt-14 flex flex-wrap items-center justify-center gap-6 animate-fade-in-up animation-delay-600">
                {[
                { icon: "⚡", label: "Instant Settlement" },
                { icon: "🔒", label: "Non-Custodial Escrow" },
                { icon: "🏆", label: "On-Chain Reputation" },
                { icon: "0%", label: "Platform Fees", mono: true },
                ].map((item) => (
                <div key={item.label} className="flex items-center gap-2">
                    <span className={`text-sm ${item.mono ? "font-bold text-[#174BD4]" : ""}`}>
                    {item.icon}
                    </span>
                    <span className="text-xs g-text-4 font-medium">{item.label}</span>
                </div>
                ))}
            </div>

            {/* Decorative pill */}
            <div className="mt-10 inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-mono g-text-5 border g-border" style={{ letterSpacing: "0.12em" }}>
                <Zap className="h-3 w-3 text-[#85DABE]" />
                POWERED BY ANCHOR · SOLANA DEVNET
            </div>
        </section>
    );
}