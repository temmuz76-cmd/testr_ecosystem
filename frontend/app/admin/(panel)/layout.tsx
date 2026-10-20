"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { useFetch } from "@/components/admin/useFetch";
import { adminApi } from "@/lib/adminApi";

const NAV = [
  { href: "/admin", label: "Gösterge Paneli", icon: "▦" },
  { href: "/admin/hizmetler", label: "Hizmetler", icon: "⚙" },
  { href: "/admin/blog", label: "Blog Yazıları", icon: "✎" },
  { href: "/admin/referanslar", label: "Projeler & Referanslar", icon: "★" },
  { href: "/admin/avantajlar", label: "Avantajlar", icon: "◆" },
  { href: "/admin/sayfalar", label: "Sayfalar", icon: "▤" },
  { href: "/admin/mesajlar", label: "Mesajlar", icon: "✉" },
  { href: "/admin/medya", label: "Medya", icon: "▣" },
  { href: "/admin/ayarlar", label: "Site Ayarları", icon: "☰" },
];

export default function PanelLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: me } = useFetch<{ email: string; name: string }>("/me");
  // Refetch the unread badge on every navigation (e.g. after reading messages).
  const { data: stats } = useFetch<{ unread: number }>(`/stats?_=${encodeURIComponent(pathname)}`);
  const unread = stats?.unread ?? 0;
  const [menuOpen, setMenuOpen] = useState(false);

  async function logout() {
    await adminApi.post("/logout").catch(() => {});
    router.replace("/admin/login");
    router.refresh();
  }

  const active = (href: string) => (href === "/admin" ? pathname === "/admin" : pathname.startsWith(href));

  return (
    <div className="min-h-screen bg-neutral-100 text-neutral-800 [font-family:system-ui,-apple-system,sans-serif]">
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-[#1f1f1f] text-neutral-300 transition-transform lg:translate-x-0 ${
          menuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-16 items-center gap-3 border-b border-white/10 px-5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/uploads/seed/logo-footer.png" alt="TESTR" className="h-8 w-auto" />
          <span className="text-xs uppercase tracking-wider text-neutral-400">Admin</span>
        </div>
        <nav className="flex-1 overflow-y-auto p-3">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMenuOpen(false)}
              className={`mb-0.5 flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors ${
                active(item.href) ? "bg-[var(--brand)] text-white" : "hover:bg-white/5 hover:text-white"
              }`}
            >
              <span className="w-4 text-center opacity-80">{item.icon}</span>
              <span className="flex-1">{item.label}</span>
              {item.href === "/admin/mesajlar" && unread > 0 && (
                <span className="rounded-full bg-white px-1.5 text-[11px] font-bold text-[var(--brand)]">{unread}</span>
              )}
            </Link>
          ))}
        </nav>
        <div className="border-t border-white/10 p-4 text-xs">
          <div className="mb-2 truncate text-neutral-400">{me?.email}</div>
          <div className="flex gap-3">
            <a href="/" target="_blank" className="hover:text-white">
              Siteyi aç ↗
            </a>
            <button type="button" onClick={logout} className="hover:text-white">
              Çıkış
            </button>
          </div>
        </div>
      </aside>
      {menuOpen && <div className="fixed inset-0 z-30 bg-black/40 lg:hidden" onClick={() => setMenuOpen(false)} />}

      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b border-neutral-200 bg-white px-4 lg:hidden">
          <button type="button" onClick={() => setMenuOpen(true)} className="p-1 text-xl" aria-label="Menü">
            ☰
          </button>
          <span className="text-sm font-semibold">TESTR Admin</span>
        </header>
        <main className="mx-auto max-w-6xl p-4 sm:p-8">{children}</main>
      </div>
    </div>
  );
}
