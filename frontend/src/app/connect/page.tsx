"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";

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
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="w-400">
          <CardHeader>
            <CardTitle>Welcome to Gazibo</CardTitle>
            <CardDescription>Blockchain connection required.</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
             <p className="text-sm text-slate-500">Please use the button in the Navbar to link your wallet.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Card className="w-400">
        <CardHeader>
          <CardTitle>Initialize Profile</CardTitle>
          <CardDescription>Allocate on-chain memory to register your identity and start creating jobs.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="bg-slate-100 p-3 rounded-md text-xs truncate font-mono border">
            Address: {publicKey?.toBase58()}
          </div>
          <Button onClick={initializeProfile} disabled={loading} className="w-full">
            {loading ? "Confirming on Network..." : "Register Profile on Solana"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}