import rss from "@astrojs/rss";
import { getCollection } from "astro:content";
import sanitizeHtml from "sanitize-html";
import MarkdownIt from "markdown-it";
import { parse as htmlParser } from "node-html-parser";
import { getImage } from "astro:assets";
const parser = new MarkdownIt();

// get dynamic import of images as a map collection
const imagesGlob = import.meta.glob(
  "/src/content/posts/images/**/*.{jpeg,jpg,png,webp,avif,gif}",
);

export async function GET(context) {
  const posts = await getCollection("posts");
  const feed = [];

  for (const post of posts) {
    const body = parser.render(post.body);
    const html = htmlParser.parse(body);
    const images = html.querySelectorAll("img");

    for (const img of images) {
      const src = img.getAttribute("src");

      if (src.startsWith("./")) {
        // change from relative to absolute path
        const imagePathPrefix = src.replace("./", "/src/content/posts/");

        // call the dynamic import and return the module
        const imagePath = await imagesGlob[imagePathPrefix]?.()?.then(
          (res) => res.default,
        );

        if (imagePath) {
          const optimizedImg = await getImage({ src: imagePath });
          img.setAttribute(
            "src",
            context.site + optimizedImg.src.replace("/", ""),
          );
        }
      } else if (src.startsWith("/images")) {
        // images starting with `/images/` is the public dir
        img.setAttribute("src", context.site + src.replace("/", ""));
      } else {
        throw Error("src unknown");
      }
    }

    let contentHtml = sanitizeHtml(html.toString(), {
      allowedTags: sanitizeHtml.defaults.allowedTags.concat(["img"]),
    });

    if (post.data.image) {
      const coverImageHtml = `<img src="${post.data.image.url}" alt="${post.data.image.alt}" />`;
      contentHtml = `${coverImageHtml}\n${contentHtml}`;
    }

    feed.push({
      title: post.data.title,
      description: post.data.description,
      author: `${post.data.author.email} (${post.data.author.name})`,
      pubDate: post.data.pubDate,
      categories: post.data.tags,
      link: `/posts/${post.slug}`,
      content: contentHtml,
    });
  }

  return rss({
    title: "Francesco Menghi | Blog",
    description:
      "My personal blog where I write about experiences and learnings in my software developer journey",
    site: context.site,
    trailingSlash: false,
    items: feed,
    customData: `<language>en-us</language>`,
    stylesheet: "/pretty-feed-v3.xsl",
  });
}
