import type { NextConfig } from "next";
import { BASE_PATH } from "./lib/basePath";

const nextConfig: NextConfig = {
  // The admin panel is served under a path prefix on the shared domain, so Next
  // must emit its own asset and route URLs with that prefix. Keep this reading
  // from lib/basePath.ts — the runtime navigation code reads the same constant.
  basePath: BASE_PATH,
  async rewrites() {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    return [
      {
        source: '/uploads/:path*',
        destination: `${apiUrl}/uploads/:path*`,
      },
    ];
  },
};

export default nextConfig;
