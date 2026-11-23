"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useLanguage, type TranslationKey } from "@/contexts/LanguageContext";
import { Sub } from "@/components/Sub";
import { GuidePage } from "@/components/guide/GuideBits";
import { DEFINITION_GROUPS } from "@/lib/definitions";

const ALL = DEFINITION_GROUPS.flatMap((g) => g.terms.map((t) => `${g.id}.${t}`));

export default function DefinicionesPage() {
  const { t } = useLanguage();
  const k = (s: string) => t(s as TranslationKey);
  const [open, setOpen] = useState<Set<string>>(new Set());
  const toggle = (id: string) =>
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  const btn =
    "rounded-md border border-teal-600 px-3 py-1.5 text-sm font-medium text-teal-700 hover:bg-teal-50 print:hidden dark:border-teal-400 dark:text-teal-300 dark:hover:bg-stone-800";
  return (
    <GuidePage title="def.title" kicker="Σ" lead="def.lead" footer="def.footer">
      <div className="mb-2 flex gap-2">
        <button type="button" className={btn} onClick={() => setOpen(new Set(ALL))}>
          {t("def.expand")}
        </button>
        <button type="button" className={btn} onClick={() => setOpen(new Set())}>
          {t("def.collapse")}
        </button>
      </div>

      {DEFINITION_GROUPS.map((g) => (
        <section key={g.id} data-testid={`def-group-${g.id}`} className="mt-10 border-t border-stone-200 pt-6 dark:border-stone-800">
          <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
            <h3 className="text-2xl font-semibold tracking-tight">{k(`def.g.${g.id}`)}</h3>
            <Link href={g.href} className="text-sm text-teal-700 hover:underline print:hidden dark:text-teal-300">
              {t("def.go")}
            </Link>
          </div>
          <ul className="divide-y divide-stone-200 rounded-lg border border-stone-200 bg-white dark:divide-stone-700 dark:border-stone-700 dark:bg-stone-900">
            {g.terms.map((term) => {
              const id = `${g.id}.${term}`;
              const isOpen = open.has(id);
              return (
                <li key={id} data-testid={`def-${id}`} className="break-inside-avoid">
                  <h4>
                    <button
                      type="button"
                      aria-expanded={isOpen}
                      aria-controls={`def-panel-${id}`}
                      onClick={() => toggle(id)}
                      className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left font-medium hover:bg-stone-50 dark:hover:bg-stone-800"
                    >
                      <span>
                        <Sub>{k(`def.t.${term}`)}</Sub>
                      </span>
                      <span aria-hidden className={`text-stone-400 transition-transform print:hidden ${isOpen ? "rotate-90" : ""}`}>
                        ›
                      </span>
                    </button>
                  </h4>
                  <div
                    id={`def-panel-${id}`}
                    role="region"
                    hidden={!isOpen}
                    className="px-4 pb-4 leading-relaxed text-stone-700 print:!block dark:text-stone-300"
                  >
                    <Sub>{k(`def.d.${term}`)}</Sub>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </GuidePage>
  );
}
