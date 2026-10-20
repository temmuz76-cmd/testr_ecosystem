import type { Metadata } from "next";
import PageHeader from "@/components/site/PageHeader";
import { api } from "@/lib/api";
import { pick } from "@/lib/i18n";
import { getLang } from "@/lib/lang";

export async function generateMetadata(): Promise<Metadata> {
  const [page, lang] = await Promise.all([api.page("references"), getLang()]);
  return { title: pick(page, "title", lang) };
}

export default async function ReferencesPage() {
  const [site, page, refs, lang] = await Promise.all([
    api.site(),
    api.page("references"),
    api.references(),
    getLang(),
  ]);

  return (
    <>
      <PageHeader title={pick(page, "title", lang)} image={page.header_image || site.page_header_image} />
      <section className="py-14 text-[13px] text-[#444]">
        <div className="container-site">
          {refs.projects.length > 0 && (
            <>
              <h4 className="mb-5 text-[15px] uppercase text-[#1f3a5f]">{site.references_heading_projects}</h4>
              <div className="space-y-5">
                {refs.projects.map((p) => (
                  <div key={p.id}>
                    <h5 className="text-[15px] uppercase text-[#111]">{p.client}</h5>
                    <div>{pick(p, "title", lang)}</div>
                    <div>{pick(p, "category", lang)}</div>
                  </div>
                ))}
              </div>
            </>
          )}

          {refs.experiences.length > 0 && (
            <>
              <h4 className="mb-5 mt-10 text-[15px] uppercase text-[#111]">{site.references_heading_experience}</h4>
              <div className="space-y-5">
                {refs.experiences.map((e) => (
                  <div key={e.id}>
                    <div className="mb-1 flex items-center gap-1.5 text-[11px] font-bold text-[#111]">
                      <span className="text-[14px]">{e.flag}</span> {pick(e, "country", lang)}
                    </div>
                    <h5 className="text-[15px] text-[#111]">{pick(e, "title", lang)}</h5>
                    <p>{pick(e, "description", lang)}</p>
                    <p className="text-[#666]">{pick(e, "tags", lang)}</p>
                  </div>
                ))}
              </div>
            </>
          )}

          {site.references_flow && <p className="mt-10 text-[12px] uppercase text-[#111]">{site.references_flow}</p>}
        </div>
      </section>
    </>
  );
}
