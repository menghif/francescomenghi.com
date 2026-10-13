import rss from "@astrojs/rss";
import sanitizeHtml from "sanitize-html";
import { getPosts } from "../lib/posts";
import { portableTextToHtml } from "../lib/portable-text-html";

export async function GET(context) {
  const posts = await getPosts();
  const absolute = (path) =>
    path.startsWith("/") ? context.site + path.slice(1) : path;

  const feed = posts.map((post) => {
    let contentHtml = sanitizeHtml(portableTextToHtml(post.content, absolute), {
      allowedTags: sanitizeHtml.defaults.allowedTags.concat(["img"]),
    });

    if (post.cover) {
      const coverImageHtml = `<img src="${absolute(post.cover.src)}" alt="${post.cover.alt}" />`;
      contentHtml = `${coverImageHtml}\n${contentHtml}`;
    }

    return {
      title: post.title,
      description: post.description,
      pubDate: post.pubDate,
      categories: post.tags.map((tag) => tag.label),
      link: `/blog/${post.slug}`,
      content: contentHtml,
    };
  });

  return rss({
    title: "Francesco Menghi",
    description:
      "My personal blog where I write about experiences and learnings in my software developer journey.",
    site: context.site,
    trailingSlash: false,
    items: feed,
    customData: `<language>en-us</language>`,
    stylesheet: "/pretty-feed-v3.xsl",
  });
}
