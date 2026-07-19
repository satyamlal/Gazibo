import Link from "next/link";
import { ArrowRight, ShieldCheck, UserRound } from "lucide-react";

export default function AccountSettingsPage() {
  return (
    <section className="min-h-full bg-[#030712] px-5 py-16 text-zinc-100 md:px-8 md:py-24">
      <div className="mx-auto max-w-3xl">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#85DABE]">Account</p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight text-white">Settings</h1>
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <Link href="/connect" className="group rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6 transition hover:border-[#85DABE]/30 hover:bg-white/[0.05]">
            <UserRound className="h-5 w-5 text-[#85DABE]" />
            <h2 className="mt-4 font-semibold text-white">Profile</h2>
            <p className="mt-1 text-sm leading-6 text-zinc-400">Connect a wallet to create or update your Gazibo profile.</p>
            <span className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-[#85DABE]">Manage profile <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" /></span>
          </Link>
          <Link href="/account/settings/delete" className="group rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6 transition hover:border-red-400/30 hover:bg-white/[0.05]">
            <ShieldCheck className="h-5 w-5 text-red-300" />
            <h2 className="mt-4 font-semibold text-white">Profile deletion</h2>
            <p className="mt-1 text-sm leading-6 text-zinc-400">Review the current availability of the on-chain deletion flow.</p>
            <span className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-red-300">Review action <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" /></span>
          </Link>
        </div>
      </div>
    </section>
  );
}
