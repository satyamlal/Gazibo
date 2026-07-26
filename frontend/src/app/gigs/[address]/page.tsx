"use client";

import { useState, useEffect, useCallback } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import type { AnchorWallet } from "@solana/wallet-adapter-react";
import { PublicKey, LAMPORTS_PER_SOL, SystemProgram } from "@solana/web3.js";
import { BN } from "@coral-xyz/anchor";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
    buildProgram, clientProfilePda, JOB_SEED, PROGRAM_ID,
    ratingAvg, shortAddress,
    type GigOnChain, type FreelancerProfileAccount,
} from "@/lib/program";
import { GigPlanTabs } from "@/components/gigs/GigPlanTabs";
import type { PlanTier, GigPlan } from "@/components/gigs/GigPlanTabs";
import { ArrowLeft, Star, Loader2, CheckCircle2, MessageCircle } from "lucide-react";

// Temporary metadata for gigs that have no IPFS URI yet.
// In a future update, this reads from the IPFS CID stored in GigAccount.
function buildFallbackPlans(gig: GigOnChain): Record<PlanTier, GigPlan> {
    return {
        basic: {
        name: "Basic",
        priceInLamports: gig.basicPrice.toNumber(),
        deliveryDays: 7,
        revisions: 3,
        description: "Starter package",
        features: ["Core deliverable", "3 revisions", "Source files"],
        },
        standard: {
        name: "Standard",
        priceInLamports: gig.standardPrice.toNumber(),
        deliveryDays: 14,
        revisions: 5,
        description: "Professional package",
        features: ["Everything in Basic", "Priority support", "5 revisions"],
        },
        premium: {
        name: "Premium",
        priceInLamports: gig.premiumPrice.toNumber(),
        deliveryDays: 21,
        revisions: 10,
        description: "Full-service package",
        features: ["Everything in Standard", "Unlimited revisions", "1 month support"],
        },
    };
    }

    export default function GigDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { connection } = useConnection();
    const wallet = useWallet();

    const gigAddress = params.address as string;

    const [gig, setGig] = useState<GigOnChain | null>(null);
    const [profile, setProfile] = useState<FreelancerProfileAccount | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [hiring, setHiring] = useState(false);
    const [hireError, setHireError] = useState("");
    const [hired, setHired] = useState(false);

    const loadGig = useCallback(async () => {
        try {
        const program = buildProgram(connection);
        const gigPubkey = new PublicKey(gigAddress);
        const gigData = await program.account.gigAccount.fetch(gigPubkey);
        setGig(gigData);

        // fetching freelancer's profile to display rating
        const profilePda = PublicKey.findProgramAddressSync(
            [Buffer.from("freelancer_profile"), gigData.freelancer.toBuffer()],
            PROGRAM_ID
        )[0];
        const prof = await program.account.freelancerProfile.fetch(profilePda).catch(() => null);
        setProfile(prof);
        } catch {
        setError("Gig not found on this validator.");
        } finally {
        setLoading(false);
        }
    }, [connection, gigAddress]);

    useEffect(() => { void loadGig(); }, [loadGig]);

    // Client hires this freelancer by creating a job at the selected plan price
    const handleContinue = async (tier: PlanTier, plan: GigPlan) => {
        if (!wallet.publicKey || !wallet.signTransaction || !wallet.signAllTransactions || !gig) return;
        if (!wallet.connected) { router.push("/connect"); return; }

        setHiring(true);
        setHireError("");
        try {
        const anchorWallet: AnchorWallet = {
            publicKey: wallet.publicKey,
            signTransaction: wallet.signTransaction,
            signAllTransactions: wallet.signAllTransactions,
        };
        const program = buildProgram(connection, anchorWallet);

        // Get job_id from client profile
        const profilePda = clientProfilePda(wallet.publicKey);
        let jobCounter = 0;
        try {
            const cp = await program.account.clientProfile.fetch(profilePda);
            jobCounter = cp.jobCounter.toNumber();
        } catch {
            setHireError("You need a Client profile first. Go to Account Settings to set one up.");
            setHiring(false);
            return;
        }

        const jobId = new BN(jobCounter);
        const idBytes = Buffer.alloc(8);
        idBytes.writeBigUInt64LE(BigInt(jobId.toString()));
        const [jobPda] = PublicKey.findProgramAddressSync(
            [JOB_SEED, wallet.publicKey.toBuffer(), idBytes],
            PROGRAM_ID
        );

        const title = `${tier.charAt(0).toUpperCase() + tier.slice(1)} — ${gig.title}`.slice(0, 50);
        const description = `Hired via gig (${plan.name} plan). ${plan.deliveryDays} day delivery, ${plan.revisions} revisions.`.slice(0, 500);
        const lamports = new BN(plan.priceInLamports);

        await program.methods
            .createJob(title, description, lamports, jobId)
            .accounts({
            clientProfile: profilePda,
            jobAccount: jobPda,
            client: wallet.publicKey,
            systemProgram: SystemProgram.programId,
            })
            .rpc();

        setHired(true);
        // Redirect to the new job
        router.push(`/jobs/${jobPda.toBase58()}`);
        } catch (err) {
        setHireError(err instanceof Error ? err.message : "Transaction failed.");
        setHiring(false);
        }
    };

    const handleContactSeller = () => {
        // XMTP chat integration — coming in a future update
        alert("Chat feature coming soon! For now, the freelancer's wallet address is shown on the page.");
    };

    if (loading) {
        return (
        <div className="min-h-[70vh] bg-[#030712] flex items-center justify-center">
            <Loader2 className="h-5 w-5 animate-spin text-zinc-500" />
        </div>
        );
    }

    if (!gig) {
        return (
        <div className="min-h-[70vh] bg-[#030712] flex items-center justify-center px-6">
            <div className="text-center">
            <p className="text-red-400 text-sm mb-4">{error}</p>
            <Link href="/gigs" className="text-[#85DABE] text-sm hover:underline">← Browse Gigs</Link>
            </div>
        </div>
        );
    }

    const avg = profile ? ratingAvg(profile.ratingSum, profile.ratingCount) : 0;
    const plans = buildFallbackPlans(gig);
    const isOwnGig = wallet.publicKey?.equals(gig.freelancer) ?? false;

    return (
        <div className="min-h-screen bg-[#030712]">
        <div className="pointer-events-none fixed inset-0 z-0">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-[radial-gradient(ellipse_at_center,rgba(23,75,212,0.08)_0%,transparent_70%)]" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-5 md:px-8 py-16">
            <div className="flex items-center gap-3 mb-8">
                <Link href="/gigs" className="text-zinc-500 hover:text-white transition-colors">
                    <ArrowLeft className="h-5 w-5" />
                </Link>
                <p className="text-xs text-zinc-600">Browse Gigs</p>
            </div>

            <div className="grid lg:grid-cols-[1fr_320px] gap-8">
                <div className="space-y-6">
                    {/* Freelancer info */}
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-[#174BD4]/20 border border-[#174BD4]/30 flex items-center justify-center text-[#174BD4] font-bold text-sm">
                            {shortAddress(gig.freelancer).charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-white">{shortAddress(gig.freelancer)}</p>
                            <p className="text-[11px] font-mono text-zinc-600">{gig.freelancer.toBase58()}</p>
                        </div>
                        {profile && profile.ratingCount > 0 && (
                            <div className="flex items-center gap-1 ml-2">
                                <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
                                <span className="text-sm font-bold text-white">{avg.toFixed(1)}</span>
                                <span className="text-xs text-zinc-500">({profile.ratingCount})</span>
                            </div>
                        )}
                    </div>

                    {/* Title */}
                    <h1 className="text-2xl md:text-3xl font-extrabold text-white leading-tight">
                        {gig.title}
                    </h1>

                    {/* Stats */}
                    <div className="flex items-center gap-4 text-xs text-zinc-500">
                        {profile && (
                            <span className="flex items-center gap-1">
                                <CheckCircle2 className="h-3.5 w-3.5 text-[#85DABE]" />
                                {profile.jobsCompleted.toString()} orders completed
                            </span>
                        )}
                        <span>From {(gig.basicPrice.toNumber() / LAMPORTS_PER_SOL).toFixed(3)} SOL</span>
                    </div>

                    {/* Gig image placeholder */}
                    <div className="h-56 rounded-2xl bg-gradient-to-br from-[#174BD4]/20 to-[#85DABE]/10 border border-white/[0.06] flex items-center justify-center">
                        <div className="text-center">
                            <p className="text-zinc-600 text-sm">Gig preview</p>
                            <p className="text-zinc-700 text-xs mt-1">IPFS images coming soon</p>
                        </div>
                    </div>

                    {/* About */}
                    <div>
                        <h2 className="text-base font-bold text-white mb-2">About this gig</h2>
                        <p className="text-sm text-zinc-400 leading-relaxed">
                            {gig.metadataUri
                            ? "Full description available on IPFS."
                            : "This freelancer hasn't added a detailed description yet. Use the 'Contact me' button to ask questions before hiring."}
                        </p>
                    </div>

                    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 flex items-start gap-3 text-xs text-zinc-500">
                        <MessageCircle className="h-4 w-4 shrink-0 mt-0.5 text-zinc-600" />
                        <p>Direct messaging via XMTP is coming soon. For now, you can contact the freelancer by reaching out to their wallet address.</p>
                    </div>
                </div>

                {/* plan tabs + hire CTA */}
                <div className="lg:sticky lg:top-24 h-fit">
                    {isOwnGig ? (
                        <div className="rounded-2xl border border-[#85DABE]/20 bg-[#85DABE]/[0.04] p-6 text-center">
                            <p className="text-sm text-zinc-400 mb-3">This is your gig.</p>
                            <Link href={`/account/freelancer/gigs/${gigAddress}`} className="text-[#85DABE] text-sm font-semibold hover:underline">
                            Edit gig →
                            </Link>
                        </div>
                    ) : (
                    <>
                        {hireError && (
                            <div className="mb-4 rounded-xl border border-red-500/20 bg-red-500/[0.06] px-4 py-3 text-sm text-red-300">
                                {hireError}
                            </div>
                        )}
                        <GigPlanTabs
                            plans={plans}
                            onContinue={(tier, plan) => void handleContinue(tier, plan)}
                            onContactSeller={handleContactSeller}
                            isLoading={hiring}
                        />
                        {!wallet.connected && (
                        <p className="mt-3 text-center text-xs text-zinc-600">
                            <Link href="/connect" className="text-[#85DABE] hover:underline">Connect wallet</Link> to hire this freelancer.
                        </p>
                        )}
                    </>
                    )}
                </div>
            </div>
        </div>
    </div>
);
}