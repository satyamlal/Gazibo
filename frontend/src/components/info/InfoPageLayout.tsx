import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { ArrowLeft } from "lucide-react";

interface InfoPageLayoutProps {
  eyebrow: string;
  title: string;
  description: string;
  icon?: LucideIcon;
  children: React.ReactNode;
}

export function InfoPageLayout({ eyebrow, title, description, icon: Icon, children }: InfoPageLayoutProps) {
  return (
    <div className="min-h-screen bg-[#030712]">
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-250 h-150 bg-[radial-gradient(ellipse_at_center,rgba(23,75,212,0.1)_0%,transparent_70%)]" />
      </div>
      <div className="relative z-10 max-w-3xl mx-auto px-5 md:px-8 py-16 md:py-20">
        <Link href="/" className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-white transition-colors mb-10">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to home
        </Link>
        {Icon && (
          <div className="h-11 w-11 rounded-xl bg-[#174BD4]/10 border border-[#174BD4]/15 flex items-center justify-center text-[#85DABE] mb-6">
            <Icon className="h-5 w-5" />
          </div>
        )}
        <div className="text-xs font-bold tracking-[0.2em] text-[#85DABE] uppercase mb-3">{eyebrow}</div>
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white mb-4" style={{ fontFamily: "var(--font-heading, var(--font-sans))" }}>{title}</h1>
        <p className="text-zinc-400 text-base md:text-lg leading-relaxed mb-12">{description}</p>
        {children}
      </div>
    </div>
  );
}

export function InfoSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-10">
      <h2 className="text-lg font-bold text-white mb-3">{title}</h2>
      <div className="space-y-3 text-sm text-zinc-400 leading-relaxed [&_strong]:text-zinc-200 [&_strong]:font-semibold">{children}</div>
    </section>
  );
}

export function InfoCallout({ tone = "neutral", children }: { tone?: "neutral" | "warning"; children: React.ReactNode }) {
  const toneClass = tone === "warning" ? "border-amber-500/20 bg-amber-500/[0.06] text-amber-200" : "border-[#174BD4]/20 bg-[#174BD4]/[0.06] text-zinc-300";
  return <div className={`rounded-xl border px-4 py-3.5 text-sm leading-relaxed ${toneClass}`}>{children}</div>;
}