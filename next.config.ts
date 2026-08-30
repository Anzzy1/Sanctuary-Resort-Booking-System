import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
    ],
  },
  serverExternalPackages: ["pg", "pg-pool", "pgpass", "pg-connection-string", "nodemailer", "@prisma/adapter-pg"],
  experimental: {
    serverActions: {
      // GCash proof screenshots are sent as base64 inside the action body
      // (2 MB image -> ~2.7 MB base64), so allow headroom above the 1MB default.
      bodySizeLimit: "4mb",
    },
  },
};

export default nextConfig;
