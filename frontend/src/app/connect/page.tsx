"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";
import { ShieldCheck, Cpu } from "lucide-react";

export default function ConnectSignupPage() {
  const { publicKey, connected } = useWallet();
  const [loading, setLoading] = useState(false);

  const initializeProfile = async () => {
    if (!publicKey) return;
    setLoading(true);
    try {
      console.log("Trigger: program.methods.initializeClient().rpc()");
      
      await new Promise(resolve => setTimeout(resolve, 1500));
      alert("Profile Initialized on Chain!");
    } catch (error) {
      console.error("Initialization transaction failed", error);
    } finally {
      setLoading(false);
    }
  };

  if (!connected) {
    return (
      <div className="flex items-center justify-center min-h-[80vh] bg-[#030712] px-6">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[#174BD4]/10 rounded-full blur-[100px] pointer-events-none" />
        <Card className="w-full max-w-[420px] bg-zinc-950/40 border-white/10 backdrop-blur-md relative z-10">
          <CardHeader className="space-y-1">
            <div className="h-10 w-10 rounded-xl bg-[#174BD4]/15 border border-[#174BD4]/30 flex items-center justify-center text-[#85DABE] mb-2">
              <Cpu className="h-5 w-5" />
            </div>
            <CardTitle className="text-2xl font-bold tracking-tight text-white">Welcome to Gazibo</CardTitle>
            <CardDescription className="text-zinc-400">Blockchain connection required to verify cryptographic state.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed text-zinc-500 mb-6">
              To continue setting up your decentralized freelance account, please link your hardware or browser wallet using the action button found inside the top header.
            </p>
            <div className="rounded-xl bg-zinc-900/50 border border-white/5 p-4 flex gap-3 items-start">
              <ShieldCheck className="h-5 w-5 text-[#85DABE] shrink-0 mt-0.5" />
              <p className="text-xs text-zinc-400 leading-relaxed">
                All workspace logs and transaction operations are signed and settled securely on top of the Solana network. We never have custody over your keys.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-[80vh] bg-[#030712] px-6">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[#174BD4]/10 rounded-full blur-[100px] pointer-events-none" />
      <Card className="w-full max-w-[420px] bg-zinc-950/40 border-white/10 backdrop-blur-md relative z-10">
        <CardHeader className="space-y-1">
          <div className="h-10 w-10 rounded-xl bg-[#174BD4]/15 border border-[#174BD4]/30 flex items-center justify-center text-[#85DABE] mb-2">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight text-white">Initialize Profile</CardTitle>
          <CardDescription className="text-zinc-400">
            Allocate on-chain memory to register your identity and start creating jobs.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          <div className="bg-zinc-900/80 p-3.5 rounded-xl text-xs truncate font-mono border border-white/5 text-[#85DABE] flex items-center justify-between">
            <span className="text-zinc-500">ADDR:</span>
            <span className="truncate max-w-[200px]">{publicKey?.toBase58()}</span>
          </div>
          <Button 
            onClick={initializeProfile} 
            disabled={loading} 
            className="w-full h-12 rounded-full bg-[#174BD4] text-white font-semibold hover:bg-[#174BD4]/90 hover:shadow-[0_0_15px_rgba(23,75,212,0.3)] transition-all duration-200"
          >
            {loading ? "Confirming on Network..." : "Register Profile on Solana"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}