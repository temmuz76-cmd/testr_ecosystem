"use client";

import ResourceManager, { thumbColumn } from "@/components/admin/ResourceManager";

export default function FeaturesAdmin() {
  return (
    <>
      <ResourceManager
        title="Avantajlar (Fark Yaratıyoruz)"
        singular="Avantaj"
        resource="features"
        columns={[
          thumbColumn,
          { label: "Başlık", render: (r) => <span className="font-medium text-neutral-900">{String(r.title_tr)}</span> },
          { label: "Metin", render: (r) => <span className="line-clamp-2 text-neutral-500">{String(r.text_tr)}</span> },
        ]}
        fields={[
          { name: "title", label: "Başlık", i18n: true, required: true },
          { name: "text", label: "Metin", type: "textarea", i18n: true },
          { name: "icon", label: "İkon", type: "image" },
          { name: "is_published", label: "Yayın", type: "checkbox", help: "Yayında" },
        ]}
      />
      <p className="mt-4 text-sm text-neutral-500">Bu kartlar tüm hizmet detay sayfalarının altında gösterilir.</p>
    </>
  );
}
