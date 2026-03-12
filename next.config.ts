import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ['crawlee', 'playwright'],
};

export default nextConfig;
