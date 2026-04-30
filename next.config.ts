import type { NextConfig } from "next"

import "./src/env"

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        hostname: "gravatar.com",
        protocol: "https",
      },
    ],
  },
}

export default nextConfig
