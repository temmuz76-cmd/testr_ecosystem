"use client";

import { useRef, useState } from "react";
import { adminApi, type MediaItem } from "@/lib/adminApi";
import { Button, Modal, inputCls } from "./ui";
import { useFetch } from "./useFetch";

export function useMedia() {
  const { data, loading, reload } = useFetch<MediaItem[]>("/media");
  return { items: data ?? [], loading, reload };
}

export async function uploadFiles(files: FileList | File[]) {
  const results: MediaItem[] = [];
  for (const file of Array.from(files)) {
    const fd = new FormData();
    fd.append("file", file);
    results.push(await adminApi.post<MediaItem>("/media", fd));
  }
  return results;
}

export const isVideo = (url: string) => /\.(mp4|webm)$/i.test(url);

export function MediaThumb({ url, className = "" }: { url: string; className?: string }) {
  if (!url) return <div className={`bg-neutral-100 ${className}`} />;
  if (isVideo(url)) return <video src={url} className={`object-cover ${className}`} muted />;
  if (/\.pdf$/i.test(url))
    return <div className={`flex items-center justify-center bg-neutral-100 text-xs text-neutral-500 ${className}`}>PDF</div>;
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={url} alt="" className={`object-cover ${className}`} loading="lazy" />;
}

function MediaLibraryModal({ onSelect, onClose }: { onSelect: (url: string) => void; onClose: () => void }) {
  const { items, loading, reload } = useMedia();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  async function onUpload(files: FileList | null) {
    if (!files?.length) return;
    setBusy(true);
    setError("");
    try {
      const uploaded = await uploadFiles(files);
      reload();
      if (uploaded.length === 1) onSelect(uploaded[0].url);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal
      title="Medya kütüphanesi"
      onClose={onClose}
      wide
      footer={
        <>
          <input ref={fileRef} type="file" multiple className="hidden" onChange={(e) => onUpload(e.target.files)} />
          <Button onClick={() => fileRef.current?.click()} disabled={busy}>
            {busy ? "Yükleniyor…" : "Bilgisayardan yükle"}
          </Button>
        </>
      }
    >
      {error && <p className="mb-3 rounded bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
      {loading ? (
        <p className="text-sm text-neutral-500">Yükleniyor…</p>
      ) : (
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
          {items.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => onSelect(m.url)}
              className="group overflow-hidden rounded-md text-left ring-1 ring-neutral-200 hover:ring-2 hover:ring-[var(--brand)]"
              title={m.filename}
            >
              <MediaThumb url={m.url} className="aspect-square w-full" />
              <div className="truncate px-1.5 py-1 text-[11px] text-neutral-500">{m.filename}</div>
            </button>
          ))}
        </div>
      )}
    </Modal>
  );
}

export default function MediaPicker({ value, onChange }: { value: string; onChange: (url: string) => void }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="flex items-start gap-3">
      <MediaThumb url={value} className="h-20 w-20 flex-none rounded-md ring-1 ring-neutral-200" />
      <div className="flex-1 space-y-2">
        <input className={inputCls} value={value} onChange={(e) => onChange(e.target.value)} placeholder="/uploads/…" />
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => setOpen(true)}>
            Seç / Yükle
          </Button>
          {value && (
            <Button variant="secondary" onClick={() => onChange("")}>
              Kaldır
            </Button>
          )}
        </div>
      </div>
      {open && (
        <MediaLibraryModal
          onClose={() => setOpen(false)}
          onSelect={(url) => {
            onChange(url);
            setOpen(false);
          }}
        />
      )}
    </div>
  );
}

export function GalleryPicker({ value, onChange }: { value: string[]; onChange: (urls: string[]) => void }) {
  const [open, setOpen] = useState(false);
  const move = (i: number, dir: -1 | 1) => {
    const next = [...value];
    const j = i + dir;
    if (j < 0 || j >= next.length) return;
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };
  return (
    <div>
      <div className="mb-2 flex flex-wrap gap-2">
        {value.map((url, i) => (
          <div key={url + i} className="relative">
            <MediaThumb url={url} className="h-20 w-20 rounded-md ring-1 ring-neutral-200" />
            <div className="absolute inset-x-0 bottom-0 flex justify-between bg-black/50 text-xs text-white">
              <button type="button" className="px-1.5" onClick={() => move(i, -1)}>
                ‹
              </button>
              <button type="button" className="px-1.5" onClick={() => onChange(value.filter((_, k) => k !== i))}>
                ✕
              </button>
              <button type="button" className="px-1.5" onClick={() => move(i, 1)}>
                ›
              </button>
            </div>
          </div>
        ))}
      </div>
      <Button variant="secondary" onClick={() => setOpen(true)}>
        Görsel ekle
      </Button>
      {open && (
        <MediaLibraryModal
          onClose={() => setOpen(false)}
          onSelect={(url) => {
            onChange([...value, url]);
            setOpen(false);
          }}
        />
      )}
    </div>
  );
}
