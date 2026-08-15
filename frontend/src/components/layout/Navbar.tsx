"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import dynamic from "next/dynamic";
import { Menu, X, Sun, Moon, Settings, LayoutDashboard } from "lucide-react";
import { fetchProfileState } from "@/lib/rpc";
import type { ProfileState } from "@/lib/rpc";

const WalletMultiButton = dynamic(
  async () => (await import("@solana/wallet-adapter-react-ui")).WalletMultiButton,
  { ssr: false }
);

// Nav links
const FREELANCER_LINKS = [
  { href: "/", label: "Home" },
  { href: "/jobs", label: "Marketplace" },
  { href: "/account/freelancer/jobs", label: "My Jobs" },
] as const;

const CLIENT_LINKS = [
  { href: "/", label: "Home" },
  { href: "/jobs", label: "Marketplace" },
  { href: "/freelancers", label: "Find Freelancers" },
  { href: "/account/client/jobs", label: "Jobs Created" },
] as const;

const PUBLIC_LINKS = [
  { href: "/", label: "Home" },
  { href: "/jobs", label: "Marketplace" },
  { href: "/freelancers", label: "Find Freelancers" },
] as const;

type NavLink = { href: string; label: string };

function isActive(href: string, pathname: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname.startsWith(href);
}

// NavItem
function NavItem({
  href, label, pathname, onClick,
}: NavLink & { pathname: string; onClick?: () => void }) {
  const active = isActive(href, pathname);
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`relative px-3.5 py-2 text-[13px] font-medium rounded-lg transition-all duration-200 ${
        active ? "g-text" : "g-text-3 hover:g-text"
      }`}
      style={{ backgroundColor: active ? "var(--ga-bg-surface)" : undefined }}
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
      className="h-9 w-9 flex items-center justify-center rounded-full border g-border g-bg-surface g-text-4 hover:g-text transition-all duration-200"
      aria-label="Toggle theme"
    >
      {isDark
        ? <Sun className="h-4 w-4 text-amber-400" />
        : <Moon className="h-4 w-4 text-[#174BD4]" />}
    </button>
  );
}

function DashboardButton({ role }: { role: ProfileState | "checking" }) {
  if (role === "client" || role === "both") {
    return (
      <Link
        href="/account/client"
        className="hidden md:inline-flex items-center gap-2 px-4 py-2 rounded-full text-[13px] font-semibold bg-[#174BD4] text-white hover:bg-[#1A58F0] hover:shadow-[0_0_20px_rgba(23,75,212,0.35)] active:scale-[0.97] transition-all duration-200"
      >
        <LayoutDashboard className="h-3.5 w-3.5" />
        Client Dashboard
      </Link>
    );
  }
  if (role === "freelancer") {
    return (
      <Link
        href="/account/freelancer"
        className="hidden md:inline-flex items-center gap-2 px-4 py-2 rounded-full text-[13px] font-semibold bg-[#85DABE] text-[#030712] hover:bg-[#A8E8D0] hover:shadow-[0_0_20px_rgba(133,218,190,0.35)] active:scale-[0.97] transition-all duration-200"
      >
        <LayoutDashboard className="h-3.5 w-3.5" />
          Freelancer Dashboard
      </Link>
    );
  }
  return null;
}

export function Navbar() {
  const pathname = usePathname();
  const { connection } = useConnection();
  const { connected, publicKey } = useWallet();

  const [scrolled,   setScrolled]   = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [role, setRole] = useState<ProfileState | "checking">("checking");

  useEffect(() => { setMobileOpen(false); }, [pathname]);

  const handleScroll = useCallback(() => setScrolled(window.scrollY > 20), []);
  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  useEffect(() => {
    if (!connected || !publicKey) { setRole("checking"); return; }
    fetchProfileState(connection, publicKey)
      .then(setRole)
      .catch(() => setRole("none"));
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
        borderBottom: scrolled ? "1px solid var(--ga-border)" : "1px solid transparent",
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
              style={{ fontFamily: "var(--font-heading, var(--font-sans))" }}
            >
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

        <div className="flex items-center gap-2">
          <div className="hidden md:block">
            <ThemeToggle />
          </div>

          {connected && <DashboardButton role={role} />}

          {/* Get Started — only for non-connected visitors */}
          {!connected && (
            <Link
              href="/connect"
              className="hidden md:inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-[13px] font-semibold bg-[#174BD4] text-white hover:bg-[#1A58F0] hover:shadow-[0_0_20px_rgba(23,75,212,0.35)] active:scale-[0.97] transition-all duration-250"
            >
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

            {/* Dashboard link in mobile */}
            {connected && (role === "client" || role === "both") && (
              <Link
                href="/account/client"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold text-[#174BD4] hover:bg-[#174BD4]/[0.08] transition-all"
              >
                <LayoutDashboard className="h-4 w-4" /> Client Dashboard
              </Link>
            )}
            {connected && role === "freelancer" && (
              <Link
                href="/account/freelancer"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold text-[#85DABE] hover:bg-[#85DABE]/[0.08] transition-all"
              >
                <LayoutDashboard className="h-4 w-4" /> Freelancer Dashboard
              </Link>
            )}

            {/* Settings — kept in mobile only */}
            {connected && (
              <Link
                href="/account/settings"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium g-text-4 hover:g-text transition-all"
                style={{
                  backgroundColor: pathname.startsWith("/account/settings")
                    ? "var(--ga-bg-surface)" : undefined,
                }}
              >
                <Settings className="h-4 w-4" /> Settings
              </Link>
            )}

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