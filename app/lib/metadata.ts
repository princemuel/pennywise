// eslint-disable no-object-as-default-parameter
// eslint-disable func-style
// eslint-disable max-lines-per-function
import { z } from "astro:schema";
import { pwaAssetsHead } from "virtual:pwa-assets/head";

import { defaultKeywords, formatHtmlTitle, getSiteSettings } from "@/constants/settings";
// import type { HeadElement } from "astro/types";

const MetadataSchema = z
  .object({
    title: z.string().max(60).optional(),
    metaTitle: z.string().optional(), // <meta name="title">
    description: z.string().max(160).optional(),
    keywords: z.array(z.string()).max(10).optional(),
    author: z.string().optional(),
    image: z.string().url().optional(),
    url: z.string().url().optional(),
    type: z.enum(["website", "article", "book", "profile"]).optional(),
    publishedAt: z.string().datetime().optional(),
    updatedAt: z.string().datetime().optional(),
    section: z.string().optional(),
    tags: z.array(z.string()).max(5).optional(),
    noIndex: z.boolean().optional(),
    canonical: z.string().url().optional(),
    priority: z.number().min(0).max(10).optional(),
    jsonLd: z
      .object({
        type: z
          .enum(["WebSite", "Article", "Person", "Organization", "BlogPosting"])
          .optional(),
        additionalProperties: z.record(z.any()).optional(),
      })
      .optional(),

    // New fields for layout parity
    viewport: z.string().optional(),
    referrer: z.string().optional(),
    colorScheme: z.string().optional(),
    applicationName: z.string().optional(),
    generator: z.string().optional(),
    creator: z.string().optional(),
    publisher: z.string().optional(),
    fediverseCreator: z.string().optional(),
    themeColor: z
      .union([
        z.string(),
        z.array(
          z.object({
            color: z.string(),
            media: z.string().optional(),
          }),
        ),
      ])
      .optional(),
    mobileWebAppCapable: z.string().optional(),
    mobileWebAppStatusBarStyle: z.string().optional(),
    msapplicationTileColor: z.string().optional(),
    sitemap: z.string().url().optional(),
    rss: z
      .object({
        title: z.string(),
        href: z.string().url(),
      })
      .optional(),
    twitterUrl: z.string().url().optional(),
  })
  .strict();

export type MetadataConfig = z.infer<typeof MetadataSchema>;

const { name, description, site_author } = getSiteSettings();

const DEFAULT_METADATA: Partial<MetadataConfig> = {
  title: formatHtmlTitle("", "%title% | %brand%", { brand: name }),
  metaTitle: formatHtmlTitle("", "%title% | %brand%", { brand: name }),
  description: description,
  keywords: defaultKeywords,
  priority: 5,
  viewport: "width=device-width,initial-scale=1",
  referrer: "origin-when-cross-origin",
  colorScheme: "light dark",
  applicationName: `${name}'s Domain`,
  generator: "Astro",
  creator: site_author,
  publisher: site_author,
  fediverseCreator: `@${site_author}@mastodon.online`,
  themeColor: [
    { color: "#fafafa", media: "(prefers-color-scheme: light)" },
    { color: pwaAssetsHead.themeColor?.content ?? "", media: "(prefers-color-scheme: dark)" },
  ],
  mobileWebAppCapable: "yes",
  mobileWebAppStatusBarStyle: "black-translucent",
  msapplicationTileColor: "#fafafa",
};

