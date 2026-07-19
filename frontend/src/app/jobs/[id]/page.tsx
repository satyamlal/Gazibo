import Link from "next/link";
import { ArrowLeft, BriefcaseBusiness, ShieldCheck } from "lucide-react";

export default function JobDetailPage() {
  return (
    <section className="min-h-full bg-[#030712] px-5 py-16 text-zinc-100 md:px-8 md:py-24">
      <div className="mx-auto max-w-2xl rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6 md:p-8">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#174BD4]/20 text-[#85DABE]">
          <BriefcaseBusiness className="h-6 w-6" />
        </div>
        <p className="mt-6 text-xs font-bold uppercase tracking-[0.2em] text-[#85DABE]">Job details</p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-white">This job is not available yet.</h1>
        <p className="mt-4 text-sm leading-6 text-zinc-400">
          Individual job records will appear here when marketplace data is connected to the escrow program.
        </p>
        <div className="mt-6 flex items-center gap-2 text-sm text-zinc-300">
          <ShieldCheck className="h-4 w-4 text-[#85DABE]" />
          Future listings will show escrow and milestone details.
        </div>
        <Link href="/jobs" className="mt-8 inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/[0.06]">
          <ArrowLeft className="h-4 w-4" />
          Back to jobs
        </Link>
      </div>
    </section>
  );
}
