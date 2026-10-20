"use client";

import { useRef, useState } from "react";
import { MediaThumb, uploadFiles, useMedia } from "@/components/admin/MediaPicker";
import { Button, Card, PageTitle, Toast } from "@/components/admin/ui";
import { adminApi } from "@/lib/adminApi";

const kb = (n: number) => (n > 1024 * 1024 ? `${(n / 1024 / 1024).toFixed(1)} MB` : `${Math.round(n / 1024)} KB`);

export default function MediaAdmin() {
  const { items, loading, reload } = useMedia();
  const [busy, setBusy] = useState(false);
  const [drag, setDrag] = useState(false);
  const [toast, setToast] = useState<{ message: string; kind: "ok" | "error" } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  async function upload(files: FileList | null) {
    if (!files?.length) return;
    setBusy(true);
    try {
      await uploadFiles(files);
      setToast({ message: `${files.length} dosya yüklendi`, kind: "ok" });
    } catch (err) {
      setToast({ message: (err as Error).message, kind: "error" });
    } finally {
      setBusy(false);
      reload();
    }
  }

  async function remove(id: number) {
    if (!confirm("Dosya silinsin mi? Bu dosyayı kullanan sayfalarda görsel görünmez olur.")) return;
    await adminApi.del(`/media/${id}`);
    reload();
  }

  return (
    <>
      <PageTitle title="Medya">
        <input ref={fileRef} type="file" multiple className="hidden" onChange={(e) => upload(e.target.files)} />
        <Button onClick={() => fileRef.current?.click()} disabled={busy}>
          {busy ? "Yükleniyor…" : "+ Dosya yükle"}
        </Button>
      </PageTitle>

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDrag(true);
        }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDrag(false);
          upload(e.dataTransfer.files);
        }}
        className={`mb-6 rounded-lg border-2 border-dashed p-6 text-center text-sm transition-colors ${
          drag ? "border-[var(--brand)] bg-[var(--brand)]/5" : "border-neutral-300 text-neutral-500"
        }`}
      >
        Dosyaları buraya sürükleyin · JPG, PNG, WEBP, GIF, MP4, WEBM, PDF · en fazla 50 MB
      </div>

      {loading ? (
        <p className="text-sm text-neutral-500">Yükleniyor…</p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {items.map((m) => (
            <Card key={m.id} className="overflow-hidden">
              <MediaThumb url={m.url} className="aspect-square w-full" />
              <div className="p-2 text-xs">
                <div className="truncate font-medium" title={m.filename}>
                  {m.filename}
                </div>
                <div className="text-neutral-400">{kb(m.size)}</div>
                <div className="mt-1.5 flex gap-3">
                  <button
                    type="button"
                    className="text-[var(--brand)] hover:underline"
                    onClick={() => {
                      navigator.clipboard?.writeText(m.url);
                      setToast({ message: "Adres kopyalandı", kind: "ok" });
                    }}
                  >
                    Adresi kopyala
                  </button>
                  <button type="button" className="text-red-600 hover:underline" onClick={() => remove(m.id)}>
                    Sil
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
      {toast && <Toast {...toast} onDone={() => setToast(null)} />}
    </>
  );
}
