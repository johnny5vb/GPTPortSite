import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Screenshots and UI captures carry fine text; the default quality of 75
    // softens it even when the pixels are there. Next 16 only optimises the
    // qualities listed here, so 90 has to be allowed before it can be used.
    qualities: [75, 90],
    // 2880 is the width every capture is taken at (1440 CSS px at 2x). Without
    // this bucket a 2650px slot rounds up to 3840 — wasted bytes, no sharper.
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 2880, 3840],
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "framerusercontent.com",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
