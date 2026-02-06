import { fileURLToPath } from "node:url";

import { devtools } from "@tanstack/devtools-vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import devtoolsJson from "vite-plugin-devtools-json";
import svgr from "vite-plugin-svgr";
import tsConfigPaths from "vite-tsconfig-paths";

import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [
    devtools(),
    devtoolsJson(),
    tsConfigPaths({ projects: ["./tsconfig.json"] }),
    svgr({ include: "**/*.svg?react", svgrOptions: { memo: true, expandProps: "end" } }),
    tailwindcss(),
    tanstackStart(),
    react(),
  ],
  envPrefix: "PUBLIC_",
  resolve: { alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) } },
});
