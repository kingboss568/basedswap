import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getAllPosts, getPostBySlug } from "@/lib/posts";

type Params = { slug: string };

export async function generateStaticParams() {
  return getAllPosts().map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const post = getPostBySlug(params.slug);
  if (!post) return { title: "Post not found" };
  return {
    title: `${post.title} | BasedSwap Blog`,
    description: post.description,
    keywords: post.tags,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      title: post.title,
      description: post.description,
      url: `https://basedswap-azure.vercel.app/blog/${post.slug}`,
      type: "article",
      publishedTime: post.date,
      tags: post.tags,
      locale: post.language === "zh" ? "zh_TW" : "en_US",
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
    },
  };
}

// ─────────────────────────────────────────────────────────────────────
// Lightweight Markdown renderer.
// We don't pull in a full library (keeps bundle small + no `dangerouslySetInnerHTML`).
// Supports: # ## ### headings, **bold**, *italic*, `code`, ```code blocks```,
// lists (- and 1.), [links](url), tables, and blank-line paragraphs.
// ─────────────────────────────────────────────────────────────────────

type Block =
  | { type: "heading"; level: number; text: string }
  | { type: "paragraph"; text: string }
  | { type: "ul"; items: string[] }
  | { type: "ol"; items: string[] }
  | { type: "code"; lang: string; text: string }
  | { type: "hr" }
  | { type: "table"; header: string[]; rows: string[][] };

function parseMarkdown(md: string): Block[] {
  const lines = md.replace(/\r\n/g, "\n").split("\n");
  const blocks: Block[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (!line.trim()) {
      i++;
      continue;
    }

    // Code block
    if (line.startsWith("```")) {
      const lang = line.slice(3).trim();
      const buf: string[] = [];
      i++;
      while (i < lines.length && !lines[i].startsWith("```")) {
        buf.push(lines[i]);
        i++;
      }
      i++; // skip closing ```
      blocks.push({ type: "code", lang, text: buf.join("\n") });
      continue;
    }

    // Heading
    const headingMatch = /^(#{1,6})\s+(.+)$/.exec(line);
    if (headingMatch) {
      blocks.push({
        type: "heading",
        level: headingMatch[1].length,
        text: headingMatch[2],
      });
      i++;
      continue;
    }

    // Horizontal rule
    if (/^---+$/.test(line.trim())) {
      blocks.push({ type: "hr" });
      i++;
      continue;
    }

    // Table
    if (line.includes("|") && lines[i + 1] && /^\s*\|?[\s|:-]+\|?\s*$/.test(lines[i + 1])) {
      const header = line.split("|").map((c) => c.trim()).filter(Boolean);
      i += 2;
      const rows: string[][] = [];
      while (i < lines.length && lines[i].includes("|")) {
        const row = lines[i].split("|").map((c) => c.trim()).filter(Boolean);
        if (row.length > 0) rows.push(row);
        i++;
      }
      blocks.push({ type: "table", header, rows });
      continue;
    }

    // Unordered list
    if (/^[-*]\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^[-*]\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^[-*]\s+/, ""));
        i++;
      }
      blocks.push({ type: "ul", items });
      continue;
    }

    // Ordered list
    if (/^\d+\.\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\d+\.\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\d+\.\s+/, ""));
        i++;
      }
      blocks.push({ type: "ol", items });
      continue;
    }

    // Paragraph (gather until blank line)
    const para: string[] = [];
    while (
      i < lines.length &&
      lines[i].trim() &&
      !lines[i].startsWith("#") &&
      !lines[i].startsWith("```") &&
      !/^[-*]\s+/.test(lines[i]) &&
      !/^\d+\.\s+/.test(lines[i])
    ) {
      para.push(lines[i]);
      i++;
    }
    blocks.push({ type: "paragraph", text: para.join(" ") });
  }

  return blocks;
}

// Render inline tokens: **bold**, *italic*, `code`, [text](url)
function renderInline(text: string): React.ReactNode {
  // Order matters: process code first (no nesting allowed inside)
  const out: React.ReactNode[] = [];
  let cursor = 0;
  let key = 0;

  const re =
    /(`[^`]+`)|(\*\*[^*]+\*\*)|(\*[^*]+\*)|(\[[^\]]+\]\([^)]+\))/g;
  let match: RegExpExecArray | null;

  while ((match = re.exec(text)) !== null) {
    if (match.index > cursor) {
      out.push(text.slice(cursor, match.index));
    }
    const m = match[0];
    if (m.startsWith("`")) {
      out.push(
        <code
          key={`k-${key++}`}
          className="rounded bg-panel2 px-1.5 py-0.5 font-mono text-[0.9em] text-accent"
        >
          {m.slice(1, -1)}
        </code>
      );
    } else if (m.startsWith("**")) {
      out.push(
        <strong key={`k-${key++}`}>{m.slice(2, -2)}</strong>
      );
    } else if (m.startsWith("*")) {
      out.push(<em key={`k-${key++}`}>{m.slice(1, -1)}</em>);
    } else if (m.startsWith("[")) {
      const linkMatch = /\[([^\]]+)\]\(([^)]+)\)/.exec(m);
      if (linkMatch) {
        const [, label, href] = linkMatch;
        const isExternal = href.startsWith("http");
        out.push(
          <a
            key={`k-${key++}`}
            href={href}
            className="text-accent underline hover:opacity-80"
            {...(isExternal
              ? { target: "_blank", rel: "noopener noreferrer" }
              : {})}
          >
            {label}
          </a>
        );
      }
    }
    cursor = match.index + m.length;
  }

  if (cursor < text.length) {
    out.push(text.slice(cursor));
  }

  return out;
}

