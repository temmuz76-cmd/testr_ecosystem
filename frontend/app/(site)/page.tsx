import Link from "next/link";
import Markdown from "@/components/Markdown";
import ServiceCard from "@/components/site/ServiceCard";
import { api } from "@/lib/api";
import { pick, t } from "@/lib/i18n";
import { getLang } from "@/lib/lang";

export default async function HomePage() {
  const [site, services, about, lang] = await Promise.all([
    api.site(),
    api.services(true),
    api.page("home_about"),
    getLang(),
  ]);
  const d = t(lang);

  return (
    <>
      {/* hero */}
      <section className="relative h-[60vh] min-h-[380px] overflow-hidden bg-[#222] sm:h-[78vh]">
        {site.hero_video ? (
          <video
            className="absolute inset-0 h-full w-full object-cover"
            src={site.hero_video}
            poster={site.hero_poster || undefined}
            autoPlay
            muted
            loop
            playsInline
          />
        ) : (
          site.hero_poster && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={site.hero_poster} alt="" className="absolute inset-0 h-full w-full object-cover" />
          )
        )}
        <div className="absolute inset-0 bg-black/15" />
        <div className="relative flex h-full items-center justify-center px-4">
          <h2 className="text-center text-[28px] uppercase leading-tight text-white drop-shadow-lg sm:text-[45px]">
            {pick(site, "hero_line1", lang)}
            <br />
            {pick(site, "hero_line2", lang)}
          </h2>
        </div>
      </section>

      {/* services */}
      <section className="bg-[var(--panel)] py-16 sm:py-20">
        <div className="container-site">
          <h2 className="section-title mb-12">{d.services}</h2>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((s) => (
              <ServiceCard key={s.id} service={s} lang={lang} cta={d.serviceDetail} />
            ))}
          </div>
        </div>
      </section>

      {/* about teaser */}
      <section className="py-16 sm:py-20">
        <div className="container-site">
          <div className="grid overflow-hidden bg-[var(--panel)] md:grid-cols-[1fr_340px]">
            <div className="p-8 sm:p-12">
              <h3 className="mb-4 text-[30px] uppercase">{pick(about, "title", lang)}</h3>
              <Markdown className="prose-site text-[14px]">{pick(about, "body", lang)}</Markdown>
              <Link href="/hakkimizda" className="btn-brand mt-6">
                {d.more}
              </Link>
            </div>
            {about.image && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={about.image} alt="" className="h-full min-h-[240px] w-full object-cover" loading="lazy" />
            )}
          </div>
        </div>
      </section>
    </>
  );
}
