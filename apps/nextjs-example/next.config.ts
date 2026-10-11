import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // @heigin/ui ships compiled ESM + CSS, so no transpilePackages entry is needed.
};

export default nextConfig;
