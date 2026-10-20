"use client";

import { useState } from "react";
import { Button, Card, PageTitle } from "@/components/admin/ui";
import { useFetch } from "@/components/admin/useFetch";
import { adminApi } from "@/lib/adminApi";

interface Message {
  id: number;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export default function MessagesAdmin() {
  const { data, setData: setItems, reload: load, loading } = useFetch<Message[]>("/messages");
  const items = data ?? [];
  const [selected, setSelected] = useState<Message | null>(null);

  async function open(m: Message) {
    setSelected(m);
    if (!m.is_read) {
      await adminApi.patch(`/messages/${m.id}`, { is_read: true });
      setItems((list) => (list ?? []).map((x) => (x.id === m.id ? { ...x, is_read: true } : x)));
    }
  }
  async function markUnread(m: Message) {
    await adminApi.patch(`/messages/${m.id}`, { is_read: false });
    setSelected(null);
    load();
  }
  async function remove(m: Message) {
    if (!confirm("Mesaj kalıcı olarak silinsin mi?")) return;
    await adminApi.del(`/messages/${m.id}`);
    setSelected(null);
    load();
  }

  const fmt = (iso: string) =>
    new Date(iso).toLocaleString("tr-TR", { dateStyle: "medium", timeStyle: "short" });

  return (
    <>
      <PageTitle title="Mesajlar" />
      <div className="grid gap-6 lg:grid-cols-[minmax(0,380px)_1fr]">
        <Card className="self-start overflow-hidden">
          {loading ? (
            <p className="p-4 text-sm text-neutral-500">Yükleniyor…</p>
          ) : items.length === 0 ? (
            <p className="p-4 text-sm text-neutral-500">İletişim formundan gelen mesajlar burada görünür.</p>
          ) : (
            <ul className="divide-y divide-neutral-100">
              {items.map((m) => (
                <li key={m.id}>
                  <button
                    type="button"
                    onClick={() => open(m)}
                    className={`block w-full px-4 py-3 text-left text-sm hover:bg-neutral-50 ${
                      selected?.id === m.id ? "bg-neutral-50" : ""
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {!m.is_read && <span className="h-2 w-2 flex-none rounded-full bg-[var(--brand)]" />}
                      <span className={`truncate ${m.is_read ? "" : "font-semibold"}`}>{m.name}</span>
                      <span className="ml-auto flex-none text-xs text-neutral-400">
                        {new Date(m.created_at).toLocaleDateString("tr-TR")}
                      </span>
                    </div>
                    <p className="mt-0.5 truncate text-neutral-500">{m.subject || m.message}</p>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Card>

        {selected ? (
          <Card className="self-start p-5">
            <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold">{selected.subject || "(Konu yok)"}</h2>
                <p className="text-sm text-neutral-500">{fmt(selected.created_at)}</p>
              </div>
              <div className="flex gap-2">
                <Button variant="secondary" onClick={() => markUnread(selected)}>
                  Okunmadı yap
                </Button>
                <Button variant="danger" onClick={() => remove(selected)}>
                  Sil
                </Button>
              </div>
            </div>
            <dl className="mb-4 grid grid-cols-[90px_1fr] gap-y-1 text-sm">
              <dt className="text-neutral-500">Gönderen</dt>
              <dd>{selected.name}</dd>
              <dt className="text-neutral-500">E-posta</dt>
              <dd>
                <a href={`mailto:${selected.email}`} className="text-[var(--brand)]">
                  {selected.email}
                </a>
              </dd>
              {selected.phone && (
                <>
                  <dt className="text-neutral-500">Telefon</dt>
                  <dd>
                    <a href={`tel:${selected.phone}`} className="text-[var(--brand)]">
                      {selected.phone}
                    </a>
                  </dd>
                </>
              )}
            </dl>
            <p className="whitespace-pre-wrap rounded-md bg-neutral-50 p-4 text-sm leading-relaxed">{selected.message}</p>
            <a
              href={`mailto:${selected.email}?subject=${encodeURIComponent("Re: " + (selected.subject || "TESTR"))}`}
              className="mt-4 inline-block text-sm font-medium text-[var(--brand)] hover:underline"
            >
              E-posta ile yanıtla →
            </a>
          </Card>
        ) : (
          <Card className="hidden p-8 text-center text-sm text-neutral-400 lg:block">Okumak için bir mesaj seçin.</Card>
        )}
      </div>
    </>
  );
}
