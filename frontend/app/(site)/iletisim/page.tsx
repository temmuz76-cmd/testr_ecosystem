import type { Metadata } from "next";
import PageHeader from "@/components/site/PageHeader";
import { api } from "@/lib/api";
import { pick, t } from "@/lib/i18n";
import { getLang } from "@/lib/lang";
import ContactForm from "./ContactForm";

export async function generateMetadata(): Promise<Metadata> {
  const [page, lang] = await Promise.all([api.page("contact"), getLang()]);
  return { title: pick(page, "title", lang) };
}

export default async function ContactPage() {
  const [site, page, lang] = await Promise.all([api.site(), api.page("contact"), getLang()]);
  const d = t(lang);
  const tel = (s: string) => `tel:${s.replace(/[^\d+]/g, "")}`;

  return (
    <>
      <PageHeader title={pick(page, "title", lang)} image={page.header_image || site.page_header_image} />
      <section className="py-16 sm:py-20">
        <div className="container-site grid gap-12 lg:grid-cols-[380px_1fr]">
          <div>
            <h3 className="mb-8 text-[24px] uppercase">{pick(page, "subtitle", lang)}</h3>
            <dl className="space-y-6 text-[15px]">
              {site.address && (
                <div>
                  <dt className="mb-1 font-[family-name:var(--font-montserrat)] font-bold text-[var(--ink)]">
                    {d.address} :
                  </dt>
                  <dd>{site.address}</dd>
                </div>
              )}
              <div>
                <dt className="mb-1 font-[family-name:var(--font-montserrat)] font-bold text-[var(--ink)]">{d.phone}</dt>
                {site.phone && (
                  <dd>
                    {d.phone} : <a className="text-[var(--brand)]" href={tel(site.phone)}>{site.phone}</a>
                  </dd>
                )}
                {site.phone_es && (
                  <dd>
                    {d.phoneEs} : <a className="text-[var(--brand)]" href={tel(site.phone_es)}>{site.phone_es}</a>
                  </dd>
                )}
              </div>
              {site.email && (
                <div>
                  <dt className="mb-1 font-[family-name:var(--font-montserrat)] font-bold text-[var(--ink)]">E-mail</dt>
                  <dd>
                    <a className="text-[var(--brand)]" href={`mailto:${site.email}`}>{site.email}</a>
                  </dd>
                </div>
              )}
            </dl>
            {pick(page, "body", lang) && <p className="mt-8 whitespace-pre-line">{pick(page, "body", lang)}</p>}
          </div>
          <ContactForm text={d.form} />
        </div>
        {site.map_embed && (
          <div className="container-site mt-14">
            <iframe
              src={site.map_embed}
              title="Map"
              className="h-[380px] w-full border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        )}
      </section>
    </>
  );
}
