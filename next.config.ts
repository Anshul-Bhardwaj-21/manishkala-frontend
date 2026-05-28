import type { NextConfig } from "next";

const wordpressBaseUrl = new URL(process.env.WORDPRESS_BASE_URL ?? "https://admin.manishkala.in");

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: wordpressBaseUrl.protocol.replace(":", "") as "http" | "https",
        hostname: wordpressBaseUrl.hostname,
        pathname: "/**"
      }
    ]
  }
};

export default nextConfig;
