import svg from "@poppanator/sveltekit-svg";
import { enhancedImages } from "@sveltejs/enhanced-img";
import { sveltekit } from "@sveltejs/kit/vite";
import tailwindcss from "@tailwindcss/vite";
import { playwright } from "@vitest/browser-playwright";
import devtoolsJson from "vite-plugin-devtools-json";
import { defineConfig } from "vitest/config";

export default defineConfig({
  envPrefix: "PUBLIC_",
  server: { host: true, port: 3000 },
  plugins: [
    tailwindcss(),
    enhancedImages(), // must come before the SvelteKit plugin
    svg({
      includePaths: ["src/assets/media/icons/"],
      svgoOptions: { multipass: true, plugins: [{ name: "preset-default" }] }
    }),
    sveltekit(),
    devtoolsJson()
  ],
  define: { __BUILD_DATE__: JSON.stringify(new Date()) },
  test: {
    expect: { requireAssertions: true },
    projects: [
      {
        extends: "./vite.config.ts",
        test: {
          name: "client",
          browser: {
            enabled: true,
            provider: playwright(),
            instances: [{ browser: "chromium", headless: true }]
          },
          include: ["src/**/*.svelte.{test,spec}.{js,ts}"],
          exclude: ["src/lib/server/**"]
        }
      },

      {
        extends: "./vite.config.ts",
        test: {
          name: "server",
          environment: "node",
          include: ["src/**/*.{test,spec}.{js,ts}"],
          exclude: ["src/**/*.svelte.{test,spec}.{js,ts}"]
        }
      }
    ]
  }
});
