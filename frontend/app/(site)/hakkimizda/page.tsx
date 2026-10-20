import type { Metadata } from "next";
import Markdown from "@/components/Markdown";
import PageHeader from "@/components/site/PageHeader";
import { api } from "@/lib/api";
import { pick } from "@/lib/i18n";
import { getLang } from "@/lib/lang";

export async function generateMetadata(): Promise<Metadata> {
  const [page, lang] = await Promise.all([api.page("about"), getLang()]);
  return { title: pick(page, "title", lang) };
}

export default async function AboutPage() {
  const [site, page, lang] = await Promise.all([api.site(), api.page("about"), getLang()]);

  return (
    <>
      <PageHeader title={pick(page, "title", lang)} image={page.header_image || site.page_header_image} />
      <section className="py-16 sm:py-20">
        <div className="container-site">
          <div className="grid overflow-hidden bg-[var(--panel)] md:grid-cols-[1fr_380px]">
            <div className="p-8 sm:p-12">
              <Markdown>{pick(page, "body", lang)}</Markdown>
            </div>
            {page.image && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={page.image} alt="" className="h-full min-h-[260px] w-full object-cover" />
            )}
          </div>
        </div>
      </section>
    </>
  );
}
