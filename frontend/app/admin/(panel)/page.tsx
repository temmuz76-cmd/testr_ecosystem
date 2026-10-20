"use client";

import Link from "next/link";
import { Card, PageTitle } from "@/components/admin/ui";
import { useFetch } from "@/components/admin/useFetch";

interface Stats {
  services: number;
  posts: number;
  projects: number;
  messages: number;
  unread: number;
  views: number;
  latest_messages: { id: number; name: string; email: string; subject: string; message: string; is_read: boolean; created_at: string }[];
  top_posts: { id: number; title: string; slug: string; views: number }[];
}

export default function Dashboard() {
  const { data: stats } = useFetch<Stats>("/stats");

  const tiles = stats
    ? [
        { label: "Hizmet", value: stats.services, href: "/admin/hizmetler" },
        { label: "Blog yazısı", value: stats.posts, href: "/admin/blog" },
        { label: "Proje / deneyim", value: stats.projects, href: "/admin/referanslar" },
        { label: "Okunmamış mesaj", value: stats.unread, href: "/admin/mesajlar", accent: stats.unread > 0 },
        { label: "Toplam blog okunma", value: stats.views, href: "/admin/blog" },
      ]
    : [];

  return (
    <>
      <PageTitle title="Gösterge Paneli" />
      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-5">
        {tiles.map((t) => (
          <Link key={t.label} href={t.href}>
            <Card className="p-4 transition-shadow hover:shadow-md">
              <div className={`text-2xl font-semibold tabular-nums ${t.accent ? "text-[var(--brand)]" : "text-neutral-900"}`}>
                {t.value.toLocaleString("tr-TR")}
              </div>
              <div className="mt-1 text-xs text-neutral-500">{t.label}</div>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <div className="flex items-center justify-between border-b border-neutral-100 px-4 py-3">
            <h2 className="text-sm font-semibold">Son mesajlar</h2>
            <Link href="/admin/mesajlar" className="text-xs text-[var(--brand)]">
              Tümü →
            </Link>
          </div>
          {stats?.latest_messages.length ? (
            <ul className="divide-y divide-neutral-100">
              {stats.latest_messages.map((m) => (
                <li key={m.id} className="px-4 py-3 text-sm">
                  <div className="flex items-center gap-2">
                    {!m.is_read && <span className="h-2 w-2 rounded-full bg-[var(--brand)]" />}
                    <span className="font-medium">{m.name}</span>
                    <span className="ml-auto text-xs text-neutral-400">
                      {new Date(m.created_at).toLocaleDateString("tr-TR")}
                    </span>
                  </div>
                  <p className="mt-0.5 truncate text-neutral-500">{m.subject || m.message}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="p-4 text-sm text-neutral-500">Henüz mesaj yok.</p>
          )}
        </Card>

        <Card>
          <div className="border-b border-neutral-100 px-4 py-3">
            <h2 className="text-sm font-semibold">En çok okunan yazılar</h2>
          </div>
          <ul className="divide-y divide-neutral-100">
            {stats?.top_posts.map((p) => (
              <li key={p.id} className="flex items-center gap-3 px-4 py-3 text-sm">
                <a href={`/blog/${p.slug}`} target="_blank" className="flex-1 truncate hover:text-[var(--brand)]">
                  {p.title}
                </a>
                <span className="tabular-nums text-neutral-500">{p.views}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </>
  );
}
