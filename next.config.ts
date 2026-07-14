import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: { ignoreBuildErrors: true },
  reactStrictMode: false,
  images: { unoptimized: true, remotePatterns: [
    { protocol: "https", hostname: "images.unsplash.com" },
    { protocol: "https", hostname: "picsum.photos" },
    { protocol: "https", hostname: "z-cdn.chatglm.cn" },
    { protocol: "https", hostname: "images.pexels.com" },
  ]},
};
export default nextConfig;
