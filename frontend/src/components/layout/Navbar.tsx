"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import dynamic from "next/dynamic";
import { Menu, X, Settings, Sun, Moon } from "lucide-react";
import IDL from "@/idl/gazibo.json";
import { fetchProfileState } from "@/lib/rpc";
import type { ProfileState } from "@/lib/rpc";

const WalletMultiButton = dynamic(
  async () => (await import("@solana/wallet-adapter-react-ui")).WalletMultiButton,
  { ssr: false }
);

const CLIENT_SEED             = Buffer.from("client_profile");
const FREELANCER_PROFILE_SEED = Buffer.from("freelancer_profile");
const PROGRAM_ID              = new PublicKey(IDL.address);

const FREELANCER_LINKS = [
  { href: "/",                        label: "Home"                 },
  { href: "/jobs",                    label: "Marketplace"          },
  { href: "/account/freelancer/jobs", label: "My Jobs"              },
  { href: "/account/freelancer",      label: "Freelancer Dashboard" },
] as const;

const CLIENT_LINKS = [
  { href: "/",                     label: "Home"              },
  { href: "/jobs",                  label: "Marketplace"       },
  { href: "/freelancers",           label: "Find Freelancers"  },
  { href: "/account/client/jobs",   label: "Jobs Created"      },
  { href: "/account/client",        label: "Client Dashboard"  },
] as const;

const PUBLIC_LINKS = [
  { href: "/",            label: "Home"             },
  { href: "/jobs",        label: "Marketplace"      },
  { href: "/freelancers", label: "Find Freelancers" },
] as const;

type NavLink = { href: string; label: string };
type Role    = "client" | "freelancer" | "both" | "none" | "checking";

function isActive(href: string, pathname: string): boolean {
  if (href === "/")                   return pathname === "/";
  if (href === "/account/freelancer") return pathname === "/account/freelancer";
  if (href === "/account/client")     return pathname === "/account/client";
  return pathname.startsWith(href);
}

function NavItem({ href, label, pathname, onClick }: NavLink & { pathname: string; onClick?: () => void }) {
  const active = isActive(href, pathname);
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`relative px-3.5 py-2 text-[13px] font-medium rounded-lg transition-all duration-200 ${
        active
          ? "g-text"
          : "g-text-3 hover:g-text"
      }`}
      style={{
        backgroundColor: active ? "var(--ga-bg-surface)" : undefined,
      }}
    >
      {label}
      {active && (
        <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-[2px] rounded-full bg-[#85DABE]" />
      )}
    </Link>
  );
}

function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains("dark"));
  }, []);

  const toggle = () => {
    const next = !isDark;
    setIsDark(next);
    if (next) {
      document.documentElement.classList.replace("light", "dark");
      localStorage.setItem("gazibo_theme", "dark");
    } else {
      document.documentElement.classList.replace("dark", "light");
      localStorage.setItem("gazibo_theme", "light");
    }
  };

  return (
    <button
      onClick={toggle}
      className="h-9 w-9 flex items-center justify-center rounded-full border g-border transition-all duration-200 g-text-4 hover:g-text g-bg-surface"
      aria-label="Toggle theme"
    >
      {isDark
        ? <Sun  className="h-4 w-4 text-amber-400" />
        : <Moon className="h-4 w-4 text-[#174BD4]" />
      }
    </button>
  );
}

