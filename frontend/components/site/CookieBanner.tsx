"use client";

import { useSyncExternalStore } from "react";
import type { Dict } from "@/lib/i18n";

const KEY = "testr_cookie_consent";
const EVENT = "testr-consent";

function read(): string | null {
  try {
    return localStorage.getItem(KEY);
  } catch {
    return null;
  }
}

function subscribe(cb: () => void) {
  window.addEventListener(EVENT, cb);
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener(EVENT, cb);
    window.removeEventListener("storage", cb);
  };
}

function decide(value: "accepted" | "rejected") {
  try {
    localStorage.setItem(KEY, value);
  } catch {}
  window.dispatchEvent(new Event(EVENT));
}

export default function CookieBanner({ text }: { text: Dict["cookie"] }) {
  // Server snapshot reports "decided" so the banner never flashes during SSR.
  const consent = useSyncExternalStore(subscribe, read, () => "ssr");
  if (consent) return null;

  return (
    <div className="fixed bottom-4 left-4 z-50 w-[calc(100%-2rem)] max-w-[300px] rounded-md bg-white p-4 text-[12px] leading-relaxed text-[var(--ink)] shadow-2xl ring-1 ring-black/5">
      <p className="mb-1 font-bold">{text.title}</p>
      <p className="mb-3 text-[#555]">{text.text}</p>
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => decide("rejected")}
          className="rounded border border-[var(--brand)] px-2 py-1.5 text-[11px] uppercase text-[var(--brand)]"
        >
          {text.reject}
        </button>
        <button
          type="button"
          onClick={() => decide("accepted")}
          className="rounded bg-[var(--brand)] px-2 py-1.5 text-[11px] uppercase text-white"
        >
          {text.accept}
        </button>
      </div>
    </div>
  );
}
