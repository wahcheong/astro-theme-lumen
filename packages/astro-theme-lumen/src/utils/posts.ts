import type { AstroComponentFactory } from "astro/runtime/server/index.js";
import { getCollection, render } from "astro:content";
import config from "virtual:astro-theme-lumen/config";
import { formatYear } from "./date";

/**
 * Structural shape of a content entry.
 *
 * The theme deliberately does not depend on Astro's generated collection
 * types: those belong to the consumer's project, and a published package
 * cannot import them. Everything the theme needs is described here.
 */
export interface LumenEntry {
  id: string;
  collection: string;
  body?: string;
  filePath?: string;
  data: {
    title?: string;
    description?: string;
    pubDatetime?: Date | string;
    modDatetime?: Date | string | null;
    author?: string;
    tags?: string[];
    draft?: boolean;
    pinned?: boolean;
    ogImage?: unknown;
    canonicalURL?: string;
    timezone?: string;
    [key: string]: unknown;
  };
}

export interface LumenHeading {
  depth: number;
  slug: string;
  text: string;
}

export interface LumenRendered {
  Content: AstroComponentFactory;
  headings?: LumenHeading[];
  remarkPluginFrontmatter?: Record<string, unknown>;
}

/**
 * Render a content entry.
 *
 * Astro 5 moved rendering off the entry and into a `render` export from
 * `astro:content`; this wrapper hides that boundary and keeps the loose typing
 * the package needs in one place.
 */
export async function renderEntry(entry: LumenEntry): Promise<LumenRendered> {
  const renderAny = render as unknown as (
    entry: LumenEntry
  ) => Promise<LumenRendered>;
  return renderAny(entry);
}

/** Astro's collection API typed loosely, so a package can call it. */
function collection(name: string, filter?: (entry: LumenEntry) => boolean) {
  const get = getCollection as unknown as (
    name: string,
    filter?: (entry: LumenEntry) => boolean
  ) => Promise<LumenEntry[]>;
  return get(name, filter);
}

/** Timestamp used for ordering; `pubDatetime` is the source of truth. */
export function publishedAt(entry: LumenEntry): number {
  const value = entry.data.pubDatetime;
  if (!value) return 0;
  return new Date(value).getTime();
}

/** Last-modified timestamp, falling back to the publish date. */
export function modifiedAt(entry: LumenEntry): number {
  const value = entry.data.modDatetime;
  if (!value) return publishedAt(entry);
  return new Date(value).getTime();
}

/**
 * Whether a post is visible right now.
 *
 * Drafts never ship, and `scheduledPostMargin` keeps future-dated posts out of
 * the build until their moment arrives.
 */
export function isPublished(entry: LumenEntry, now = Date.now()): boolean {
  if (entry.data.draft) return false;
  return publishedAt(entry) - config.posts.scheduledPostMargin <= now;
}

/** Every published post, newest first. */
export async function getSortedPosts(): Promise<LumenEntry[]> {
  const posts = await collection(config.posts.collection);
  return posts
    .filter(entry => isPublished(entry))
    .sort((a, b) => publishedAt(b) - publishedAt(a));
}

/**
 * Split published posts into the pinned group and the rest.
 *
 * The homepage renders both halves in a single list, pinned first, so a pinned
 * post is never shown twice. Returning both halves together is what keeps that
 * rule in one place, instead of leaving every caller to re-derive it — and to
 * forget the exclusion.
 */
export async function splitPinnedPosts(): Promise<{
  pinned: LumenEntry[];
  recent: LumenEntry[];
}> {
  const posts = await getSortedPosts();
  const pinned = posts.filter(entry => entry.data.pinned);
  const pinnedIds = new Set(pinned.map(entry => entry.id));

  return {
    pinned,
    recent: posts.filter(entry => !pinnedIds.has(entry.id)),
  };
}

/** Every tag with the number of published posts carrying it, busiest first. */
export async function getTagCounts(): Promise<Map<string, number>> {
  const posts = await getSortedPosts();
  const counts = new Map<string, number>();

  for (const post of posts) {
    for (const tag of post.data.tags ?? []) {
      counts.set(tag, (counts.get(tag) ?? 0) + 1);
    }
  }

  return new Map(
    [...counts.entries()].sort(
      (a, b) => b[1] - a[1] || a[0].localeCompare(b[0])
    )
  );
}

/** Published posts carrying `tag`, newest first. */
export async function getPostsByTag(tag: string): Promise<LumenEntry[]> {
  const posts = await getSortedPosts();
  const needle = tag.toLowerCase();
  return posts.filter(post =>
    (post.data.tags ?? []).some(value => value.toLowerCase() === needle)
  );
}

/** Published posts grouped into calendar years, newest year first. */
export async function getPostsByYear(): Promise<
  Array<{ year: string; posts: LumenEntry[] }>
> {
  const posts = await getSortedPosts();
  const groups = new Map<string, LumenEntry[]>();
  const timeZone = config.site.timezone;

  for (const post of posts) {
    const year = formatYear(new Date(publishedAt(post)), timeZone);
    const bucket = groups.get(year);
    if (bucket) bucket.push(post);
    else groups.set(year, [post]);
  }

  return [...groups.entries()]
    .map(([year, entries]) => ({ year, posts: entries }))
    .sort((a, b) => Number(b.year) - Number(a.year));
}

/** The post published immediately before and after `entry`, if any. */
export async function getAdjacentPosts(entry: LumenEntry): Promise<{
  older?: LumenEntry;
  newer?: LumenEntry;
}> {
  const posts = await getSortedPosts();
  const index = posts.findIndex(post => post.id === entry.id);
  if (index === -1) return {};

  return {
    newer: index > 0 ? posts[index - 1] : undefined,
    older: index < posts.length - 1 ? posts[index + 1] : undefined,
  };
}

/**
 * Estimated reading time in minutes.
 *
 * Latin words and CJK characters are counted separately, because a character
 * count would wildly overstate an English post and a word count would
 * understate a Chinese one.
 */
export function readingTimeMinutes(body = ""): number {
  const latinWords = (body.match(/[A-Za-z0-9'’\-]+/g) ?? []).length;
  const cjkChars = (
    body.match(/[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff\uac00-\ud7af]/g) ?? []
  ).length;

  const minutes = latinWords / 220 + cjkChars / 400;
  return Math.max(1, Math.round(minutes));
}

/** Look up a standalone page (e.g. `about`) from the pages collection. */
export async function getPage(id: string): Promise<LumenEntry | undefined> {
  const pages = await collection(config.posts.pagesCollection);
  const needle = id.toLowerCase();

  return (
    pages.find(page => page.id === id) ??
    pages.find(page => page.id.toLowerCase() === needle)
  );
}

/** Every standalone page, sorted by id for stable ordering. */
export async function getPages(): Promise<LumenEntry[]> {
  const pages = await collection(config.posts.pagesCollection);
  return [...pages].sort((a, b) => a.id.localeCompare(b.id));
}

/** Split a list into pages of `size`, returning at least one page. */
export function paginate<T>(items: T[], size: number): T[][] {
  const pageSize = Math.max(1, size);
  const total = Math.max(1, Math.ceil(items.length / pageSize));
  return Array.from({ length: total }, (_, index) =>
    items.slice(index * pageSize, index * pageSize + pageSize)
  );
}

/** URL of a listing page: page 1 is the bare path, later pages are `/page/n`. */
export function pageUrl(base: string, page: number): string {
  const clean = base.endsWith("/") && base !== "/" ? base.slice(0, -1) : base;
  return page <= 1 ? clean : `${clean}/page/${page}`;
}
