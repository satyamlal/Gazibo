import Link from "next/link";
import { ArrowRight, BriefcaseBusiness, ShieldCheck, WalletCards } from "lucide-react";

const jobHighlights = [
  "Smart-contract escrow before work begins",
  "Milestones released directly to your wallet",
  "Portable, on-chain professional reputation",
];

export default function JobsPage() {
  return (
    <section className="min-h-full bg-[#030712] px-5 py-16 text-zinc-100 md:px-8 md:py-24">
      <div className="mx-auto max-w-4xl">
        <div className="mb-10 max-w-2xl">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-[#85DABE]">
            Opportunity marketplace
          </p>
          <h1 className="text-4xl font-bold tracking-tight text-white md:text-5xl">
            Find work with payments you can verify.
          </h1>
          <p className="mt-5 text-base leading-relaxed text-zinc-400 md:text-lg">
            Gazibo&apos;s job marketplace is being connected to the on-chain escrow program.
            Join now to be ready when the first verified opportunities go live.
          </p>
        </div>

        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6 shadow-2xl shadow-black/20 md:p-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#174BD4]/20 text-[#85DABE]">
            <BriefcaseBusiness className="h-6 w-6" />
          </div>
          <h2 className="mt-5 text-xl font-semibold text-white">No open jobs yet</h2>
          <p className="mt-2 max-w-xl text-sm leading-6 text-zinc-400">
            The marketplace is in its launch phase. Connect your wallet to create your
            on-chain profile and receive access as jobs become available.
          </p>

          <ul className="mt-7 space-y-3 text-sm text-zinc-300">
            {jobHighlights.map((highlight) => (
              <li key={highlight} className="flex items-center gap-3">
                <ShieldCheck className="h-4 w-4 shrink-0 text-[#85DABE]" />
                {highlight}
              </li>
            ))}
          </ul>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/connect" className="inline-flex items-center justify-center gap-2 rounded-full bg-[#85DABE] px-5 py-3 text-sm font-semibold text-[#030712] transition hover:bg-[#a8e8d0]">
              <WalletCards className="h-4 w-4" />
              Connect wallet
            </Link>
            <Link href="/" className="inline-flex items-center justify-center gap-2 rounded-full border border-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/[0.06]">
              Back to home
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
