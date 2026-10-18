import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { AstroIntegration } from "astro";
import type { Plugin } from "vite";
import icon from "astro-icon";
// Imported eagerly on purpose. `astro:build:done` runs after Vite's module
// runner has shut down, so a dynamic import there fails; a static import is
// already bound by the time the hook fires.
import { createIndex } from "pagefind";
import {
  INTEGRATION_NAME,
  RESOLVED_VIRTUAL_CONFIG_ID,
  RESOLVED_VIRTUAL_STYLES_ID,
  USER_CONFIG_FILE_NAMES,
  USER_STYLESHEET_CANDIDATES,
  VIRTUAL_CONFIG_ID,
  VIRTUAL_STYLES_ID,
} from "./consts";

/** Which injected routes the consumer wants. Everything defaults to `true`. */
export interface LumenRouteOptions {
  /** `/tags` and `/tags/[tag]`. */
  tags?: boolean;
  /** `/archives`. */
  archives?: boolean;
  /** `/about`, rendered from the `about` entry of the pages collection. */
  about?: boolean;
  /** `/search`, backed by a Pagefind index written after `astro build`. */
  search?: boolean;
  /** `/rss.xml`. */
  rss?: boolean;
  /** `/404`. */
  notFound?: boolean;
}

/** Options accepted by the `lumen()` integration. */
export interface LumenOptions {
  /** Explicit config path, relative to the project root. */
  configFile?: string;
  /** Explicit Tailwind entry path, relative to the project root. */
  stylesheet?: string;
  /** Route toggles. Every route is injected unless switched off here. */
  routes?: LumenRouteOptions;
  /**
   * Shiki theme pair used for code blocks.
   *
   * The theme ships a light/dark pair and sets `defaultColor: false` so the
   * prose layer can switch between them with the colour scheme. Pass `false`
   * to configure Shiki yourself, or your own pair to keep the mechanism and
   * change the colours.
   */
  codeTheme?: { light: string; dark: string } | false;
}

/** Shiki themes the theme installs unless told otherwise. */
export const DEFAULT_CODE_THEME = {
  light: "min-light",
  dark: "min-dark",
} as const;

interface RouteDefinition {
  pattern: string;
  /** Path relative to `src/routes/`. */
  entry: string;
  /** Route option gating this entry; omitted means always injected. */
  option?: keyof LumenRouteOptions;
}

/**
 * Route table.
 *
 * `/posts/page/[page]` and `/posts/[...slug]` overlap on paper by design: the
 * listing uses a literal `page` segment so Astro's route priority always
 * prefers it, which keeps detail pages and paginated listings unambiguous.
 */
const ROUTES: readonly RouteDefinition[] = [
  { pattern: "/", entry: "index.astro" },
  { pattern: "/posts", entry: "posts/index.astro" },
  { pattern: "/posts/page/[page]", entry: "posts/page/[page].astro" },
  { pattern: "/posts/[...slug]", entry: "posts/[...slug].astro" },
  { pattern: "/tags", entry: "tags/index.astro", option: "tags" },
  { pattern: "/tags/[tag]", entry: "tags/[tag].astro", option: "tags" },
  { pattern: "/archives", entry: "archives.astro", option: "archives" },
  { pattern: "/about", entry: "about.astro", option: "about" },
  { pattern: "/search", entry: "search.astro", option: "search" },
  { pattern: "/rss.xml", entry: "rss.xml.ts", option: "rss" },
  { pattern: "/404", entry: "404.astro", option: "notFound" },
];

/** Find the first existing file from `candidates` under `rootDir`. */
function findFirstExisting(
  rootDir: string,
  candidates: readonly string[]
): string | undefined {
  for (const name of candidates) {
    const candidate = path.join(rootDir, name);
    if (fs.existsSync(candidate)) return candidate;
  }
  return undefined;
}

/** Resolve the consumer's `lumen.config.*` file, if any. */
function findUserConfig(
  rootDir: string,
  explicit?: string
): string | undefined {
  if (explicit) {
    const candidate = path.resolve(rootDir, explicit);
    if (!fs.existsSync(candidate)) {
      throw new Error(
        `[${INTEGRATION_NAME}] \`configFile\` points at "${candidate}", which does not exist.`
      );
    }
    return candidate;
  }

  return findFirstExisting(rootDir, USER_CONFIG_FILE_NAMES);
}

/**
 * Serve `virtual:astro-theme-lumen/config`.
 *
 * The module re-exports the consumer's config with every default applied, so
 * theme components can treat the resolved shape as fully populated.
 */
function createVirtualConfigPlugin(
  configModulePath: string,
  userConfigPath: string | undefined,
  routes: Required<LumenRouteOptions>
): Plugin {
  return {
    name: "astro-theme-lumen:virtual-config",
    enforce: "pre",
    resolveId(id) {
      if (id === VIRTUAL_CONFIG_ID) return RESOLVED_VIRTUAL_CONFIG_ID;
      return null;
    },
    load(id) {
      if (id !== RESOLVED_VIRTUAL_CONFIG_ID) return null;

      return [
        `import { resolveLumenConfig, pruneNav } from ${JSON.stringify(configModulePath)};`,
        userConfigPath
          ? `import userConfig from ${JSON.stringify(userConfigPath)};`
          : `const userConfig = { site: {} };`,
        `export default pruneNav(resolveLumenConfig(userConfig), ${JSON.stringify(routes)});`,
      ].join("\n");
    },
  };
}

