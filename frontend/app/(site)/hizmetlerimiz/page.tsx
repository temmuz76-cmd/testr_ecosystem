import type { Metadata } from "next";
import Link from "next/link";
import Markdown from "@/components/Markdown";
import PageHeader from "@/components/site/PageHeader";
import { api } from "@/lib/api";
import { pick, t } from "@/lib/i18n";
import { getLang } from "@/lib/lang";

export async function generateMetadata(): Promise<Metadata> {
  const [page, lang] = await Promise.all([api.page("services"), getLang()]);
  return { title: pick(page, "title", lang) };
}

export default async function ServicesPage() {
  const [site, page, services, lang] = await Promise.all([
    api.site(),
    api.page("services"),
    api.services(),
    getLang(),
  ]);
  const d = t(lang);

  return (
    <>
      <PageHeader title={pick(page, "title", lang)} image={page.header_image || site.page_header_image} />
      <section className="py-16 sm:py-20">
        <div className="container-site space-y-16">
          {services.map((s, i) => (
            <article
              key={s.id}
              id={s.slug}
              className="grid scroll-mt-28 items-start gap-8 border-b border-neutral-100 pb-16 last:border-0 last:pb-0 md:grid-cols-2 md:gap-12"
            >
              <div className={i % 2 ? "md:order-2" : ""}>
                <h3 className="mb-4 text-[24px]">
                  <Link href={`/hizmetlerimiz/${s.slug}`} className="hover:text-[var(--brand)]">
                    {pick(s, "title", lang)}
                  </Link>
                </h3>
                <Markdown>{pick(s, "body", lang) || pick(s, "summary", lang)}</Markdown>
                <Link href={`/hizmetlerimiz/${s.slug}`} className="btn-brand mt-6">
                  {d.serviceDetail}
                </Link>
              </div>
              {s.image && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={s.image}
                  alt={pick(s, "title", lang)}
                  className={`w-full rounded-sm object-cover md:sticky md:top-32 ${i % 2 ? "md:order-1" : ""}`}
                  loading="lazy"
                />
              )}
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
