"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useLanguage, type TranslationKey } from "@/contexts/LanguageContext";
import NavMenu from "@/components/NavMenu";
import { Footer } from "@/components/Footer";
import { Sub } from "@/components/Sub";
import { PERFIL_LINES, PERFIL_NAME, REACC_LINES, REACC_NAME } from "@/lib/casioPrograms";

const P = "max-w-[66ch] leading-relaxed text-stone-700 dark:text-stone-300";
const SECTION = "mt-12 border-t border-stone-200 pt-8 dark:border-stone-800";

function Program({ name, lines, id }: { name: string; lines: string[]; id: string }) {
  const { t } = useLanguage();
  const [copied, setCopied] = useState(false);
  // the plain lines, without the line numbers shown on the page, ready for the calculator's program editor
  const copy = async () => {
    const text = lines.join("\n");
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const ta = document.createElement("textarea"); // older browsers / no permission: select and copy
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand("copy");
      } finally {
        ta.remove();
      }
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <figure className="my-4 max-w-3xl overflow-hidden rounded-lg border border-stone-200 bg-white shadow-sm dark:border-stone-700 dark:bg-stone-900">
      <figcaption className="flex items-center justify-between border-b border-stone-200 px-3 py-1.5 font-mono text-xs uppercase tracking-wider text-teal-700 dark:border-stone-700 dark:text-teal-400">
        <span>
          PRGM › {name} · {lines.length}
        </span>
        <button
          type="button"
          onClick={copy}
          data-testid={`${id}-copy`}
          aria-label={t("casio.copy")}
          title={t("casio.copy")}
          className="flex items-center gap-1 rounded px-1.5 py-0.5 normal-case tracking-normal text-stone-600 transition-colors hover:bg-stone-100 hover:text-stone-900 dark:text-stone-300 dark:hover:bg-stone-800 dark:hover:text-stone-50"
        >
          {copied ? (
            <svg viewBox="0 0 24 24" className="h-4 w-4 text-teal-600" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect x="9" y="9" width="11" height="11" rx="2" />
              <path d="M5 15V6a2 2 0 0 1 2-2h9" />
            </svg>
          )}
          <span role="status">{copied ? t("casio.copied") : t("casio.copy")}</span>
        </button>
      </figcaption>
      <pre data-testid={id} className="overflow-x-auto px-3 py-2 font-mono text-[13px] leading-relaxed text-stone-800 dark:text-stone-100">
        {lines.map((l, i) => `${String(i + 1).padStart(2, " ")}  ${l}`).join("\n")}
      </pre>
    </figure>
  );
}

export default function CasioReaccionesPage() {
  const { t } = useLanguage();
  const notes: TranslationKey[] = ["casio.n.1", "casio.n.2", "casio.n.3", "casio.n.4"];
  return (
    <div className="flex min-h-screen flex-col bg-stone-50 text-stone-900 dark:bg-stone-950 dark:text-stone-100">
      <header className="z-10 flex items-center gap-3 border-b border-stone-200 bg-white px-4 py-2 shadow-sm dark:border-stone-700 dark:bg-stone-900">
        <Link href="/" className="text-sm text-stone-500 transition-colors hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-100">
          {t("quiz.back")}
        </Link>
        <span className="text-stone-300 dark:text-stone-600">|</span>
        <h1 className="text-base font-semibold tracking-tight text-stone-800 dark:text-stone-100">{t("casio.link")}</h1>
        <div className="ml-auto">
          <NavMenu />
        </div>
      </header>
      <main className="flex-1">
        <article className="mx-auto max-w-5xl px-6 py-12">
          <p className="mb-2 font-mono text-xs font-medium uppercase tracking-wider text-teal-700 dark:text-teal-400">{t("casio.kicker")}</p>
          <h2 className="mb-4 max-w-3xl text-4xl font-bold leading-tight tracking-tight text-balance">{t("casio.title")}</h2>
          <p className="mb-6 max-w-[62ch] text-lg leading-relaxed text-stone-600 dark:text-stone-300">{t("casio.lead")}</p>

          <section className={SECTION}>
            <h3 className="mb-3 text-2xl font-semibold tracking-tight">{t("casio.r.title")}</h3>
            <p className={P}>{t("casio.r.p1")}</p>
            <div className="my-3 max-w-3xl overflow-x-auto whitespace-pre rounded bg-stone-100 px-3 py-2 font-mono text-sm dark:bg-stone-800">
              {"M_x = y·F_z − z·F_y + M_x    M_y = z·F_x − x·F_z + M_y    M_z = x·F_y − y·F_x + M_z"}
            </div>
            <Program name={REACC_NAME} lines={REACC_LINES} id="casio-reacc" />
            <p className={P}>{t("casio.r.q")}</p>
            <p className={`${P} mt-3`}>{t("casio.r.ex")}</p>
            <p className={`${P} mt-3`}>{t("casio.r.base")}</p>
          </section>

          <section className={SECTION}>
            <h3 className="mb-3 text-2xl font-semibold tracking-tight">{t("casio.p.title")}</h3>
            <p className={P}><Sub>{t("casio.p.p1")}</Sub></p>
            <Program name={PERFIL_NAME} lines={PERFIL_LINES} id="casio-perfil" />
            <p className={P}><Sub>{t("casio.p.q")}</Sub></p>
            <p className={`${P} mt-3`}><Sub>{t("casio.p.ex")}</Sub></p>
            <p className={`${P} mt-3`}>{t("casio.p.how")}</p>
          </section>

          <section className="mt-12 rounded-lg border border-[#B7791F] p-5">
            <h3 className="mb-3 text-xl font-semibold tracking-tight">{t("casio.notes.title")}</h3>
            <ul className="max-w-[66ch] list-disc space-y-2 pl-5 text-[15px] leading-relaxed text-stone-700 dark:text-stone-300">
              {notes.map((k) => (
                <li key={k}>{t(k)}</li>
              ))}
            </ul>
          </section>
        </article>
      </main>
      <Footer />
    </div>
  );
}
