import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Keep both domains and remotePatterns to avoid config mismatches across Next versions
    domains: [
      "images.unsplash.com",
      "campusmarketng.vercel.app",
      "myschool.ng",
      "i.pravatar.cc",
      "purepng.com",
      "lh3.googleusercontent.com",
      "res.cloudinary.com",
    ],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "campusmarketng.vercel.app",
      },
      {
        protocol: "https",
        hostname: "myschool.ng",
      },
      {
        protocol: "https",
        hostname: "i.pravatar.cc",
      },
      {
        protocol: "https",
        hostname: "purepng.com",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "*.onrender.com",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
  },
};

export default nextConfig;
