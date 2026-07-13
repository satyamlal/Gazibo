"use client";

import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { PhantomWalletAdapter, SolflareWalletAdapter } from "@solana/wallet-adapter-wallets";
import { useMemo } from "react";

import "@solana/wallet-adapter-react-ui/styles.css";

const ENDPOINT = "http://127.0.0.1:8899";

// ── Provider Component ─────────────────────────────────────────────
export function SolanaWalletProvider({ children }: { children: React.ReactNode }) {
  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter(),
    ],
    []
  );

  return (
    <ConnectionProvider endpoint={ENDPOINT}>

      {/* Layer 2: WalletProvider — manages wallet state.
          autoConnect: true = auto-reconnect on page reload if wallet was previously connected.
          Internally uses localStorage to remember the last connected wallet. */}
      <WalletProvider wallets={wallets} autoConnect>

        {/* Layer 3: WalletModalProvider — renders the wallet selection modal.
            <WalletMultiButton> components anywhere in the tree trigger this modal. */}
        <WalletModalProvider>
          {children}
        </WalletModalProvider>

      </WalletProvider>
    </ConnectionProvider>
  );
}