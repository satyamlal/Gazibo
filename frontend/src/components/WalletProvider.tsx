"use client";

import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import "@solana/wallet-adapter-react-ui/styles.css";

const RPC_ENDPOINT = process.env.NEXT_PUBLIC_RPC_ENDPOINT ?? "http://127.0.0.1:8899";

export function AppWalletProvider({ children }: { children: React.ReactNode }) {
  return (
    <ConnectionProvider 
      endpoint={RPC_ENDPOINT}
      config = {{
        commitment: "confirmed",
        disableRetryOnRateLimit: false, // automatically Retry on rate-limit
        confirmTransactionInitialTimeout: 60_000, // 60seconds timeout for public devnet
      }}>
      <WalletProvider wallets={[]} autoConnect>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}