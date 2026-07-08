"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useLanguage, type TranslationKey } from "@/contexts/LanguageContext";

// Guide/nav links, grouped into a single dropdown so the header stays compact
// (especially on mobile).
const LINKS: { href: string; labelKey: TranslationKey }[] = [
  { href: "/learn", labelKey: "learn.link" },
  { href: "/esfuerzos-caracteristicos", labelKey: "esf.link" },
  { href: "/quiz", labelKey: "quiz.link" },
];

export default function NavMenu() {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex items-center gap-1 rounded border border-stone-200 bg-stone-100 px-2.5 py-1.5 text-sm text-stone-700 transition-colors hover:bg-stone-200 dark:border-stone-600 dark:bg-stone-800 dark:text-stone-200 dark:hover:bg-stone-700"
      >
        {t("nav.guides")}
        <svg
          viewBox="0 0 24 24"
          width="14"
          height="14"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      {open && (
        <div
          role="menu"
          className="absolute top-full left-0 z-20 mt-1 min-w-[180px] overflow-hidden rounded border border-stone-200 bg-white shadow-lg dark:border-stone-700 dark:bg-stone-800"
        >
          {LINKS.map(({ href, labelKey }) => (
            <Link
              key={href}
              href={href}
              role="menuitem"
              onClick={() => setOpen(false)}
              className="block px-4 py-2 text-sm text-stone-700 transition-colors hover:bg-stone-100 dark:text-stone-200 dark:hover:bg-stone-700"
            >
              {t(labelKey)}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
