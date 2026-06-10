import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  // Keep these out of the server bundle so they load from node_modules at
  // runtime. pdfjs-dist (via pdf-parse) and tesseract.js dynamically import
  // worker files; bundling them breaks that resolution ("Setting up fake
  // worker failed: Cannot find module 'pdf.worker.mjs'").
  serverExternalPackages: ["pdf-parse", "pdfjs-dist", "tesseract.js"],
  experimental: {
    // Allow up to 15MB request bodies so the /api/parse upload route can
    // accept files up to its 10MB limit plus multipart/form-data overhead.
    proxyClientMaxBodySize: "15mb",
  },
};

export default nextConfig;
