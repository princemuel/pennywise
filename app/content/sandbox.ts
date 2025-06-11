import { file } from "astro/loaders";
import { defineCollection, reference } from "astro:content";
import { z } from "astro:schema";

import { img } from "@/content/schema";

import type { Icon } from "virtual:astro-icon";

export const authors = defineCollection({
  loader: file("content/sandbox/authors.yml"),
  schema: ({ image }) =>
    z.object({
      name: z.string().min(2),
      handle: z.string().min(2),
      email: z.string().min(2).email(),
      bio: z.string().min(2).optional(),
      role: z.string().min(2).optional(),
      image: img(image).optional(),
      location: z.string().min(2).optional(),
      links: z
        .array(z.object({ label: reference("labels"), url: z.string().min(2).url() }))
        .default([]),
    }),
});

export const labels = defineCollection({
  loader: file("content/sandbox/labels.yml"),
  schema: z.object({
    text: z.string().min(2),
    icon: z.string().min(2),
  }),
});

export const routes = defineCollection({
  loader: file("content/sandbox/routes.yml"),
  schema: z.object({
    href: z.string(),
    text: z.string().min(2),
    // icon: z.string().min(2),
    icon: z.custom<Icon>((val) => "string" === typeof val),
  }),
});

export const shares = defineCollection({
  loader: file("content/sandbox/shares.yml"),
  schema: z.object({
    href: z.string().min(2).url(),
    text: z.string().min(2),
    icon: z.string().min(2).optional(),
  }),
});

export const socials = defineCollection({
  loader: file("content/sandbox/socials.yml"),
  schema: z.object({
    href: z.string().min(2),
    text: z.string().min(2),
    icon: z.string().min(2),
  }),
});
