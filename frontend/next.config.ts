import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  devIndicators: false,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      {
        protocol: "https",
        hostname: "fastor-d2c-shared-bucket-1.s3.ap-south-1.amazonaws.com",
      },
      { protocol: "https", hostname: "d14vymw7cvldyc.cloudfront.net" },
      { protocol: "https", hostname: "img1a.flixcart.com" },
    ],
  },
};

export default nextConfig;
