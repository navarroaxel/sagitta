"use client";

import React, { useEffect, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { useLanguage, type TranslationKey } from "@/contexts/LanguageContext";
import { Sub, plain } from "@/components/Sub";
import { GuidePage } from "@/components/guide/GuideBits";
import { DEFINITION_GROUPS } from "@/lib/definitions";
import { DefinitionFigure, hasFigure } from "@/components/DefinitionFigure";

const readHash = () => decodeURIComponent(window.location.hash.slice(1));
const subscribeHash = (cb: () => void) => {
  window.addEventListener("hashchange", cb);
  return () => window.removeEventListener("hashchange", cb);
};

const ALL = DEFINITION_GROUPS.flatMap((g) => g.terms.map((t) => `${g.id}.${t}`));

export default function DefinicionesPage() {
  const { t } = useLanguage();
  const k = (s: string) => t(s as TranslationKey);
  // /definiciones#group.term opens that term and scrolls to it (the links of /resumen); read from the URL without a state copy
  const hash = useSyncExternalStore(subscribeHash, readHash, () => "");
  const fromUrl = ALL.includes(hash) ? hash : "";
  const [opened, setOpened] = useState<Set<string>>(new Set());
  const [closed, setClosed] = useState<Set<string>>(new Set());
  const isOpen = (id: string) => !closed.has(id) && (opened.has(id) || id === fromUrl);
  useEffect(() => {
    if (fromUrl) requestAnimationFrame(() => document.getElementById(`def-item-${fromUrl}`)?.scrollIntoView?.());
  }, [fromUrl]);
  const toggle = (id: string) => {
    const nextOpen = !isOpen(id);
    setOpened((prev) => {
      const next = new Set(prev);
      if (nextOpen) next.add(id);
      else next.delete(id);
      return next;
    });
    setClosed((prev) => {
      const next = new Set(prev);
      if (nextOpen) next.delete(id);
      else next.add(id);
      return next;
    });
  };
  const openAll = () => {
    setOpened(new Set(ALL));
    setClosed(new Set());
  };
  const closeAll = () => {
    setOpened(new Set());
    setClosed(new Set(ALL));
  };
  const btn =
    "rounded-md border border-teal-600 px-3 py-1.5 text-sm font-medium text-teal-700 hover:bg-teal-50 print:hidden dark:border-teal-400 dark:text-teal-300 dark:hover:bg-stone-800";
  return (
    <GuidePage title="def.title" kicker="Σ" lead="def.lead" footer="def.footer">
      <div className="mb-2 flex gap-2">
        <button type="button" className={btn} onClick={openAll}>
          {t("def.expand")}
        </button>
        <button type="button" className={btn} onClick={closeAll}>
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
              const expanded = isOpen(id);
              return (
                <li key={id} id={`def-item-${id}`} data-testid={`def-${id}`} className="break-inside-avoid scroll-mt-4">
                  <h4>
                    <button
                      type="button"
                      aria-expanded={expanded}
                      aria-controls={`def-panel-${id}`}
                      onClick={() => toggle(id)}
                      className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left font-medium hover:bg-stone-50 dark:hover:bg-stone-800"
                    >
                      <span>
                        <Sub>{k(`def.t.${term}`)}</Sub>
                      </span>
                      <span aria-hidden className={`text-stone-400 transition-transform print:hidden ${expanded ? "rotate-90" : ""}`}>
                        ›
                      </span>
                    </button>
                  </h4>
                  <div
                    id={`def-panel-${id}`}
                    role="region"
                    hidden={!expanded}
                    className="px-4 pb-4 leading-relaxed text-stone-700 print:!block dark:text-stone-300"
                  >
                    <Sub>{k(`def.d.${term}`)}</Sub>
                    {hasFigure(id) && (
                      <figure className="mt-3 max-w-md rounded-lg border border-stone-200 bg-white p-3 dark:border-stone-700 dark:bg-stone-100">
                        <DefinitionFigure id={id} label={plain(k(`def.f.${term}`))} />
                        <figcaption className="mt-2 text-center text-[13px] leading-snug text-stone-500 dark:text-stone-600">
                          <Sub>{k(`def.f.${term}`)}</Sub>
                        </figcaption>
                      </figure>
                    )}
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
