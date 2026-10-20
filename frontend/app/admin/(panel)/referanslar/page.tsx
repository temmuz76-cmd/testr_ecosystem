"use client";

import ResourceManager from "@/components/admin/ResourceManager";
import { PageTitle } from "@/components/admin/ui";

export default function ReferencesAdmin() {
  return (
    <>
      <PageTitle title="Projeler & Referanslar" />
      <ResourceManager
        embedded
        title="Proje deneyimi"
        singular="Proje"
        resource="projects"
        columns={[
          { label: "Müşteri", render: (r) => <span className="font-medium text-neutral-900">{String(r.client)}</span> },
          { label: "Proje", render: (r) => String(r.title_tr) },
          { label: "Kategori / durum", render: (r) => <span className="text-neutral-500">{String(r.category_tr)}</span> },
        ]}
        fields={[
          { name: "client", label: "Müşteri / ülke", required: true, help: "Örn. TCDD TAŞIMACILIK A.Ş." },
          { name: "title", label: "Proje adı", i18n: true, required: true },
          { name: "category", label: "Kategori ve durum", i18n: true, help: "Örn. Railway Electronics Repair & Testing — Completed" },
          { name: "is_published", label: "Yayın", type: "checkbox", help: "Yayında" },
        ]}
      />
      <ResourceManager
        embedded
        title="Yönetim deneyimi (ülkeler)"
        singular="Deneyim"
        resource="experiences"
        columns={[
          {
            label: "Ülke",
            render: (r) => (
              <span>
                {String(r.flag)} {String(r.country_tr)}
              </span>
            ),
          },
          { label: "Başlık", render: (r) => <span className="font-medium text-neutral-900">{String(r.title_tr)}</span> },
        ]}
        fields={[
          { name: "flag", label: "Bayrak (emoji)", help: "Örn. 🇹🇷 🇪🇸 🇭🇷" },
          { name: "country", label: "Ülke", i18n: true, required: true },
          { name: "title", label: "Başlık", i18n: true, required: true },
          { name: "description", label: "Açıklama", type: "textarea", i18n: true },
          { name: "tags", label: "Alanlar", i18n: true, help: "Örn. Installation · Testing & Commissioning" },
          { name: "is_published", label: "Yayın", type: "checkbox", help: "Yayında" },
        ]}
      />
      <p className="text-sm text-neutral-500">
        Bölüm başlıkları ve alttaki akış satırı <a href="/admin/ayarlar" className="text-[var(--brand)]">Site Ayarları</a>{" "}
        sayfasından düzenlenir.
      </p>
    </>
  );
}
