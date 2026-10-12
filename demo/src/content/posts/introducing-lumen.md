---
title: "Introducing Lumen"
description: "An Astro theme for blogs: reading-first, no client framework, and installed as a package instead of forked as a template."
pubDatetime: 2026-09-14T09:00:00+08:00
tags: ["meta", "design"]
pinned: true
---

Most Astro blog themes are templates. You clone the repository, delete the parts
you do not want, and then merge upstream changes by hand forever. Lumen is a
package instead.

## What that buys you

You install it and point a config file at your details. A fix or a new feature
then arrives as a version bump — no fork to keep in sync, and no merge conflicts
when the theme changes.

## What it is trying to be

Lumen is built around reading. The homepage is a plain list of recent writing,
with nothing claiming the top of the screen before a reader reaches a post.

Past that it is an ordinary blog: an index, tags, an archive, and a feed.

> Good typography is invisible. You only notice it when it is wrong.

The design leans on type rather than decoration — one measure, one type scale,
and a palette that stays out of the way of the text.

## What it deliberately does not do

- No client-side framework. Interactivity stays at the minimum a blog needs.
- No flash of the wrong colour scheme on first paint.

---

Lumen is still young and the details are moving, so this introduction stays
deliberately short. The [about page](/about) has the current setup instructions.
