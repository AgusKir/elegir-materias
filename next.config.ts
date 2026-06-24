import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  basePath: "/elegir-materias",
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