export const HEAD_PRIORITIES = {
  // Critical meta and base
  charset: 1,
  viewport: 2,
  base: 3,

  // Performance resource hints (early)
  dnsPrefetch: 4,
  preconnect: 5,
  preload: 6,
  modulepreload: 7,
  prefetch: 8,

  // Title and canonical
  title: 10,
  metaTitle: 11,
  canonical: 12,

  // SEO meta
  description: 13,
  keywords: 14,
  author: 15,
  robots: 16,

  // Structured data (early for SEO)
  jsonLd: 17,

  // Social meta
  // Open Graph
  ogTitle: 18,
  ogDescription: 19,
  ogImage: 20,
  ogUrl: 21,
  ogType: 22,
  ogPublishedAt: 23,
  ogUpdatedAt: 24,
  ogSection: 25,
  ogTags: 26,

  // Twitter
  twitterCard: 27,
  twitterTitle: 28,
  twitterDescription: 29,
  twitterImage: 30,
  twitterUrl: 31,

  // Global meta
  referrer: 32,
  colorScheme: 33,
  applicationName: 34,
  generator: 35,
  creator: 36,
  publisher: 37,
  fediverseCreator: 38,

  // Theme and PWA
  themeColor: 39,
  mobileWebAppCapable: 40,
  mobileWebAppStatusBarStyle: 41,
  msapplicationTileColor: 42,

  // Icons and manifest
  favicon: 43,
  appleTouchIcon: 44,
  msapplicationTileImage: 45,
  manifest: 46,
  icon: 47,

  // Alternate and feeds
  rss: 48,
  sitemap: 49,
  alternate: 50,

  // Fonts and favicons (layout-specific)
  fonts: 51,
  favicons: 52,

  // Miscellaneous head elements
  link: 53,
  script: 54,
  style: 55,
  noscript: 56,

  // Custom additions
  custom: 100,
};

export interface HeadElement {
  tag: string;
  attributes?: { [key: string]: string | null };
  content?: string;
  children?: HeadElement[]; // For nested elements, if needed
  priority: number;
  key: string;
}

