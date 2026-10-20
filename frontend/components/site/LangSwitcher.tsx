"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Lang } from "@/lib/types";

const LANGS: { code: Lang; label: string; flag: string }[] = [
  { code: "tr", label: "TR", flag: "🇹🇷" },
  { code: "en", label: "EN", flag: "🇬🇧" },
];

function setLangCookie(code: Lang) {
  document.cookie = `lang=${code}; path=/; max-age=31536000; samesite=lax`;
}

export default function LangSwitcher({ lang }: { lang: Lang }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const current = LANGS.find((l) => l.code === lang) ?? LANGS[0];

  const choose = (code: Lang) => {
    setLangCookie(code);
    setOpen(false);
    router.refresh();
  };

  return (
    <div className="fixed bottom-4 right-4 z-40 text-[13px]">
      {open && (
        <ul className="mb-1 overflow-hidden rounded-md bg-white shadow-lg ring-1 ring-black/5">
          {LANGS.filter((l) => l.code !== lang).map((l) => (
            <li key={l.code}>
              <button
                type="button"
                onClick={() => choose(l.code)}
                className="flex w-full items-center gap-2 px-3 py-2 text-[var(--ink)] hover:bg-neutral-100"
              >
                <span className="text-lg leading-none">{l.flag}</span> {l.label}
              </button>
            </li>
          ))}
        </ul>
      )}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-md bg-white px-3 py-2 text-[var(--ink)] shadow-lg ring-1 ring-black/5"
        aria-label="Dil seçimi"
      >
        <span className="text-lg leading-none">{current.flag}</span>
        <span className="font-bold">{current.label}</span>
        <span className={`text-[10px] transition-transform ${open ? "" : "rotate-180"}`}>▲</span>
      </button>
    </div>
  );
}
