import { defineConfig, passthroughImageService } from "astro/config";
import { FontaineTransform } from "fontaine";

import expressiveCode from "astro-expressive-code";
import sitemap from "@astrojs/sitemap";

// https://astro.build/config
export default defineConfig({
  site: "https://francescomenghi.com",
  integrations: [
    expressiveCode({
      themes: ["github-dark"],
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
