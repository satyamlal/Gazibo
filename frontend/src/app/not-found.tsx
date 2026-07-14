import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh]">
      <div className="text-center space-y-6 p-8">
        <h1 className="text-9xl font-bold text-slate-800">404</h1>
        <h2 className="text-3xl font-semibold text-slate-600">Page Not Found</h2>
        <p className="text-slate-500 max-w-md mx-auto">
          The gig or profile you are looking for does not exist on the Solana blockchain or has been moved.
        </p>
        <Link href="/">
          <Button size="lg" className="mt-4">
            Return to Home
          </Button>
        </Link>
      </div>
    </div>
  );
}