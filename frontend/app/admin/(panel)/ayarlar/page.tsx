"use client";

import { useState } from "react";
import { FieldsForm, type FieldDef, type Values } from "@/components/admin/fields";
import { Button, Card, PageTitle, Toast, inputCls } from "@/components/admin/ui";
import { useFetch } from "@/components/admin/useFetch";
import { adminApi } from "@/lib/adminApi";

const GROUPS: { title: string; fields: FieldDef[] }[] = [
  {
    title: "Genel",
    fields: [
      { name: "site_title", label: "Site başlığı" },
      { name: "logo", label: "Logo (header)", type: "image" },
      { name: "logo_footer", label: "Logo (footer, açık renk)", type: "image" },
      { name: "page_header_image", label: "Varsayılan sayfa başlığı arka planı", type: "image" },
      { name: "cookie_banner_enabled", label: "Çerez bildirimi", type: "checkbox", help: "Çerez onay kutusunu göster" },
    ],
  },
  {
    title: "Anasayfa üst alanı",
    fields: [
      { name: "hero_line1", label: "Başlık 1. satır", i18n: true },
      { name: "hero_line2", label: "Başlık 2. satır", i18n: true },
      { name: "hero_video", label: "Arka plan videosu (MP4)", type: "image", help: "Boş bırakılırsa kapak görseli kullanılır" },
      { name: "hero_poster", label: "Kapak görseli", type: "image" },
    ],
  },
  {
    title: "İletişim bilgileri",
    fields: [
      { name: "phone", label: "Telefon" },
      { name: "phone_es", label: "Telefon (ES)" },
      { name: "email", label: "E-posta" },
      { name: "address", label: "Adres", type: "textarea" },
      { name: "linkedin", label: "LinkedIn adresi" },
      { name: "map_embed", label: "Harita embed adresi", help: "Google Maps → Paylaş → Harita yerleştir → src içindeki adres" },
    ],
  },
  {
    title: "Footer",
    fields: [
      { name: "footer_text", label: "Logo altı metin", type: "textarea", i18n: true },
      { name: "footer_gallery", label: "Footer galerisi (6 görsel)", type: "gallery" },
      { name: "copyright", label: "Telif metni", i18n: true },
      { name: "credit_name", label: "Tasarım/geliştirici adı" },
      { name: "credit_url", label: "Tasarım/geliştirici bağlantısı" },
    ],
  },
  {
    title: "Referanslar sayfası",
    fields: [
      { name: "references_heading_projects", label: "Proje bölümü başlığı" },
      { name: "references_heading_experience", label: "Yönetim deneyimi başlığı" },
      { name: "references_flow", label: "Alt akış satırı", type: "textarea" },
    ],
  },
];

function PasswordCard() {
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null);
  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form));
    if (data.new_password !== data.repeat) {
      setMsg({ text: "Yeni şifreler eşleşmiyor", ok: false });
      return;
    }
    try {
      await adminApi.post("/password", { current_password: data.current_password, new_password: data.new_password });
      form.reset();
      setMsg({ text: "Şifre güncellendi", ok: true });
    } catch (err) {
      setMsg({ text: (err as Error).message, ok: false });
    }
  }
  return (
    <Card className="p-5">
      <h2 className="mb-4 font-semibold">Şifre değiştir</h2>
      <form onSubmit={onSubmit} className="grid max-w-md gap-3">
        <input name="current_password" type="password" required placeholder="Mevcut şifre" autoComplete="current-password" className={inputCls} />
        <input name="new_password" type="password" required minLength={10} placeholder="Yeni şifre (en az 10 karakter)" autoComplete="new-password" className={inputCls} />
        <input name="repeat" type="password" required placeholder="Yeni şifre (tekrar)" autoComplete="new-password" className={inputCls} />
        {msg && <p className={`text-sm ${msg.ok ? "text-emerald-700" : "text-red-600"}`}>{msg.text}</p>}
        <div>
          <Button type="submit">Şifreyi güncelle</Button>
        </div>
      </form>
    </Card>
  );
}

export default function SettingsAdmin() {
  const { data: values, setData: setValues } = useFetch<Values>("/settings/site");
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; kind: "ok" | "error" } | null>(null);

  async function save() {
    if (!values) return;
    setSaving(true);
    try {
      setValues(await adminApi.put<Values>("/settings/site", values));
      setToast({ message: "Ayarlar kaydedildi", kind: "ok" });
    } catch (err) {
      setToast({ message: (err as Error).message, kind: "error" });
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <PageTitle title="Site Ayarları">
        <Button onClick={save} disabled={saving || !values}>
          {saving ? "Kaydediliyor…" : "Kaydet"}
        </Button>
      </PageTitle>
      {values ? (
        <div className="space-y-6">
          {GROUPS.map((g) => (
            <Card key={g.title} className="p-5">
              <h2 className="mb-4 font-semibold">{g.title}</h2>
              <FieldsForm fields={g.fields} values={values} onChange={setValues} />
            </Card>
          ))}
          <div className="flex justify-end">
            <Button onClick={save} disabled={saving}>
              {saving ? "Kaydediliyor…" : "Kaydet"}
            </Button>
          </div>
          <PasswordCard />
        </div>
      ) : (
        <p className="text-sm text-neutral-500">Yükleniyor…</p>
      )}
      {toast && <Toast {...toast} onDone={() => setToast(null)} />}
    </>
  );
}
