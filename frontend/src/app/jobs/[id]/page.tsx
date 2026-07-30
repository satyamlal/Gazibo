"use client";

import { useState, useEffect, useCallback } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import type { AnchorWallet } from "@solana/wallet-adapter-react";
import { PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { buildProgram, type JobOnChain } from "@/lib/program";
import { ToastContainer } from "@/components/ui/Toast";
import { useToast } from "@/hooks/useToast";
import {
  ArrowLeft, Loader2, CheckCircle2, Clock,
  Truck, XCircle, Lock, ShieldCheck, AlertTriangle,
} from "lucide-react";

function statusKey(s: Record<string, Record<string, never>>) {
  return Object.keys(s)[0] ?? "open";
}

const STATUS_CONFIG: Record<string, {
  label: string; icon: React.ElementType; cls: string; bg: string;
}> = {
  open:       { label: "Open — waiting for a freelancer", icon: Clock,         cls: "text-[#85DABE] border-[#85DABE]/20",  bg: "bg-[#85DABE]/10"  },
  inProgress: { label: "In Progress",                     icon: Truck,         cls: "text-[#174BD4] border-[#174BD4]/20",  bg: "bg-[#174BD4]/10"  },
  delivered:  { label: "Delivered — review needed",       icon: AlertTriangle, cls: "text-amber-400 border-amber-500/20",  bg: "bg-amber-500/10"  },
  completed:  { label: "Completed",                       icon: CheckCircle2,  cls: "text-zinc-400 border-zinc-500/20",    bg: "bg-zinc-500/10"   },
  cancelled:  { label: "Cancelled",                       icon: XCircle,       cls: "text-red-400 border-red-500/20",      bg: "bg-red-500/10"    },
};

export default function JobDetailPage() {
  const params    = useParams();
  const router    = useRouter();
  const { connection } = useConnection();
  const wallet    = useWallet();
  const { toasts, addToast, dismiss } = useToast();

  const jobAddress = params.id as string;

  const [job, setJob]         = useState<JobOnChain | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");

  const [delivering, setDelivering]           = useState(false);
  const [delivered,  setDelivered]            = useState(false);
  const [releasing,  setReleasing]            = useState(false);
  const [released,   setReleased]             = useState(false);
  const [cancelling, setCancelling]           = useState(false);
  const [cancelled,  setCancelled]            = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  const loadJob = useCallback(async () => {
    setError("");
    try {
      const program = buildProgram(connection);
      const data    = await program.account.jobAccount.fetch(new PublicKey(jobAddress));
      setJob(data);
    } catch {
      setError("Job not found on this validator.");
    } finally {
      setLoading(false);
    }
  }, [connection, jobAddress]);

  useEffect(() => { void loadJob(); }, [loadJob]);

  const getAnchorWallet = (): AnchorWallet | null => {
    if (!wallet.publicKey || !wallet.signTransaction || !wallet.signAllTransactions) return null;
    return {
      publicKey:           wallet.publicKey,
      signTransaction:     wallet.signTransaction,
      signAllTransactions: wallet.signAllTransactions,
    };
  };

  const handleDeliver = async () => {
    const aw = getAnchorWallet();
    if (!aw || !job) return;
    setDelivering(true);
    setError("");
    try {
      const program = buildProgram(connection, aw);
      await program.methods.deliverJob()
        .accounts({ freelancer: aw.publicKey, jobAccount: new PublicKey(jobAddress) })
        .rpc();
      setDelivered(true);
      addToast("Delivery submitted! Waiting for client approval.", "success");
      await loadJob();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delivery failed.");
      setDelivering(false);
    }
  };

  const handleRelease = async () => {
    const aw = getAnchorWallet();
    if (!aw || !job || releasing || released) return;
    setReleasing(true);
    setError("");
    try {
      const program = buildProgram(connection, aw);
      await program.methods.releasePayment()
        .accounts({
          jobAccount: new PublicKey(jobAddress),
          client:     aw.publicKey,
          freelancer: job.freelancer as PublicKey,
        })
        .rpc();
      setReleased(true);
      addToast(
        `Payment of ${(job.amount.toNumber() / LAMPORTS_PER_SOL).toFixed(3)} SOL released!`,
        "success"
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Payment release failed.");
      setReleasing(false);
    }
  };

  const handleCancel = async () => {
    const aw = getAnchorWallet();
    if (!aw || !job || cancelling || cancelled) return;
    setCancelling(true);
    setError("");
    try {
      const program = buildProgram(connection, aw);
      await program.methods.cancelJob()
        .accounts({ client: aw.publicKey, jobAccount: new PublicKey(jobAddress) })
        .rpc();
      setCancelled(true);
      setShowCancelConfirm(false);
      addToast(
        `Job cancelled. ${(job.amount.toNumber() / LAMPORTS_PER_SOL).toFixed(3)} SOL returned to your wallet.`,
        "info"
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Cancel failed.");
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] bg-[#030712] flex items-center justify-center">
        <Loader2 className="h-5 w-5 animate-spin text-zinc-500" />
      </div>
    );
  }

  if (error && !job) {
    return (
      <div className="min-h-[70vh] bg-[#030712] flex items-center justify-center px-6">
        <div className="text-center">
          <p className="text-red-400 text-sm mb-4">{error}</p>
          <Link href="/jobs" className="text-[#85DABE] text-sm hover:underline">← Browse Jobs</Link>
        </div>
      </div>
    );
  }

  if (!job) return null;

  const sk  = statusKey(job.status);
  const cfg = STATUS_CONFIG[sk] ?? STATUS_CONFIG.open;
  const StatusIcon = cfg.icon;

  const isClient     = wallet.publicKey?.equals(job.client) ?? false;
  const freelancerPk = job.freelancer as PublicKey | null;
  const isFreelancer = freelancerPk && wallet.publicKey
    ? freelancerPk.equals(wallet.publicKey)
    : false;

  return (
    <div className="min-h-screen bg-[#030712]">
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-[radial-gradient(ellipse_at_center,rgba(23,75,212,0.08)_0%,transparent_70%)]" />
      </div>

      <div className="relative z-10 max-w-2xl mx-auto px-5 md:px-8 py-16">

        <div className="flex items-center gap-3 mb-8">
          <button onClick={() => router.back()} className="text-zinc-500 hover:text-white transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <p className="text-xs font-mono text-zinc-600 truncate">{jobAddress}</p>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-red-500/20 bg-red-500/[0.06] px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        {/* Job header */}
        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6 mb-4">
          <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-bold mb-4 ${cfg.cls} ${cfg.bg}`}>
            <StatusIcon className="h-3.5 w-3.5" />
            {cfg.label}
          </div>
          <h1 className="text-2xl font-extrabold text-white mb-3">{job.title}</h1>
          <p className="text-zinc-400 text-sm leading-relaxed whitespace-pre-wrap">{job.description}</p>
          <div className="mt-6 pt-5 border-t border-white/[0.06] grid grid-cols-2 gap-4">
            <div>
              <p className="text-[11px] text-zinc-600 uppercase tracking-wider mb-1">Escrow amount</p>
              <p className="text-xl font-bold text-[#85DABE]">
                {(job.amount.toNumber() / LAMPORTS_PER_SOL).toFixed(3)} SOL
              </p>
            </div>
            <div>
              <p className="text-[11px] text-zinc-600 uppercase tracking-wider mb-1">Job ID</p>
              <p className="text-sm font-mono text-zinc-300">#{job.jobId.toString()}</p>
            </div>
          </div>
        </div>

        {/* Parties */}
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 mb-4 space-y-3">
          <div>
            <p className="text-[11px] text-zinc-600 uppercase tracking-wider mb-1">Client</p>
            <p className="text-sm font-mono text-zinc-300 break-all">
              {job.client.toBase58()}
              {isClient && <span className="ml-2 text-[10px] text-[#85DABE] font-bold">(You)</span>}
            </p>
          </div>
          {freelancerPk && (
            <div>
              <p className="text-[11px] text-zinc-600 uppercase tracking-wider mb-1">Freelancer</p>
              <p className="text-sm font-mono text-zinc-300 break-all">
                {freelancerPk.toBase58()}
                {isFreelancer && <span className="ml-2 text-[10px] text-[#85DABE] font-bold">(You)</span>}
              </p>
            </div>
          )}
        </div>

        {/* Payment released */}
        {released && (
          <div className="rounded-2xl border border-[#85DABE]/20 bg-[#85DABE]/[0.06] p-6 text-center mb-4">
            <CheckCircle2 className="h-8 w-8 text-[#85DABE] mx-auto mb-3" />
            <p className="text-white font-bold text-lg mb-1">Payment Released!</p>
            <p className="text-zinc-400 text-sm">
              {(job.amount.toNumber() / LAMPORTS_PER_SOL).toFixed(3)} SOL sent to the freelancer&apos;s wallet.
            </p>
            <Link href="/account/client" className="inline-block mt-4 text-[#85DABE] text-sm hover:underline">
              Back to Dashboard →
            </Link>
          </div>
        )}

        {/* Actions */}
        {!released && (
          <div className="space-y-3">

            {/* CLIENT: Cancel */}
            {isClient && sk === "open" && !cancelled && (
              <>
                {showCancelConfirm ? (
                  <div className="rounded-xl border border-red-500/20 bg-red-500/[0.06] p-5 space-y-4">
                    <p className="text-sm font-semibold text-white">Are you sure you want to cancel?</p>
                    <p className="text-xs text-zinc-400">
                      Your {(job.amount.toNumber() / LAMPORTS_PER_SOL).toFixed(3)} SOL will be
                      returned to your wallet immediately.
                    </p>
                    <div className="flex gap-3">
                      <button
                        onClick={() => void handleCancel()}
                        disabled={cancelling}
                        className="flex-1 py-2.5 rounded-xl bg-red-500/80 text-white text-sm font-semibold hover:bg-red-500 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                      >
                        {cancelling
                          ? <><Loader2 className="h-4 w-4 animate-spin" /> Cancelling…</>
                          : "Yes, cancel & reclaim SOL"}
                      </button>
                      <button
                        onClick={() => setShowCancelConfirm(false)}
                        className="flex-1 py-2.5 rounded-xl border border-white/[0.1] text-white text-sm font-semibold hover:bg-white/[0.06] transition-colors"
                      >
                        Keep job
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowCancelConfirm(true)}
                    className="w-full py-3.5 rounded-xl border border-red-500/30 text-red-400 text-sm font-semibold hover:bg-red-500/10 transition-colors flex items-center justify-center gap-2"
                  >
                    <XCircle className="h-4 w-4" /> Cancel Job &amp; Reclaim SOL
                  </button>
                )}
              </>
            )}

            {/* Cancelled success */}
            {cancelled && (
              <div className="rounded-xl border border-[#85DABE]/20 bg-[#85DABE]/[0.06] p-5 text-center">
                <CheckCircle2 className="h-6 w-6 text-[#85DABE] mx-auto mb-2" />
                <p className="text-white font-bold mb-1">Job Cancelled</p>
                <p className="text-zinc-400 text-sm">
                  {(job.amount.toNumber() / LAMPORTS_PER_SOL).toFixed(3)} SOL returned to your wallet.
                </p>
                <Link href="/account/client" className="inline-block mt-3 text-[#85DABE] text-sm hover:underline">
                  Back to Dashboard →
                </Link>
              </div>
            )}

            {/* CLIENT: Release */}
            {isClient && sk === "delivered" && (
              <div className="space-y-3">
                <div className="rounded-xl border border-amber-500/20 bg-amber-500/[0.06] p-4 text-xs text-amber-200/80">
                  <p className="font-semibold text-amber-300 mb-1">Review the delivered work</p>
                  <p>The freelancer has submitted their work. Release payment only when satisfied. This cannot be undone.</p>
                </div>
                <button
                  onClick={() => void handleRelease()}
                  disabled={releasing || released}
                  className="w-full py-4 rounded-xl bg-[#85DABE] text-[#030712] font-bold text-[15px] hover:bg-[#A8E8D0] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                >
                  {releasing
                    ? <><Loader2 className="h-4 w-4 animate-spin" /> Releasing payment…</>
                    : <><ShieldCheck className="h-4 w-4" /> Release Payment</>}
                </button>
              </div>
            )}

            {/* FREELANCER: Deliver */}
            {isFreelancer && sk === "inProgress" && !delivered && (
              <div className="space-y-3">
                <div className="rounded-xl border border-[#174BD4]/15 bg-[#174BD4]/[0.04] p-4 text-xs text-zinc-400">
                  <p className="font-semibold text-white mb-1">Ready to deliver?</p>
                  <p>Clicking &quot;Mark as Delivered&quot; notifies the client. They then review and release your payment.</p>
                </div>
                <button
                  onClick={() => void handleDeliver()}
                  disabled={delivering}
                  className="w-full py-4 rounded-xl bg-[#174BD4] text-white font-bold text-[15px] hover:bg-[#174BD4]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                >
                  {delivering
                    ? <><Loader2 className="h-4 w-4 animate-spin" /> Submitting delivery…</>
                    : <><Truck className="h-4 w-4" /> Mark as Delivered</>}
                </button>
              </div>
            )}

            {delivered && (
              <div className="rounded-xl border border-[#85DABE]/20 bg-[#85DABE]/[0.06] p-4 text-center text-sm text-[#85DABE]">
                <CheckCircle2 className="h-5 w-5 mx-auto mb-2" />
                Delivery submitted. Waiting for client approval.
              </div>
            )}

            {/* Observer */}
            {!isClient && !isFreelancer && (
              <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 flex items-start gap-3 text-xs text-zinc-500">
                <Lock className="h-4 w-4 shrink-0 mt-0.5 text-zinc-600" />
                <p>This is a public on-chain job. The {(job.amount.toNumber() / LAMPORTS_PER_SOL).toFixed(3)} SOL escrow is locked until the client releases payment after delivery.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Toast notifications */}
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </div>
  );
}