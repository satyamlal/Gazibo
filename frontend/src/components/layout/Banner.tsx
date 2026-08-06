"use client";

import Link from "next/link";
import { ArrowRight, Zap, Shield, DollarSign } from "lucide-react";

const PROOF_POINTS = [
    { icon: DollarSign, text: "0% Commission" },
    { icon: Shield,     text: "Smart Escrow"  },
    { icon: Zap,        text: "Instant Pay"   },
] as const;

export function Banner() {
    return (
        <section className="border-t g-border">
            <div className="relative overflow-hidden bg-[#0F2F8A]">
                {/* Ambient glow orbs */}
                <div className="pointer-events-none absolute inset-0" aria-hidden>
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[300px] bg-[radial-gradient(ellipse_at_center,rgba(133,218,190,0.12)_0%,transparent_70%)]" />
                <div className="absolute bottom-0 right-[10%] w-[300px] h-[200px] bg-[radial-gradient(circle,rgba(23,75,212,0.25)_0%,transparent_70%)]" />
                {/* Subtle grid */}
                <div
                    className="absolute inset-0 opacity-20"
                    style={{
                    backgroundImage:
                        "linear-gradient(to right,rgba(255,255,255,0.04)1px,transparent 1px),linear-gradient(to bottom,rgba(255,255,255,0.04)1px,transparent 1px)",
                    backgroundSize: "4rem 4rem",
                    }}
                />
                </div>

                <div className="relative z-10 max-w-4xl mx-auto px-5 md:px-8 py-20 md:py-24 text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/10 bg-white/[0.06] text-xs font-medium text-white/60 mb-8">
                        <span className="flex h-2 w-2 rounded-full bg-[#85DABE] animate-glow-pulse" />
                        Join the network
                    </div>

                    <h2
                        className="text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight text-white mb-5 leading-tight"
                        style={{ fontFamily: "var(--font-heading, var(--font-sans))" }}>
                            Ready to Build
                        <br />
                        <span className="bg-gradient-to-r from-[#85DABE] to-[#A8E8D0] bg-clip-text text-transparent">
                            Trustless Work?
                        </span>
                    </h2>

                    <p className="text-white/60 text-base md:text-lg max-w-xl mx-auto mb-10">
                        Join the next generation of Web3 freelancers and clients.
                        Your wallet, your rules, your reputation — permanently on Solana.
                    </p>

                    {/* Proof points */}
                    <div className="flex flex-wrap items-center justify-center gap-6 mb-10">
                        {PROOF_POINTS.map(({ icon: Icon, text }) => (
                            <div key={text} className="flex items-center gap-2 text-sm text-white/50">
                                <Icon className="h-4 w-4 text-[#85DABE]" />
                                <span>{text}</span>
                            </div>
                        ))}
                    </div>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link
                            href="/connect"
                            className="group w-full sm:w-auto px-8 py-3.5 rounded-full bg-[#85DABE] text-[#030712] font-semibold text-[15px] flex items-center justify-center gap-2 hover:bg-[#A8E8D0] hover:shadow-[0_0_24px_rgba(133,218,190,0.4)] active:scale-[0.97] transition-all duration-300">
                            Get Started Free
                            <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                        </Link>
                        <Link
                            href="/jobs"
                            className="w-full sm:w-auto px-8 py-3.5 rounded-full border border-white/20 text-white/80 font-semibold text-[15px] flex items-center justify-center hover:bg-white/[0.08] hover:border-white/30 transition-all duration-300">
                            Browse Active Jobs
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
}