// eslint-disable max-lines-per-function
// eslint-disable max-lines
import { z } from "zod";

// Zod schemas for validation
const MetadataSchema = z
  .object({
    title: z.string().max(60).optional(),
    description: z.string().max(160).optional(),
    keywords: z.array(z.string()).max(10).optional(),
    author: z.string().optional(),
    image: z.string().url().optional(),
    url: z.string().url().optional(),
    type: z.enum(["website", "article", "profile"]).optional(),
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
  })
  .strict();

export type MetadataConfig = z.infer<typeof MetadataSchema>;

const DEFAULT_METADATA: Partial<MetadataConfig> = {
  title: "Default Title",
  description: "Default description for the page.",
  keywords: ["default", "keywords"],
  priority: 5,
};

// Head element priorities (lower = higher priority)
export const HEAD_PRIORITIES = {
  // Critical meta and base
  charset: 1,
  viewport: 2,
  base: 3,

  // Title and canonical
  title: 4,
  canonical: 5,

  // SEO meta
  description: 6,
  keywords: 7,
  author: 8,
  robots: 9,

  // Open Graph
  ogTitle: 10,
  ogDescription: 11,
  ogImage: 12,
  ogUrl: 13,
  ogType: 14,
  ogPublishedAtpublishedAt: 15,
  ogUpdatedAt: 16,
  ogSection: 17,
  ogTags: 18,

  // Twitter
  twitterCard: 19,
  twitterTitle: 20,
  twitterDescription: 21,
  twitterImage: 22,

  // Structured data
  jsonLd: 23,

  // Icons and manifest
  favicon: 24,
  appleTouchIcon: 25,
  msapplicationTileImage: 26,
  msapplicationTileColor: 27,
  themeColor: 28,
  manifest: 29,
  icon: 30,

  // Alternate and feeds
  rss: 31,
  alternate: 32,

  // Resource hints
  preload: 33,
  modulepreload: 34,
  prefetch: 35,
  dnsPrefetch: 36,
  preconnect: 37,

  // Links, scripts, styles
  link: 38,
  script: 39,
  style: 40,
  noscript: 41,

  // Custom
  custom: 42,
};

interface HeadElement {
  tag: string;
  attributes?: { [key: string]: string | boolean };
  content?: string;
  children?: HeadElement[]; // For nested elements, if needed
  priority: number;
  key: string;
}

export const generateMetadata = (config: MetadataConfig = {}) => {
  const validatedConfig = MetadataSchema.parse(config);
  const meta = { ...DEFAULT_METADATA, ...validatedConfig };

  const elements: HeadElement[] = [];

  // Basic meta tags
  if (meta.title) {
    elements.push({
      tag: "title",
      content: meta.title,
      priority: HEAD_PRIORITIES.title,
      key: "title",
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
      priority: HEAD_PRIORITIES.ogPublishedAtpublishedAt,
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

  // Sort by priority
  return elements.sort((a, b) => a.priority - b.priority);
};