/**
 * Serve `virtual:astro-theme-lumen/styles`.
 *
 * Injected routes live inside the package, so the consumer has nowhere to
 * import their Tailwind entry from. This bridge imports whichever stylesheet
 * was resolved, falling back to the theme's own baseline.
 */
function createVirtualStylesPlugin(
  stylesheetPath: string | undefined,
  fallbackPath: string
): Plugin {
  return {
    name: "astro-theme-lumen:virtual-styles",
    enforce: "pre",
    resolveId(id) {
      if (id === VIRTUAL_STYLES_ID) return RESOLVED_VIRTUAL_STYLES_ID;
      return null;
    },
    load(id) {
      if (id !== RESOLVED_VIRTUAL_STYLES_ID) return null;
      return `import ${JSON.stringify(stylesheetPath ?? fallbackPath)};`;
    },
  };
}

/** The `astro-theme-lumen` integration. */
export default function lumen(options: LumenOptions = {}): AstroIntegration {
  const routes: Required<LumenRouteOptions> = {
    tags: true,
    archives: true,
    about: true,
    search: true,
    rss: true,
    notFound: true,
    ...options.routes,
  };

  return {
    name: INTEGRATION_NAME,
    hooks: {
      "astro:config:setup": ({
        config,
        updateConfig,
        injectRoute,
        addWatchFile,
        logger,
      }) => {
        const rootDir = fileURLToPath(config.root);
        const userConfigPath = findUserConfig(rootDir, options.configFile);

        if (userConfigPath) {
          // Restart the dev server when the config changes.
          addWatchFile(userConfigPath);
        } else {
          logger.warn(
            "No lumen.config.ts found at the project root — falling back to the default configuration."
          );
        }

        const stylesheetPath = options.stylesheet
          ? path.resolve(rootDir, options.stylesheet)
          : findFirstExisting(rootDir, USER_STYLESHEET_CANDIDATES);

        if (!stylesheetPath) {
          logger.warn(
            `No stylesheet found. Create \`src/styles/global.css\` with:\n` +
              `  @import "tailwindcss";\n` +
              `  @import "astro-theme-lumen/styles/theme.css";\n` +
              `  @import "astro-theme-lumen/styles/prose.css";`
          );
        }

        const configModulePath = fileURLToPath(
          new URL("./config.ts", import.meta.url)
        );
        const fallbackStylesheet = fileURLToPath(
          new URL("./styles/fallback.css", import.meta.url)
        );

        // Dual Shiki themes are what let `prose.css` swap code colours with the
        // colour scheme; a single theme bakes its background in as an inline
        // style that the stylesheet cannot override.
        if (options.codeTheme !== false) {
          const codeTheme = options.codeTheme ?? DEFAULT_CODE_THEME;
          updateConfig({
            markdown: {
              shikiConfig: {
                themes: { light: codeTheme.light, dark: codeTheme.dark },
                defaultColor: false,
              },
            },
          });
        }

        updateConfig({
          vite: {
            plugins: [
              createVirtualConfigPlugin(configModulePath, userConfigPath, routes),
              createVirtualStylesPlugin(stylesheetPath, fallbackStylesheet),
            ],
          },
        });

        // The theme's <Icon> resolves names through astro-icon, so the consumer
        // should not have to register it. Skip if they already did — a second
        // integration with the same name would clash.
        if (!config.integrations.some(entry => entry.name === "astro-icon")) {
          updateConfig({ integrations: [icon()] });
        }

        const injected = ROUTES.filter(
          route => !route.option || routes[route.option]
        );

        for (const route of injected) {
          injectRoute({
            pattern: route.pattern,
            entrypoint: new URL(`./routes/${route.entry}`, import.meta.url),
          });
        }

        logger.info(`Injected ${injected.length} routes.`);
      },

      "astro:config:done": ({ injectTypes }) => {
        injectTypes({
          filename: "astro-theme-lumen.d.ts",
          content: [
            `declare module ${JSON.stringify(VIRTUAL_CONFIG_ID)} {`,
            `  const config: import("astro-theme-lumen/types").ResolvedLumenConfig;`,
            `  export default config;`,
            `}`,
            ``,
            `declare module ${JSON.stringify(VIRTUAL_STYLES_ID)};`,
            ``,
          ].join("\n"),
        });
      },

      "astro:build:done": async ({ dir, logger }) => {
        if (!routes.search) return;

        const outputDir = fileURLToPath(dir);
        const { index, errors: createErrors } = await createIndex();
        if (!index) {
          logger.error("Pagefind could not start an index.");
          createErrors.forEach(logger.error);
          return;
        }

        const { errors } = await index.addDirectory({
          path: outputDir,
        });
        if (errors.length) {
          logger.error("Pagefind failed to index the built pages.");
          errors.forEach(logger.error);
          return;
        }

        const { errors: writeErrors } = await index.writeFiles({
          outputPath: path.join(outputDir, "pagefind"),
        });
        if (writeErrors.length) {
          logger.error("Pagefind failed to write the search index.");
          writeErrors.forEach(logger.error);
          return;
        }

        logger.info("Built the search index.");
      },
    },
  };
}
