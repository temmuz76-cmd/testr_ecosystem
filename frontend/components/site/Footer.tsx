import Link from "next/link";
import { pick, t } from "@/lib/i18n";
import type { Lang, SiteSettings } from "@/lib/types";

export default function Footer({ site, lang }: { site: SiteSettings; lang: Lang }) {
  const d = t(lang);
  const tel = (s: string) => `tel:${s.replace(/[^\d+]/g, "")}`;
  const credit = site.credit_name ? (
    site.credit_url ? (
      <a href={site.credit_url} target="_blank" rel="noopener noreferrer" className="text-white hover:text-[var(--brand)]">
        {site.credit_name}
      </a>
    ) : (
      <span className="text-white">{site.credit_name}</span>
    )
  ) : null;

  return (
    <footer className="text-[15px]">
      <div className="bg-[var(--footer)] py-14 text-[#a0a0a0]">
        <div className="container-site grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={site.logo_footer} alt="TESTR" className="mb-5 h-16 w-auto" />
            <p className="max-w-[240px] text-[11px] uppercase leading-relaxed tracking-wide">
              {pick(site, "footer_text", lang)}
            </p>
          </div>

          <div>
            <h4 className="mb-5 text-[18px] text-white">{d.corporate}</h4>
            <ul className="space-y-2">
              {[
                ["/hizmetlerimiz", d.services],
                ["/hakkimizda", d.about],
                ["/referanslar", d.references],
              ].map(([href, label]) => (
                <li key={href}>
                  <Link href={href} className="hover:text-white">
                    <span className="mr-1 text-[var(--brand)]">›</span> {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-5 text-[18px] text-white">{d.contact}</h4>
            <ul className="space-y-1.5">
              {site.phone && (
                <li>
                  <span className="font-bold text-white">{d.phone} :</span>{" "}
                  <a href={tel(site.phone)} className="text-[var(--brand)] hover:text-white">{site.phone}</a>
                </li>
              )}
              {site.phone_es && (
                <li>
                  <span className="font-bold text-white">{d.phoneEs} :</span>{" "}
                  <a href={tel(site.phone_es)} className="text-[var(--brand)] hover:text-white">{site.phone_es}</a>
                </li>
              )}
              {site.email && (
                <li>
                  <span className="font-bold text-white">{d.mail} :</span>{" "}
                  <a href={`mailto:${site.email}`} className="text-[var(--brand)] hover:text-white">{site.email}</a>
                </li>
              )}
            </ul>
            {site.linkedin && (
              <a
                href={site.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 inline-flex items-center gap-2 text-[var(--brand)] hover:text-white"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                  <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.94v5.67H9.34V9h3.42v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0z" />
                </svg>
                LinkedIn
              </a>
            )}
          </div>

          <div className="grid grid-cols-3 gap-2 self-start">
            {(site.footer_gallery ?? []).slice(0, 6).map((src) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={src} src={src} alt="" className="aspect-square w-full object-cover" loading="lazy" />
            ))}
          </div>
        </div>
      </div>
      <div className="bg-[var(--copyright)] py-8 text-center text-[14px] text-white/40">
        {credit} {pick(site, "copyright", lang)}
      </div>
    </footer>
  );
}
