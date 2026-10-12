import { defineCollection } from "astro:content";
import { z } from "astro/zod";
import { glob } from "astro/loaders";

/**
 * Collections the Lumen theme expects.
 *
 * Names are configurable via `posts.collection` / `posts.pagesCollection` in
 * `lumen.config.ts`, but the field shapes below are what the theme reads.
 */

const posts = defineCollection({
  loader: glob({ pattern: "**/[^_]*.{md,mdx}", base: "./src/content/posts" }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string(),
      pubDatetime: z.coerce.date(),
      modDatetime: z.coerce.date().optional().nullable(),
      author: z.string().optional(),
      tags: z.array(z.string()).default([]),
      draft: z.boolean().default(false),
      pinned: z.boolean().default(false),
      ogImage: z.union([image(), z.string()]).optional(),
      canonicalURL: z.string().optional(),
    }),
});

const pages = defineCollection({
  loader: glob({ pattern: "**/[^_]*.{md,mdx}", base: "./src/content/pages" }),
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
  }),
});

export const collections = { posts, pages };
