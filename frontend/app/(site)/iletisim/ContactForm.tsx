"use client";

import { useState } from "react";
import type { Dict } from "@/lib/i18n";

const input =
  "w-full border border-neutral-200 bg-[var(--panel)] px-4 py-3 text-[14px] text-[var(--ink)] outline-none focus:border-[var(--brand)]";

export default function ContactForm({ text }: { text: Dict["form"] }) {
  const [status, setStatus] = useState<"idle" | "sending" | "ok" | "error">("idle");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form));
    setStatus("sending");
    const res = await fetch("/api/public/contact", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ ...data, consent: data.consent === "on" }),
    }).catch(() => null);
    if (res?.ok) {
      form.reset();
      setStatus("ok");
    } else {
      setStatus("error");
    }
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-4 sm:grid-cols-2">
      <input name="name" required minLength={2} placeholder={text.name} className={input} />
      <input name="email" type="email" required placeholder={text.email} className={input} />
      <input name="phone" placeholder={text.phone} className={input} />
      <input name="subject" placeholder={text.subject} className={input} />
      <textarea name="message" required minLength={5} rows={7} placeholder={text.message} className={`${input} sm:col-span-2`} />
      {/* honeypot */}
      <input name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
      <label className="flex items-start gap-2 text-[13px] sm:col-span-2">
        <input type="checkbox" name="consent" required className="mt-1 accent-[var(--brand)]" />
        {text.consent}
      </label>
      <div className="sm:col-span-2">
        <button type="submit" disabled={status === "sending"} className="btn-brand disabled:opacity-60">
          {status === "sending" ? text.sending : text.send}
        </button>
      </div>
      {status === "ok" && <p className="text-[14px] text-green-700 sm:col-span-2">{text.ok}</p>}
      {status === "error" && <p className="text-[14px] text-red-700 sm:col-span-2">{text.error}</p>}
    </form>
  );
}
