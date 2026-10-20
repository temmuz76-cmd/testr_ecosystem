"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

type NavItem = { href: string; label: string };

export default function Header({ logo, nav }: { logo: string; nav: NavItem[] }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
  }, [open]);

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  return (
    <header className="sticky top-0 z-40 bg-[var(--panel)] shadow-[0_1px_0_rgba(0,0,0,0.04)]">
      <div className="container-site relative flex h-[76px] items-center justify-center lg:h-[100px] lg:justify-between">
        <button
          type="button"
          aria-label="Menü"
          onClick={() => setOpen(true)}
          className="absolute left-4 p-2 text-[var(--ink)] lg:hidden"
        >
          <svg width="20" height="16" viewBox="0 0 20 16" fill="currentColor" aria-hidden>
            <rect width="20" height="2" rx="1" />
            <rect y="7" width="20" height="2" rx="1" />
            <rect y="14" width="20" height="2" rx="1" />
          </svg>
        </button>

        <Link href="/" aria-label="TESTR">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={logo} alt="TESTR" className="h-[42px] w-auto lg:h-[54px]" />
        </Link>

        <nav className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {nav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`block px-[14px] py-2 font-[family-name:var(--font-montserrat)] text-[12px] uppercase tracking-wide transition-colors hover:text-[var(--brand)] ${
                    isActive(item.href) ? "text-[var(--brand)]" : "text-[var(--ink)]"
                  }`}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      {/* mobile side panel */}
      <div
        className={`fixed inset-0 z-50 bg-black/50 transition-opacity lg:hidden ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={() => setOpen(false)}
      />
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-[290px] max-w-[85vw] overflow-y-auto bg-white p-6 shadow-xl transition-transform lg:hidden ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="mb-8 flex items-center justify-between">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={logo} alt="TESTR" className="h-10 w-auto" />
          <button type="button" aria-label="Kapat" onClick={() => setOpen(false)} className="p-2 text-2xl leading-none text-[var(--ink)]">
            ×
          </button>
        </div>
        <ul className="divide-y divide-neutral-100">
          {nav.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                onClick={() => setOpen(false)}
                className={`block py-3 font-[family-name:var(--font-montserrat)] text-[13px] uppercase ${
                  isActive(item.href) ? "text-[var(--brand)]" : "text-[var(--ink)]"
                }`}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </aside>
    </header>
  );
}
