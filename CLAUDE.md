# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Francesco Menghi's personal site/blog, built with Astro (SSG). Content lives as Markdown, pages as `.astro` files.

## Commands

Package manager is pnpm (enforced via `preinstall: npx only-allow pnpm` — do not use npm/yarn).

- `pnpm dev` / `pnpm start` — run local dev server
- `pnpm build` — production build (outputs to `dist/`)
- `pnpm preview` — preview the production build locally
- `pnpm lint` — run ESLint
- `pnpm format` — run Prettier over `js,jsx,ts,tsx,md,mdx,astro` files

There is no test suite configured in this repo.

## Architecture

- **Content collection**: blog posts are Markdown files in `src/content/posts/`, validated against the Zod schema in `src/content/config.ts` (`title`, `pubDate`, `description`, `author`, optional `cover`/`coverAlt`, `tags[]`). Post images live alongside in `src/content/posts/images/`.
- **Routing**: file-based under `src/pages/`.
  - `blog/[...slug].astro` — individual post pages, statically generated from the `posts` collection via `getStaticPaths`, rendered through `MarkdownPostLayout`.
  - `tags/[tag].astro` and `tags/index.astro` — tag listing/filter pages, derived by flattening `post.data.tags` across all posts.
  - `rss.xml.js` — hand-built RSS feed endpoint. It re-parses each post body with `markdown-it`, rewrites relative image `src`s (`./...` → resolved via `import.meta.glob` on `src/content/posts/images/`, or `/images/...` → public dir) to absolute URLs, then sanitizes the HTML with `sanitize-html` before including it in the feed. Any other `src` pattern throws — keep post image references to these two forms.
- **Layouts** (`src/layouts/`): `BaseLayout.astro` (root HTML shell — head/meta/RSS link/sitemap, `Header`/`Footer`, Astro View Transitions via `ClientRouter`) is composed by `AboutLayout.astro` and `MarkdownPostLayout.astro` for their respective page types.
- **Components** (`src/components/`): shared UI (`Header`, `Footer`, `Navigation`, `BlogPost`, `Project`, `Social`, `LanguagesLogos`) plus a `icons/` subfolder of individual inline SVG icon components.
- **Images**: Astro's image service is set to `passthroughImageService()` in `astro.config.mjs` (no built-in optimization/resizing pipeline) — factor this in when adding images. Font fallback metrics are generated via the `fontaine` Vite plugin, resolving font URLs against `./public`.
- **Site URL** is fixed to `https://francescomenghi.com` in `astro.config.mjs` (`site`), used for sitemap and RSS absolute-URL generation.

## Conventions

- Astro + `eslint-plugin-astro` (recommended + jsx-a11y-recommended rules) and Prettier (with `prettier-plugin-astro`) are both configured — run `pnpm lint` and `pnpm format` before considering frontend changes done.
- TypeScript config extends `astro/tsconfigs/base` with `strictNullChecks` and `allowJs` enabled.
