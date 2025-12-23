import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  // Export static assets so Electron can load via file://
  output: "export",
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
}

export default nextConfig
