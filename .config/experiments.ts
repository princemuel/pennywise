import { fontsArr } from "./fonts";

import type { AstroUserConfig } from "astro";

type Config = NonNullable<NonNullable<AstroUserConfig["experimental"]>>;

export default {
  clientPrerender: true,
  responsiveImages: true,
  csp: true,
  contentIntellisense: true,
  headingIdCompat: true,
  preserveScriptOrder: true,
  fonts: fontsArr,
} satisfies Config;
