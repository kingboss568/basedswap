import Link from "next/link";
import type { Metadata } from "next";
import { getAllPosts } from "@/lib/posts";

export const metadata: Metadata = {
  title: "Blog — BasedSwap | Multichain DEX Insights",
  description:
    "Guides, tutorials, and analysis on multichain DEX trading, airdrop farming, and DeFi development. Updated weekly.",
  openGraph: {
    title: "BasedSwap Blog",
    description: "Guides on multichain DEX trading and airdrop farming.",
    url: "https://basedswap-azure.vercel.app/blog",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "BasedSwap Blog",
    description: "Guides on multichain DEX trading and airdrop farming.",
  },
};

export default function BlogIndex() {
  const posts = getAllPosts();

  return (
    <div className="mx-auto max-w-3xl py-8">
      <header className="mb-12">
        <h1 className="mb-3 text-4xl font-bold tracking-tight">Blog</h1>
        <p className="text-muted">
          Guides, tutorials, and analysis on multichain DEX trading, airdrop
          farming, and DeFi development.
        </p>
      </header>

      <div className="space-y-6">
        {posts.map((post) => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            className="block rounded-2xl border border-border bg-panel p-6 transition hover:border-accent"
          >
            <div className="mb-2 flex items-center gap-3 text-xs text-muted">
              <span>{new Date(post.date).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}</span>
              <span>·</span>
              <span>{post.readingTime}</span>
              <span>·</span>
              <span className="rounded-full border border-border bg-panel2 px-2 py-0.5 uppercase">
                {post.language === "zh" ? "中文" : "EN"}
              </span>
            </div>
            <h2 className="mb-2 text-2xl font-semibold leading-tight">
              {post.title}
            </h2>
            <p className="mb-4 text-sm text-muted">{post.description}</p>
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-panel2 px-2 py-0.5 text-[11px] text-muted"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
