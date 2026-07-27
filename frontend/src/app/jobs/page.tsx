"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import type { AnchorWallet } from "@solana/wallet-adapter-react";
import { PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";
import {
  buildProgram,
  type GigOnChain,
  type FreelancerProfileAccount,
} from "@/lib/program";
import { Briefcase, Loader2, RefreshCw, ArrowRight } from "lucide-react";
import Link from "next/link";

interface JobListItem {
  publicKey: PublicKey;
  account: {
    client: PublicKey;
    freelancer: PublicKey | null;
    amount: { toNumber(): number };
    status: Record<string, Record<string, never>>;
    title: string;
    description: string;
    jobId: { toString(): string };
    createdAt: { toNumber(): number };
  };
}

const READONLY_WALLET: AnchorWallet = {
  publicKey: PublicKey.default,
  signTransaction: async () => { throw new Error("Read-only"); },
  signAllTransactions: async () => { throw new Error("Read-only"); },
};

const STATUS_STYLES: Record<string, { label: string; cls: string }> = {
  open:       { label: "Open",        cls: "bg-[#85DABE]/10 text-[#85DABE] border-[#85DABE]/20" },
  inProgress: { label: "In Progress", cls: "bg-[#174BD4]/10 text-[#174BD4] border-[#174BD4]/25" },
  delivered:  { label: "Delivered",   cls: "bg-amber-500/10 text-amber-400 border-amber-500/20" },
  completed:  { label: "Completed",   cls: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20" },
  cancelled:  { label: "Cancelled",   cls: "bg-red-500/10 text-red-400 border-red-500/20" },
};

function statusKey(status: Record<string, Record<string, never>>): string {
  return Object.keys(status)[0] ?? "open";
}

export default function JobsPage() {
  const { connection } = useConnection();
  const wallet = useWallet();

  const program = useMemo(() => {
    const aw: AnchorWallet =
      wallet.publicKey && wallet.signTransaction && wallet.signAllTransactions
        ? {
            publicKey: wallet.publicKey,
            signTransaction: wallet.signTransaction,
            signAllTransactions: wallet.signAllTransactions,
          }
        : READONLY_WALLET;
    return buildProgram(connection, aw);
  }, [connection, wallet.publicKey, wallet.signTransaction, wallet.signAllTransactions]);

  const [jobs, setJobs] = useState<JobListItem[] | null>(null);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<"open" | "all">("open");
  const [acceptingId, setAcceptingId] = useState<string | null>(null);

  const loadJobs = useCallback(async () => {
    setError("");
    try {
      const all = await program.account.jobAccount.all();
      all.sort((a, b) =>
        (b.account.createdAt as { toNumber(): number }).toNumber() -
        (a.account.createdAt as { toNumber(): number }).toNumber()
      );
      setJobs(all as unknown as JobListItem[]);
    } catch {
      setError("Couldn't load jobs. Is solana-test-validator running on localhost:8899?");
      setJobs([]);
    }
  }, [program]);

  useEffect(() => { void loadJobs(); }, [loadJobs]);

  const visibleJobs = useMemo(() => {
    if (!jobs) return [];

    // Filter by status
    let result =
      filter === "all"
        ? jobs
        : jobs.filter((j) => statusKey(j.account.status) === "open");

    // Hide a connected client's own jobs from the browse view —
    // they can't accept their own job (blocked on-chain too)
    if (wallet.publicKey) {
      result = result.filter(
        (j) => !(j.account.client as PublicKey).equals(wallet.publicKey!)
      );
    }

    return result;
  }, [jobs, filter, wallet.publicKey]);

  const handleAccept = async (job: JobListItem) => {
    if (!wallet.publicKey) return;
    const idStr = job.publicKey.toBase58();
    setAcceptingId(idStr);
    setError("");
    try {
      await program.methods
        .acceptJob()
        .accounts({ freelancer: wallet.publicKey, jobAccount: job.publicKey })
        .rpc();
      await loadJobs();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to accept job.");
    } finally {
      setAcceptingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#030712]">
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-[radial-gradient(ellipse_at_center,rgba(23,75,212,0.10)_0%,transparent_70%)]" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-5 md:px-8 py-16 md:py-20">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
          <div>
            <p className="text-xs font-bold tracking-[0.2em] text-[#85DABE] uppercase mb-3">
              Marketplace
            </p>
            <h1
              className="text-3xl md:text-4xl font-extrabold tracking-tight text-white"
              style={{ fontFamily: "var(--font-heading, var(--font-sans))" }}
            >
              Browse Jobs
            </h1>
            <p className="mt-2 text-zinc-400 text-sm">
              Live escrow-backed jobs on your local validator.
              {!wallet.connected && (
                <span className="text-[#85DABE]"> No wallet needed to browse.</span>
              )}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <div className="flex rounded-full border border-white/[0.08] bg-white/[0.02] p-1">
              {(["open", "all"] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                    filter === f
                      ? "bg-[#174BD4] text-white"
                      : "text-zinc-400 hover:text-white"
                  }`}
                >
                  {f === "open" ? "Open" : "All"}
                </button>
              ))}
            </div>
            <button
              onClick={() => void loadJobs()}
              className="h-8 w-8 flex items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.02] text-zinc-400 hover:text-white hover:bg-white/[0.06] transition-colors"
              aria-label="Refresh"
            >
              <RefreshCw className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Connect prompt for unconnected users wanting to accept */}
        {!wallet.connected && (
          <div className="mb-6 rounded-xl border border-white/[0.06] bg-white/[0.02] px-5 py-4 flex items-center justify-between gap-4">
            <p className="text-sm text-zinc-400">
              Connect a wallet to accept jobs.
            </p>
            <Link
              href="/connect"
              className="shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#85DABE] text-[#030712] text-xs font-bold hover:bg-[#A8E8D0] transition-colors"
            >
              Connect <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        )}

        {error && (
          <div className="mb-6 rounded-xl border border-red-500/20 bg-red-500/[0.06] px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        {/* Job list */}
        {jobs === null ? (
          <div className="flex items-center justify-center gap-2 py-24 text-zinc-500">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading jobs from chain…
          </div>
        ) : visibleJobs.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
            <div className="h-12 w-12 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center text-zinc-600">
              <Briefcase className="h-5 w-5" />
            </div>
            <p className="text-zinc-400 text-sm">
              {filter === "open"
                ? "No open jobs right now."
                : "No jobs have been created yet."}
            </p>
            <p className="text-zinc-600 text-xs">
              Post one from your{" "}
              <Link href="/account/client" className="text-[#85DABE] hover:underline">
                Dashboard
              </Link>
              .
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {visibleJobs.map((job) => {
              const key = statusKey(job.account.status);
              const style = STATUS_STYLES[key] ?? STATUS_STYLES.open;
              const canAccept =
                key === "open" && !!wallet.publicKey;
              const idStr = job.publicKey.toBase58();

              return (
                <div
                  key={idStr}
                  className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 md:p-6 hover:border-white/[0.10] transition-colors"
                >
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${style.cls}`}
                        >
                          {style.label}
                        </span>
                        <span className="text-[11px] font-mono text-zinc-600">
                          #{job.account.jobId.toString()}
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-white truncate">
                        {job.account.title}
                      </h3>
                      <p className="mt-1 text-sm text-zinc-400 line-clamp-2">
                        {job.account.description}
                      </p>
                      <p className="mt-3 text-[11px] font-mono text-zinc-600 truncate">
                        Client: {(job.account.client as PublicKey).toBase58()}
                      </p>
                    </div>

                    <div className="flex md:flex-col items-center md:items-end justify-between md:justify-start gap-3 shrink-0">
                      <div className="text-lg font-bold text-[#85DABE]">
                        {(job.account.amount.toNumber() / LAMPORTS_PER_SOL).toFixed(3)} SOL
                      </div>
                      {canAccept ? (
                        <button
                          onClick={() => void handleAccept(job)}
                          disabled={acceptingId === idStr}
                          className="px-4 py-2 rounded-full bg-[#174BD4] text-white text-xs font-semibold hover:bg-[#174BD4]/90 disabled:opacity-50 transition-colors whitespace-nowrap"
                        >
                          {acceptingId === idStr ? "Accepting…" : "Accept Job"}
                        </button>
                      ) : key === "open" ? (
                        <Link
                          href="/connect"
                          className="px-4 py-2 rounded-full border border-white/[0.10] text-white text-xs font-semibold hover:bg-white/[0.06] transition-colors whitespace-nowrap"
                        >
                          Connect to Accept
                        </Link>
                      ) : (
                        <Link
                          href={`/jobs/${idStr}`}
                          className="text-xs text-zinc-500 hover:text-white transition-colors whitespace-nowrap"
                        >
                          View →
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}