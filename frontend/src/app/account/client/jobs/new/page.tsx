"use client";

import { useState } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import type { AnchorWallet } from "@solana/wallet-adapter-react";
import { PublicKey, LAMPORTS_PER_SOL, SystemProgram } from "@solana/web3.js";
import { BN } from "@coral-xyz/anchor";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { buildProgram, clientProfilePda, JOB_SEED, PROGRAM_ID } from "@/lib/program";
import { ArrowLeft, Loader2, Lock } from "lucide-react";

export default function PostJobPage() {
    const { connection } = useConnection();
    const wallet = useWallet();
    const router = useRouter();

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [amountSol, setAmountSol] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async () => {
        if (!wallet.publicKey || !wallet.signTransaction || !wallet.signAllTransactions) return;
        setError("");

        if (!title.trim()) { setError("Title is required."); return; }
        if (!description.trim()) { setError("Description is required."); return; }
        const amount = parseFloat(amountSol);
        if (isNaN(amount) || amount < 0.001) {
            setError("Minimum amount is 0.001 SOL.");
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
            const profilePda = clientProfilePda(wallet.publicKey);

        // job_id comes from the current job_counter in ClientProfile
            const profile = await program.account.clientProfile.fetch(profilePda);
            const jobId = new BN(profile.jobCounter.toString());

        // Derive job PDA: [JOB_SEED, client, job_id_bytes]
            const idBytes = Buffer.alloc(8);
            idBytes.writeBigUInt64LE(BigInt(jobId.toString()));
            const [jobPda] = PublicKey.findProgramAddressSync(
                [JOB_SEED, wallet.publicKey.toBuffer(), idBytes],
                PROGRAM_ID
            );

        const lamports = new BN(Math.floor(amount * LAMPORTS_PER_SOL));

            await program.methods
                .createJob(title.trim(), description.trim(), lamports, jobId)
                .accounts({
                clientProfile: profilePda,
                jobAccount: jobPda,
                client: wallet.publicKey,
                systemProgram: SystemProgram.programId,
                })
                .rpc();

            router.push("/account/client");
        } catch (err) {
            setError(err instanceof Error ? err.message : "Transaction failed.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#030712]">
        <div className="max-w-xl mx-auto px-5 md:px-8 py-16">

            <div className="flex items-center gap-3 mb-8">
            <Link href="/account/client" className="text-zinc-500 hover:text-white transition-colors">
                <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
                <h1 className="text-2xl font-extrabold text-white tracking-tight">Post a Job</h1>
                <p className="text-zinc-500 text-sm">SOL gets locked in escrow the moment you post.</p>
            </div>
            </div>

            {error && (
            <div className="mb-6 rounded-xl border border-red-500/20 bg-red-500/[0.06] px-4 py-3 text-sm text-red-300">
                {error}
            </div>
            )}

            <div className="space-y-5">
            <div>
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2 block">
                Job Title <span className="text-red-400">*</span>
                </label>
                <input
                type="text"
                placeholder="e.g. Build a Solana staking dashboard"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={50}
                className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white placeholder:text-zinc-600 text-sm focus:outline-none focus:border-[#174BD4]/50 transition-colors"
                />
                <p className="text-[11px] text-zinc-700 mt-1 px-3">{title.length}/50 characters</p>
            </div>

            <div>
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2 block">
                Description <span className="text-red-400">*</span>
                </label>
                <textarea
                rows={5}
                placeholder="Describe the work, deliverables, and any technical requirements…"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={500}
                className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white placeholder:text-zinc-600 text-sm focus:outline-none focus:border-[#174BD4]/50 transition-colors resize-none"
                />
                <p className="text-[11px] text-zinc-700 mt-1 px-3">{description.length}/500 characters</p>
            </div>

            <div>
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2 block">
                Budget in SOL <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                <input
                    type="number"
                    step="0.001"
                    min="0.001"
                    placeholder="1.5"
                    value={amountSol}
                    onChange={(e) => setAmountSol(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white placeholder:text-zinc-600 text-sm focus:outline-none focus:border-[#174BD4]/50 transition-colors pr-16"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-[#85DABE]">SOL</span>
                </div>
                {amountSol && !isNaN(parseFloat(amountSol)) && (
                <p className="text-[11px] text-zinc-500 mt-1 px-3">
                    {(parseFloat(amountSol)).toLocaleString()} SOL — this exact amount will be locked in escrow
                </p>
                )}
            </div>

            <button
                onClick={() => void handleSubmit()}
                disabled={loading || !wallet.connected}
                className="w-full py-4 rounded-xl bg-[#85DABE] text-[#030712] font-bold text-[15px] hover:bg-[#A8E8D0] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
                {loading ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Locking funds in escrow…</>
                ) : (
                <><Lock className="h-4 w-4" /> Post Job &amp; Lock Escrow</>
                )}
            </button>

            <div className="rounded-xl border border-[#174BD4]/15 bg-[#174BD4]/[0.04] p-4 text-xs text-zinc-400 leading-relaxed">
                <span className="text-[#85DABE] font-semibold">How escrow works:</span> When you post this job, the SOL amount is locked in an on-chain account. A freelancer accepts → does the work → delivers → you review. You release payment only when satisfied. You can cancel before anyone accepts to get your SOL back.
            </div>
            </div>
        </div>
        </div>
    );
}