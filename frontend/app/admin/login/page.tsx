"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { adminApi } from "@/lib/adminApi";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.currentTarget));
    setLoading(true);
    setError("");
    try {
      await adminApi.post("/login", data);
      router.replace("/admin");
      router.refresh();
    } catch (err) {
      setError((err as Error).message);
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-100 px-4">
      <form onSubmit={onSubmit} className="w-full max-w-sm rounded-xl bg-white p-8 shadow-sm ring-1 ring-black/5">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/uploads/seed/logo.png" alt="TESTR" className="mx-auto mb-2 h-12 w-auto" />
        <p className="mb-6 text-center text-sm text-neutral-500">Yönetim Paneli</p>
        <label className="mb-1 block text-sm font-medium text-neutral-700">E-posta</label>
        <input
          name="email"
          type="email"
          required
          autoComplete="username"
          className="mb-4 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm text-neutral-900 outline-none focus:border-[var(--brand)]"
        />
        <label className="mb-1 block text-sm font-medium text-neutral-700">Şifre</label>
        <input
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className="mb-6 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm text-neutral-900 outline-none focus:border-[var(--brand)]"
        />
        {error && <p className="mb-4 rounded bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-md bg-[var(--brand)] py-2.5 text-sm font-semibold text-white hover:bg-[#9b240a] disabled:opacity-60"
        >
          {loading ? "Giriş yapılıyor…" : "Giriş yap"}
        </button>
      </form>
    </div>
  );
}
