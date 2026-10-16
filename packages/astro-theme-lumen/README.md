# Lumen

**An Astro theme for blogs.**
Lumen is built for reading, and costs almost nothing to load.

```
astro  ·  tailwind v4  ·  mdx  ·  typescript
```

Screenshots and a working demo live in the
[repository](https://github.com/wahcheong/astro-theme-lumen).

---

## Why another blog theme

Most Astro blog themes are templates. You clone the repository, delete the parts
you do not want, and then merge upstream changes by hand forever.

Lumen ships as an **npm package with injected routes**. A fix or a new feature
arrives as a version bump, and there is no fork to keep in sync.

The homepage is a plain list of cards — no hero, no sidebar, nothing taking the
top third of the screen before a reader reaches any writing. Posts you mark
`pinned` lead that list and carry a small pin icon.

**Roadmap:** a documentation section is planned. Blog only, for now.

---

## Quick start

### 1. Install

```bash
npm install astro-theme-lumen @tailwindcss/vite tailwindcss
npm install -D @iconify-json/lucide @iconify-json/simple-icons
```

`astro`, `tailwindcss` and `@tailwindcss/vite` are peer dependencies — the theme
never pins them for you.

The two icon sets are peer dependencies as well, and they have to be installed
**in your project** rather than only as a transitive dependency: the theme
resolves icon names through `astro-icon`, which looks the sets up from the
project root. `lucide` covers every UI glyph; `simple-icons` supplies the brand
marks, which Lucide does not carry. Missing sets fail the build with
`Unable to locate the "lucide" icon set!`.

### 2. Register the integration

```ts
// astro.config.ts
import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import lumen from "astro-theme-lumen";

export default defineConfig({
  site: "https://example.com/",
  integrations: [lumen()],
  vite: {
    plugins: [tailwindcss()],
  },
});
```

### 3. Configure the theme

```ts
// lumen.config.ts
import { defineLumenConfig } from "astro-theme-lumen/config";

export default defineLumenConfig({
  site: {
    url: "https://example.com/",
    title: "Your site",
    description: "What this site is about.",
    author: "Your name",
    lang: "en",
    timezone: "Asia/Shanghai",
  },
});
```

### 4. Declare the content collections

```ts
// src/content.config.ts
import { defineCollection } from "astro:content";
import { z } from "astro/zod";
import { glob } from "astro/loaders";

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
```

### 5. Create the Tailwind entry

```css
/* src/styles/global.css */
@import "tailwindcss";
@import "astro-theme-lumen/styles/theme.css";
@import "astro-theme-lumen/styles/prose.css";
```

> **This file is required.** Tailwind v4 only registers `@theme` tokens and
> scans `@source` directories inside the bundle that imports `tailwindcss`, so
> the theme cannot supply it. The integration resolves this path and injects it
> into every route it owns. If it is missing, a fallback renders an unstyled
> site and logs a warning.

### 6. Write something

```
src/content/posts/hello-world.md
src/content/pages/about.md
```

```md
---
title: "Hello world"
description: "The first post."
pubDatetime: 2026-01-01T09:00:00+08:00
tags: ["meta"]
---

Content goes here.
```

That is the whole setup. Run `astro dev`.

---

## What gets injected

Routes are injected by the integration, so they live in the package rather than
your `src/pages`. **A file you create in `src/pages` always wins** — that is the
override mechanism.

| Route | Source |
| --- | --- |
| `/` | `routes/index.astro` |
| `/posts` | `routes/posts/index.astro` |
| `/posts/page/[page]` | `routes/posts/page/[page].astro` |
| `/posts/[...slug]` | `routes/posts/[...slug].astro` |
| `/tags` | `routes/tags/index.astro` |
| `/tags/[tag]` | `routes/tags/[tag].astro` |
| `/archives` | `routes/archives.astro` |
| `/about` | `routes/about.astro` |
| `/rss.xml` | `routes/rss.xml.ts` |
| `/404` | `routes/404.astro` |

The listing uses a literal `page` segment deliberately: Astro's route priority
then always prefers `/posts/page/2` over `/posts/[...slug]`, which keeps
paginated listings and detail pages unambiguous.

---

## Configuration reference

### `site` — required

| Field | Type | Default | Notes |
| --- | --- | --- | --- |
| `url` | `string` | `"https://example.com/"` | Canonical URL, used for RSS and absolute links |
| `title` | `string` | `"Lumen"` | Header, `<title>`, RSS channel |
| `description` | `string` | — | `<meta name="description">` |
| `author` | `string` | `"Anonymous"` | Fallback author for posts |
| `lang` | `string` | `"en"` | BCP-47 tag |
| `dir` | `"ltr" \| "rtl"` | `"ltr"` | Text direction |
| `timezone` | `string` | `"UTC"` | IANA zone for every rendered date |
| `ogImage` | `string` | `"default-og.jpg"` | Social card in `public/` |

### `posts`

| Field | Type | Default |
| --- | --- | --- |
| `perPage` | `number` | `6` |
| `perIndex` | `number` | `4` |
| `scheduledPostMargin` | `number` | `15 * 60 * 1000` |
| `collection` | `string` | `"posts"` |
| `pagesCollection` | `string` | `"pages"` |

### Pinned posts

Set `pinned: true` in a post's frontmatter to pin it:

```md
---
title: "Introducing Lumen"
pinned: true
---
```

Pinned posts lead the homepage list and carry a pin icon in their meta row.
They are **removed from the chronological run**, so a pinned post is shown once,
never twice. `perIndex` counts only the recent posts, so pinning does not eat
into it.

Nothing changes when no post is pinned — the icon simply never renders, which is
why the field defaults to `false`.

### `features`

| Field | Type | Default |
| --- | --- | --- |
| `lightAndDarkMode` | `boolean` | `true` |
| `showReadingTime` | `boolean` | `true` |
| `showToc` | `boolean` | `true` |
| `showEditPost` | `boolean` | `false` |
| `editPostUrl` | `string` | `""` |
| `showBackButton` | `boolean` | `true` |
| `showShareLinks` | `boolean` | `true` |
| `showFooter` | `boolean` | `true` |

### `socials`, `shareLinks`, `nav`

Arrays of `{ name, url, label? }`. `socials` and `shareLinks` pair `name` with a
built-in icon (`github`, `x`, `linkedin`, `telegram`, `whatsapp`, `facebook`,
`mail`, `rss`). `nav` is an array of `{ label, href, icon? }`. The optional
`icon` names any [Lucide](https://lucide.dev/icons) icon — pass it without the
collection prefix (`doc`, `calendar`, `map-pin`, `anchor`, …) and it resolves
through `astro-icon` at build time. Brand marks come from Simple Icons instead;
the theme maps `github`, `x`, `linkedin`, `telegram`, `whatsapp` and `facebook`
for you. Icons are decorative, so the label is always rendered and an unknown
name simply draws nothing rather than breaking the page.

Collection-valued keys are **replaced**, not concatenated, so an intentionally
empty list works.

---

## Integration options

```ts
lumen({
  configFile: "config/lumen.ts", // default: lumen.config.* at the project root
  stylesheet: "src/styles/site.css", // default: probed from src/styles/global.css
  codeTheme: { light: "github-light", dark: "github-dark" }, // or `false`
  routes: {
    tags: false,
    archives: false,
    about: false,
    rss: false,
    notFound: false,
  },
});
```

Every route toggle defaults to `true`. Turning one off also removes it from the
default navigation.

### Code highlighting

The integration configures Shiki with a light/dark theme pair and
`defaultColor: false`. That is not cosmetic: with a single theme Shiki writes
its background as an inline style, which no stylesheet can override, so code
blocks would stay dark in light mode.

Pass `codeTheme: false` to take over `markdown.shikiConfig` yourself — but keep
`defaultColor: false`, or re-add the light rules shown in `styles/prose.css`.

---

## Theming

Override the tokens rather than the components:

```css
/* src/styles/global.css */
@import "tailwindcss";
@import "astro-theme-lumen/styles/theme.css";
@import "astro-theme-lumen/styles/prose.css";

:root {
  --lumen-accent: oklch(0.62 0.14 250);
}

.dark {
  --lumen-accent: oklch(0.78 0.12 250);
}
```

Because `@theme inline` makes utilities reference the variables instead of
copying their values, this restyles everything without regenerating CSS.

The palette that ships is a pure greyscale: every `--lumen-*` colour token sits
on the neutral axis, so light mode is black on white and dark mode is white on
near-black. The example above is the intended way to put colour back — override
`--lumen-accent` (and any other token) in your own stylesheet.

### Hover states

Hover colours are their own layer, so you can restyle every hover without
changing links, buttons or active states:

| Token | Paints | Default |
| --- | --- | --- |
| `--lumen-hover-ink` | hovered text, full-strength hover borders | `--lumen-accent` |
| `--lumen-hover-surface` | hovered icon-button and list-row backgrounds | `--lumen-elevated` |
| `--lumen-hover-line` | hovered card and pill borders | `--lumen-accent` at 40% |
| `--lumen-hover-soft` | filled hover background for tags and share links | `--lumen-accent-soft` |

Set them in `:root` and `.dark` like any other token. Components reach them
through the `text-hover-ink`, `bg-hover-surface`, `border-hover-line` and
`bg-hover-soft` utilities.

### Fonts

The theme loads **no webfont**. Latin comes from the platform UI font and CJK
from the families listed explicitly in the stack, so a Chinese setup does not
depend on the browser's last-resort font (which differs per OS):

```css
--lumen-font-sans: var(--lumen-font-sans-override, ui-sans-serif), system-ui,
  -apple-system, "Segoe UI", "Noto Sans SC", "PingFang SC", "Microsoft YaHei",
  "Noto Sans CJK SC", sans-serif;
--lumen-font-mono: var(--lumen-font-mono-override, ui-monospace),
  "SFMono-Regular", "JetBrains Mono", Menlo, Consolas, monospace;
```

The two `-override` hooks let you prepend your own face while keeping the rest
of the chain — the usual move for mixed Chinese/English text, where a Latin
webfont is cheap but a CJK one is not:

```css
:root {
  --lumen-font-sans-override: "Inter";
}
```

Because `font-family` resolves per glyph, Latin is drawn with `Inter` and Chinese
falls through to `PingFang SC` / `Microsoft YaHei` / `Noto Sans CJK SC` with no
extra work. To go further, override `--lumen-font-sans` wholesale and put your
own CJK family in the chain.

> A full CJK webfont is several megabytes, so subset it (`cn-font-split`,
> `fontmin`, `glyphhanger`) or load one that already ships split by
> `unicode-range`.

To change markup, copy the component you want into your own `src/components/`
and override the route that renders it via `src/pages/`.

---

## Notes on packaging

Three things make an Astro theme harder to ship as a package than as a template,
and Lumen works around all three:

1. **Pages cannot live in `node_modules`.** They are injected with
   `injectRoute` and an absolute `URL` entrypoint.
2. **Content schemas stay with the consumer.** Astro requires
   `src/content.config.ts` in the project, so the theme types entries
   structurally (`LumenEntry`) instead of importing generated types.
3. **Config has to cross a module boundary.** A Vite plugin serves
   `virtual:astro-theme-lumen/config`, which imports the consumer's config,
   merges defaults, and `injectTypes` publishes the declaration.

---

## Development

This repository is a pnpm workspace:

- `packages/astro-theme-lumen` — the published package
- `demo` — a site that consumes it via `workspace:*`

```bash
pnpm install
pnpm dev      # demo dev server
pnpm build    # demo production build
pnpm check    # type-check demo + theme sources
```

The demo doubles as the theme's documentation: its `lumen.config.ts`,
`src/content.config.ts` and `src/styles/global.css` are the reference setup.

---

## License

MIT

## Credits

Icons are not bundled with the theme — they resolve through
[`astro-icon`](https://github.com/natemoo-re/astro-icon) against the Iconify
collections you install:

- UI glyphs: [Lucide](https://lucide.dev) — ISC
- Brand marks: [Simple Icons](https://simpleicons.org) — CC0

The theme ships icon *names* only; the artwork comes from those packages, which
carry their own licence files.
