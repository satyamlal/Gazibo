import Link from "next/link";
import { ArrowLeft, ShieldAlert } from "lucide-react";

export default function DeleteAccountPage() {
  return (
    <section className="min-h-full bg-[#030712] px-5 py-16 text-zinc-100 md:px-8 md:py-24">
      <div className="mx-auto max-w-xl rounded-2xl border border-red-400/20 bg-red-400/[0.04] p-6 md:p-8">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-400/10 text-red-300">
          <ShieldAlert className="h-6 w-6" />
        </div>
        <p className="mt-6 text-xs font-bold uppercase tracking-[0.2em] text-red-300">Restricted action</p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-white">Account deletion is not available yet.</h1>
        <p className="mt-4 text-sm leading-6 text-zinc-400">
          Gazibo does not currently provide a profile-deletion transaction. This page is
          intentionally informational until that on-chain flow is designed and audited.
        </p>
        <Link
          href="/account/settings"
          className="mt-8 inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/[0.06]"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to settings
        </Link>
      </div>
    </section>
  );
}
