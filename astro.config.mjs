import { defineConfig, passthroughImageService } from "astro/config";
import { FontaineTransform } from "fontaine";

import expressiveCode from "astro-expressive-code";
import sitemap from "@astrojs/sitemap";

// The CMS (EmDash) only runs locally, during `astro dev`. Production builds
// are fully static and read the committed snapshot in src/data/content.json,
// which `pnpm content:export` regenerates from the local CMS database.
const isDev = process.argv.includes("dev");

const cmsIntegrations = [];
let cmsAdapter;

if (isDev) {
  const [{ default: node }, { default: react }, emdashModule, { sqlite }] =
    await Promise.all([
      import("@astrojs/node"),
      import("@astrojs/react"),
      import("emdash/astro"),
      import("emdash/db"),
    ]);
  cmsAdapter = node({ mode: "standalone" });
  cmsIntegrations.push(
    react(),
    emdashModule.default({
      database: sqlite({ url: "file:./data.db" }),
      storage: emdashModule.local({
        directory: "./uploads",
        baseUrl: "/_emdash/api/media/file",
      }),
    }),
  );
}

// https://astro.build/config
export default defineConfig({
  site: "https://francescomenghi.com",
  // The CMS admin and API are on-demand routes, so dev needs server output.
  output: isDev ? "server" : "static",
  adapter: cmsAdapter,
  integrations: [
    expressiveCode({
      themes: ["github-dark"],
    }),
    ...cmsIntegrations,
    sitemap(),
  ],
  vite: {
    plugins: [
      FontaineTransform.vite({
        fallbacks: ["Arial"],
        resolvePath: (id) => new URL(`./public${id}`, import.meta.url), // id is the font src value in the CSS
      }),
    ],
  },
  image: {
    service: passthroughImageService(),
  },
});
