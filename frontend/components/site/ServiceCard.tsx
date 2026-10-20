import Link from "next/link";
import { pick } from "@/lib/i18n";
import type { Lang, Service } from "@/lib/types";

export default function ServiceCard({ service, lang, cta }: { service: Service; lang: Lang; cta: string }) {
  const href = `/hizmetlerimiz/${service.slug}`;
  return (
    <article className="flex flex-col bg-white p-[18px] text-center shadow-[0_0_20px_rgba(0,0,0,0.04)]">
      <Link href={href} className="block overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={service.image}
          alt={pick(service, "title", lang)}
          className="aspect-square w-full object-cover transition-transform duration-500 hover:scale-105"
          loading="lazy"
        />
      </Link>
      <h3 className="mt-4 text-[17px] leading-snug">
        <Link href={href} className="hover:text-[var(--brand)]">
          {pick(service, "title", lang)}
        </Link>
      </h3>
      <p className="mt-3 flex-1 text-[13px] leading-relaxed text-[var(--muted)]">{pick(service, "summary", lang)}</p>
      <div className="mt-5">
        <Link href={href} className="btn-dark">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
            <path d="M6 2h12v4H6zM4 8h16v14H4zm4 4v2h8v-2zm0 4v2h8v-2z" />
          </svg>
          {cta}
        </Link>
      </div>
    </article>
  );
}
