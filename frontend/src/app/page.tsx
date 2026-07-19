"use client";

import Link from "next/link";
import { FaGithub } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import {
  ArrowRight,
  ShieldCheck,
  Cpu,
  Zap,
  Clock,
  DollarSign,
  Award,
  Lock,
} from "lucide-react";

const SOCIAL_LINKS = [
  {
    name: "Twitter",
    href: "#",
    icon: FaXTwitter,
  },
  {
    name: "Github",
    href: "#",
    icon: FaGithub,
  },
];

export default function HomePage() {
  return (
    <div className="relative min-h-screen bg-[#030712] text-zinc-100 selection:bg-[#85DABE] selection:text-[#030712]">
      {/* ── Background Effects ─────────────────────────── */}
      <div className="pointer-events-none fixed inset-0 z-0">
        {/* Primary radial glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-250 h-150 bg-[radial-gradient(ellipse_at_center,rgba(23,75,212,0.12)_0%,transparent_70%)]" />
        {/* Secondary accent glow */}
        <div className="absolute top-50 right-[10%] w-100 h-100 bg-[radial-gradient(circle,rgba(133,218,190,0.06)_0%,transparent_70%)]" />
        {/* Grid mesh pattern */}
        <div className="absolute inset-0 bg-grid-pattern opacity-40" />
      </div>

      <div className="relative z-10">
        {/* ═══════════════════════════════════════════════
            SECTION 1 — Hero
            ═══════════════════════════════════════════════ */}
        <section className="max-w-7xl mx-auto px-5 md:px-8 pt-20 pb-16 md:pt-28 md:pb-24 text-center">
          
          {/* Announcement Badge */}
          <div
            className="
              inline-flex items-center gap-2 px-4 py-1.5 rounded-full
              border border-white/8 bg-white/3 backdrop-blur-sm
              text-xs font-medium tracking-wide text-zinc-300
              mb-8 animate-fade-in-up
            "
          >
            <span className="flex h-2 w-2 rounded-full bg-[#85DABE] animate-glow-pulse" />
            <span className="text-[#85DABE] font-semibold">Built on Solana</span>
            <span className="text-zinc-600">•</span>
            <span>400ms Finality · Zero Custody</span>
          </div>

          {/* Headline */}
          <h1
            className="
              text-4xl sm:text-5xl md:text-6xl lg:text-7xl
              font-extrabold tracking-tight
              max-w-5xl mx-auto leading-[1.08] mb-7
              animate-fade-in-up
            "
            style={{ fontFamily: "var(--font-heading, var(--font-sans))" }}
          >
          The Trustless Workspace
            <br className="hidden sm:block" />{" "}
            For{" "}
            <span
              className="
                bg-gradient-to-r from-white via-[#85DABE] to-[#174BD4]
                bg-clip-text text-transparent
              "
            >
              Elite Builders
            </span>
          </h1>
          {/* Subtitle */}
          <p
            className="
              text-zinc-400 text-base sm:text-lg md:text-xl
              max-w-2xl mx-auto mb-10 leading-relaxed
              animate-fade-in-up animation-delay-200
            "
          >
          Eliminate 20% platform fees forever. Secure instant smart-contract
            escrow payments, gas-free milestones, and immutable on-chain
            reputation — all on Solana.
          </p>
        {/* CTA Buttons */}
          <div
            className="
              flex flex-col sm:flex-row items-center justify-center gap-4
              animate-fade-in-up animation-delay-400
            "
          >
            <Link
              href="/connect"
              className="
                group w-full sm:w-auto px-8 py-3.5 rounded-full
                bg-[#85DABE] text-[#030712] font-semibold text-[15px]
                flex items-center justify-center gap-2
                hover:bg-[#A8E8D0] hover:shadow-[0_0_24px_rgba(133,218,190,0.35)]
                active:scale-[0.97]
                transition-all duration-300
              "
            >
              Get Started Free
              <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
            </Link>
            <Link
              href="/jobs"
              className="
                w-full sm:w-auto px-8 py-3.5 rounded-full
                border border-white/[0.1] bg-white/3 text-white font-semibold text-[15px]
                flex items-center justify-center gap-2
                hover:bg-white/[0.07] hover:border-white/[0.18]
                transition-all duration-300
              "
            >
              Browse Active Jobs
            </Link>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════
            SECTION 2 — Social Proof / Stats Bar
            ═══════════════════════════════════════════════ */}
        <section className="border-y border-white/[0.05]">
          <div className="max-w-7xl mx-auto px-5 md:px-8 py-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
              {[
                {
                  icon: DollarSign,
                  value: "0%",
                  label: "Platform Fees",
                },
                {
                  icon: Clock,
                  value: "~400ms",
                  label: "Settlement Speed",
                },
                {
                  icon: Lock,
                  value: "Trustless",
                  label: "Smart Escrow",
                },
                {
                  icon: Award,
                  value: "Immutable",
                  label: "On-Chain Reputation",
                },
              ].map((stat, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-3 justify-center md:justify-start"
                >
                  <div
                    className="
                      h-9 w-9 rounded-lg
                      bg-[#174BD4]/10 border border-[#174BD4]/15
                      flex items-center justify-center
                      text-[#85DABE]
                    "
                  >
                    <stat.icon className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white">{stat.value}</div>
                    <div className="text-[11px] text-zinc-500 font-medium">
                      {stat.label}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════
            SECTION 3 — Why Gazibo (Competitive Comparison)
            ═══════════════════════════════════════════════ */}
        <section className="max-w-7xl mx-auto px-5 md:px-8 py-20 md:py-28">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left — Copy */}
            <div>
              <div className="text-xs font-bold tracking-[0.2em] text-[#85DABE] uppercase mb-4">
                Why Gazibo
              </div>
              <h2
                className="text-3xl md:text-4xl lg:text-[2.75rem] font-extrabold tracking-tight text-white mb-6 leading-tight"
                style={{ fontFamily: "var(--font-heading, var(--font-sans))" }}
              >
                Finally, a Work Protocol
                <br />
                That Works{" "}
                <span className="text-[#85DABE]">For You</span>
              </h2>
              <p className="text-zinc-400 text-base md:text-lg mb-8 leading-relaxed max-w-lg">
                Traditional platforms take up to 20% of your earnings and hold
                your money hostage for days. Gazibo uses Solana smart contracts
                to deliver instant, zero-fee settlements with full transparency.
              </p>
              <div className="space-y-3.5">
                {[
                  "Instant Smart Contract Escrow Release",
                  "0% Platform Commission — Ever",
                  "Decentralized Dispute Resolution",
                  "Immutable Professional Reputation",
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <div
                      className="
                        h-5 w-5 rounded-full shrink-0
                        bg-[#85DABE]/10 border border-[#85DABE]/20
                        flex items-center justify-center
                      "
                    >
                      <ShieldCheck className="h-3 w-3 text-[#85DABE]" />
                    </div>
                    <span className="text-sm font-medium text-zinc-300">
                      {item}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            {/* Right — Comparison Table */}
            <div
              className="
                border border-white/[0.08] rounded-2xl
                bg-[#0A0F1E]/60 backdrop-blur-sm
                p-5 md:p-7 space-y-3
              "
            >
              {/* Table Header */}
              <div className="flex justify-between items-center pb-4 border-b border-white/[0.06]">
                <span className="text-[11px] font-mono font-bold text-zinc-500 uppercase tracking-wider">
                  Platform Comparison
                </span>
                <span className="text-[11px] font-mono font-semibold text-[#85DABE] tracking-wide">
                  Solana L1
                </span>
              </div>
              {[
                {
                  rank: "01",
                  name: "Gazibo (Solana)",
                  speed: "Instant",
                  fees: "≈ 0.00005 SOL",
                  active: true,
                },
                {
                  rank: "02",
                  name: "Traditional Upwork",
                  speed: "3-5 Days",
                  fees: "Up to 20%",
                  active: false,
                },
                {
                  rank: "03",
                  name: "Ethereum dApps",
                  speed: "~15 Min",
                  fees: "$15-$40 Gas",
                  active: false,
                },
                {
                  rank: "04",
                  name: "Bank Wire Transfer",
                  speed: "3-7 Days",
                  fees: "$25-$50 Fee",
                  active: false,
                },
              ].map((row, idx) => (
                <div
                  key={idx}
                  className={`
                    flex items-center justify-between p-4 rounded-xl border
                    transition-all duration-250
                    ${
                      row.active
                        ? "bg-[#174BD4]/8 border-[#174BD4]/30 shadow-[0_0_20px_rgba(23,75,212,0.08)] animate-border-glow"
                        : "bg-white/[0.02] border-white/[0.04] hover:border-white/[0.08]"
                    }
                  `}
                >
                  <div className="flex items-center gap-3.5">
                    <span
                      className={`text-[11px] font-mono font-bold ${
                        row.active ? "text-[#85DABE]" : "text-zinc-600"
                      }`}
                    >
                      {row.rank}
                    </span>
                    <span
                      className={`text-sm font-semibold ${
                        row.active ? "text-white" : "text-zinc-300"
                      }`}
                    >
                      {row.name}
                    </span>
                    {row.active && (
                      <span className="hidden sm:inline-flex text-[9px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full bg-[#85DABE]/10 text-[#85DABE] border border-[#85DABE]/20">
                        Best
                      </span>
                    )}
                  </div>
                  <div className="text-right">
                    <div
                      className={`text-xs font-bold ${
                        row.active ? "text-[#85DABE]" : "text-white"
                      }`}
                    >
                      {row.speed}
                    </div>
                    <div className="text-[10px] font-mono text-zinc-500">
                      {row.fees}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════
            SECTION 4 — How It Works (Step Flow)
            ═══════════════════════════════════════════════ */}
        <section className="border-t border-white/[0.05]">
          <div className="max-w-7xl mx-auto px-5 md:px-8 py-20 md:py-28 text-center">
            <div className="text-xs font-bold tracking-[0.2em] text-[#85DABE] uppercase mb-4">
              Simple Workflow
            </div>
            <h2
              className="text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight mb-5"
              style={{ fontFamily: "var(--font-heading, var(--font-sans))" }}
            >
              How It Works
            </h2>

            <p className="text-zinc-400 text-base md:text-lg max-w-2xl mx-auto mb-16">
              Three steps. Zero middlemen. Cryptographically guaranteed outcomes.
            </p>

            {/* Steps */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-0 relative">
              {/* Connecting line — desktop only */}
              <div className="hidden md:block absolute top-12 left-[20%] right-[20%] h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />
              {[
                {
                  step: "01",
                  title: "Connect Wallet",
                  desc: "Link your Solana wallet, verify your cryptographic identity, and create your on-chain profile in seconds.",
                  icon: Zap,
                },
                {
                  step: "02",
                  title: "Post or Accept Jobs",
                  desc: "Create a gig with escrowed funds, or browse open jobs and accept work — all backed by smart contracts.",
                  icon: Cpu,
                },
                {
                  step: "03",
                  title: "Instant Payout",
                  desc: "Submit deliverables, get verified, and receive instant payment. No waiting. No intermediaries.",
                  icon: ShieldCheck,
                },
              ].map((item, idx) => (
                <div key={idx} className="relative flex flex-col items-center">
                  {/* Step Number Circle */}
                  <div
                    className="
                      relative z-10 h-14 w-14 rounded-full mb-6
                      bg-[#0A0F1E] border-2 border-white/[0.08]
                      flex items-center justify-center
                      text-sm font-bold text-zinc-400
                      transition-all duration-300
                      hover:border-[#85DABE]/30 hover:text-[#85DABE]
                      hover:shadow-[0_0_20px_rgba(133,218,190,0.1)]
                    "
                  >
                    {item.step}
                  </div>
                  {/* Card */}
                  <div
                    className="
                      group w-full max-w-xs p-6 rounded-2xl
                      border border-white/[0.05] bg-white/[0.02]
                      hover:border-[#174BD4]/20 hover:bg-white/[0.04]
                      transition-all duration-300
                    "
                  >
                    <div
                      className="
                        h-10 w-10 rounded-xl mx-auto mb-4
                        bg-[#174BD4]/10 border border-[#174BD4]/15
                        flex items-center justify-center text-[#85DABE]
                        group-hover:scale-110 transition-transform duration-300
                      "
                    >
                      <item.icon className="h-5 w-5" />
                    </div>
                    <h3
                      className="text-base font-bold text-white mb-2"
                      style={{ fontFamily: "var(--font-heading, var(--font-sans))" }}
                    >
                      {item.title}
                    </h3>
                    <p className="text-sm text-zinc-400 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════
            SECTION 5 — CTA Banner (Fiverr-inspired)
            ═══════════════════════════════════════════════ */}
        <section className="max-w-7xl mx-auto px-5 md:px-8 py-8 md:py-12">
          <div
            className="
              relative overflow-hidden rounded-3xl
              border border-white/[0.08]
              bg-gradient-to-br from-[#0A0F1E] via-[#0f1a3a] to-[#0A0F1E]
              px-8 py-16 md:px-16 md:py-24 text-center
            "
          >
            {/* Background glow orbs */}
            <div className="absolute -top-20 -left-20 w-72 h-72 bg-[#174BD4]/10 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute -bottom-20 -right-20 w-72 h-72 bg-[#85DABE]/8 rounded-full blur-[100px] pointer-events-none" />
            <h2
              className="
                relative z-10 text-3xl md:text-4xl lg:text-5xl
                font-extrabold tracking-tight mb-5
                max-w-3xl mx-auto leading-tight
              "
              style={{ fontFamily: "var(--font-heading, var(--font-sans))" }}
            >
              Decentralized Services at Your{" "}
              <span className="text-[#85DABE] italic font-normal" style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
                Fingertips
              </span>
            </h2>
            <p className="relative z-10 text-zinc-400 text-sm md:text-base max-w-xl mx-auto mb-10">
              Create an immutable Solana-based contract and start onboarding top
              engineers today. Zero middleman custody risk.
            </p>
            <Link
              href="/connect"
              className="
                relative z-10 inline-flex items-center gap-2
                px-8 py-3.5 rounded-full
                bg-white text-[#030712] font-bold text-[15px]
                hover:bg-zinc-100 hover:shadow-[0_0_30px_rgba(255,255,255,0.12)]
                active:scale-[0.97]
                transition-all duration-300
              "
            >
              Launch Gazibo App
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════
            SECTION 6 — Footer (DevStudio-inspired)
            ═══════════════════════════════════════════════ */}
        <footer className="relative border-t border-white/[0.05] bg-[#030712] pt-16 md:pt-20 pb-10 overflow-hidden">
          <div className="max-w-7xl mx-auto px-5 md:px-8">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-8 md:gap-10 mb-14 relative z-10">
              {/* Brand Column */}
              <div className="col-span-2">
                <Link href="/" className="flex items-center gap-2.5 mb-5">
                  <span className="h-6 w-6 rounded-md bg-gradient-to-br from-[#174BD4] to-[#85DABE] flex items-center justify-center text-white font-extrabold text-xs">
                    G
                  </span>
                  <span className="text-lg font-bold text-white">Gazibo</span>
                </Link>
                <p className="text-zinc-500 text-sm max-w-xs mb-5 leading-relaxed">
                  The trustless workspace protocol for modern Web3 builders.
                  Build, earn, and get paid — directly on Solana.
                </p>
                {/* Social Links */}
                <div className="flex items-center gap-3">
                  {SOCIAL_LINKS.map((link) => (
                    <a
                      key={link.name}
                      href={link.href}
                      className="h-8 w-8 rounded-lg bg-white/[0.04] border border-white/[0.06] flex items-center justify-center text-zinc-500 hover:text-white hover:bg-white/[0.08] transition-all duration-200"
                      aria-label={link.name}
                    >
                      <link.icon className="h-3.5 w-3.5" />
                    </a>
                  ))}
                </div>
              </div>
              {/* Link Columns */}
              <div>
                <div className="text-[11px] font-bold text-zinc-400 mb-4 uppercase tracking-[0.15em]">
                  Platform
                </div>
                <ul className="space-y-2.5">
                  <li>
                    <Link
                      href="/jobs"
                      className="text-sm text-zinc-500 hover:text-white transition-colors duration-200"
                    >
                      Browse Jobs
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/connect"
                      className="text-sm text-zinc-500 hover:text-white transition-colors duration-200"
                    >
                      Get Started
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/account"
                      className="text-sm text-zinc-500 hover:text-white transition-colors duration-200"
                    >
                      Dashboard
                    </Link>
                  </li>
                </ul>
              </div>
              <div>
                <div className="text-[11px] font-bold text-zinc-400 mb-4 uppercase tracking-[0.15em]">
                  Protocol
                </div>
                <ul className="space-y-2.5">
                  <li>
                    <span className="text-sm text-zinc-600 cursor-default">
                      Smart Escrows
                    </span>
                  </li>
                  <li>
                    <span className="text-sm text-zinc-600 cursor-default">
                      Dispute Resolution
                    </span>
                  </li>
                  <li>
                    <span className="text-sm text-zinc-600 cursor-default">
                      Solana Ledger
                    </span>
                  </li>
                </ul>
              </div>
              <div>
                <div className="text-[11px] font-bold text-zinc-400 mb-4 uppercase tracking-[0.15em]">
                  Legal
                </div>
                <ul className="space-y-2.5">
                  <li>
                    <span className="text-sm text-zinc-600 cursor-default">
                      Terms of Service
                    </span>
                  </li>
                  <li>
                    <span className="text-sm text-zinc-600 cursor-default">
                      Privacy Policy
                    </span>
                  </li>
                  <li>
                    <span className="text-sm text-zinc-600 cursor-default">
                      Cookie Policy
                    </span>
                  </li>
                </ul>
              </div>
            </div>
            {/* Bottom Bar */}
            <div className="relative z-10 pt-6 border-t border-white/[0.05] flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="text-xs text-zinc-600 font-medium">
                © {new Date().getFullYear()} Gazibo Labs. All rights reserved.
              </div>
              <div className="text-[10px] font-mono text-zinc-700">
                Built on Solana • Powered by Anchor
              </div>
            </div>
            {/* Large Decorative Watermark */}
            <div
              className="
                absolute bottom-[-40px] left-1/2 -translate-x-1/2
                text-[15vw] font-black text-white/[0.015]
                select-none pointer-events-none tracking-tighter whitespace-nowrap
              "
              style={{ fontFamily: "var(--font-heading, var(--font-sans))" }}
            >
              GAZIBO
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}