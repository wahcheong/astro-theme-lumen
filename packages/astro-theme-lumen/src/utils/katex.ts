import katex from "katex";
import { defineHastPlugin } from "satteri";
import type { HastNode } from "satteri";

/** The element arm of Sätteri's HAST union. */
type HastElement = Extract<HastNode, { type: "element" }>;

function classList(node: HastElement): string[] {
  // Typed as `string[]` in hast, but the runtime value can still be a space-
  // separated string, so it is widened before being inspected.
  const value: unknown = node.properties.className;
  if (Array.isArray(value)) return value.map(String);
  return typeof value === "string" ? value.split(/\s+/) : [];
}

const isMath = (node: HastElement) => classList(node).includes("language-math");
const isDisplay = (node: HastElement) => classList(node).includes("math-display");

function render(tex: string, display: boolean) {
  return {
    type: "raw" as const,
    value: katex.renderToString(tex, {
      displayMode: display,
      throwOnError: false,
      output: "html",
    }),
  };
}

/**
 * Render `$…$` and `$$…$$` with KaTeX.
 *
 * Sätteri's `features.math` only *parses* maths — it emits
 * `<code class="language-math math-inline|math-display">` and ships no renderer.
 * This turns those nodes into KaTeX's HTML at build time, so the page still
 * needs no runtime script; only the stylesheet has to be loaded.
 *
 * Block maths arrives wrapped in `<pre>`, following the fenced-code shape. The
 * `<pre>` is replaced too, otherwise KaTeX's block element would inherit the
 * code-block styling.
 */
export const katexForSatteri = defineHastPlugin({
  name: "lumen-katex",
  element: [
    {
      filter: ["pre"],
      visit(node, ctx) {
        const code = node.children[0];
        if (!code || code.type !== "element" || code.tagName !== "code") return;
        if (!isMath(code)) return;

        return render(ctx.textContent(code), true);
      },
    },
    {
      filter: ["code"],
      visit(node, ctx) {
        if (!isMath(node) || isDisplay(node)) return;
        return render(ctx.textContent(node), false);
      },
    },
  ],
});
