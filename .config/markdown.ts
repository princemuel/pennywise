import { spawnSync } from "node:child_process";
import { statSync } from "node:fs";

import { rehypeHeadingIds } from "@astrojs/markdown-remark";
import { Temporal } from "@js-temporal/polyfill";
import { toString as parseToString } from "mdast-util-to-string";
import getReadingTime from "reading-time";
import rehypeExternalLinks from "rehype-external-links";
import remarkEmoji from "remark-emoji";
import { visit } from "unist-util-visit";

import type { AstroUserConfig } from "astro";

type Config = NonNullable<NonNullable<AstroUserConfig["markdown"]>>;
type RemarkPlugin = NonNullable<Config["remarkPlugins"]>[number];

const remarkReadingTime: RemarkPlugin = () => {
  return (tree, file) => {
    if (file.data.astro?.frontmatter) {
      const textOnPage = parseToString(tree);
      const readingTime = getReadingTime(textOnPage);
      file.data.astro.frontmatter.words = readingTime.words;
      file.data.astro.frontmatter.duration = readingTime.text;
    }
  };
};

const remarkDeruntify: RemarkPlugin = () => (tree) => {
  visit(tree, "text", (node) => {
    const wordCount = node.value.split(" ").length;
    if (4 <= wordCount) node.value = node.value.replace(/ ([^ ]*)$/, "\u00A0$1");
  });
};

const remarkModifiedTime: RemarkPlugin = () => (_, file) => {
  const getFileModifiedTime = (filePath: string): Temporal.Instant => {
    if (!filePath || "string" !== typeof filePath) return Temporal.Now.instant();

    try {
      const result = spawnSync("git", ["log", "-1", "--pretty=format:%cI", filePath], {
        encoding: "utf8",
        cwd: process.cwd(),
      });

      if (0 !== result.status || !result.stdout?.trim())
        throw new Error("Git command failed or returned empty");

      return Temporal.Instant.from(result.stdout.trim());
    } catch {
      // Fallback to file system modified time if available
      try {
        const stats = statSync(filePath);
        return Temporal.Instant.from(stats.mtime.toISOString());
      } catch {
        return Temporal.Now.instant();
      }
    }
  };

  const timeModified = getFileModifiedTime(file.history?.[0] ?? "");

  if (file.data?.astro?.frontmatter && !file.data.astro.frontmatter.updatedAt) {
    file.data.astro.frontmatter.updatedAt = timeModified.toString();
  }
};

export default {
  remarkPlugins: [
    remarkDeruntify,
    remarkReadingTime,
    remarkModifiedTime,
    [remarkEmoji, { accessible: true, padSpaceAfter: true, emoticon: true }],
  ],
  rehypePlugins: [
    [rehypeHeadingIds, { experimentalHeadingIdCompat: true }],
    [rehypeExternalLinks, { rel: ["noopener", "noreferrer", "external"], target: "_blank" }],
  ],
} satisfies Config;
