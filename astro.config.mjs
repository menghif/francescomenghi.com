import { defineConfig, passthroughImageService } from "astro/config";
import { FontaineTransform } from "fontaine";

import node from "@astrojs/node";
import react from "@astrojs/react";
import emdash, { local } from "emdash/astro";
import { sqlite } from "emdash/db";
import expressiveCode from "astro-expressive-code";
import sitemap from "@astrojs/sitemap";

// https://astro.build/config
export default defineConfig({
  site: "https://francescomenghi.com",
  output: "server",
  adapter: node({ mode: "standalone" }),
  integrations: [
    expressiveCode({
      themes: ["github-dark"],
    }),
    react(),
    emdash({
      database: sqlite({ url: "file:./data.db" }),
      storage: local({
        directory: "./uploads",
        baseUrl: "/_emdash/api/media/file",
      }),
    }),
    sitemap(),
  ],
  vite: {
    plugins: [
      FontaineTransform.vite({
        fallbacks: ["Arial"],
        // eslint-disable-next-line no-undef
        resolvePath: (id) => new URL(`./public${id}`, import.meta.url), // id is the font src value in the CSS
      }),
    ],
  },
  image: {
    service: passthroughImageService(),
  },
});
