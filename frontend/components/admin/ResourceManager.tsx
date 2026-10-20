"use client";

import { useMemo, useState } from "react";
import { adminApi } from "@/lib/adminApi";
import { FieldsForm, type FieldDef, type Values } from "./fields";
import { MediaThumb } from "./MediaPicker";
import { Button, Card, Modal, PageTitle, Toast } from "./ui";
import { useFetch } from "./useFetch";

export interface Column {
  label: string;
  render: (row: Values) => React.ReactNode;
  className?: string;
}

export default function ResourceManager({
  title,
  resource,
  fields,
  columns,
  defaults = {},
  singular = "Kayıt",
  viewUrl,
  sortable = true,
  embedded = false,
}: {
  title: string;
  resource: string;
  fields: FieldDef[];
  columns: Column[];
  defaults?: Values;
  singular?: string;
  viewUrl?: (row: Values) => string;
  sortable?: boolean;
  embedded?: boolean;
}) {
  const { data, setData: setRows, reload: load, loading } = useFetch<Values[]>(`/${resource}`);
  const rows = useMemo(() => data ?? [], [data]);
  const [editing, setEditing] = useState<Values | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState<{ message: string; kind: "ok" | "error" } | null>(null);
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLocaleLowerCase("tr-TR");
    if (!q) return rows;
    return rows.filter((r) => JSON.stringify(r).toLocaleLowerCase("tr-TR").includes(q));
  }, [rows, query]);

  async function save() {
    if (!editing) return;
    for (const f of fields) {
      const key = f.i18n ? `${f.name}_tr` : f.name;
      if (f.required && !String(editing[key] ?? "").trim()) {
        setError(`"${f.label}" alanı zorunlu`);
        return;
      }
    }
    setSaving(true);
    setError("");
    try {
      if (editing.id) await adminApi.put(`/${resource}/${editing.id}`, editing);
      else await adminApi.post(`/${resource}`, editing);
      setEditing(null);
      setToast({ message: "Kaydedildi", kind: "ok" });
      load();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  async function remove(row: Values) {
    if (!confirm(`Bu ${singular.toLocaleLowerCase("tr-TR")} kalıcı olarak silinsin mi?`)) return;
    try {
      await adminApi.del(`/${resource}/${row.id}`);
      setToast({ message: "Silindi", kind: "ok" });
      load();
    } catch (err) {
      setToast({ message: (err as Error).message, kind: "error" });
    }
  }

  async function togglePublish(row: Values) {
    await adminApi.put(`/${resource}/${row.id}`, { ...row, is_published: !row.is_published });
    load();
  }

  async function move(index: number, dir: -1 | 1) {
    const j = index + dir;
    if (j < 0 || j >= rows.length) return;
    const next = [...rows];
    [next[index], next[j]] = [next[j], next[index]];
    setRows(next);
    await Promise.all(
      next.map((r, i) => (r.sort_order === i ? null : adminApi.put(`/${resource}/${r.id}`, { ...r, sort_order: i }))),
    );
    load();
  }

  const newItem = () => {
    setError("");
    setEditing({ is_published: true, sort_order: rows.length, ...defaults });
  };

  const hasPublish = rows.some((r) => "is_published" in r) || "is_published" in defaults;
  const canSort = sortable && !query;

  return (
    <div className={embedded ? "mb-10" : ""}>
      {embedded ? (
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-semibold text-neutral-900">{title}</h2>
          <Button onClick={newItem}>+ Yeni {singular.toLocaleLowerCase("tr-TR")}</Button>
        </div>
      ) : (
        <PageTitle title={title}>
          <Button onClick={newItem}>+ Yeni {singular.toLocaleLowerCase("tr-TR")}</Button>
        </PageTitle>
      )}

      <Card>
        {rows.length > 6 && (
          <div className="border-b border-neutral-100 p-3">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ara…"
              className="w-full max-w-xs rounded-md border border-neutral-200 px-3 py-1.5 text-sm outline-none focus:border-[var(--brand)]"
            />
          </div>
        )}
        {loading ? (
          <p className="p-6 text-sm text-neutral-500">Yükleniyor…</p>
        ) : filtered.length === 0 ? (
          <p className="p-6 text-sm text-neutral-500">Henüz kayıt yok.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-neutral-100 text-left text-xs uppercase tracking-wide text-neutral-500">
                <tr>
                  {canSort && <th className="w-14 px-3 py-2.5" />}
                  {columns.map((c) => (
                    <th key={c.label} className={`px-3 py-2.5 font-medium ${c.className ?? ""}`}>
                      {c.label}
                    </th>
                  ))}
                  {hasPublish && <th className="px-3 py-2.5 font-medium">Durum</th>}
                  <th className="px-3 py-2.5" />
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {filtered.map((row, i) => (
                  <tr key={String(row.id)} className="hover:bg-neutral-50">
                    {canSort && (
                      <td className="px-3 py-2 text-neutral-400">
                        <div className="flex flex-col leading-none">
                          <button type="button" onClick={() => move(i, -1)} disabled={i === 0} className="hover:text-neutral-800 disabled:opacity-30" aria-label="Yukarı">
                            ▲
                          </button>
                          <button type="button" onClick={() => move(i, 1)} disabled={i === rows.length - 1} className="hover:text-neutral-800 disabled:opacity-30" aria-label="Aşağı">
                            ▼
                          </button>
                        </div>
                      </td>
                    )}
                    {columns.map((c) => (
                      <td key={c.label} className={`px-3 py-2 ${c.className ?? ""}`}>
                        {c.render(row)}
                      </td>
                    ))}
                    {hasPublish && (
                      <td className="px-3 py-2">
                        <button
                          type="button"
                          onClick={() => togglePublish(row)}
                          className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                            row.is_published ? "bg-emerald-50 text-emerald-700" : "bg-neutral-100 text-neutral-500"
                          }`}
                        >
                          {row.is_published ? "Yayında" : "Taslak"}
                        </button>
                      </td>
                    )}
                    <td className="whitespace-nowrap px-3 py-2 text-right">
                      {viewUrl && (
                        <a href={viewUrl(row)} target="_blank" className="mr-3 text-xs text-neutral-500 hover:text-neutral-900">
                          Gör ↗
                        </a>
                      )}
                      <button
                        type="button"
                        onClick={() => {
                          setError("");
                          setEditing({ ...row });
                        }}
                        className="mr-3 text-xs font-medium text-[var(--brand)] hover:underline"
                      >
                        Düzenle
                      </button>
                      <button type="button" onClick={() => remove(row)} className="text-xs text-red-600 hover:underline">
                        Sil
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {editing && (
        <Modal
          title={editing.id ? `${singular} düzenle` : `Yeni ${singular.toLocaleLowerCase("tr-TR")}`}
          onClose={() => setEditing(null)}
          wide
          footer={
            <>
              {error && <span className="mr-auto self-center text-sm text-red-600">{error}</span>}
              <Button variant="secondary" onClick={() => setEditing(null)}>
                Vazgeç
              </Button>
              <Button onClick={save} disabled={saving}>
                {saving ? "Kaydediliyor…" : "Kaydet"}
              </Button>
            </>
          }
        >
          <FieldsForm fields={fields} values={editing} onChange={setEditing} />
        </Modal>
      )}
      {toast && <Toast {...toast} onDone={() => setToast(null)} />}
    </div>
  );
}

export const thumbColumn: Column = {
  label: "",
  className: "w-16",
  render: (r) => <MediaThumb url={String(r.image ?? r.icon ?? "")} className="h-11 w-11 rounded" />,
};
