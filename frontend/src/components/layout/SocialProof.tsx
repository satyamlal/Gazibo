"use client";

import { Clock, DollarSign, Award, Lock } from "lucide-react";

const STATS = [
    { icon: DollarSign, value: "0%", label: "Platform Fees" },
    { icon: Clock, value: "~400ms", label: "Settlement Speed" },
    { icon: Lock, value: "Trustless", label: "Smart Escrow" },
    { icon: Award, value: "Immutable", label: "On-Chain Reputation" },
] as const;

export function SocialProof() {
    return (
        <section className="border-y g-border">
            <div className="max-w-7xl mx-auto px-5 md:px-8 py-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
                    {STATS.map(({ icon: Icon, value, label }) => (
                        <div key={label} className="flex items-center gap-3 justify-center md:justify-start">
                            <div className="h-9 w-9 rounded-lg bg-[#174BD4]/10 border border-[#174BD4]/15 flex items-center justify-center text-[#174BD4] shrink-0">
                                <Icon className="h-4 w-4" />
                            </div>
                            <div>
                                <div className="text-sm font-bold g-text">{value}</div>
                                <div className="text-[11px] g-text-4 font-medium">{label}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}