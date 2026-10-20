"use client";

import { useRef, useState } from "react";
import Markdown from "@/components/Markdown";
import MediaPicker, { GalleryPicker, uploadFiles } from "./MediaPicker";
import { inputCls } from "./ui";

export type FieldType = "text" | "textarea" | "markdown" | "image" | "gallery" | "number" | "checkbox" | "date" | "slug";

export interface FieldDef {
  name: string;
  label: string;
  type?: FieldType;
  /** Field exists as `<name>_tr` and `<name>_en`. */
  i18n?: boolean;
  required?: boolean;
  help?: string;
  /** For slug fields: the source field to derive from. */
  from?: string;
  wide?: boolean;
}

export type Values = Record<string, unknown>;

const TR_MAP: Record<string, string> = { ç: "c", ğ: "g", ı: "i", ö: "o", ş: "s", ü: "u", â: "a", î: "i", û: "u" };

export function slugify(text: string) {
  return text
    .toLocaleLowerCase("tr-TR")
    .replace(/[çğıöşüâîû]/g, (c) => TR_MAP[c] ?? c)
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

type ToolId = "bold" | "italic" | "h2" | "h4" | "ul" | "ol" | "link" | "image";

const TOOLS: [ToolId, string, string][] = [
  ["bold", "B", "Kalın"],
  ["italic", "I", "İtalik"],
  ["h2", "H2", "Başlık"],
  ["h4", "H4", "Alt başlık"],
  ["ul", "•", "Madde"],
  ["ol", "1.", "Numaralı liste"],
  ["link", "🔗", "Bağlantı"],
  ["image", "🖼", "Görsel ekle"],
];

function MarkdownEditor({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [preview, setPreview] = useState(false);
  const ref = useRef<HTMLTextAreaElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const wrap = (before: string, after = before, placeholder = "metin") => {
    const el = ref.current;
    if (!el) return;
    const { selectionStart: s, selectionEnd: e } = el;
    const selected = value.slice(s, e) || placeholder;
    onChange(value.slice(0, s) + before + selected + after + value.slice(e));
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(s + before.length, s + before.length + selected.length);
    });
  };
  const linePrefix = (prefix: string) => {
    const el = ref.current;
    if (!el) return;
    const start = value.lastIndexOf("\n", el.selectionStart - 1) + 1;
    onChange(value.slice(0, start) + prefix + value.slice(start));
  };
  async function insertImage(files: FileList | null) {
    if (!files?.length) return;
    const [media] = await uploadFiles(files);
    const el = ref.current;
    const pos = el?.selectionStart ?? value.length;
    onChange(value.slice(0, pos) + `\n![](${media.url})\n` + value.slice(pos));
  }

  function runTool(id: ToolId) {
    switch (id) {
      case "bold": return wrap("**");
      case "italic": return wrap("_");
      case "h2": return linePrefix("## ");
      case "h4": return linePrefix("#### ");
      case "ul": return linePrefix("- ");
      case "ol": return linePrefix("1. ");
      case "link": return wrap("[", "](https://)", "bağlantı");
      case "image": return fileRef.current?.click();
    }
  }

  return (
    <div className="overflow-hidden rounded-md border border-neutral-300">
      <div className="flex flex-wrap items-center gap-0.5 border-b border-neutral-200 bg-neutral-50 px-1.5 py-1">
        {TOOLS.map(([id, label, title]) => (
          <button
            key={id}
            type="button"
            title={title}
            onClick={() => runTool(id)}
            disabled={preview}
            className="min-w-8 rounded px-2 py-1 text-xs font-semibold text-neutral-600 hover:bg-white disabled:opacity-40"
          >
            {label}
          </button>
        ))}
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => insertImage(e.target.files)} />
        <div className="ml-auto flex rounded bg-neutral-200 p-0.5 text-xs">
          <button type="button" onClick={() => setPreview(false)} className={`rounded px-2 py-0.5 ${!preview ? "bg-white shadow-sm" : ""}`}>
            Yaz
          </button>
          <button type="button" onClick={() => setPreview(true)} className={`rounded px-2 py-0.5 ${preview ? "bg-white shadow-sm" : ""}`}>
            Önizle
          </button>
        </div>
      </div>
      {preview ? (
        <div className="min-h-[220px] bg-white p-4">
          <Markdown>{value || "_(boş)_"}</Markdown>
        </div>
      ) : (
        <textarea
          ref={ref}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={12}
          className="block w-full resize-y bg-white px-3 py-2 font-mono text-[13px] leading-relaxed text-neutral-900 outline-none"
        />
      )}
    </div>
  );
}

