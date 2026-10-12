import rss from "@astrojs/rss";
import type { APIContext } from "astro";
import config from "virtual:astro-theme-lumen/config";
import { getSortedPosts } from "../utils/posts";

export async function GET(context: APIContext) {
  const posts = await getSortedPosts();
  const site = context.site ?? new URL(config.site.url);

  return rss({
    title: config.site.title,
    description: config.site.description,
    site,
    trailingSlash: true,
    customData: `<language>${config.site.lang}</language>`,
    items: posts.map(post => ({
      title: post.data.title ?? "Untitled",
      description: post.data.description ?? "",
      pubDate: post.data.pubDatetime
        ? new Date(post.data.pubDatetime)
        : new Date(),
      link: `/posts/${post.id}/`,
      categories: post.data.tags ?? [],
      author: post.data.author ?? config.profile.name ?? config.site.author,
    })),
  });
}
