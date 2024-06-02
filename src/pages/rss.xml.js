import rss from "@astrojs/rss";
import { getCollection } from "astro:content";
import sanitizeHtml from "sanitize-html";
import MarkdownIt from "markdown-it";
const parser = new MarkdownIt();

export async function GET(context) {
  const posts = await getCollection("posts");

  return rss({
    title: "Francesco Menghi | Blog",
    description: "My personal blog",
    site: context.site,
    trailingSlash: false,
    items: posts.map((post) => {
      let contentHtml = sanitizeHtml(parser.render(post.body), {
        allowedTags: sanitizeHtml.defaults.allowedTags.concat(["img"]),
      });

      if (post.data.image) {
        const coverImageHtml = `<img src="${post.data.image.url}" alt="${post.data.image.alt}" />`;
        contentHtml = `${coverImageHtml}\n${contentHtml}`;
      }

      return {
        title: post.data.title,
        pubDate: post.data.pubDate,
        description: post.data.description,
        link: `/blog/${post.slug}`,
        content: contentHtml,
        ...post.data,
      };
    }),
    customData: `<language>en-us</language>`,
    stylesheet: "/pretty-feed-v3.xsl",
  });
}
