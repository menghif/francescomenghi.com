import type { PortableTextBlock } from "emdash";

// Minimal Portable Text -> HTML for the RSS feed. Handles the block types the
// posts use: text blocks (headings, quotes, lists, marks), code and images.

interface Span {
  text: string;
  marks?: string[];
}
interface MarkDef {
  _key: string;
  _type: string;
  href?: string;
}
interface TextBlock {
  _type: "block";
  style?: string;
  listItem?: "bullet" | "number";
  level?: number;
  children: Span[];
  markDefs?: MarkDef[];
}

const escapeHtml = (s: string) =>
  s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

function renderSpan(span: Span, markDefs: MarkDef[]): string {
  let html = escapeHtml(span.text);
  for (const mark of span.marks ?? []) {
    const def = markDefs.find((d) => d._key === mark);
    if (def?.href) html = `<a href="${escapeHtml(def.href)}">${html}</a>`;
    else if (mark === "strong") html = `<strong>${html}</strong>`;
    else if (mark === "em") html = `<em>${html}</em>`;
    else if (mark === "code") html = `<code>${html}</code>`;
  }
  return html;
}

function renderText(block: TextBlock): string {
  const inner = block.children
    .map((span) => renderSpan(span, block.markDefs ?? []))
    .join("");
  const style = block.style ?? "normal";
  if (/^h[1-6]$/.test(style)) return `<${style}>${inner}</${style}>`;
  if (style === "blockquote") return `<blockquote>${inner}</blockquote>`;
  return `<p>${inner}</p>`;
}

export function portableTextToHtml(
  blocks: PortableTextBlock[],
  absoluteUrl: (path: string) => string,
): string {
  const out: string[] = [];
  const open: ("ul" | "ol")[] = [];
  const closeLists = (toLevel = 0) => {
    while (open.length > toLevel) out.push(`</${open.pop()}>`);
  };

  for (const raw of blocks) {
    const block = raw as unknown as Record<string, unknown> & { _type: string };

    if (block._type === "block" && (block as unknown as TextBlock).listItem) {
      const item = block as unknown as TextBlock;
      const level = item.level ?? 1;
      const tag = item.listItem === "number" ? "ol" : "ul";
      closeLists(level);
      while (open.length < level) {
        open.push(tag);
        out.push(`<${tag}>`);
      }
      out.push(
        `<li>${renderText({ ...item, style: "li" }).replace(/^<p>|<\/p>$/g, "")}</li>`,
      );
      continue;
    }

    closeLists();
    if (block._type === "block") {
      out.push(renderText(block as unknown as TextBlock));
    } else if (block._type === "code") {
      out.push(
        `<pre><code>${escapeHtml(String(block.code ?? ""))}</code></pre>`,
      );
    } else if (block._type === "image") {
      const asset = block.asset as { url?: string } | undefined;
      if (asset?.url) {
        out.push(
          `<img src="${escapeHtml(absoluteUrl(asset.url))}" alt="${escapeHtml(String(block.alt ?? ""))}" />`,
        );
      }
    }
  }
  closeLists();
  return out.join("\n");
}
