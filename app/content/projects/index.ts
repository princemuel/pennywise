import { glob } from "astro/loaders";
import { defineCollection, reference } from "astro:content";
import { z } from "astro:schema";

import { baseSchema, img } from "@/content/schema";

const ps = [
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
    base: "app/content/projects",
    pattern: "**/[^_]*.{md,mdx}",
  }),
  schema: ({ image }) =>
    baseSchema.extend({
      genre: z.enum(ps).default("app"),
      image: img(image).optional(),
      author: reference("authors"),
      technologies: z.array(z.string()).default([]),
      contributors: z.array(reference("authors")).default([]),
      status: z
        .enum(["concept", "planned", "in-progress", "completed", "archived"])
        .default("planned"),
      links: z
        .array(
          z.object({
            label: reference("labels"),
            url: z.string().min(2).url(),
          }),
        )
        .default([]),
    }),
});
