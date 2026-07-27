"use client";

import { useState } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import type { AnchorWallet } from "@solana/wallet-adapter-react";
import { PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { BN } from "@coral-xyz/anchor";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { buildProgram, freelancerProfilePda, GIG_SEED, PROGRAM_ID } from "@/lib/program";
import { ArrowLeft, Plus, Trash2, Loader2 } from "lucide-react";

interface PlanForm {
    name: string;
    description: string;
    priceSol: string;
    deliveryDays: string;
    revisions: string;
    features: string[];
}

const defaultPlan = (name: string): PlanForm => ({
    name,
    description: "",
    priceSol: "",
    deliveryDays: "7",
    revisions: "3",
    features: [""],
});

export default function NewGigPage() {
    const { connection } = useConnection();
    const wallet = useWallet();
    const router = useRouter();

    const [title, setTitle] = useState("");
    const [plans, setPlans] = useState<[PlanForm, PlanForm, PlanForm]>([
        defaultPlan("Basic"),
        defaultPlan("Standard"),
        defaultPlan("Premium"),
    ]);
    const [activeTab, setActiveTab] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const updatePlan = (idx: number, field: keyof PlanForm, value: string) => {
        setPlans((prev) => {
        const next = [...prev] as [PlanForm, PlanForm, PlanForm];
        next[idx] = { ...next[idx], [field]: value };
        return next;
        });
    };

    const addFeature = (idx: number) => {
        setPlans((prev) => {
        const next = [...prev] as [PlanForm, PlanForm, PlanForm];
        next[idx] = { ...next[idx], features: [...next[idx].features, ""] };
        return next;
        });
    };

    const updateFeature = (planIdx: number, featIdx: number, value: string) => {
        setPlans((prev) => {
        const next = [...prev] as [PlanForm, PlanForm, PlanForm];
        const features = [...next[planIdx].features];
        features[featIdx] = value;
        next[planIdx] = { ...next[planIdx], features };
        return next;
        });
    };

    const removeFeature = (planIdx: number, featIdx: number) => {
        setPlans((prev) => {
        const next = [...prev] as [PlanForm, PlanForm, PlanForm];
        const features = next[planIdx].features.filter((_, i) => i !== featIdx);
        next[planIdx] = { ...next[planIdx], features: features.length ? features : [""] };
        return next;
        });
    };

    const handleSubmit = async () => {
        if (!wallet.publicKey || !wallet.signTransaction || !wallet.signAllTransactions) return;
        setError("");

        if (!title.trim()) { setError("Gig title is required."); return; }
        const prices = plans.map((p) => parseFloat(p.priceSol));
        if (prices.some(isNaN) || prices.some((p) => p <= 0)) {
        setError("All three prices must be valid positive numbers.");
        return;
        }
        if (prices[0] > prices[1] || prices[1] > prices[2]) {
        setError("Prices must be: Basic ≤ Standard ≤ Premium.");
        return;
        }

        setLoading(true);
        try {
        const anchorWallet: AnchorWallet = {
            publicKey: wallet.publicKey,
            signTransaction: wallet.signTransaction,
            signAllTransactions: wallet.signAllTransactions,
        };
        const program = buildProgram(connection, anchorWallet);

        // Get current gig_counter from FreelancerProfile to use as gig_id
        const profilePda = freelancerProfilePda(wallet.publicKey);
        const profile = await program.account.freelancerProfile.fetch(profilePda);
        const gigId = new BN(profile.gigCounter.toString());

        // Derive the gig PDA
        const idBytes = gigId.toArrayLike(Buffer, "le", 8);
        const [gigPda] = PublicKey.findProgramAddressSync(
            [GIG_SEED, wallet.publicKey.toBuffer(), idBytes],
            PROGRAM_ID
        );

        const basicLamports = new BN(Math.floor(prices[0] * LAMPORTS_PER_SOL));
        const standardLamports = new BN(Math.floor(prices[1] * LAMPORTS_PER_SOL));
        const premiumLamports = new BN(Math.floor(prices[2] * LAMPORTS_PER_SOL));

        await program.methods
            .createGig(gigId, title.trim(), basicLamports, standardLamports, premiumLamports, "")
            .accounts({
            freelancer: wallet.publicKey,
            freelancerProfile: profilePda,
            gigAccount: gigPda,
            })
            .rpc();

        router.push("/account/freelancer");
        } catch (err) {
        setError(err instanceof Error ? err.message : "Transaction failed.");
        } finally {
        setLoading(false);
        }
    };

    const plan = plans[activeTab];

    return (
        <div className="min-h-screen bg-[#030712]">
        <div className="max-w-2xl mx-auto px-5 md:px-8 py-16">

            {/* Header */}
            <div className="flex items-center gap-3 mb-8">
            <Link href="/account/freelancer" className="text-zinc-500 hover:text-white transition-colors">
                <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
                <h1 className="text-2xl font-extrabold text-white tracking-tight">Create a Gig</h1>
                <p className="text-zinc-500 text-sm">Define your service and pricing tiers.</p>
            </div>
            </div>

            {error && (
            <div className="mb-6 rounded-xl border border-red-500/20 bg-red-500/[0.06] px-4 py-3 text-sm text-red-300">
                {error}
            </div>
            )}

            {/* Gig title */}
            <div className="mb-6">
            <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2 block">
                Gig Title <span className="text-red-400">*</span>
            </label>
            <input
                type="text"
                placeholder="e.g. I will build your Solana dApp from scratch"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={80}
                className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white placeholder:text-zinc-600 text-sm focus:outline-none focus:border-[#174BD4]/50 transition-colors"
            />
            <p className="text-[11px] text-zinc-700 mt-1">{title.length}/80 characters</p>
            </div>

            {/* Plan tabs */}
            <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] overflow-hidden mb-6">
            <div className="grid grid-cols-3 border-b border-white/[0.06]">
                {["Basic", "Standard", "Premium"].map((t, i) => (
                <button
                    key={t}
                    onClick={() => setActiveTab(i)}
                    className={`py-3.5 text-sm font-semibold transition-colors border-b-2 ${
                    activeTab === i
                        ? "border-[#85DABE] text-white"
                        : "border-transparent text-zinc-500 hover:text-zinc-300"
                    }`}
                >
                    {t}
                </button>
                ))}
            </div>

            <div className="p-5 space-y-4">
                <div>
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2 block">
                    Price (SOL) <span className="text-red-400">*</span>
                </label>
                <input
                    type="number"
                    step="0.001"
                    min="0.001"
                    placeholder="0.5"
                    value={plan.priceSol}
                    onChange={(e) => updatePlan(activeTab, "priceSol", e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white placeholder:text-zinc-600 text-sm focus:outline-none focus:border-[#174BD4]/50 transition-colors"
                />
                </div>

                <div>
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2 block">
                    Short description
                </label>
                <input
                    type="text"
                    placeholder="What's included in this tier?"
                    value={plan.description}
                    onChange={(e) => updatePlan(activeTab, "description", e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white placeholder:text-zinc-600 text-sm focus:outline-none focus:border-[#174BD4]/50 transition-colors"
                />
                </div>

                <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2 block">
                    Delivery (days)
                    </label>
                    <input
                    type="number"
                    min="1"
                    value={plan.deliveryDays}
                    onChange={(e) => updatePlan(activeTab, "deliveryDays", e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-sm focus:outline-none focus:border-[#174BD4]/50 transition-colors"
                    />
                </div>
                <div>
                    <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2 block">
                    Revisions
                    </label>
                    <input
                    type="number"
                    min="0"
                    value={plan.revisions}
                    onChange={(e) => updatePlan(activeTab, "revisions", e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-sm focus:outline-none focus:border-[#174BD4]/50 transition-colors"
                    />
                </div>
                </div>

                {/* Features list */}
                <div>
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2 block">
                    What&apos;s included
                </label>
                <div className="space-y-2">
                    {plan.features.map((feat, fi) => (
                    <div key={fi} className="flex items-center gap-2">
                        <input
                        type="text"
                        placeholder={`Feature ${fi + 1}`}
                        value={feat}
                        onChange={(e) => updateFeature(activeTab, fi, e.target.value)}
                        className="flex-1 px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white placeholder:text-zinc-600 text-sm focus:outline-none focus:border-[#174BD4]/50 transition-colors"
                        />
                        <button
                        onClick={() => removeFeature(activeTab, fi)}
                        className="h-9 w-9 flex items-center justify-center rounded-lg text-zinc-600 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                        >
                        <Trash2 className="h-4 w-4" />
                        </button>
                    </div>
                    ))}
                </div>
                <button
                    onClick={() => addFeature(activeTab)}
                    className="mt-2 flex items-center gap-1.5 text-xs text-[#85DABE] hover:text-[#A8E8D0] transition-colors"
                >
                    <Plus className="h-3.5 w-3.5" /> Add feature
                </button>
                </div>
            </div>
            </div>

            {/* Submit */}
            <button
            onClick={() => void handleSubmit()}
            disabled={loading || !wallet.connected}
            className="w-full py-4 rounded-xl bg-[#85DABE] text-[#030712] font-bold text-[15px] hover:bg-[#A8E8D0] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
            {loading ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Creating gig on-chain…</>
            ) : (
                "Publish Gig"
            )}
            </button>
            <p className="mt-3 text-center text-xs text-zinc-700">
            This creates an on-chain GigAccount. Small SOL amount required for rent.
            </p>
        </div>
        </div>
    );
}