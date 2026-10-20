import CookieBanner from "@/components/site/CookieBanner";
import Footer from "@/components/site/Footer";
import Header from "@/components/site/Header";
import LangSwitcher from "@/components/site/LangSwitcher";
import ScrollTop from "@/components/site/ScrollTop";
import { api } from "@/lib/api";
import { t } from "@/lib/i18n";
import { getLang } from "@/lib/lang";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const [site, lang] = await Promise.all([api.site(), getLang()]);
  const d = t(lang);
  const nav = [
    { href: "/", label: d.home },
    { href: "/hakkimizda", label: d.about },
    { href: "/hizmetlerimiz", label: d.services },
    { href: "/referanslar", label: d.references },
    { href: "/blog", label: d.blog },
    { href: "/iletisim", label: d.contact },
  ];

  return (
    <>
      <Header logo={site.logo} nav={nav} />
      <main>{children}</main>
      <Footer site={site} lang={lang} />
      <LangSwitcher lang={lang} />
      <ScrollTop />
      {site.cookie_banner_enabled !== false && <CookieBanner text={d.cookie} />}
    </>
  );
}
