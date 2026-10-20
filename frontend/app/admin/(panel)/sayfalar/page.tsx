"use client";

import { useState } from "react";
import { FieldsForm, type FieldDef, type Values } from "@/components/admin/fields";
import { Button, Card, PageTitle, Toast } from "@/components/admin/ui";
import { useFetch } from "@/components/admin/useFetch";
import { adminApi } from "@/lib/adminApi";

const PAGES: { key: string; label: string; url: string; fields: FieldDef[] }[] = [
  {
    key: "about",
    label: "Hakkımızda",
    url: "/hakkimizda",
    fields: [
      { name: "title", label: "Sayfa başlığı", i18n: true },
      { name: "body", label: "İçerik", type: "markdown", i18n: true },
      { name: "image", label: "Yan görsel", type: "image" },
      { name: "header_image", label: "Başlık arka planı", type: "image", help: "Boşsa site genelindeki başlık görseli kullanılır" },
    ],
  },
  {
    key: "home_about",
    label: "Anasayfa · Hakkımızda kutusu",
    url: "/",
    fields: [
      { name: "title", label: "Başlık", i18n: true },
      { name: "body", label: "Metin", type: "markdown", i18n: true },
      { name: "image", label: "Görsel", type: "image" },
    ],
  },
  {
    key: "service_intro",
    label: "Hizmet detay · tanıtım & avantaj başlığı",
    url: "/hizmetlerimiz/proje-yonetimi-ve-saha-koordinasyonu",
    fields: [
      { name: "body", label: "Tanıtım metni (tüm hizmet detaylarının altında)", type: "markdown", i18n: true },
      { name: "title", label: "Avantaj kartları başlığı", i18n: true },
    ],
  },
  {
    key: "services",
    label: "Hizmetlerimiz",
    url: "/hizmetlerimiz",
    fields: [
      { name: "title", label: "Sayfa başlığı", i18n: true },
      { name: "header_image", label: "Başlık arka planı", type: "image" },
    ],
  },
  {
    key: "references",
    label: "Projeler & Referanslar",
    url: "/referanslar",
    fields: [
      { name: "title", label: "Sayfa başlığı", i18n: true },
      { name: "header_image", label: "Başlık arka planı", type: "image" },
    ],
  },
  {
    key: "blog",
    label: "Blog",
    url: "/blog",
    fields: [
      { name: "title", label: "Sayfa başlığı", i18n: true },
      { name: "header_image", label: "Başlık arka planı", type: "image" },
    ],
  },
  {
    key: "contact",
    label: "İletişim",
    url: "/iletisim",
    fields: [
      { name: "title", label: "Sayfa başlığı", i18n: true },
      { name: "subtitle", label: "Bilgi kutusu başlığı", i18n: true },
      { name: "body", label: "Ek not (isteğe bağlı)", type: "textarea", i18n: true },
      { name: "header_image", label: "Başlık arka planı", type: "image" },
    ],
  },
];

export default function PagesAdmin() {
  const [active, setActive] = useState(PAGES[0]);
  const { data, setData: setValues } = useFetch<Values>(`/pages/${active.key}`);
  // Ignore the previous page's data while the newly selected one loads.
  const values = data?.key === active.key ? data : null;
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; kind: "ok" | "error" } | null>(null);

  async function save() {
    if (!values) return;
    setSaving(true);
    try {
      setValues(await adminApi.put<Values>(`/pages/${active.key}`, values));
      setToast({ message: "Kaydedildi", kind: "ok" });
    } catch (err) {
      setToast({ message: (err as Error).message, kind: "error" });
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <PageTitle title="Sayfalar" />
      <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
        <Card className="self-start p-2">
          {PAGES.map((p) => (
            <button
              key={p.key}
              type="button"
              onClick={() => setActive(p)}
              className={`block w-full rounded-md px-3 py-2 text-left text-sm ${
                active.key === p.key ? "bg-[var(--brand)]/10 font-medium text-[var(--brand)]" : "hover:bg-neutral-50"
              }`}
            >
              {p.label}
            </button>
          ))}
        </Card>
        <Card className="p-5">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="font-semibold">{active.label}</h2>
            <a href={active.url} target="_blank" className="text-xs text-neutral-500 hover:text-neutral-900">
              Sayfayı gör ↗
            </a>
          </div>
          {values ? (
            <>
              <FieldsForm fields={active.fields} values={values} onChange={setValues} />
              <div className="mt-6 flex justify-end">
                <Button onClick={save} disabled={saving}>
                  {saving ? "Kaydediliyor…" : "Kaydet"}
                </Button>
              </div>
            </>
          ) : (
            <p className="text-sm text-neutral-500">Yükleniyor…</p>
          )}
        </Card>
      </div>
      {toast && <Toast {...toast} onDone={() => setToast(null)} />}
    </>
  );
}
