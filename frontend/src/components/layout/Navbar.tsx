"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import dynamic from "next/dynamic";
import { Menu, X, Settings, LayoutDashboard } from "lucide-react";
import IDL from "@/idl/gazibo.json";

const WalletMultiButton = dynamic(
  async () => (await import("@solana/wallet-adapter-react-ui")).WalletMultiButton,
  { ssr: false }
);

const CLIENT_SEED = Buffer.from("client_profile");
const FREELANCER_SEED = Buffer.from("freelancer_profile");
const PROGRAM_ID = new PublicKey(IDL.address);

// Only public pages
const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/jobs", label: "Browse Jobs" },
] as const;

export function Navbar() {
  const pathname = usePathname();
  const { connection } = useConnection();
  const { connected, publicKey } = useWallet();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [role, setRole] = useState<"client" | "freelancer" | "both" | "none" | "checking">("checking");

  const handleScroll = useCallback(() => setScrolled(window.scrollY > 20), []);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  // Detects which PDA(s) exist so the Dashboard button routes correctly
  useEffect(() => {
    if (!connected || !publicKey) {
      setRole("checking");
      return;
    }
    const detect = async () => {
      const [clientPda] = PublicKey.findProgramAddressSync([CLIENT_SEED, publicKey.toBuffer()], PROGRAM_ID);
      const [freelancerPda] = PublicKey.findProgramAddressSync([FREELANCER_SEED, publicKey.toBuffer()], PROGRAM_ID);
      const [ci, fi] = await Promise.all([
        connection.getAccountInfo(clientPda),
        connection.getAccountInfo(freelancerPda),
      ]);
      if (ci && fi) setRole("both");
      else if (ci) setRole("client");
      else if (fi) setRole("freelancer");
      else setRole("none");
    };
    detect().catch(() => setRole("none"));
  }, [connected, publicKey, connection]);

  const dashboardHref = () => {
    if (!connected) return "/connect";
    if (role === "client" || role === "both") return "/account/client";
    if (role === "freelancer") return "/account/freelancer";
    return "/account";
  };

  return (
    <header className={`sticky top-0 z-50 w-full transition-all duration-300 ${
      scrolled
        ? "bg-[#030712]/90 backdrop-blur-2xl border-b border-white/[0.08]"
        : "bg-[#030712]/60 backdrop-blur-xl border-b border-white/[0.04]"
    }`}>
      <div className="flex h-16 items-center justify-between mx-auto max-w-7xl px-5 md:px-8">

        {/* Logo + public nav links */}
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="h-6 w-6 rounded-md bg-gradient-to-br from-[#174BD4] to-[#85DABE] flex items-center justify-center text-white font-extrabold text-xs">G</span>
            <span className="text-lg font-bold tracking-tight bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">Gazibo</span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link key={link.href} href={link.href}
                  className={`relative px-3.5 py-2 text-[13px] font-medium rounded-lg transition-all duration-200 ${
                    isActive ? "text-white bg-white/[0.06]" : "text-zinc-400 hover:text-white hover:bg-white/[0.04]"
                  }`}
                >
                  {link.label}
                  {isActive && <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-[2px] rounded-full bg-[#85DABE]" />}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-2">

          {connected ? (
            <>
              {/* Dashboard — routes directly to the role page */}
              <Link
                href={dashboardHref()}
                className={`hidden md:inline-flex items-center gap-2 px-4 py-2 rounded-full text-[13px] font-semibold transition-all duration-250 ${
                  pathname.startsWith("/account")
                    ? "bg-white/[0.08] text-white border border-white/[0.12]"
                    : "text-zinc-400 hover:text-white hover:bg-white/[0.04]"
                }`}
              >
                <LayoutDashboard className="h-3.5 w-3.5" />
                {role === "freelancer" ? "My Workspace" : "Dashboard"}
              </Link>

              {/* Account Settings */}
              <Link
                href="/account/settings"
                className={`hidden md:flex h-9 w-9 items-center justify-center rounded-full border transition-colors duration-200 ${
                  pathname.startsWith("/account/settings")
                    ? "bg-white/[0.08] border-white/[0.15] text-white"
                    : "border-white/[0.08] bg-white/[0.02] text-zinc-400 hover:text-white hover:bg-white/[0.06]"
                }`}
                aria-label="Account Settings"
              >
                <Settings className="h-4 w-4" />
              </Link>
            </>
          ) : (
            <Link href="/connect"
              className="hidden md:inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-[13px] font-semibold bg-[#85DABE] text-[#030712] hover:bg-[#A8E8D0] hover:shadow-[0_0_20px_rgba(133,218,190,0.3)] active:scale-[0.97] transition-all duration-250"
            >
              Get Started
            </Link>
          )}

          <WalletMultiButton />

          <button onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-white/[0.06] transition-colors"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-white/[0.06] bg-[#030712]/95 backdrop-blur-2xl">
          <nav className="flex flex-col px-5 py-4 gap-1">
            {NAV_LINKS.map((link) => (
              <Link key={link.href} href={link.href} onClick={() => setMobileOpen(false)}
                className={`px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  pathname === link.href ? "text-white bg-white/[0.06]" : "text-zinc-400 hover:text-white hover:bg-white/[0.04]"
                }`}
              >
                {link.label}
              </Link>
            ))}
            {connected && (
              <>
                <Link href={dashboardHref()} onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium text-zinc-400 hover:text-white hover:bg-white/[0.04] transition-all"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  {role === "freelancer" ? "My Workspace" : "Dashboard"}
                </Link>
                <Link href="/account/settings" onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium text-zinc-400 hover:text-white hover:bg-white/[0.04] transition-all"
                >
                  <Settings className="h-4 w-4" />
                  Account Settings
                </Link>
              </>
            )}
            {!connected && (
              <Link href="/connect" onClick={() => setMobileOpen(false)}
                className="mt-2 px-4 py-3 rounded-xl text-sm font-semibold text-center bg-[#85DABE] text-[#030712] hover:bg-[#A8E8D0] transition-all"
              >
                Get Started
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}