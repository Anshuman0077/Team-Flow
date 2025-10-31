import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        hostname:"avatars.githubusercontent.com",
        protocol: "https",
      },
      {
        hostname: "*.googleusercontent.com",
        protocol: "https",
      },
      {
        hostname: "avatar.vercel.sh",
        protocol: "https",

      },{
        hostname:"lqwz6jba7d.ufs.sh",
        protocol:"https",
      },
    ]
  }
  /* config options here */
};

export default nextConfig;
