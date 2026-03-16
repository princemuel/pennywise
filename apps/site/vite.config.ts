import svg from "@poppanator/sveltekit-svg";
import { enhancedImages } from "@sveltejs/enhanced-img";
import { sveltekit } from "@sveltejs/kit/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import devtoolsJson from "vite-plugin-devtools-json";

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
  define: { __BUILD_DATE__: JSON.stringify(new Date()) }
});
