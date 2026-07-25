"use client";

import { useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, AlertTriangle, Trash2, Loader2 } from "lucide-react";

export default function DeleteAccountPage() {
  const { publicKey, connected, disconnect } = useWallet();
  const router = useRouter();
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const address = publicKey?.toBase58() ?? "";
  const shortAddress = address ? `${address.slice(0, 6)}...${address.slice(-4)}` : "";
  const confirmTarget = address.slice(-6);
  const canDelete = confirm === confirmTarget && connected;

  const handleDelete = async () => {
    if (!canDelete) return;
    setLoading(true);
    setError("");

    try {
      localStorage.removeItem(`role_set_${address}`);
      await disconnect();
      router.push("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete account.");
      setLoading(false);
    }
  };

  if (!connected) {
    return (
      <div className="min-h-[70vh] bg-[#030712] flex items-center justify-center px-6">
        <div className="text-center">
          <p className="text-zinc-400 mb-4">Connect your wallet to manage your account.</p>
          <Link href="/connect" className="px-6 py-3 rounded-full bg-[#85DABE] text-[#030712] text-sm font-bold">
            Connect Wallet
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#030712]">
      <div className="max-w-lg mx-auto px-5 md:px-8 py-16">

        <div className="flex items-center gap-3 mb-10">
          <Link href="/account/settings" className="text-zinc-500 hover:text-white transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Delete Account</h1>
        </div>

        {/* Warning box */}
        <div className="rounded-2xl border border-amber-500/20 bg-amber-500/[0.06] p-5 mb-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-2 text-sm text-amber-200/80">
              <p className="font-semibold text-amber-300">Read before proceeding</p>
              <p>Your on-chain transaction history <strong className="text-white">cannot be deleted</strong>. The Solana ledger is permanent — all past job records remain visible forever.</p>
              <p>What can be removed: your profile accounts (reclaims rent SOL back to your wallet). This is not yet implemented — this button will clear your local session for now.</p>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-5 rounded-xl border border-red-500/20 bg-red-500/[0.06] px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 space-y-5">
          <div>
            <p className="text-sm text-zinc-400 mb-1">Wallet to be disconnected:</p>
            <p className="font-mono text-sm text-white break-all">{address}</p>
          </div>

          <div>
            <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2 block">
              Type the last 6 characters of your address to confirm
            </label>
            <p className="text-xs text-zinc-600 mb-2 font-mono">Expected: <span className="text-zinc-400">{confirmTarget}</span></p>
            <input
              type="text"
              placeholder={confirmTarget}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white placeholder:text-zinc-700 text-sm font-mono focus:outline-none focus:border-red-500/40 transition-colors"
            />
          </div>

          <button
            onClick={() => void handleDelete()}
            disabled={!canDelete || loading}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-red-500/80 text-white font-bold text-sm hover:bg-red-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> Processing…</>
            ) : (
              <><Trash2 className="h-4 w-4" /> Disconnect & Clear Profile</>
            )}
          </button>
        </div>

        <p className="mt-4 text-center text-xs text-zinc-700">
          On-chain account closure (rent reclaim) will be added in a future update.
        </p>
      </div>
    </div>
  );
}