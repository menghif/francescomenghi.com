---
title: "Upgrading ESLint"
pubDate: 2024-10-14
description: "My experience upgrading the Chatcraft project to ESLint version 9."
cover: "./images/eslint-cover.jpg"
coverAlt: "ESLint logo"
author: "Francesco Menghi"
tags: ["JavaScript Tools", "ESLint", "linting"]
---

The JavaScript ecosystem is full of useful tools, and some of them are standard practice in every project. One such tool is [ESLint](https://eslint.org), a “linter” that helps catch errors in your code and can be extended with various plugins.

For the last few years, the ESLint maintainers have been transitioning to a completely new configuration setup. Now that version 8 is no longer maintained, it’s time for everyone to switch to the new “flat config.”

I won’t explain all the differences of the new configuration here. There’s a great [post](https://eslint.org/blog/2022/08/new-config-system-part-2/) from the ESLint project that explains all the changes, and there’s also a complete [migration guide](https://eslint.org/docs/latest/use/migrate-to-9.0.0) in the documentation.

## Upgrading experience

In this post, I want to share my experience upgrading to the flat config for the [Chatcraft](https://github.com/tarasglek/chatcraft.org) project.

I initially found the [ESLint Configuration Migrator](https://www.npmjs.com/package/@eslint/migrate-config) package from the documentation and thought the whole process would just involve running one script:

```sh
npx @eslint/migrate-config .eslintrc.json
```

I was wrong... The script did create a new `eslint.config.mjs` file with the proper structure, but it also added a `FlatCompat` utility and other Node.js functions like `fileURLToPath`.

```js
// ... more imports above
import { fileURLToPath } from "node:url";
import js from "@eslint/js";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

export default [
  ...fixupConfigRules(
    compat.extends(
      "eslint:recommended",
      "plugin:@typescript-eslint/recommended",
      "plugin:react/recommended",
      "plugin:jsx-a11y/recommended",
      "plugin:react-hooks/recommended",
      "eslint-config-prettier",
    ),
  ),
  {
    plugins: {
      "@typescript-eslint": fixupPluginRules(typescriptEslint),
      react: fixupPluginRules(react),
      "react-hooks": fixupPluginRules(reactHooks),
      "jsx-a11y": fixupPluginRules(jsxA11Y),
      prettier,
    },
  },

  // ... more code below
];
```

All these added functions are needed to properly use ESLint plugins that are not yet supported by the new flat config. However, after doing some research, I realized that most popular ESLint plugins have already been updated, and they provide instructions for their recommended setup.

I went through each plugin and added the recommended configuration. The only plugin not working was `eslint-plugin-react-hooks`, but luckily, after digging through the [React repository](https://github.com/facebook/react/issues/28313#issuecomment-2363692765), I found that the latest RC version is now compatible with the new ESLint flat config!

In the end, I was able to remove `fileURLToPath` and the Node.js functions to get a much simpler config:

```js
export default [
  eslint.configs.recommended,
  ...tsEslint.configs.recommended,
  reactPlugin.configs.flat.recommended,
  reactPlugin.configs.flat["jsx-runtime"],
  jsxA11y.flatConfigs.recommended,
  eslintPluginPrettier,

  // ... more code below
];
```

Here’s the [pull request](https://github.com/tarasglek/chatcraft.org/pull/697) with all the changes, including fixes for multiple ESLint errors.

## Learnings

Upgrading ESLint to the latest major version taught me more about the tool itself. I spent a lot of time reading the docs and learning what each specific linting rule is used for.

The biggest takeaway, however, was that it’s worth taking the time to really understand what’s going on in the config file instead of simply running a script and calling it a day.
