import { envField } from "astro/config";
import { loadEnv } from "vite";

import type { AstroUserConfig } from "astro";

type Config = NonNullable<NonNullable<AstroUserConfig["env"]>["schema"]>;

const v = envField;

const mode = process.env.NODE_ENV ?? "production";

export const envVars = loadEnv(mode, process.cwd(), "");

const server_secret_str = v.string({ context: "server", access: "secret" });
const server_secret_url = v.string({ context: "server", access: "secret", url: true });
const server_secret_int = v.number({ context: "server", access: "secret", int: true });
const client_public_url = v.string({ context: "client", access: "public", url: true });

export default {
  ASTRO_KEY: server_secret_str,
  DARK_VISITORS_TOKEN: server_secret_str,
  DATABASE_TOKEN: server_secret_str,
  DATABASE_URL: server_secret_str,
  DATABASE_ENCRYPTION_KEY: server_secret_str,

  GOOGLE_DRIVE_TOKEN: server_secret_str,
  GOOGLE_DRIVE_FILE_ID: server_secret_str,

  OCTOKIT_TOKEN: server_secret_str,
  OCTOKIT_URL: server_secret_url,
  OCTOKIT_USERNAME: server_secret_str,
  OCTOKIT_VERSION: server_secret_str,

  PUBLIC_SITE_URL: client_public_url,

  RESEND_ADDRESS: server_secret_str,
  RESEND_AUDIENCE: server_secret_str,
  RESEND_TOKEN: server_secret_str,

  WEBHOOK_SECRET: server_secret_str,
  SITE_STATUS: v.enum({
    access: "secret",
    context: "server",
    values: ["construction", "maintenance", "downtime", "live"],
  }),

  UPSTASH_REDIS_REST_TOKEN: server_secret_str,
  UPSTASH_LIMIT_TOKEN: server_secret_int,
  UPSTASH_LIMIT_WINDOW: server_secret_str,
  UPSTASH_REDIS_REST_URL: server_secret_url,
  WAKATIME_TOKEN: server_secret_str,
} satisfies Config;
