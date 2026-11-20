"use client";

import React from "react";
import Link from "next/link";
import { useLanguage, type TranslationKey } from "@/contexts/LanguageContext";
import NavMenu from "@/components/NavMenu";
import { Footer } from "@/components/Footer";
import { NeutralAxisExample, SectionCutSimulator } from "@/components/SectionCutGuide";

function Kicker({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-2 font-mono text-xs font-medium uppercase tracking-wider text-teal-700 dark:text-teal-400">{children}</p>
  );
}

const P = "max-w-[66ch] leading-relaxed text-stone-700 dark:text-stone-300";
const SECTION = "mt-12 border-t border-stone-200 pt-8 dark:border-stone-800";
const EQ =
  "my-3 overflow-x-auto whitespace-nowrap rounded bg-stone-100 px-3 py-2 font-mono text-sm dark:bg-stone-800";

function Bullets({ keys }: { keys: TranslationKey[] }) {
  const { t } = useLanguage();
  return (
    <ul className="my-3 max-w-[66ch] list-disc space-y-2 pl-5 text-[15px] leading-relaxed text-stone-700 dark:text-stone-300">
      {keys.map((k) => (
        <li key={k}>{t(k)}</li>
      ))}
    </ul>
  );
}

export default function CorteDeSeccionPage() {
  const { t } = useLanguage();
  const full: TranslationKey[] = [
    "cut.full.1", "cut.full.2", "cut.full.3", "cut.full.4", "cut.full.5",
    "cut.full.6", "cut.full.7", "cut.full.8", "cut.full.9", "cut.full.10",
  ];
  return (
    <div className="flex min-h-screen flex-col bg-stone-50 text-stone-900 dark:bg-stone-950 dark:text-stone-100">
      <header className="z-10 flex items-center gap-3 border-b border-stone-200 bg-white px-4 py-2 shadow-sm dark:border-stone-700 dark:bg-stone-900">
        <Link href="/" className="text-sm text-stone-500 transition-colors hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-100">
          {t("quiz.back")}
        </Link>
        <span className="text-stone-300 dark:text-stone-600">|</span>
        <h1 className="text-base font-semibold tracking-tight text-stone-800 dark:text-stone-100">{t("cut.link")}</h1>
        <div className="ml-auto">
          <NavMenu />
        </div>
      </header>

      <main className="flex-1">
        <article className="mx-auto max-w-5xl px-6 py-12">
          <Kicker>{t("cut.kicker")}</Kicker>
          <h2 className="mb-4 max-w-3xl text-4xl font-bold leading-tight tracking-tight text-balance">{t("cut.title")}</h2>
          <p className="mb-6 max-w-[62ch] text-lg leading-relaxed text-stone-600 dark:text-stone-300">{t("cut.lead")}</p>

          <section className={SECTION}>
            <Kicker>{t("cut.s1.kicker")}</Kicker>
            <h3 className="mb-3 text-2xl font-semibold tracking-tight">{t("cut.s1.title")}</h3>
            <p className={P}>{t("cut.s1.p1")}</p>
            <Bullets keys={["cut.s1.b1", "cut.s1.b2"]} />
            <p className={P}>{t("cut.s1.p2")}</p>
          </section>

          <section className={SECTION}>
            <Kicker>{t("cut.s2.kicker")}</Kicker>
            <h3 className="mb-3 text-2xl font-semibold tracking-tight">{t("cut.s2.title")}</h3>
            <p className={P}>{t("cut.s2.p1")}</p>
            <Bullets keys={["cut.s2.n", "cut.s2.m"]} />
            <p className={P}>{t("cut.s2.example")}</p>
            <div className={EQ}>σ(x, y) = N/A + Mx·y/Ix + My·x/Iy</div>
            <p className={P}>{t("cut.s2.units")}</p>
          </section>

          <section className={SECTION}>
            <Kicker>{t("cut.f.kicker")}</Kicker>
            <h3 className="mb-3 text-2xl font-semibold tracking-tight">{t("cut.f.title")}</h3>
            <p className={P}>{t("cut.f.p1")}</p>
            <Bullets keys={["cut.f.b1", "cut.f.b2", "cut.f.b3"]} />
            <p className={P}>{t("cut.f.p2")}</p>
          </section>

          <section className={SECTION}>
            <Kicker>{t("cut.s3.kicker")}</Kicker>
            <h3 className="mb-3 text-2xl font-semibold tracking-tight">{t("cut.s3.title")}</h3>
            <p className="mb-5 max-w-[66ch] leading-relaxed text-stone-700 dark:text-stone-300">{t("cut.s3.p1")}</p>
            <SectionCutSimulator />
            <p className="mt-5 max-w-[66ch] leading-relaxed text-stone-700 dark:text-stone-300">{t("cut.s3.p2")}</p>
          </section>

          <section className={SECTION}>
            <Kicker>{t("cut.s4.kicker")}</Kicker>
            <h3 className="mb-3 text-2xl font-semibold tracking-tight">{t("cut.s4.title")}</h3>
            <p className={P}>{t("cut.s4.p1")}</p>
            <div className={EQ}>x₀ = −N·Iy / (A·My) &nbsp;→ (x₀; 0)</div>
            <div className={EQ}>y₀ = −N·Ix / (A·Mx) &nbsp;→ (0; y₀)</div>
            <p className={`${P} mb-3`}>{t("cut.s4.p2")}</p>
            <NeutralAxisExample />
            <Bullets keys={["cut.s4.b1", "cut.s4.b2", "cut.s4.b3"]} />
          </section>

          <section className={SECTION}>
            <Kicker>{t("cut.s5.kicker")}</Kicker>
            <h3 className="mb-3 text-2xl font-semibold tracking-tight">{t("cut.s5.title")}</h3>
            <p className={P}>{t("cut.s5.p1")}</p>
            <Bullets keys={["cut.s5.b1", "cut.s5.b2", "cut.s5.b3", "cut.s5.b4"]} />
            <p className={P}>{t("cut.s5.p2")}</p>
          </section>

          <section className={SECTION}>
            <Kicker>{t("cut.s6.kicker")}</Kicker>
            <h3 className="mb-3 text-2xl font-semibold tracking-tight">{t("cut.s6.title")}</h3>
            <ol className="my-3 max-w-[70ch] list-decimal space-y-3 pl-6 text-[15px] leading-relaxed text-stone-700 marker:font-mono marker:font-semibold marker:text-teal-700 dark:text-stone-300 dark:marker:text-teal-400">
              {full.map((k) => (
                <li key={k}>{t(k)}</li>
              ))}
            </ol>
            <p className={P}>{t("cut.s6.note")}</p>
          </section>

          <section className="mt-12 rounded-lg border border-[#C0392B] p-5">
            <h3 className="mb-3 text-xl font-semibold tracking-tight">{t("cut.err.title")}</h3>
            <Bullets keys={["cut.err.1", "cut.err.2", "cut.err.3", "cut.err.4"]} />
            <p className={P}>{t("cut.err.app")}</p>
          </section>
        </article>
      </main>
      <Footer />
    </div>
  );
}
