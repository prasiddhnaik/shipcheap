import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname,
  },
  // Cloud agent / preview hosts hit the Next dev server cross-origin.
  allowedDevOrigins: [
    "p-8904-pod-3uou5cu2jvhmfg3s5ewthbvpty-652633b9c9cc12684c50-us7p.agent.cvm.dev",
    "*.agent.cvm.dev",
  ],
};

export default nextConfig;
