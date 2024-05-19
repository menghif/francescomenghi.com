import { defineConfig } from "astro/config";
import expressiveCode from "astro-expressive-code";

// https://astro.build/config
export default defineConfig({
  site: "https://francescomenghi.com",
  integrations: [expressiveCode()],
});
