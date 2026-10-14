import type { PortableTextBlock } from "emdash";
import snapshot from "../data/content.json";

export interface Tag {
  slug: string;
  label: string;
}

export interface Post {
  slug: string;
  title: string;
  pubDate: Date;
  description: string;
  author: string;
  cover?: { src: string; alt: string };
  tags: Tag[];
  content: PortableTextBlock[];
}

// Fields are typed in emdash-env.d.ts, which is regenerated on dev server start
interface PostData {
  slug: string | null;
  title: string;
  excerpt?: string;
  author?: string;
  pub_date?: string | Date;
  featured_image?: { src?: string; alt?: string };
  content?: PortableTextBlock[];
  publishedAt: Date | null;
  createdAt: Date;
}

const DEFAULT_AUTHOR = "Francesco Menghi";

function toPost(data: PostData, tags: Tag[]): Post {
  const image = data.featured_image;
  return {
    slug: data.slug ?? "",
    title: data.title,
    pubDate: new Date(data.pub_date ?? data.publishedAt ?? data.createdAt),
    description: data.excerpt ?? "",
    author: data.author || DEFAULT_AUTHOR,
    cover: image?.src ? { src: image.src, alt: image.alt ?? "" } : undefined,
    tags,
    content: data.content ?? [],
  };
}

const toTags = (terms: { slug: string; label: string }[] = []): Tag[] =>
  terms.map(({ slug, label }) => ({ slug, label }));

interface SnapshotPost extends Omit<Post, "pubDate" | "content"> {
  pubDate: string;
  content: unknown[];
}

// Static builds read the snapshot written by `pnpm content:export`.
function snapshotPosts(): Post[] {
  return (snapshot.posts as unknown as SnapshotPost[]).map((post) => ({
    ...post,
    pubDate: new Date(post.pubDate),
    content: post.content as PortableTextBlock[],
  }));
}

// The dev server reads live from the local CMS so edits show up immediately.
async function cmsPosts(): Promise<Post[]> {
  const { getAllTermsForEntries, getEmDashCollection } = await import("emdash");
  const { entries, error } = await getEmDashCollection("posts", {
    status: "published",
  });
  if (error) throw error;

  const termsById = await getAllTermsForEntries(
    "posts",
    entries.map((entry) => entry.id),
  );

  return entries.map((entry) =>
    toPost(
      entry.data as unknown as PostData,
      toTags(termsById.get(entry.id)?.tag),
    ),
  );
}

/** All published posts, newest first. */
export async function getPosts(): Promise<Post[]> {
  const posts = import.meta.env.DEV ? await cmsPosts() : snapshotPosts();
  return posts.sort((a, b) => b.pubDate.getTime() - a.pubDate.getTime());
}

export async function getPost(slug: string): Promise<Post | undefined> {
  return (await getPosts()).find((post) => post.slug === slug);
}

/** Every tag in use, sorted by label. */
export function uniqueTags(posts: Post[]): Tag[] {
  const tags = new Map(
    posts.flatMap((post) => post.tags).map((t) => [t.slug, t]),
  );
  return [...tags.values()].sort((a, b) => a.label.localeCompare(b.label));
}
