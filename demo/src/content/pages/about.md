---
title: "About"
description: "What this site is, and who writes here."
---

This is the **Lumen** demo site — a working example of the theme rather than a
real person's blog. Everything you see is rendered by routes injected from the
`astro-theme-lumen` package.

## What Lumen is for

Lumen is an Astro theme for blogs and documentation-style sites. The homepage
is a plain list of recent posts; everything else is the usual furniture — a
paginated index, tags, per-year archives, and RSS.

It is deliberately small:

- **No client framework.** No islands; outside the search page, the only script
  on a page is the theme toggle.
- **No CMS.** Content lives in Markdown and MDX under `src/content/`.
- **No plugin to learn.** One config file, `lumen.config.ts`.

## Configuring it

Point the theme at your own details:

```ts
import { defineLumenConfig } from "astro-theme-lumen/config";

export default defineLumenConfig({
  site: {
    url: "https://example.com/",
    title: "Your site",
    author: "Your name",
  },
});
```

> Every field other than `site` is optional. The theme fills in sensible
> defaults so a minimal config stays readable.

## Where things live

| What | Where |
| --- | --- |
| Posts | `src/content/posts/` |
| Standalone pages | `src/content/pages/` |
| Collection schema | `src/content.config.ts` |
| Theme config | `lumen.config.ts` |
| Tailwind entry | `src/styles/global.css` |

If you want to change how something renders, override any theme component in
your own `src/components/` and it takes precedence.
