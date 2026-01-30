import type { NextConfig } from "next";

export default {
  typedRoutes: true,
  reactCompiler: true,
  experimental: {
    typedEnv: true,
    authInterrupts: true,
    viewTransition: true,
    webVitalsAttribution: ["CLS", "LCP", "INP"],
    // Enable filesystem caching for `next dev`
    turbopackFileSystemCacheForDev: true,
    // Enable filesystem caching for `next build`
    turbopackFileSystemCacheForBuild: true,
  },

  webpack(config) {
    //@ts-expect-error ignoring type issue
    const fileLoaderRule = config.module.rules.find((rule) => rule.test?.test?.(".svg"));
    config.module.rules.push(
      // Treat normal *.svg as file assets (strings/URLs)
      {
        ...fileLoaderRule,
        test: /\.svg$/i,
        resourceQuery: { not: [/react/] }, // exclude *.svg?react
      },
      // Convert *.svg?react imports to React components
      {
        test: /\.svg$/i,
        issuer: fileLoaderRule.issuer,
        resourceQuery: /react/, // *.svg?react
        use: ["@svgr/webpack"],
      },
    );
    fileLoaderRule.exclude = /\.svg$/i;
    return config;
  },

  turbopack: {
    rules: {
      "*.svg": {
        loaders: ["@svgr/webpack"],
        condition: { path: "./assets/media/icons/**" },
        as: "*.js",
      },
    },
  },

  images: {
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
} satisfies NextConfig;
