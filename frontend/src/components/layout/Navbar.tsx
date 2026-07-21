"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import { Menu, X } from "lucide-react";
const WalletMultiButton = dynamic(
  async () =>
    (await import("@solana/wallet-adapter-react-ui")).WalletMultiButton,
  { ssr: false }
);
const navLinks = [
  { href: "/", label: "Home" },
  { href: "/jobs", label: "Browse Jobs" },
  { href: "/account", label: "Dashboard" },
] as const;
export function Navbar() {

  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const handleScroll = useCallback(() => {
    setScrolled(window.scrollY > 20);
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  // Close mobile menu on route change
  // useEffect(() => {
  //   setMobileOpen(false);
  // }, [pathname]);

  return (
    <header
      className={`
        sticky top-0 z-50 w-full transition-all duration-300
        ${
          scrolled
            ? "bg-[#030712]/90 backdrop-blur-2xl border-b border-white/[0.08] shadow-[0_1px_20px_rgba(0,0,0,0.4)]"
            : "bg-[#030712]/60 backdrop-blur-xl border-b border-white/[0.04]"
        }
      `}
    >
      <div className="flex h-16 items-center justify-between mx-auto max-w-7xl px-5 md:px-8">
        {/* ── Left: Logo + Nav ──────────────────────────── */}
        <div className="flex items-center gap-10">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <span className="h-6 w-6 rounded-md bg-gradient-to-br from-[#174BD4] to-[#85DABE] flex items-center justify-center text-white font-extrabold text-xs">
              G
            </span>
            <span
              className="
                text-lg font-bold tracking-tight
                bg-gradient-to-r from-white via-zinc-200 to-zinc-400
                bg-clip-text text-transparent
              "
            >
              Gazibo
            </span>
          </Link>
          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`
                    relative px-3.5 py-2 text-[13px] font-medium rounded-lg
                    transition-all duration-200
                    ${
                      isActive
                        ? "text-white bg-white/[0.06]"
                        : "text-zinc-400 hover:text-white hover:bg-white/[0.04]"
                    }
                  `}
                >
                  {link.label}
                  {isActive && (
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-[2px] rounded-full bg-[#85DABE]" />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>
        {/* ── Right: CTA + Wallet + Mobile Toggle ──────── */}
        <div className="flex items-center gap-3">
          {/* Get Started CTA — only on desktop */}
          <Link
            href="/connect"
            className="
              hidden md:inline-flex items-center gap-1.5 px-4 py-2
              rounded-full text-[13px] font-semibold
              bg-[#85DABE] text-[#030712]
              hover:bg-[#A8E8D0] hover:shadow-[0_0_20px_rgba(133,218,190,0.3)]
              active:scale-[0.97]
              transition-all duration-250
            "
          >
            Get Started
          </Link>
          {/* Wallet Button */}
          <WalletMultiButton />
          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="
              md:hidden p-2 rounded-lg text-zinc-400
              hover:text-white hover:bg-white/[0.06]
              transition-colors duration-200
            "
            aria-label="Toggle navigation menu"
          >
            {mobileOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>
      {/* ── Mobile Menu Dropdown ────────────────────────── */}
      {mobileOpen && (
        <div className="md:hidden animate-slide-down border-t border-white/[0.06] bg-[#030712]/95 backdrop-blur-2xl">
          <nav className="flex flex-col px-5 py-4 gap-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`
                    px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200
                    ${
                      isActive
                        ? "text-white bg-white/[0.06]"
                        : "text-zinc-400 hover:text-white hover:bg-white/[0.04]"
                    }
                  `}
                >
                  {link.label}
                </Link>
              );
            })}
            <Link
              href="/connect"
              className="
                mt-2 px-4 py-3 rounded-xl text-sm font-semibold text-center
                bg-[#85DABE] text-[#030712]
                hover:bg-[#A8E8D0] transition-all duration-200
              "
            >
              Get Started
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}