export function Navbar() {
  const pathname = usePathname();
  const { connection } = useConnection();
  const { connected, publicKey } = useWallet();

  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [role, setRole] = useState<Role>("checking");

  useEffect(() => { setMobileOpen(false); }, [pathname]);

  const handleScroll = useCallback(() => setScrolled(window.scrollY > 20), []);
  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  useEffect(() => {
    if (!connected || !publicKey) {
      setRole("checking"); return;
    }
    
    const detect = async () => {
      const [clientPda] = PublicKey.findProgramAddressSync(
        [CLIENT_SEED, publicKey.toBuffer()], PROGRAM_ID
      );
      const [freelancerPda] = PublicKey.findProgramAddressSync(
        [FREELANCER_PROFILE_SEED, publicKey.toBuffer()], PROGRAM_ID
      );
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

    fetchProfileState(connection, publicKey)
      .then(setRole)
      .catch(() => setRole("none")); // RPC failed — show public nav, don't crash
  }, [connected, publicKey, connection]);

  const navLinks: readonly NavLink[] = (() => {
    if (!connected) return PUBLIC_LINKS;
    if (role === "freelancer") return FREELANCER_LINKS;
    if (role === "client") return CLIENT_LINKS;
    if (role === "both") return CLIENT_LINKS;
    return PUBLIC_LINKS;
  })();

  return (
    <header
      className="sticky top-0 z-50 w-full transition-all duration-300"
      style={{
        backgroundColor: scrolled ? "var(--ga-bg-header)" : "transparent",
        borderBottom: scrolled ? `1px solid var(--ga-border)` : "1px solid transparent",
        backdropFilter: scrolled ? "blur(20px)" : "none",
        WebkitBackdropFilter: scrolled ? "blur(20px)" : "none",
      }}
    >
      <div className="flex h-16 items-center justify-between mx-auto max-w-7xl px-5 md:px-8">

        {/* Logo + desktop nav */}
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2.5 shrink-0">
            <span className="h-6 w-6 rounded-md bg-gradient-to-br from-[#174BD4] to-[#85DABE] flex items-center justify-center text-white font-extrabold text-xs">
              G
            </span>
            <span
              className="text-lg font-bold g-text"
              style={{ fontFamily: "var(--font-heading, var(--font-sans))" }}>
                Gazibo
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <NavItem
                key={link.href + link.label}
                href={link.href}
                label={link.label}
                pathname={pathname}
              />
            ))}
          </nav>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2">
          <div className="hidden md:block">
            <ThemeToggle />
          </div>

          {/* Settings — when connected */}
          {connected && (
            <Link
              href="/account/settings"
              className={`hidden md:flex h-9 w-9 items-center justify-center rounded-full border transition-all duration-200 ${
                pathname.startsWith("/account/settings")
                  ? "g-bg-surface g-border-mid g-text"
                  : "border-transparent g-text-4 hover:g-text g-bg-surface hover:border g-border"
              }`}
              style={{
                border: pathname.startsWith("/account/settings")
                  ? `1px solid var(--ga-border-mid)`
                  : "1px solid transparent",
                backgroundColor: "var(--ga-bg-surface)",
              }}
              aria-label="Account Settings">
              <Settings className="h-4 w-4" />
            </Link>
          )}

          {/* CTA for unconnected users */}
          {!connected && (
            <Link
              href="/connect"
              className="hidden md:inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-[13px] font-semibold bg-[#174BD4] text-white hover:bg-[#1A58F0] hover:shadow-[0_0_20px_rgba(23,75,212,0.35)] active:scale-[0.97] transition-all duration-250">
              Get Started
            </Link>
          )}

          <WalletMultiButton />

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded-lg g-text-3 hover:g-text transition-colors"
            style={{ backgroundColor: mobileOpen ? "var(--ga-bg-surface)" : undefined }}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div
          className="md:hidden border-t g-border"
          style={{ backgroundColor: "var(--ga-bg-card)", backdropFilter: "blur(20px)" }}
        >
          <nav className="flex flex-col px-5 py-4 gap-1">
            {navLinks.map((link) => (
              <NavItem
                key={link.href + link.label}
                href={link.href}
                label={link.label}
                pathname={pathname}
                onClick={() => setMobileOpen(false)}
              />
            ))}

            {connected && (
              <Link
                href="/account/settings"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium g-text-3 hover:g-text transition-all"
                style={{
                  backgroundColor: pathname.startsWith("/account/settings")
                    ? "var(--ga-bg-surface)"
                    : undefined,
                }}
              >
                <Settings className="h-4 w-4" /> Settings
              </Link>
            )}

            {/* Theme toggle in mobile */}
            <div className="px-2 pt-2 pb-1">
              <ThemeToggle />
            </div>

            {!connected && (
              <Link
                href="/connect"
                onClick={() => setMobileOpen(false)}
                className="mt-2 px-4 py-3 rounded-xl text-sm font-semibold text-center bg-[#174BD4] text-white hover:bg-[#1A58F0] transition-all"
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