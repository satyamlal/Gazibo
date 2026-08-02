"use client";

import Link from "next/link";
import { FaGithub } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";

const SOCIAL_LINKS = [
    {
        name: "Twitter",
        href: "#",
        icon: FaXTwitter,
    },
    {
        name: "Github",
        href: "https://github.com/satyamlal/Gazibo",
        icon: FaGithub,
    },
];

export function Footer() {
    return (
    <>
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
                                    Active Listings
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

                {/* Brand Watermark */}
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
    </>
    );
}