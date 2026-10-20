"use client";

import ResourceManager, { thumbColumn } from "@/components/admin/ResourceManager";

export default function ServicesAdmin() {
  return (
    <ResourceManager
      title="Hizmetler"
      singular="Hizmet"
      resource="services"
      defaults={{ show_on_home: true }}
      viewUrl={(r) => `/hizmetlerimiz/${r.slug}`}
      columns={[
        thumbColumn,
        {
          label: "Başlık",
          render: (r) => (
            <>
              <div className="font-medium text-neutral-900">{String(r.title_tr)}</div>
              <div className="text-xs text-neutral-400">/{String(r.slug)}</div>
            </>
          ),
        },
        { label: "Anasayfa", render: (r) => (r.show_on_home ? "✓" : "—"), className: "text-center w-24" },
      ]}
      fields={[
        { name: "title", label: "Başlık", i18n: true, required: true },
        { name: "slug", label: "Kısa ad (URL)", type: "slug", from: "title", required: true, help: "Örn. proje-yonetimi → /hizmetlerimiz/proje-yonetimi" },
        { name: "summary", label: "Kısa açıklama (kartlarda görünür)", type: "textarea", i18n: true },
        { name: "body", label: "Detay içeriği", type: "markdown", i18n: true },
        { name: "image", label: "Görsel", type: "image" },
        { name: "show_on_home", label: "Anasayfa", type: "checkbox", help: "Anasayfadaki hizmet kartlarında göster" },
        { name: "is_published", label: "Yayın", type: "checkbox", help: "Yayında" },
      ]}
    />
  );
}
