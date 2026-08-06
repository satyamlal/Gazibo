"use client";

import Link from "next/link";
import { FaGithub } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";

const SOCIAL_LINKS = [
    { name: "Twitter", href: "#", icon: FaXTwitter },
    { name: "Github",  href: "https://github.com/satyamlal/Gazibo", icon: FaGithub },
] as const;

const NAV_COLS = [
    {
        heading: "Platform",
        links: [
        { label: "Marketplace",  href: "/jobs"      },
        { label: "Get Started",  href: "/connect"   },
        { label: "Dashboard",    href: "/account"   },
        ],
    },
    {
        heading: "Protocol",
        links: [
        { label: "Smart Escrows",        href: null },
        { label: "Dispute Resolution",   href: null },
        { label: "Solana Ledger",        href: null },
        ],
    },
    {
        heading: "Legal",
        links: [
        { label: "Terms of Service", href: null },
        { label: "Privacy Policy",   href: null },
        { label: "Cookie Policy",    href: null },
        ],
    },
] as const;

export function Footer() {
    return (
        <footer className="relative border-t g-border g-bg-alt pt-16 md:pt-20 pb-10 overflow-hidden">
            <div className="max-w-7xl mx-auto px-5 md:px-8">
                <div className="grid grid-cols-2 md:grid-cols-5 gap-8 md:gap-10 mb-14 relative z-10">

                    {/* Brand column */}
                    <div className="col-span-2">
                        <Link href="/" className="flex items-center gap-2.5 mb-5">
                            <span className="h-6 w-6 rounded-md bg-gradient-to-br from-[#174BD4] to-[#85DABE] flex items-center justify-center text-white font-extrabold text-xs">
                                G
                            </span>
                            <span
                                className="text-lg font-bold g-text"
                                style={{ fontFamily: "var(--font-heading, var(--font-sans))" }}>
                                Gazibo
                            </span>
                        </Link>
                        <p className="g-text-4 text-sm max-w-xs mb-5 leading-relaxed">
                            The trustless workspace protocol for modern Web3 builders.
                            Build, earn, and get paid — directly on Solana.
                        </p>
                        <div className="flex items-center gap-3">
                        {SOCIAL_LINKS.map((link) => (
                            <a
                                key={link.name}
                                href={link.href}
                                className="h-8 w-8 rounded-lg g-bg-surface border g-border flex items-center justify-center g-text-4 hover:g-text hover:g-border-mid transition-all duration-200 g-shadow"
                                aria-label={link.name}
                                target={link.href !== "#" ? "_blank" : undefined}
                                rel={link.href !== "#" ? "noreferrer" : undefined}>
                                <link.icon className="h-3.5 w-3.5" />
                            </a>
                        ))}
                        </div>
                    </div>

                    {/* Link columns */}
                    {NAV_COLS.map((col) => (
                        <div key={col.heading}>
                            <div className="text-[11px] font-bold g-text-3 mb-4 uppercase tracking-[0.15em]">
                                {col.heading}
                            </div>
                            <ul className="space-y-2.5">
                                {col.links.map((link) => (
                                <li key={link.label}>
                                    {link.href ? (
                                    <Link
                                        href={link.href}
                                        className="text-sm g-text-4 hover:g-text transition-colors duration-200"
                                    >
                                        {link.label}
                                    </Link>
                                    ) : (
                                    <span className="text-sm g-text-5 cursor-default">{link.label}</span>
                                    )}
                                </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                {/* Bottom bar */}
                <div className="relative z-10 pt-6 border-t g-border flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="text-xs g-text-5 font-medium">
                        © {new Date().getFullYear()} Gazibo Labs. All rights reserved.
                    </div>
                    <div className="text-[10px] font-mono g-text-6">
                        Built on Solana · Powered by Anchor
                    </div>
                </div>

                {/* Brand watermark — adapts to theme */}
                <div
                    className="absolute bottom-[-40px] left-1/2 -translate-x-1/2 text-[15vw] font-black select-none pointer-events-none tracking-tighter whitespace-nowrap"
                    style={{
                        color: "var(--ga-border)",
                        fontFamily: "var(--font-heading, var(--font-sans))",
                    }}
                    aria-hidden
                    >
                    GAZIBO
                </div>
            </div>
        </footer>
    );
}