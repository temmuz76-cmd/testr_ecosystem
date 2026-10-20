"use client";

import ResourceManager, { thumbColumn } from "@/components/admin/ResourceManager";

export default function PostsAdmin() {
  return (
    <ResourceManager
      title="Blog Yazıları"
      singular="Yazı"
      resource="posts"
      sortable={false}
      defaults={{ published_at: new Date().toISOString().slice(0, 10), views: 0 }}
      viewUrl={(r) => `/blog/${r.slug}`}
      columns={[
        thumbColumn,
        {
          label: "Başlık",
          render: (r) => (
            <>
              <div className="font-medium text-neutral-900">{String(r.title_tr)}</div>
              <div className="text-xs text-neutral-400">/blog/{String(r.slug)}</div>
            </>
          ),
        },
        {
          label: "Tarih",
          className: "whitespace-nowrap",
          render: (r) => new Date(String(r.published_at)).toLocaleDateString("tr-TR"),
        },
        { label: "Okunma", className: "text-right tabular-nums", render: (r) => String(r.views) },
      ]}
      fields={[
        { name: "title", label: "Başlık", i18n: true, required: true },
        { name: "slug", label: "Kısa ad (URL)", type: "slug", from: "title", required: true },
        { name: "excerpt", label: "Özet (liste sayfasında görünür)", type: "textarea", i18n: true },
        { name: "body", label: "İçerik", type: "markdown", i18n: true },
        { name: "image", label: "Kapak görseli", type: "image" },
        { name: "tags", label: "Etiketler", help: "Virgülle ayırın: cbtc, ato, rams" },
        { name: "published_at", label: "Yayın tarihi", type: "date" },
        { name: "is_published", label: "Yayın", type: "checkbox", help: "Yayında" },
      ]}
    />
  );
}
