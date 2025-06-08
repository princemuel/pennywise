import type { ImageMetadata } from "astro";
import type { ImageFunction } from "astro:content";
import { z } from "astro:schema";

export const baseSchema = z.object({
  title: z.string().min(2),
  summary: z.string().min(2).optional(),
  description: z.string().min(2),
  featured: z.boolean().default(false),
  tags: z.array(z.string()).default([]),
  category: z.string().min(2),
  draft: z.boolean().default(true),
  publishedAt: z.string().datetime(),
  updatedAt: z.string().datetime().optional(),
  duration: z.string().default("1 min read"),
  words: z.number().finite().int().nonnegative().lte(65_535).default(200),
  language: z.enum(["en", "es", "fr"]).default("en"),
  permalink: z.string().url().optional(),
});

export const img = (image: ImageFunction) =>
  z
    .string()
    .url()
    .regex(/^https:.*/)
    .transform(
      (url) =>
        ({
          src: url,
          width: 1200,
          height: 630,
          format: "jpg",
        }) satisfies ImageMetadata,
    )
    .or(image());
