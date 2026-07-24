"use client";

import { useState } from "react";
import { Clock, RefreshCw, Check, ArrowRight } from "lucide-react";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";

export type PlanTier = "basic" | "standard" | "premium";

export interface GigPlan {
    name: string;
    priceInLamports: number;
    deliveryDays: number;
    revisions: number;
    description: string;
    features: string[];
}

interface GigPlanTabsProps {
    plans: Record<PlanTier, GigPlan>;
    onContinue: (tier: PlanTier, plan: GigPlan) => void;
    onContactSeller: () => void;
    isLoading?: boolean;
}

const TIER_ORDER: PlanTier[] = ["basic", "standard", "premium"];

export function GigPlanTabs({
    plans,
    onContinue,
    onContactSeller,
    isLoading = false,
}: GigPlanTabsProps) {
    const [active, setActive] = useState<PlanTier>("basic");
    const plan = plans[active];
    const solAmount = (plan.priceInLamports / LAMPORTS_PER_SOL).toFixed(3);

    return (
    <div className="rounded-2xl border border-white/[0.08] bg-[#0A0F1E]/80 backdrop-blur-sm overflow-hidden">

      {/* Tab bar — Basic | Standard | Premium */}
        <div className="grid grid-cols-3 border-b border-white/[0.06]">
        {TIER_ORDER.map((tier) => (
        
        <button
            key={tier}
            onClick={() => setActive(tier)}
            className={`py-4 text-sm font-semibold capitalize transition-colors duration-150 border-b-2 ${
                active === tier
                ? "border-[#85DABE] text-white"
                : "border-transparent text-zinc-500 hover:text-zinc-300"
            }`}
        >
            {tier}
        </button>
        ))}
    </div>

    <div className="p-5 space-y-5">
        {/* Price */}
        <div>
            <div className="text-2xl font-extrabold text-white">
                {solAmount}{" "}
            <span className="text-base font-semibold text-[#85DABE]">SOL</span>
        </div>
        <p className="mt-1 text-xs text-zinc-500">{plan.description}</p>
    </div>

    {/* Delivery + Revisions */}
    <div className="flex gap-5 text-sm text-zinc-300">
        <div className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 text-zinc-500" />
                <span>{plan.deliveryDays}-day delivery</span>
        </div>
        <div className="flex items-center gap-1.5">
            <RefreshCw className="h-3.5 w-3.5 text-zinc-500" />
            <span>{plan.revisions} Revisions</span>
        </div>
    </div>

        {/* Features checklist */}
        {plan.features.length > 0 && (
            <div className="space-y-2">
                <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                    What&apos;s included
            </p>
            <ul className="space-y-2">
                {plan.features.map((feat, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-zinc-300">
                    <Check className="h-4 w-4 text-[#85DABE] mt-0.5 shrink-0" />
                        {feat}
                    </li>
                ))}
            </ul>
            </div>
        )}

        {/* Continue button */}
        <button
            onClick={() => onContinue(active, plan)}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-white text-[#030712] font-bold text-[15px] hover:bg-zinc-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150"
        >
            {isLoading ? "Creating escrow…" : (
                <>Continue <ArrowRight className="h-4 w-4" /></>
            )}
        </button>

        {/* Contact seller */}
        <button
            onClick={onContactSeller}
            className="w-full py-3 rounded-xl border border-white/[0.1] text-white text-sm font-semibold hover:bg-white/[0.06] transition-colors duration-150"
        >
            Contact me ↓
        </button>
    </div>
</div>
);}