export const generateMetadata = (config: MetadataConfig = {}) => {
  const metadata = MetadataSchema.parse(config);
  const meta = { ...DEFAULT_METADATA, ...metadata };

  const elements: HeadElement[] = [];

  // Critical meta
  elements.push({
    tag: "meta",
    // eslint-disable-next-line text-encoding-identifier-case
    attributes: { charset: "utf-8" },
    priority: HEAD_PRIORITIES.charset,
    key: "charset",
  });

  if (meta.viewport) {
    elements.push({
      tag: "meta",
      attributes: { name: "viewport", content: meta.viewport },
      priority: HEAD_PRIORITIES.viewport,
      key: "viewport",
    });
  }

  if (meta.referrer) {
    elements.push({
      tag: "meta",
      attributes: { name: "referrer", content: meta.referrer },
      priority: HEAD_PRIORITIES.referrer,
      key: "referrer",
    });
  }

  if (meta.colorScheme) {
    elements.push({
      tag: "meta",
      attributes: { name: "color-scheme", content: meta.colorScheme },
      priority: HEAD_PRIORITIES.colorScheme,
      key: "color-scheme",
    });
  }

  if (meta.applicationName) {
    elements.push({
      tag: "meta",
      attributes: { name: "application-name", content: meta.applicationName },
      priority: HEAD_PRIORITIES.applicationName,
      key: "application-name",
    });
  }

  if (meta.generator) {
    elements.push({
      tag: "meta",
      attributes: { name: "generator", content: meta.generator },
      priority: HEAD_PRIORITIES.generator,
      key: "generator",
    });
  }

  if (meta.creator) {
    elements.push({
      tag: "meta",
      attributes: { name: "creator", content: meta.creator },
      priority: HEAD_PRIORITIES.creator,
      key: "creator",
    });
  }

  if (meta.publisher) {
    elements.push({
      tag: "meta",
      attributes: { name: "publisher", content: meta.publisher },
      priority: HEAD_PRIORITIES.publisher,
      key: "publisher",
    });
  }

  if (meta.fediverseCreator) {
    elements.push({
      tag: "meta",
      attributes: { name: "fediverse:creator", content: meta.fediverseCreator },
      priority: HEAD_PRIORITIES.fediverseCreator,
      key: "fediverse:creator",
    });
  }

  // Title and meta title
  if (meta.title) {
    elements.push({
      tag: "title",
      content: meta.title,
      priority: HEAD_PRIORITIES.title,
      key: "title",
    });
  }
  if (meta.metaTitle) {
    elements.push({
      tag: "meta",
      attributes: { name: "title", content: meta.metaTitle },
      priority: HEAD_PRIORITIES.metaTitle,
      key: "meta-title",
    });
  }

  if (meta.description) {
    elements.push({
      tag: "meta",
      attributes: { name: "description", content: meta.description },
      priority: HEAD_PRIORITIES.description,
      key: "description",
    });
  }

  if (meta.keywords?.length) {
    elements.push({
      tag: "meta",
      attributes: { name: "keywords", content: meta.keywords.join(", ") },
      priority: HEAD_PRIORITIES.keywords,
      key: "keywords",
    });
  }

  if (meta.author) {
    elements.push({
      tag: "meta",
      attributes: { name: "author", content: meta.author },
      priority: HEAD_PRIORITIES.author,
      key: "author",
    });
  }

  // SEO
  const robots = meta.noIndex ? "noindex, nofollow" : "index, follow";
  elements.push({
    tag: "meta",
    attributes: { name: "robots", content: robots },
    priority: HEAD_PRIORITIES.robots,
    key: "robots",
  });

  if (meta.canonical) {
    elements.push({
      tag: "link",
      attributes: { rel: "canonical", href: meta.canonical },
      priority: HEAD_PRIORITIES.canonical,
      key: "canonical",
    });
  }

  // Theme and PWA
  if (meta.themeColor) {
    if (Array.isArray(meta.themeColor)) {
      meta.themeColor.forEach((tc, idx) => {
        elements.push({
          tag: "meta",
          attributes: {
            name: "theme-color",
            content: tc.color,
            ...(tc.media ? { media: tc.media } : {}),
          },
          priority: HEAD_PRIORITIES.themeColor,
          key: `theme-color-${idx}`,
        });
      });
    } else {
      elements.push({
        tag: "meta",
        attributes: { name: "theme-color", content: meta.themeColor },
        priority: HEAD_PRIORITIES.themeColor,
        key: "theme-color",
      });
    }
  }

  if (meta.mobileWebAppCapable) {
    elements.push({
      tag: "meta",
      attributes: { name: "mobile-web-app-capable", content: meta.mobileWebAppCapable },
      priority: HEAD_PRIORITIES.mobileWebAppCapable,
      key: "mobile-web-app-capable",
    });
  }

  if (meta.mobileWebAppStatusBarStyle) {
    elements.push({
      tag: "meta",
      attributes: {
        name: "mobile-web-app-status-bar-style",
        content: meta.mobileWebAppStatusBarStyle,
      },
      priority: HEAD_PRIORITIES.mobileWebAppStatusBarStyle,
      key: "mobile-web-app-status-bar-style",
    });
  }

  if (meta.msapplicationTileColor) {
    elements.push({
      tag: "meta",
      attributes: { name: "msapplication-TileColor", content: meta.msapplicationTileColor },
      priority: HEAD_PRIORITIES.msapplicationTileColor,
      key: "msapplication-TileColor",
    });
  }

  // Open Graph
  if (meta.title) {
    elements.push({
      tag: "meta",
      attributes: { property: "og:title", content: meta.title },
      priority: HEAD_PRIORITIES.ogTitle,
      key: "og:title",
    });
  }

  if (meta.description) {
    elements.push({
      tag: "meta",
      attributes: { property: "og:description", content: meta.description },
      priority: HEAD_PRIORITIES.ogDescription,
      key: "og:description",
    });
  }

  if (meta.image) {
    elements.push({
      tag: "meta",
      attributes: { property: "og:image", content: meta.image },
      priority: HEAD_PRIORITIES.ogImage,
      key: "og:image",
    });
  }

  if (meta.url) {
    elements.push({
      tag: "meta",
      attributes: { property: "og:url", content: meta.url },
      priority: HEAD_PRIORITIES.ogUrl,
      key: "og:url",
    });
  }

  if (meta.type) {
    elements.push({
      tag: "meta",
      attributes: { property: "og:type", content: meta.type },
      priority: HEAD_PRIORITIES.ogType,
      key: "og:type",
    });
  }

  if (meta.publishedAt) {
    elements.push({
      tag: "meta",
      attributes: { property: "article:published_time", content: meta.publishedAt },
      priority: HEAD_PRIORITIES.ogPublishedAt,
      key: "article:published_time",
    });
  }

  if (meta.updatedAt) {
    elements.push({
      tag: "meta",
      attributes: { property: "article:modified_time", content: meta.updatedAt },
      priority: HEAD_PRIORITIES.ogUpdatedAt,
      key: "article:modified_time",
    });
  }

  if (meta.section) {
    elements.push({
      tag: "meta",
      attributes: { property: "article:section", content: meta.section },
      priority: HEAD_PRIORITIES.ogSection,
      key: "article:section",
    });
  }

  // Article tags
  meta.tags?.forEach((tag, index) => {
    elements.push({
      tag: "meta",
      attributes: { property: "article:tag", content: tag },
      priority: HEAD_PRIORITIES.ogTags,
      key: `article:tag:${index}`,
    });
  });

  // Twitter Card
  const twitterCard = meta.image ? "summary_large_image" : "summary";
  elements.push({
    tag: "meta",
    attributes: { name: "twitter:card", content: twitterCard },
    priority: HEAD_PRIORITIES.twitterCard,
    key: "twitter:card",
  });

  if (meta.title) {
    elements.push({
      tag: "meta",
      attributes: { name: "twitter:title", content: meta.title },
      priority: HEAD_PRIORITIES.twitterTitle,
      key: "twitter:title",
    });
  }

  if (meta.description) {
    elements.push({
      tag: "meta",
      attributes: { name: "twitter:description", content: meta.description },
      priority: HEAD_PRIORITIES.twitterDescription,
      key: "twitter:description",
    });
  }

  if (meta.image) {
    elements.push({
      tag: "meta",
      attributes: { name: "twitter:image", content: meta.image },
      priority: HEAD_PRIORITIES.twitterImage,
      key: "twitter:image",
    });
  }

  if (meta.twitterUrl) {
    elements.push({
      tag: "meta",
      attributes: { property: "twitter:url", content: meta.twitterUrl },
      priority: HEAD_PRIORITIES.twitterUrl,
      key: "twitter:url",
    });
  }

  // JSON-LD
  if (meta.jsonLd) {
    const jsonLdContent = generateJsonLd(meta);
    elements.push({
      tag: "script",
      attributes: { type: "application/ld+json" },
      content: jsonLdContent,
      priority: HEAD_PRIORITIES.jsonLd,
      key: "json-ld",
    });
  }

  // Sitemap
  if (meta.sitemap) {
    elements.push({
      tag: "link",
      attributes: { rel: "sitemap", type: "application/xml", href: meta.sitemap },
      priority: HEAD_PRIORITIES.sitemap,
      key: "sitemap",
    });
  }

  // RSS
  if (meta.rss) {
    elements.push({
      tag: "link",
      attributes: {
        rel: "alternate",
        type: "application/rss+xml",
        title: meta.rss.title,
        href: meta.rss.href,
      },
      priority: HEAD_PRIORITIES.rss,
      key: "rss",
    });
  }

  return sortByPriority(dedupeByKey(elements));
};

const generateJsonLd = (meta: MetadataConfig) => {
  const baseJsonLd = {
    "@context": "https://schema.org",
    "@type": meta.jsonLd?.type || "WebSite",
    name: meta.title,
    description: meta.description,
    url: meta.url,
    author: {
      "@type": "Person",
      name: meta.author,
    },
    ...(meta.image && { image: meta.image }),
    ...(meta.publishedAt && { datePublished: meta.publishedAt }),
    ...(meta.updatedAt && { dateModified: meta.updatedAt }),
    ...meta.jsonLd?.additionalProperties,
  };

  return JSON.stringify(baseJsonLd);
};

function dedupeByKey(elements: HeadElement[]): HeadElement[] {
  const seen = new Set<string>();
  return elements.filter((el) => !seen.has(el.key) && seen.add(el.key));
}

function sortByPriority(elements: HeadElement[]): HeadElement[] {
  return elements.sort((a, b) => a.priority - b.priority);
}
