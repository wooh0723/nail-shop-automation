import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  images: {
    deviceSizes: [390],
    imageSizes: [390],
  },
};

export default nextConfig;
