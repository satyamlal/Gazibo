"use client";

import { useEffect, useState } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useRouter } from "next/navigation";
import { PublicKey } from "@solana/web3.js";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import IDL from "@/idl/gazibo.json";

const CLIENT_SEED = Buffer.from("client_profile");
const FREELANCER_SEED = Buffer.from("freelancer_profile");
const PROGRAM_ID = new PublicKey(IDL.address);

export default function AccountPage() {
  const { connected, publicKey } = useWallet();
  const { connection } = useConnection();
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "no-wallet" | "no-profile" | "redirecting">("loading");

  useEffect(() => {
    if (!connected || !publicKey) {
      setStatus("no-wallet");
      return;
    }

    const checkAndRedirect = async () => {
      setStatus("loading");

      const [clientPda] = PublicKey.findProgramAddressSync(
        [CLIENT_SEED, publicKey.toBuffer()], PROGRAM_ID
      );
      const [freelancerPda] = PublicKey.findProgramAddressSync(
        [FREELANCER_SEED, publicKey.toBuffer()], PROGRAM_ID
      );

      const [clientInfo, freelancerInfo] = await Promise.all([
        connection.getAccountInfo(clientPda),
        connection.getAccountInfo(freelancerPda),
      ]);

      setStatus("redirecting");

      if (clientInfo && freelancerInfo) {
        router.replace("/account/client"); // Both: default to client
      } else if (clientInfo) {
        router.replace("/account/client");
      } else if (freelancerInfo) {
        router.replace("/account/freelancer");
      } else {
        // No profile — stay here, RoleModal will auto-show
        setStatus("no-profile");
      }
    };

    checkAndRedirect().catch(() => setStatus("no-profile"));
  }, [connected, publicKey, connection, router]);

  // No wallet connected
  if (status === "no-wallet") {
    return (
      <div className="min-h-[70vh] bg-[#030712] flex items-center justify-center px-6">
        <div className="text-center">
          <p className="text-zinc-400 mb-4">Connect your wallet to access your dashboard.</p>
          <Link href="/connect" className="px-6 py-3 rounded-full bg-[#85DABE] text-[#030712] text-sm font-bold hover:bg-[#A8E8D0] transition-colors">
            Connect Wallet
          </Link>
        </div>
      </div>
    );
  }

  // No profile yet — spinner only, RoleModal handles the rest
  if (status === "no-profile") {
    return (
      <div className="min-h-[70vh] bg-[#030712] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-6 w-6 animate-spin text-[#85DABE] mx-auto mb-3" />
          <p className="text-sm text-zinc-400">Preparing your workspace…</p>
          <p className="text-xs text-zinc-700 mt-1">Choose a role in the overlay above.</p>
        </div>
      </div>
    );
  }

  // Loading / redirecting — just show spinner
  return (
    <div className="min-h-[70vh] bg-[#030712] flex items-center justify-center">
      <div className="flex items-center gap-2 text-zinc-500">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span className="text-sm">Loading your profile…</span>
      </div>
    </div>
  );
}