import Link from "next/link";
import { ArrowLeft, BadgeCheck, UserRound } from "lucide-react";

export default function FreelancerProfilePage() {
  return (
    <section className="min-h-full bg-[#030712] px-5 py-16 text-zinc-100 md:px-8 md:py-24">
      <div className="mx-auto max-w-2xl rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6 md:p-8">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#174BD4]/20 text-[#85DABE]">
          <UserRound className="h-6 w-6" />
        </div>
        <p className="mt-6 text-xs font-bold uppercase tracking-[0.2em] text-[#85DABE]">Freelancer profile</p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-white">Profile data is coming soon.</h1>
        <p className="mt-4 text-sm leading-6 text-zinc-400">
          Public profiles will display verified on-chain reputation once the profile index is connected.
        </p>
        <div className="mt-6 flex items-center gap-2 text-sm text-zinc-300">
          <BadgeCheck className="h-4 w-4 text-[#85DABE]" />
          On-chain identity will remain verifiable from this route.
        </div>
        <Link href="/jobs" className="mt-8 inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/[0.06]">
          <ArrowLeft className="h-4 w-4" />
          Browse jobs
        </Link>
      </div>
    </section>
  );
}
