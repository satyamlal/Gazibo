"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Ghost, ArrowRight, ArrowLeft } from "lucide-react";

export default function NotFound() {
  const pathname = usePathname();

  return (
    <div className="relative min-h-screen bg-[#030712] flex items-center justify-center overflow-hidden">
      {/* Background effects — same treatment as the rest of the site */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-250 h-150 bg-[radial-gradient(ellipse_at_center,rgba(23,75,212,0.12)_0%,transparent_70%)]" />
        <div className="absolute bottom-0 right-[10%] w-100 h-100 bg-[radial-gradient(circle,rgba(133,218,190,0.06)_0%,transparent_70%)]" />
        <div className="absolute inset-0 bg-grid-pattern opacity-40" />
      </div>

      <div className="relative z-10 max-w-xl mx-auto px-6 text-center py-24">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/8 bg-white/3 backdrop-blur-sm text-xs font-medium tracking-wide text-zinc-300 mb-8 animate-fade-in-up">
          <span className="flex h-2 w-2 rounded-full bg-rose-400 animate-glow-pulse" />
          <span className="text-rose-400 font-semibold">Account Not Found</span>
        </div>

        {/* Ghost accent */}
        <div className="flex justify-center mb-2 animate-float">
          <div className="h-14 w-14 rounded-2xl bg-white/[0.03] border border-white/[0.08] flex items-center justify-center text-zinc-600">
            <Ghost className="h-6 w-6" />
          </div>
        </div>

        {/* 404 */}
        <h1
          className="text-8xl sm:text-9xl md:text-[10rem] font-extrabold tracking-tight leading-none mb-2 bg-gradient-to-r from-white via-[#85DABE] to-[#174BD4] bg-clip-text text-transparent animate-fade-in-up animation-delay-200"
          style={{ fontFamily: "var(--font-heading, var(--font-sans))" }}
        >
          404
        </h1>

        <h2
          className="text-2xl sm:text-3xl font-bold text-white mb-4 animate-fade-in-up animation-delay-200"
          style={{ fontFamily: "var(--font-heading, var(--font-sans))" }}
        >
          This account doesn&apos;t exist.
        </h2>

        <p className="text-zinc-400 text-sm sm:text-base max-w-md mx-auto mb-8 leading-relaxed animate-fade-in-up animation-delay-400">
          The job, profile, or page you&apos;re looking for was never
          created, got cancelled, or the address is wrong.<br/> No record of it
          in this ledger.
        </p>

        {/* Fake lookup box — mirrors the wallet-address box on /connect */}
        <div className="mb-10 animate-fade-in-up animation-delay-400">
          <div className="inline-flex items-center gap-3 bg-zinc-900/80 px-4 py-3 rounded-xl text-xs font-mono border border-white/5 text-zinc-500">
            <span className="text-zinc-600 uppercase tracking-wider">
              Requested:
            </span>
            <span className="text-rose-400 truncate max-w-[240px]">
              {pathname}
            </span>
          </div>
        </div>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up animation-delay-600">
          <Link
            href="/"
            className="group w-full sm:w-auto px-8 py-3.5 rounded-full bg-[#85DABE] text-[#030712] font-semibold text-[15px] flex items-center justify-center gap-2 hover:bg-[#A8E8D0] hover:shadow-[0_0_24px_rgba(133,218,190,0.35)] active:scale-[0.97] transition-all duration-300"
          >
            <ArrowLeft className="h-4 w-4 transition-transform duration-200 group-hover:-translate-x-0.5" />
            Return Home
          </Link>
          <Link
            href="/jobs"
            className="w-full sm:w-auto px-8 py-3.5 rounded-full border border-white/[0.1] bg-white/3 text-white font-semibold text-[15px] flex items-center justify-center gap-2 hover:bg-white/[0.07] hover:border-white/[0.18] transition-all duration-300"
          >
            Browse Jobs
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}