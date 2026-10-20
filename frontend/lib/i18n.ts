import type { Lang } from "./types";

export const LANG_COOKIE = "lang";

/** Pick `<field>_<lang>` from a record, falling back to Turkish when empty. */
export function pick(obj: object, field: string, lang: Lang): string {
  const rec = obj as Record<string, unknown>;
  const value = rec[`${field}_${lang}`];
  if (typeof value === "string" && value.trim()) return value;
  return (rec[`${field}_tr`] as string) ?? "";
}

const dict = {
  tr: {
    home: "Anasayfa",
    about: "Hakkımızda",
    services: "Hizmetlerimiz",
    references: "Projeler & Referanslar",
    blog: "Blog",
    contact: "İletişim",
    serviceDetail: "Hizmet Detayı",
    more: "Daha fazla...",
    corporate: "Kurumsal",
    phone: "Telefon",
    phoneEs: "Telefon (ES)",
    mail: "Mail",
    address: "Adresimiz",
    readMore: "Devamını oku",
    posted: "Yayınlandı",
    tags: "Etiketler",
    share: "Paylaş",
    views: "görüntülenme",
    form: {
      name: "Adınız *",
      email: "E-posta *",
      phone: "Telefon",
      subject: "Konu",
      message: "Mesajınız *",
      consent: "Gönderdiğim verilerin toplanmasını ve saklanmasını kabul ediyorum.",
      send: "Gönder",
      sending: "Gönderiliyor…",
      ok: "Mesajınız alındı. En kısa sürede size dönüş yapacağız.",
      error: "Mesaj gönderilemedi. Lütfen alanları kontrol edip tekrar deneyin.",
    },
    cookie: {
      title: "Gizliliğinize saygı duyuyoruz",
      text: "Çerezler deneyiminizi geliştirmemize, kişiselleştirilmiş içerik sunmamıza ve trafiği analiz etmemize yardımcı olur. Onaylamak için Tümünü Kabul Et, reddetmek için Tümünü Reddet tıklayın.",
      accept: "Tümünü Kabul Et",
      reject: "Tümünü Reddet",
    },
    notFound: "Aradığınız sayfa bulunamadı",
    backHome: "Anasayfaya dön",
  },
  en: {
    home: "Home",
    about: "About Us",
    services: "Our Services",
    references: "Projects & References",
    blog: "Blog",
    contact: "Contact",
    serviceDetail: "Service Details",
    more: "Read more...",
    corporate: "Corporate",
    phone: "Phone",
    phoneEs: "Phone (ES)",
    mail: "Mail",
    address: "Address",
    readMore: "Read more",
    posted: "Posted",
    tags: "Tags",
    share: "Share",
    views: "views",
    form: {
      name: "Your name *",
      email: "Email *",
      phone: "Phone",
      subject: "Subject",
      message: "Your message *",
      consent: "I agree that my submitted data is being collected and stored.",
      send: "Send",
      sending: "Sending…",
      ok: "Thank you! We have received your message and will get back to you shortly.",
      error: "The message could not be sent. Please check the fields and try again.",
    },
    cookie: {
      title: "We value your privacy",
      text: "Cookies help us improve your experience, personalise content and analyse traffic. Click Accept All to agree or Reject All to decline.",
      accept: "Accept All",
      reject: "Reject All",
    },
    notFound: "The page you are looking for cannot be found",
    backHome: "Back to homepage",
  },
} as const;

export type Dict = (typeof dict)["tr"];

export function t(lang: Lang): Dict {
  return dict[lang] as Dict;
}

export function formatDate(iso: string, lang: Lang) {
  return new Date(iso).toLocaleDateString(lang === "tr" ? "tr-TR" : "en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
