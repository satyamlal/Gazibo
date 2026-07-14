'use strict';

import Link from 'next/link';

export default function NotFound() {
    return (
        <div className="flex min-h-[70vh] flex-col items-center justify-center text-center px-4">
            <h1 className="text-6xl font-extrabold tracking-tight lg:text-9xl text-muted-foreground/40">
                404
            </h1>
            <h2 className="mt-4 text-2xl font-bold tracking-tight sm:text-4xl">
                Page Not Found
            </h2>
            <p className="mt-2 text-base text-muted-foreground max-w-md">
                Yeh page exist nahi karta ya remove ho chuka hai. Apne escrow jobs check karne ke liye home page par lautein.
            </p>
            <div className="mt-6">
                <Link
                    href="/"
                    className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                    Return to Dashboard
                </Link>
            </div>
        </div>
    );
}