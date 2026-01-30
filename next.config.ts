import type { NextConfig } from "next";

export default {
  typedRoutes: true,
  reactCompiler: true,
  experimental: {
    authInterrupts: true,
    viewTransition: true,
    webVitalsAttribution: ["CLS", "LCP", "INP"],
    // Enable filesystem caching for `next dev`
    turbopackFileSystemCacheForDev: true,
    // Enable filesystem caching for `next build`
    turbopackFileSystemCacheForBuild: true,
  },
} satisfies NextConfig;
