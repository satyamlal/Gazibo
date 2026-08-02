"use client";

import {
    Clock,
    DollarSign,
    Award,
    Lock,
} from "lucide-react";

export function SocialProof() {
    return (
        <>
            <section className="border-y border-white/[0.05]">
                <div className="max-w-7xl mx-auto px-5 md:px-8 py-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
                        {[
                            {
                            icon: DollarSign,
                            value: "0%",
                            label: "Platform Fees",
                            },
                            {
                            icon: Clock,
                            value: "~400ms",
                            label: "Settlement Speed",
                            },
                            {
                            icon: Lock,
                            value: "Trustless",
                            label: "Smart Escrow",
                            },
                            {
                            icon: Award,
                            value: "Immutable",
                            label: "On-Chain Reputation",
                            },
                        ].map((stat, idx) => (
                            <div
                            key={idx}
                            className="flex items-center gap-3 justify-center md:justify-start"
                            >
                                <div
                                    className="
                                    h-9 w-9 rounded-lg
                                    bg-[#174BD4]/10 border border-[#174BD4]/15
                                    flex items-center justify-center
                                    text-[#85DABE]
                                    "
                                >
                                    <stat.icon className="h-4 w-4" />
                                </div>
                                <div>
                                    <div className="text-sm font-bold text-white">{stat.value}</div>
                                    <div className="text-[11px] text-zinc-500 font-medium">
                                        {stat.label}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </>
    );
}