function Input({
  def,
  value,
  onChange,
}: {
  def: FieldDef;
  value: unknown;
  onChange: (v: unknown) => void;
}) {
  const type = def.type ?? "text";
  const str = (value ?? "") as string;
  switch (type) {
    case "textarea":
      return <textarea className={inputCls} rows={4} value={str} onChange={(e) => onChange(e.target.value)} />;
    case "markdown":
      return <MarkdownEditor value={str} onChange={onChange} />;
    case "image":
      return <MediaPicker value={str} onChange={onChange} />;
    case "gallery":
      return <GalleryPicker value={(value as string[]) ?? []} onChange={onChange} />;
    case "number":
      return (
        <input type="number" className={`${inputCls} max-w-40`} value={String(value ?? 0)} onChange={(e) => onChange(Number(e.target.value))} />
      );
    case "date":
      return <input type="date" className={`${inputCls} max-w-52`} value={str.slice(0, 10)} onChange={(e) => onChange(e.target.value)} />;
    case "checkbox":
      return (
        <label className="inline-flex cursor-pointer items-center gap-2 text-sm">
          <input type="checkbox" className="h-4 w-4 accent-[var(--brand)]" checked={Boolean(value)} onChange={(e) => onChange(e.target.checked)} />
          {def.help ?? "Evet"}
        </label>
      );
    default:
      return <input className={inputCls} value={str} required={def.required} onChange={(e) => onChange(e.target.value)} />;
  }
}

export function FieldsForm({
  fields,
  values,
  onChange,
}: {
  fields: FieldDef[];
  values: Values;
  onChange: (values: Values) => void;
}) {
  const [lang, setLang] = useState<"tr" | "en">("tr");
  const hasI18n = fields.some((f) => f.i18n);
  const set = (key: string, v: unknown) => {
    const next = { ...values, [key]: v };
    // keep slug in sync with its source until the user edits the slug by hand
    for (const f of fields) {
      if (f.type === "slug" && f.from && key === `${f.from}_tr`) {
        const prevAuto = slugify(String(values[`${f.from}_tr`] ?? ""));
        if (!values[f.name] || values[f.name] === prevAuto) next[f.name] = slugify(String(v));
      }
    }
    onChange(next);
  };

  return (
    <div className="space-y-5">
      {hasI18n && (
        <div className="flex items-center gap-3 rounded-md bg-neutral-50 px-3 py-2 text-sm">
          <span className="text-neutral-500">İçerik dili:</span>
          <div className="flex rounded-md bg-neutral-200 p-0.5">
            {(["tr", "en"] as const).map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => setLang(l)}
                className={`rounded px-3 py-1 text-xs font-semibold ${lang === l ? "bg-white text-[var(--brand)] shadow-sm" : "text-neutral-600"}`}
              >
                {l === "tr" ? "🇹🇷 Türkçe" : "🇬🇧 English"}
              </button>
            ))}
          </div>
          {lang === "en" && <span className="text-xs text-neutral-500">Boş bırakılan alanlarda Türkçe metin gösterilir.</span>}
        </div>
      )}
      {fields.map((def) => {
        const key = def.i18n ? `${def.name}_${lang}` : def.name;
        return (
          <div key={def.name}>
            <label className="mb-1.5 block text-sm font-medium text-neutral-700">
              {def.label}
              {def.i18n && <span className="ml-1.5 text-xs font-normal uppercase text-neutral-400">{lang}</span>}
              {def.required && <span className="text-red-600"> *</span>}
            </label>
            <Input def={def} value={values[key]} onChange={(v) => set(key, v)} />
            {def.help && def.type !== "checkbox" && <p className="mt-1 text-xs text-neutral-500">{def.help}</p>}
          </div>
        );
      })}
    </div>
  );
}
