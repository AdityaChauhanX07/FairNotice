import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  experimental: {
    // Allow up to 15MB request bodies so the /api/parse upload route can
    // accept files up to its 10MB limit plus multipart/form-data overhead.
    proxyClientMaxBodySize: "15mb",
  },
};

export default nextConfig;
