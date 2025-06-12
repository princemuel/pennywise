// @ts-check
import { defineConfig } from "astro/config";

import netlify from "@astrojs/netlify";

import dotenv, { envVars } from "./.config/dotenv";
import flags from "./.config/experiments";
import images from "./.config/images";
import integrations from "./.config/integrations";
import plugins_md from "./.config/markdown";
import plugins_vite from "./.config/plugins";

// https://astro.build/config
export default defineConfig({
  srcDir: "./app",
  site: envVars.PUBLIC_SITE_URL,
  env: { validateSecrets: true, schema: dotenv },
  experimental: flags,
  server: { host: true },
  integrations: integrations,
  session: { driver: "netlifyBlobs" },
  markdown: plugins_md,
  vite: plugins_vite,
  image: images,
  adapter: netlify({ cacheOnDemandPages: true }),
});
