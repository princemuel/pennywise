import {
  createAppleSplashScreens,
  defineConfig,
  minimal2023Preset,
} from "@vite-pwa/assets-generator/config";

export default defineConfig({
  headLinkOptions: { preset: "2023" },
  preset: {
    ...minimal2023Preset,
    appleSplashScreens: createAppleSplashScreens(
      {
        padding: 0.3,
        linkMediaOptions: { xhtml: true },
        resizeOptions: { background: "white" },
        darkResizeOptions: { background: "black" },
      },
      ["iPhone 14 Pro Max", 'iPad Pro 12.9"'],
    ),
  },
  images: "public/favicon.svg",
});
