import twForms from "@tailwindcss/forms";
import twDefaultTheme from "tailwindcss/defaultTheme";
import twPlugin from "tailwindcss/plugin";
import twConfig from "./tailwind.json";

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./app/**/{**,.client,.server}/**/*.{js,jsx,ts,tsx}"],
  future: "all",
  experimental: "all",
  theme: {
    screens: {
      "3xs": "24em", // @media (min-width: 384px) { ... }
      "2xs": "30em", // @media (min-width: 480px) { ... }
      ...twDefaultTheme.screens,
    },
    fluidCols: { fit: "fit", fill: "fill" },
    extend: {
      colors: twConfig.theme.colors,
      borderRadius: { pill: "100vmax" },
      fontFamily: {
        sans: [twConfig.theme.fontFamily.sans, ...twDefaultTheme.fontFamily.sans],
      },
      cursor: twConfig.theme.cursor,
      screens: {
        xs: "36em", // @media (min-width: 576px) { ... },
        sm: "40em", // @media (min-width: 640px) { ... }
        md: "48em", // @media (min-width: 768px) { ... }
        lg: "64em", // @media (min-width: 1024px) { ... }
        xl: "80em", // @media (min-width: 1280px) { ... }
        "2xl": "96em", // @media (min-width: 1536px) { ... }
        "3xl": "112.5em", // @media (min-width: 1800px) { ... }
      },
    },
  },
  plugins: [
    twForms({ strategy: "base" }),
    twPlugin(({ theme, addUtilities, addVariant, matchUtilities }) => {
      addVariant("hocus", ["&:hover", "&:focus"]);

      addUtilities({
        ".auto-fit": { "--tw-repeat": "auto-fit" },
        ".auto-fill": { "--tw-repeat": "auto-fill" },
      });

      matchUtilities(
        {
          "grid-cols-fluid": (value) => ({
            gridTemplateColumns: `repeat(var(--tw-repeat), minmax(min(100%, ${value}), 1fr))`,
          }),
        },
        { values: theme("width") },
      );
    }),
  ],
};
