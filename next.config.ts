import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Genera un sitio 100 % estático en la carpeta "out" (sirve para Vercel o cualquier hosting).
  output: "export",
  images: { unoptimized: true },
  trailingSlash: true,
};

export default nextConfig;
