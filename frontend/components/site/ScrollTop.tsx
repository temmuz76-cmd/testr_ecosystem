"use client";

import { useEffect, useState } from "react";

export default function ScrollTop() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 400);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <button
      type="button"
      aria-label="Yukarı"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className={`fixed bottom-[68px] right-4 z-30 flex h-10 w-10 items-center justify-center rounded bg-[var(--brand)] text-white shadow transition-opacity ${
        show ? "opacity-100" : "pointer-events-none opacity-0"
      }`}
    >
      ▲
    </button>
  );
}
