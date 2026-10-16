import { defineLumenConfig } from "astro-theme-lumen/config";

export default defineLumenConfig({
  site: {
    url: "https://lumen.example.com/",
    title: "Lumen",
    description:
      "An Astro theme for blogs — built for reading, and costs almost nothing to load.",
    author: "huachang",
    lang: "en",
    dir: "ltr",
    timezone: "Asia/Shanghai",
    ogImage: "default-og.jpg",
  },
  posts: {
    perPage: 6,
    perIndex: 4,
  },
  socials: [
    { name: "github", url: "https://github.com/wahcheong" },
    { name: "mail", url: "mailto:hello@example.com" },
  ],
});
