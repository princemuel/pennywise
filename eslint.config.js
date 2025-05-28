// @ts-check

import js from "@eslint/js";
import ts from "typescript-eslint";

import oxlint from "eslint-plugin-oxlint";
import prettier from "eslint-plugin-prettier/recommended";

import { configs as astro } from "eslint-plugin-astro";

const config = ts.config(
  { ignores: ["dist", ".astro", ".netlify", "**/ignored/*", "**/local/*"] },
  js.configs.recommended,
  ts.configs.strict,
  ts.configs.stylistic,
  ...oxlint.buildFromOxlintConfigFile(".oxlintrc.json"),
  ...astro.recommended,
  ...astro["jsx-a11y-strict"],
  prettier,
  {
    // Define the configuration for `<script>` tag.
    // Script in `<script>` is assigned a virtual file name with the `.js` extension.
    files: ["**/*.astro/*.js", "*.astro/*.js", "**/*.astro/*.ts", "*.astro/*.ts"],
    rules: {
      "prettier/prettier": "off",
    },
  },
);

export default config;
