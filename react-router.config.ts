import type { Config } from "@react-router/dev/config";

export default {
  appDirectory: "app",
  // ssr: false,
  prerender: true,
  // async prerender() {
  //   return ["/", "/about", "/sign-in", "/sign-up", "/contact-us"];
  // },
} satisfies Config;
