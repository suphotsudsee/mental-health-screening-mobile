import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow dev cross-origin requests from the mobile host used in this project.
  allowedDevOrigins: ["https://mhs-mobile.phoubon.in.th"],
};

export default nextConfig;
