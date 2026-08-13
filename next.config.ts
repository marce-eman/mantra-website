import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "xcorxezfhjmncyxegrvi.supabase.co",
      },
    ],
  },
};

export default nextConfig;