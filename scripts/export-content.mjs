// Snapshots published posts from the local EmDash database into
// src/data/content.json so static builds (Netlify) don't need the CMS.
// Usage: pnpm content:export
import { execFileSync } from "node:child_process";
import { writeFileSync } from "node:fs";

const seed = JSON.parse(
  execFileSync(
    "pnpm",
    ["exec", "emdash", "export-seed", "--with-content", "posts"],
    {
      encoding: "utf8",
      maxBuffer: 64 * 1024 * 1024,
      stdio: ["ignore", "pipe", "inherit"],
    },
  ),
);

const tagLabels = new Map(
  (seed.taxonomies ?? [])
    .filter((taxonomy) => taxonomy.name === "tag")
    .flatMap((taxonomy) => taxonomy.terms ?? [])
    .map((term) => [term.slug, term.label]),
);

const posts = (seed.content?.posts ?? [])
  .filter((entry) => entry.status === "published")
  .map((entry) => {
    const { data } = entry;
    const pubDate = data.pub_date ?? entry.publishedAt ?? entry.createdAt;
    if (!entry.slug || !pubDate) {
      throw new Error(`Post "${data.title}" is missing a slug or publish date`);
    }
    const image = data.featured_image;
    return {
      slug: entry.slug,
      title: data.title,
      pubDate: new Date(pubDate).toISOString(),
      description: data.excerpt ?? "",
      author: data.author ?? "",
      cover: image?.src ? { src: image.src, alt: image.alt ?? "" } : undefined,
      tags: (entry.taxonomies?.tag ?? []).map((slug) => ({
        slug,
        label: tagLabels.get(slug) ?? slug,
      })),
      content: data.content ?? [],
    };
  });

writeFileSync(
  new URL("../src/data/content.json", import.meta.url),
  `${JSON.stringify({ posts }, null, 2)}\n`,
);
console.log(`Exported ${posts.length} posts to src/data/content.json`);
