import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Standalone output is for the local container runtime only.
  // Netlify's plugin manages its own packaging.
  ...(process.env.NETLIFY ? {} : { output: "standalone" as const }),
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
};

export default nextConfig;
