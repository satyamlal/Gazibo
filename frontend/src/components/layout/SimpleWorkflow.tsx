"use client";

import { ShieldCheck, Cpu, Zap } from "lucide-react";

const STEPS = [
    {
        step: "01",
        title: "Connect Wallet",
        desc: "Link your Solana wallet, verify your cryptographic identity, and create your on-chain profile in seconds.",
        icon: Zap,
    },
    {
        step: "02",
        title: "Post or Accept Jobs",
        desc: "Create a gig with escrowed funds, or browse open jobs and accept work — all backed by smart contracts.",
        icon: Cpu,
    },
    {
        step: "03",
        title: "Instant Payout",
        desc: "Submit deliverables, get verified, and receive instant payment. No waiting. No intermediaries.",
        icon: ShieldCheck,
    },
] as const;

export function SimpleWorkflow() {
    return (
        <section className="border-t g-border g-bg-alt">
            <div className="max-w-7xl mx-auto px-5 md:px-8 py-20 md:py-28 text-center">
                <div className="text-xs font-bold tracking-[0.2em] text-[#85DABE] uppercase mb-4">
                    Simple Workflow
                </div>

                <h2
                    className="text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight g-text mb-5"
                    style={{ fontFamily: "var(--font-heading, var(--font-sans))" }}>
                    How It Works
                </h2>

                <p className="g-text-4 text-base md:text-lg max-w-2xl mx-auto mb-16">
                    Three steps. Zero middlemen. Cryptographically guaranteed outcomes.
                </p>

                {/* Steps */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-0 relative">
                    {/* Connector line */}
                    <div className="hidden md:block absolute top-12 left-[20%] right-[20%] h-px bg-gradient-to-r from-transparent via-[rgba(0,0,0,0.1)] to-transparent" style={{ background: "linear-gradient(to right, transparent, var(--ga-border-mid), transparent)" }} />

                    {STEPS.map((item) => (
                        <div key={item.step} className="relative flex flex-col items-center">
                            {/* Step number circle */}
                            <div className="relative z-10 h-14 w-14 rounded-full mb-6 g-bg-card g-shadow border g-border-mid flex items-center justify-center text-sm font-bold g-text-4 transition-all duration-300 hover:border-[#85DABE]/40 hover:text-[#85DABE] hover:shadow-[0_0_20px_rgba(133,218,190,0.15)]">
                                {item.step}
                            </div>

                            {/* Card */}
                            <div className="group w-full max-w-xs p-6 rounded-2xl border g-border g-card transition-all duration-300 hover:border-[#174BD4]/20">
                                <div className="h-10 w-10 rounded-xl mx-auto mb-4 bg-[#174BD4]/10 border border-[#174BD4]/15 flex items-center justify-center text-[#85DABE] group-hover:scale-110 transition-transform duration-300">
                                    <item.icon className="h-5 w-5" />
                                </div>
                                <h3
                                    className="text-base font-bold g-text mb-2"
                                    style={{ fontFamily: "var(--font-heading, var(--font-sans))" }}>
                                    {item.title}
                                </h3>
                                <p className="text-sm g-text-4 leading-relaxed">{item.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}