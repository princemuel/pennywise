// eslint-disable no-object-as-default-parameter
// eslint-disable func-style
export const site_settings = {
  id: "settings",
  /** The site title*/
  name: "Prince Muel",
  /** A human-readable description of the site*/
  description: "",
  /** The site's default language as a string, e.g. `"en-US"`*/
  language: "en" as ["en", "fr", "es"][number],
  /** The site's timezone as a string, e.g. `"Europe/Paris"`*/
  timezone_string: "Africa/Lagos",
  /** The site's timezone expressed as an offset in hours from GMT*/
  gmt_offset: 1,
  /** The URL of the site*/
  url: new URL("/", import.meta.env.SITE),
  /** The URL of the site homepage. (Usually the same as `url`)*/
  home: new URL("/", import.meta.env.SITE),
  /** The site's author's handle as a string, e.g. `"the_primeagean"`*/
  site_author: "princemuel",
  /** Reference to a media attachment to use as the site icon*/
  site_icon: "",
  /** Reference to a media attachment to use as the site logo*/
  site_logo: "",
  /** URL to a resource to use as the site icon*/
  site_icon_url: "",
  /** The publish date of the site*/
  published_date: new Date("2024-02-01T16:43:29.577Z"),
} as const;

export const N_A = `HTTP method %M% not allowed`;

type TitleContent = string | [title: string, isStandAlone?: boolean];
type TitleTemplate = Lowercase<string>;
interface TemplateContext {
  [key: string]: string;
}

/**
 * Formats the HTML title based on the provided content and template.
 * If content is an array, it expects the first element to be the page title
 * and the second to indicate if it's a standalone page.
 * If content is a string, it uses that as the page title.
 * The template can include placeholders for title and brand.
 *
 * @param content - The page title content, either a string or an array.
 * @param template - The title template with placeholders.
 * @param context - Additional context for placeholders in the template.
 * @returns The formatted HTML title string.
 */
export function htmlTitle(
  content?: TitleContent,
  template: TitleTemplate = "%title% | %brand%",
  context: TemplateContext = { brand: "Prince Muel" },
): string {
  const fallback = `${context.brand} | Developer, Educator & Musician`;

  if (!content) return fallback;

  if (Array.isArray(content)) {
    const [title, isStandAlone] = content;
    if (isStandAlone) return title || fallback;

    return template.replaceAll(/%(\w+)%/gu, (match, key) => {
      if ("title" === key) return title;
      return context[key] || match;
    });
  }

  return template.replaceAll(/%(\w+)%/gu, (match, key) => {
    if ("title" === key) return content;
    return context[key] || match;
  });
}

export const baseData = {
  title: "Cesar Poumian's Blog",
  description: "Cesar Poumian's blog. Web development, programming, and personal projects.",
  home_intro:
    "Welcome to my blog! I’m a web developer based in México. I created this blog to document techniques, patterns, insights, etc. To keep myself accountable, I also document any new personal projects I work on.",
  greeting: "Hello, I'm Cesar 👋",
  blog_intro:
    "Below are all my recent blog posts. Some of them are tutorials, others are project walk-throughs/case-studies, and some are insights discussing things like libraries, courses, developer resources, etc.",
  blog_title: "My Posts",
};

export const delimiter = "–";
export const published_date = new Date("2024-02-01T16:43:29.577Z");

export const homeKeywords = [
  "princemuel",
  "iamprincemuel",
  "princemuel_cs",
  "pHoeniX-svg",
  "Prince Muel",
  "Samuel Chukwuzube",
  "Software Engineer",
  "Frontend Engineer",
  "Web Developer",
  "React Developer",
  "Coding Instructor",
  "Musician",
  "Educator",
  "React",
  "Node.js",
  "GraphQL",
  "JavaScript",
  "Typescript",
  "Frontend Development",
  "Web Design",
  "UI/UX",
  "Web Applications",
  "Tech Industry",
  "Portfolio",
  "Africa",
];

export const defaultKeywords = [
  "React",
  "Qwik",
  "Astro",
  "Remix",
  "Next.js",
  "JavaScript",
  "TypeScript",
  "Styled Components",
  "TailwindCSS",
  "Jest",
  "Vitest",
  "Rust",
  "Testing",
  "React Testing Libary",
  "Node.js",
  "MongoDB",
  "Jamstack",
  "Component Library",
  "Serverless Functions",
  "Edge Functions",
  "SQL",
  "GraphQL",
  "Postgres",
  "Linux",
  "Security",
  "Homelab",
  "Bash",
  "Interview",
  "Engineering",
  "Competition",
  "Cloudflare",
  "Database",
  "Devops",
  "Oss",
  "Git",
  "Gatsby",
  "Golang",
  "Projects",
  "Performance",
  "Personal",
  "System Design",
  "Networking",
  "Frontend Development",
  "Web Design",
  "UI/UX",
];

export interface NewsletterFormInput {
  email: string;
  first_name?: string;
  last_name?: string;
  from_url?: string;
}

export type PostClickedFrom = "recent" | "suggested" | "previous" | "next";
