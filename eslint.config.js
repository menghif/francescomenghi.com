import pluginJs from "@eslint/js";
import pluginTs from "@eslint/ts";
import eslintPluginAstro from "eslint-plugin-astro";

export default [
  pluginJs.configs.recommended,
  pluginTs.configs.recommended,
  ...eslintPluginAstro.configs.recommended,
];
