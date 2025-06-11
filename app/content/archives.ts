import { glob } from "astro/loaders";
import { defineCollection, reference } from "astro:content";
import { z } from "astro:schema";

import { baseSchema, img } from "@/content/schema";

const genres = [
  "game",
  "website",
  "app",
  "template",
  "plugin",
  "library",
  "docs",
  "tool",
  "resource",
  "design",
  "service",
  "script",
  "theme",
  "widget",
  "component",
  "hardware",
  "cli",
] as const;

export default defineCollection({
  loader: glob({
    base: "content/archives",
    pattern: "**/[^_]*.{md,mdx}",
  }),
  schema: ({ image }) =>
    baseSchema.extend({
      genre: z.enum(genres).default("app"),
      image: img(image).optional(),
      author: reference("authors"),
      contributors: z.array(reference("authors")).default([]),
      status: z
        .enum(["concept", "planned", "in-progress", "completed", "archived"])
        .default("planned"),
    }),
});