function renderBlock(block: Block, idx: number): React.ReactNode {
  switch (block.type) {
    case "heading": {
      // Demote one level: the page already has an h1 for the post title in the header.
      const level = Math.min(block.level + 1, 6);
      const Tag = `h${level}` as "h2" | "h3" | "h4" | "h5" | "h6";
      const sizes: Record<number, string> = {
        2: "text-2xl font-bold mt-10 mb-3",
        3: "text-xl font-semibold mt-8 mb-2",
        4: "text-lg font-semibold mt-6 mb-2",
        5: "text-base font-semibold mt-4 mb-2",
        6: "text-sm font-semibold mt-4 mb-2",
      };
      return (
        <Tag key={idx} className={sizes[level] ?? "font-semibold mt-4 mb-2"}>
          {renderInline(block.text)}
        </Tag>
      );
    }
    case "paragraph":
      return (
        <p key={idx} className="my-4 leading-relaxed text-white/90">
          {renderInline(block.text)}
        </p>
      );
    case "ul":
      return (
        <ul key={idx} className="my-4 list-disc space-y-1 pl-6 text-white/90">
          {block.items.map((it, i) => (
            <li key={i}>{renderInline(it)}</li>
          ))}
        </ul>
      );
    case "ol":
      return (
        <ol key={idx} className="my-4 list-decimal space-y-1 pl-6 text-white/90">
          {block.items.map((it, i) => (
            <li key={i}>{renderInline(it)}</li>
          ))}
        </ol>
      );
    case "code":
      return (
        <pre
          key={idx}
          className="my-5 overflow-x-auto rounded-lg border border-border bg-panel2 p-4 text-xs"
        >
          <code className="font-mono text-white/90">{block.text}</code>
        </pre>
      );
    case "hr":
      return <hr key={idx} className="my-10 border-border" />;
    case "table":
      return (
        <div key={idx} className="my-6 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                {block.header.map((h, i) => (
                  <th key={i} className="px-3 py-2 text-left font-semibold">
                    {renderInline(h)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.map((row, i) => (
                <tr key={i} className="border-b border-border/50">
                  {row.map((cell, j) => (
                    <td key={j} className="px-3 py-2">
                      {renderInline(cell)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
  }
}

export default function BlogPostPage({
  params,
}: {
  params: Params;
}) {
  const post = getPostBySlug(params.slug);
  if (!post) notFound();

  const allBlocks = parseMarkdown(post.content);
  // Drop the leading h1 if it duplicates the post title (we already render title in <header>).
  const blocks =
    allBlocks[0]?.type === "heading" &&
    allBlocks[0].level === 1 &&
    allBlocks[0].text.trim() === post.title.trim()
      ? allBlocks.slice(1)
      : allBlocks;
  const others = getAllPosts()
    .filter((p) => p.slug !== post.slug)
    .slice(0, 3);

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    dateModified: post.date,
    inLanguage: post.language === "zh" ? "zh-Hant" : "en",
    keywords: post.tags.join(", "),
    author: { "@type": "Organization", name: "BasedSwap" },
    publisher: {
      "@type": "Organization",
      name: "BasedSwap",
      logo: {
        "@type": "ImageObject",
        url: "https://basedswap-azure.vercel.app/icon.svg",
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `https://basedswap-azure.vercel.app/blog/${post.slug}`,
    },
  };

  return (
    <article
      lang={post.language === "zh" ? "zh-Hant" : "en"}
      className="mx-auto max-w-3xl py-8"
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <Link
        href="/blog"
        className="mb-8 inline-block text-sm text-muted hover:text-white"
      >
        ← All posts
      </Link>

      <header className="mb-8">
        <div className="mb-3 flex items-center gap-3 text-xs text-muted">
          <time dateTime={post.date}>
            {new Date(post.date).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </time>
          <span>·</span>
          <span>{post.readingTime}</span>
          <span>·</span>
          <span className="rounded-full border border-border bg-panel2 px-2 py-0.5 uppercase">
            {post.language === "zh" ? "中文" : "EN"}
          </span>
        </div>
        <h1 className="mb-3 text-3xl font-bold leading-tight tracking-tight md:text-4xl">
          {post.title}
        </h1>
        <p className="mb-2 text-base text-muted">{post.description}</p>
      </header>

      <div className="prose prose-invert max-w-none">
        {blocks.map((b, i) => renderBlock(b, i))}
      </div>

      <div className="my-12 rounded-2xl border border-accent bg-gradient-to-br from-accent/10 to-accent2/10 p-6 text-center">
        <h3 className="mb-2 text-lg font-semibold">Try BasedSwap</h3>
        <p className="mb-4 text-sm text-muted">
          Multichain DEX across 7 networks · daily check-in points · routed through Uniswap V3
        </p>
        <Link
          href="/"
          className="inline-block rounded-xl bg-gradient-to-r from-accent to-accent2 px-6 py-2 font-semibold text-white"
        >
          Open the App
        </Link>
      </div>

      {others.length > 0 && (
        <section className="mt-16 border-t border-border pt-10">
          <h3 className="mb-6 text-xl font-semibold">More posts</h3>
          <div className="grid gap-4 md:grid-cols-2">
            {others.map((other) => (
              <Link
                key={other.slug}
                href={`/blog/${other.slug}`}
                className="rounded-xl border border-border bg-panel p-4 transition hover:border-accent"
              >
                <div className="mb-1 text-xs text-muted">{other.readingTime}</div>
                <div className="text-sm font-medium leading-snug">
                  {other.title}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
