---
title: "Manage Node versions with pnpm"
pubDate: 2024-12-02
description: "pnpm is not only the best package manager, it can also easily manage Node versions."
author: "Francesco Menghi"
tags: ["pnpm", "JavaScript Tools"]
---

When it comes to managing different Node versions for your projects, there are several tools to do it, such as `nvm`, `n`, or `fnm`, but if you use [pnpm](https://pnpm.io) as your package manager, you probably don’t need any of those!

Pnpm is a package manager that has become very popular over the years thanks to its faster install times and more efficient use of disk space compared to npm or yarn. Its core philosophy revolves around creating a single store for all dependencies, avoiding duplication, and ensuring that every package version is used only once across all projects.

Something less known is that pnpm can also handle Node version management through its `pnpm env` command. In this blog post, we'll explore how to use pnpm to manage and quickly switch Node versions within your development environment.

## Getting Started with pnpm

To use pnpm for managing Node versions, you first need to install pnpm globally on your system with the standalone script:

```sh
curl -fsSL https://get.pnpm.io/install.sh | sh -
```

You can now install the LTS version of Node like this:

```sh
pnpm env use --global lts
```

You can verify that the Long Term Support (LTS) version of Node was successfully installed with the command `node -v`.

## How to manage Node versions with pnpm

Let’s say you just cloned a project from GitHub that only works with Node 18 and you have version 22 installed. Downloading and switching to Node 18 is as easy as running:

```sh
pnpm env use --global 18
```

Once this version of Node is installed, `pnpm` will automatically switch your environment to use it.

You can also list all of the downloaded versions of Node on your machine:

```sh
pnpm env list
```

If you want to download a Node version and not switch to it directly, you can use `add` instead of `use`:

```sh
pnpm env add --global 19.1.0
```

Finally, to remove a version you don’t need anymore, you can simply run:

```sh
pnpm env remove --global 19.1.0
```

## Set a specific Node version per project

If you have a project that requires a specific version of Node and you don't want to change your global Node, you can define the version in a `.npmrc` file at the root of you project:

```sh title=".npmrc"
use-node-version = 20.0.0
```

This way whenever you use pnpm in that project you will always be using Node 20 without having to manually change to it.

## Bonus feature: manage your pnpm versions

Pnpm also includes a way to manage versions of itself on a per-project basis.

If your project needs an old version of pnpm, you can define it in its `package.json` file like this:

```js title="package.json"
{
  "packageManager": "pnpm@8.15.9"
}
```

You also need to turn on the option to manage package manager versions by adding one line to `.npmrc` in your home folder (This will be on by default starting with pnpm 10):

```sh title="~/.npmrc"
manage-package-manager-versions = true
```

Now when you run `pnpm install` in a project, pnpm will download and use the specific version defined in `package.json`.

_Note_: Node also has a way to manage package managers (both pnpm and yarn) with Corepack. If another developer has pnpm installed via Corepack, the “packageManager” field will be used by Corepack to switch between versions the same way.

## Conclusion

Using `pnpm` to manage Node versions is a great way to streamline your development environment. With the `pnpm env` you can install, switch, and manage multiple Node versions with ease. If you're already using `pnpm` as your package manager, it is worth giving it a try!
