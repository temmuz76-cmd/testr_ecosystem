"use client";

import { useEffect } from "react";

export const inputCls =
  "w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 outline-none focus:border-[var(--brand)] focus:ring-2 focus:ring-[var(--brand)]/15";

export function PageTitle({ title, children }: { title: string; children?: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
      <h1 className="text-xl font-semibold text-neutral-900">{title}</h1>
      <div className="flex gap-2">{children}</div>
    </div>
  );
}

export function Button({
  variant = "primary",
  className = "",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" | "danger" }) {
  const styles = {
    primary: "bg-[var(--brand)] text-white hover:bg-[#9b240a]",
    secondary: "bg-white text-neutral-700 ring-1 ring-neutral-300 hover:bg-neutral-50",
    danger: "bg-white text-red-700 ring-1 ring-red-200 hover:bg-red-50",
  }[variant];
  return (
    <button
      type="button"
      {...props}
      className={`inline-flex items-center gap-1.5 rounded-md px-3.5 py-2 text-sm font-medium transition-colors disabled:opacity-50 ${styles} ${className}`}
    />
  );
}

export function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`rounded-lg bg-white shadow-sm ring-1 ring-black/5 ${className}`}>{children}</div>;
}

export function Modal({
  title,
  onClose,
  children,
  footer,
  wide = false,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
  wide?: boolean;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 p-2 sm:p-6">
      <div className={`my-4 w-full rounded-lg bg-white shadow-xl ${wide ? "max-w-5xl" : "max-w-2xl"}`}>
        <div className="flex items-center justify-between border-b border-neutral-200 px-5 py-3">
          <h2 className="font-semibold text-neutral-900">{title}</h2>
          <button type="button" onClick={onClose} className="text-2xl leading-none text-neutral-400 hover:text-neutral-700">
            ×
          </button>
        </div>
        <div className="max-h-[calc(100vh-11rem)] overflow-y-auto p-5">{children}</div>
        {footer && <div className="flex justify-end gap-2 border-t border-neutral-200 px-5 py-3">{footer}</div>}
      </div>
    </div>
  );
}

export function Toast({ message, kind, onDone }: { message: string; kind: "ok" | "error"; onDone: () => void }) {
  useEffect(() => {
    const id = setTimeout(onDone, 3500);
    return () => clearTimeout(id);
  }, [onDone]);
  return (
    <div
      className={`fixed bottom-5 right-5 z-[60] rounded-md px-4 py-3 text-sm text-white shadow-lg ${
        kind === "ok" ? "bg-emerald-600" : "bg-red-600"
      }`}
    >
      {message}
    </div>
  );
}
