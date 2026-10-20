import type { Metadata } from "next";
import Link from "next/link";
import Markdown from "@/components/Markdown";
import PageHeader from "@/components/site/PageHeader";
import { api } from "@/lib/api";
import { pick, t } from "@/lib/i18n";
import { getLang } from "@/lib/lang";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const [service, lang] = await Promise.all([api.service(slug), getLang()]);
  return { title: pick(service, "title", lang), description: pick(service, "summary", lang) };
}

export default async function ServiceDetailPage({ params }: Props) {
  const { slug } = await params;
  const [site, service, all, intro, features, lang] = await Promise.all([
    api.site(),
    api.service(slug),
    api.services(),
    api.page("service_intro"),
    api.features(),
    getLang(),
  ]);
  const d = t(lang);
  const title = pick(service, "title", lang);

  return (
    <>
      <PageHeader title={title} image={site.page_header_image} />

      <section className="py-16 sm:py-20">
        <div className="container-site grid gap-12 lg:grid-cols-[1fr_300px]">
          <div>
            {service.image && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={service.image} alt={title} className="mb-8 max-h-[460px] w-full object-cover" />
            )}
            <Markdown>{pick(service, "body", lang) || pick(service, "summary", lang)}</Markdown>
          </div>

          <aside className="self-start bg-[var(--panel)] p-6 lg:sticky lg:top-32">
            <h4 className="mb-4 text-[16px] uppercase">{d.services}</h4>
            <ul className="divide-y divide-neutral-200 text-[14px]">
              {all.map((s) => (
                <li key={s.id}>
                  <Link
                    href={`/hizmetlerimiz/${s.slug}`}
                    className={`block py-2.5 hover:text-[var(--brand)] ${
                      s.slug === service.slug ? "font-bold text-[var(--brand)]" : "text-[var(--ink)]"
                    }`}
                  >
                    {pick(s, "title", lang)}
                  </Link>
                </li>
              ))}
            </ul>
          </aside>
        </div>
      </section>

      {(pick(intro, "body", lang) || features.length > 0) && (
        <section className="bg-[var(--panel)] py-16 sm:py-20">
          <div className="container-site">
            {pick(intro, "body", lang) && (
              <div className="mx-auto mb-14 max-w-[900px]">
                <Markdown>{pick(intro, "body", lang)}</Markdown>
              </div>
            )}
            {features.length > 0 && (
              <>
                <h3 className="section-title mb-10 !text-[30px]">{pick(intro, "title", lang)}</h3>
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                  {features.map((f) => (
                    <div key={f.id} className="bg-white p-6 text-center shadow-[0_0_20px_rgba(0,0,0,0.04)]">
                      {f.icon && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={f.icon} alt="" className="mx-auto mb-4 h-16 w-16 object-contain" loading="lazy" />
                      )}
                      <h4 className="mb-2 text-[16px]">{pick(f, "title", lang)}</h4>
                      <p className="text-[13px] leading-relaxed">{pick(f, "text", lang)}</p>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </section>
      )}
    </>
  );
}
