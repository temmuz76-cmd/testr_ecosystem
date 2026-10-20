import type { Metadata } from "next";
import Link from "next/link";
import PageHeader from "@/components/site/PageHeader";
import { api } from "@/lib/api";
import { formatDate, pick, t } from "@/lib/i18n";
import { getLang } from "@/lib/lang";

export async function generateMetadata(): Promise<Metadata> {
  const [page, lang] = await Promise.all([api.page("blog"), getLang()]);
  return { title: pick(page, "title", lang) };
}

export default async function BlogPage() {
  const [site, page, posts, lang] = await Promise.all([api.site(), api.page("blog"), api.posts(), getLang()]);
  const d = t(lang);

  return (
    <>
      <PageHeader title={pick(page, "title", lang)} image={page.header_image || site.page_header_image} />
      <section className="py-16 sm:py-20">
        <div className="container-site grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => {
            const href = `/blog/${post.slug}`;
            const title = pick(post, "title", lang);
            return (
              <article key={post.id} className="flex flex-col bg-white shadow-[0_0_20px_rgba(0,0,0,0.06)]">
                <Link href={href} className="block overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={post.image}
                    alt={title}
                    className="aspect-square w-full object-cover transition-transform duration-500 hover:scale-105"
                    loading="lazy"
                  />
                </Link>
                <div className="flex flex-1 flex-col p-6">
                  <h4 className="text-[18px] leading-snug">
                    <Link href={href} className="hover:text-[var(--brand)]">
                      {title}
                    </Link>
                  </h4>
                  <div className="mt-2 flex flex-wrap items-center gap-x-3 text-[12px] text-[var(--muted)]">
                    <span>
                      {d.posted} <span className="text-[var(--brand)]">{formatDate(post.published_at, lang)}</span>
                    </span>
                    <span aria-label={d.views}>👁 {post.views}</span>
                  </div>
                  <p className="mt-3 flex-1 text-[14px]">{pick(post, "excerpt", lang)}</p>
                  <Link href={href} className="mt-4 text-[12px] uppercase text-[var(--brand)] hover:underline">
                    {d.readMore} →
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </>
  );
}
