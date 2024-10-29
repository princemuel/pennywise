import { vitePlugin as remix } from "@remix-run/dev";
import { installGlobals } from "@remix-run/node";
import { defineConfig, loadEnv } from "vite";
import tsConfigPaths from "vite-tsconfig-paths";

installGlobals({ nativeFetch: true });

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, process.cwd(), "");
  return {
    plugins: [
      remix({
        ignoredRouteFiles: ["**/*.css"],
        future: {
          v3_fetcherPersist: true,
          v3_relativeSplatPath: true,
          v3_throwAbortReason: true,
          v3_singleFetch: true,
          // v3_lazyRouteDiscovery: true,
        },
      }),
      tsConfigPaths(),
    ],
  };
});

declare module "@remix-run/server-runtime" {
  interface Future {
    v3_singleFetch: true;
  }
}
