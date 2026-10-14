import { defineLiveCollection } from "astro:content";

// The CMS loader is only needed while running the local dev server. Static
// builds read src/data/content.json instead (see src/lib/posts.ts).
export const collections = import.meta.env.DEV
  ? {
      _emdash: defineLiveCollection({
        loader: (await import("emdash/runtime")).emdashLoader(),
      }),
    }
  : {};
