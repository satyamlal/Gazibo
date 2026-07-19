import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    // This app has its own package-lock.json. Keep Turbopack from inferring
    // the repository root from the unrelated root-level yarn.lock.
    root: __dirname,
  },
};

export default nextConfig;
