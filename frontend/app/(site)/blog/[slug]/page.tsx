import type { Metadata } from "next";
import Link from "next/link";
import Markdown from "@/components/Markdown";
import PageHeader from "@/components/site/PageHeader";
import { api } from "@/lib/api";
import { formatDate, pick, t } from "@/lib/i18n";
import { getLang } from "@/lib/lang";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const [post, lang] = await Promise.all([api.post(slug, false), getLang()]);
  return { title: pick(post, "title", lang), description: pick(post, "excerpt", lang) };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const [site, post, recent, lang] = await Promise.all([api.site(), api.post(slug), api.posts(5), getLang()]);
  const d = t(lang);
  const title = pick(post, "title", lang);
  const tags = post.tags
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  return (
    <>
      <PageHeader title={title} image={site.page_header_image} />
      <section className="py-16 sm:py-20">
        <div className="container-site grid gap-12 lg:grid-cols-[1fr_300px]">
          <article>
            {post.image && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={post.image} alt={title} className="mb-6 max-h-[520px] w-full object-cover" />
            )}
            <div className="mb-6 flex flex-wrap gap-x-4 text-[13px]">
              <span>
                {d.posted} <span className="text-[var(--brand)]">{formatDate(post.published_at, lang)}</span>
              </span>
              <span>
                👁 {post.views} {d.views}
              </span>
            </div>
            <Markdown>{pick(post, "body", lang)}</Markdown>
            {tags.length > 0 && (
              <div className="mt-8 flex flex-wrap items-center gap-2 border-t border-neutral-100 pt-6 text-[13px]">
                <span className="font-bold text-[var(--ink)]">{d.tags}:</span>
                {tags.map((tag) => (
                  <span key={tag} className="rounded bg-[var(--panel)] px-2 py-0.5">
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </article>

          <aside className="self-start bg-[var(--panel)] p-6 lg:sticky lg:top-32">
            <h4 className="mb-4 text-[16px] uppercase">{d.blog}</h4>
            <ul className="space-y-4">
              {recent.map((p) => (
                <li key={p.id}>
                  <Link href={`/blog/${p.slug}`} className="flex gap-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={p.image} alt="" className="h-14 w-14 flex-none object-cover" loading="lazy" />
                    <span
                      className={`text-[13px] leading-snug hover:text-[var(--brand)] ${
                        p.slug === post.slug ? "font-bold text-[var(--brand)]" : "text-[var(--ink)]"
                      }`}
                    >
                      {pick(p, "title", lang)}
                      <span className="mt-1 block text-[11px] font-normal text-[var(--muted)]">
                        {formatDate(p.published_at, lang)}
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </aside>
        </div>
      </section>
    </>
  );
}
