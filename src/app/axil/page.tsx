"use client";

import NavMenu from "@/components/NavMenu";
import React from "react";
import Link from "next/link";
import { useLanguage, type TranslationKey } from "@/contexts/LanguageContext";
import { SettingsPanel } from "@/components/SettingsPanel";
import { SaintVenantFigure } from "@/components/DefinitionFigures";
import { Sub, SvgSub, eqLines, plain } from "@/components/Sub";

const INK = "#16232E";
const TENSION = "#0B8A8A";
const LOAD = "#C0392B";
const FAINT = "#C9D2D8";

function Kicker({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-2 font-mono text-xs font-medium uppercase tracking-wider text-teal-700 dark:text-teal-400">
      {children}
    </p>
  );
}

function Figure({ children, caption }: { children: React.ReactNode; caption?: React.ReactNode }) {
  return (
    <figure className="my-5 rounded-lg border border-stone-200 bg-white p-4 shadow-sm dark:border-stone-700 dark:bg-stone-100">
      {children}
      {caption && (
        <figcaption className="mt-2 text-center text-[13px] leading-snug text-stone-500 dark:text-stone-600">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}

function Eq({ children, boxed }: { children: string; boxed?: boolean }) {
  return (
    <div
      className={
        boxed
          ? "my-3 rounded-md border-2 border-teal-600 px-4 py-3 text-center font-mono text-lg dark:border-teal-400"
          : "my-3 rounded-md bg-stone-100 px-4 py-2 text-center font-mono text-[15px] dark:bg-stone-900"
      }
    >
      {eqLines(children).map((line, i) => (
        <div key={i}>
          <Sub>{line}</Sub>
        </div>
      ))}
    </div>
  );
}

function Para({ k }: { k: TranslationKey }) {
  const { t } = useLanguage();
  return (
    <p className="mb-4 max-w-[66ch] leading-relaxed text-stone-700 dark:text-stone-300">
      <Sub>{t(k)}</Sub>
    </p>
  );
}

function Section({ kicker, title, children }: { kicker: TranslationKey; title: TranslationKey; children: React.ReactNode }) {
  const { t } = useLanguage();
  return (
    <section className="mt-12 border-t border-stone-200 pt-8 dark:border-stone-800">
      <Kicker>{t(kicker)}</Kicker>
      <h3 className="mb-3 text-2xl font-semibold tracking-tight">
        <Sub>{t(title)}</Sub>
      </h3>
      {children}
    </section>
  );
}

// Bar under N with the (uniform) stress block drawn on a cut section.
function BarSVG() {
  const { t } = useLanguage();
  return (
    <svg viewBox="0 0 360 140" className="h-auto w-full" role="img" aria-label={plain(t("axl.fig"))}>
      <rect x="70" y="50" width="220" height="40" fill="#E7EEF2" stroke={INK} strokeWidth="2" />
      <line x1="180" y1="46" x2="180" y2="94" stroke={INK} strokeWidth="1.5" strokeDasharray="3 3" />
      <line x1="20" y1="70" x2="68" y2="70" stroke={LOAD} strokeWidth="3" />
      <polygon points="14,70 28,63 28,77" fill={LOAD} />
      <line x1="292" y1="70" x2="340" y2="70" stroke={LOAD} strokeWidth="3" />
      <polygon points="346,70 332,63 332,77" fill={LOAD} />
      <text x="40" y="58" fontSize="13" fontWeight="600" fill={LOAD}>N</text>
      <text x="316" y="58" fontSize="13" fontWeight="600" fill={LOAD}>N</text>
      {[58, 70, 82].map((y) => (
        <g key={y}>
          <line x1="150" y1={y} x2="180" y2={y} stroke={TENSION} strokeWidth="2" />
          <polygon points={`144,${y} 154,${y - 4} 154,${y + 4}`} fill={TENSION} />
        </g>
      ))}
      <text x="186" y="116" fontSize="13" fill={INK} textAnchor="middle">σ = N / A</text>
      <text x="180" y="30" fontSize="12" fill={INK} textAnchor="middle">l</text>
      <line x1="70" y1="36" x2="290" y2="36" stroke={INK} strokeWidth="1" />
    </svg>
  );
}

// An element of the bar: axial load keeps its right angles (γ = 0, so τ = 0); a sheared element (γ ≠ 0) would carry τ.
function ElementSVG() {
  const { t } = useLanguage();
  const head = (x: number, y: number, dir: 1 | -1) => `${x},${y} ${x - 7 * dir},${y - 3.5} ${x - 7 * dir},${y + 3.5}`;
  return (
    <svg viewBox="0 0 330 160" className="h-auto w-full" role="img" aria-label={plain(t("axl.fig2"))}>
      {/* axial: right angles stay right angles */}
      <rect x="40" y="50" width="50" height="50" fill="none" stroke={FAINT} strokeWidth="1.5" strokeDasharray="4 3" />
      <rect x="40" y="53" width="64" height="44" fill="#E7EEF2" stroke={INK} strokeWidth="2" />
      <polyline points="40,63 50,63 50,53" fill="none" stroke={INK} strokeWidth="1" />
      <line x1="104" y1="75" x2="132" y2="75" stroke={TENSION} strokeWidth="2.5" />
      <polygon points={head(138, 75, 1)} fill={TENSION} />
      <line x1="40" y1="75" x2="12" y2="75" stroke={TENSION} strokeWidth="2.5" />
      <polygon points={head(6, 75, -1)} fill={TENSION} />
      <text x="140" y="68" fontSize="12" fill={INK}><SvgSub>σ</SvgSub></text>
      <text x="72" y="120" fontSize="12" fill={INK} textAnchor="middle"><SvgSub>γ = 0</SvgSub></text>
      <text x="72" y="136" fontSize="12" fill={INK} textAnchor="middle"><SvgSub>τ = 0</SvgSub></text>
      {/* not the case: sheared element */}
      <rect x="200" y="50" width="50" height="50" fill="none" stroke={FAINT} strokeWidth="1.5" strokeDasharray="4 3" />
      <polygon points="200,100 250,100 266,50 216,50" fill="#F7E9EE" stroke={LOAD} strokeWidth="2" />
      <line x1="262" y1="50" x2="290" y2="50" stroke={LOAD} strokeWidth="2.5" />
      <polygon points={head(296, 50, 1)} fill={LOAD} />
      <line x1="204" y1="100" x2="176" y2="100" stroke={LOAD} strokeWidth="2.5" />
      <polygon points={head(170, 100, -1)} fill={LOAD} />
      <path d="M 200 82 A 18 18 0 0 1 206 83" fill="none" stroke={INK} strokeWidth="1.5" />
      <text x="298" y="46" fontSize="12" fill={INK}><SvgSub>τ</SvgSub></text>
      <text x="168" y="95" fontSize="12" fill={INK} textAnchor="end"><SvgSub>τ</SvgSub></text>
      <text x="236" y="120" fontSize="12" fill={LOAD} textAnchor="middle"><SvgSub>γ ≠ 0</SvgSub></text>
      <text x="236" y="136" fontSize="12" fill={LOAD} textAnchor="middle"><SvgSub>τ ≠ 0</SvgSub></text>
    </svg>
  );
}

// Cross-section seen face on: only σ (out of the page) acts; both shear components τ_xy and τ_xz are zero.
function SectionSVG() {
  const { t } = useLanguage();
  const cx = 110;
  const cy = 80;
  const ghost = (x2: number, y2: number, key: string) => (
    <line key={key} x1={cx} y1={cy} x2={x2} y2={y2} stroke={FAINT} strokeWidth="3" strokeDasharray="5 4" />
  );
  return (
    <svg viewBox="0 0 240 170" className="h-auto w-full" role="img" aria-label={plain(t("axl.fig3"))}>
      <rect x="50" y="25" width="120" height="110" fill="#E7EEF2" stroke={INK} strokeWidth="2" />
      {ghost(190, cy, "y")}
      {ghost(cx, 150, "z")}
      <circle cx={cx} cy={cy} r="9" fill="#fff" stroke={TENSION} strokeWidth="2.5" />
      <circle cx={cx} cy={cy} r="3" fill={TENSION} />
      <text x={cx + 14} y={cy - 12} fontSize="12" fill={INK}><SvgSub>σ_x</SvgSub></text>
      <text x="194" y={cy + 4} fontSize="12" fill={INK}><SvgSub>τ_xy = 0</SvgSub></text>
      <text x={cx + 8} y="160" fontSize="12" fill={INK}><SvgSub>τ_xz = 0</SvgSub></text>
      <text x="228" y="22" fontSize="12" fontStyle="italic" fill={INK} textAnchor="end">y →</text>
      <text x="40" y="22" fontSize="12" fontStyle="italic" fill={INK} textAnchor="end">z ↓</text>
    </svg>
  );
}

export default function AxilPage() {
  const { t } = useLanguage();
  return (
    <div className="flex h-screen flex-col overflow-hidden bg-stone-50 text-stone-900 dark:bg-stone-950 dark:text-stone-100">
      <header className="z-10 flex items-center gap-3 border-b border-stone-200 bg-white px-4 py-2 shadow-sm dark:border-stone-700 dark:bg-stone-900">
        <Link
          href="/"
          className="text-sm text-stone-500 transition-colors hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-100"
        >
          {t("learn.back")}
        </Link>
        <span className="text-stone-300 dark:text-stone-600">|</span>
        <h1 className="text-base font-semibold tracking-tight text-stone-800 dark:text-stone-100">{t("axl.title")}</h1>
        <NavMenu />
        <div className="flex-1" />
        <SettingsPanel />
      </header>

      <main className="flex-1 overflow-auto">
        <article className="mx-auto max-w-3xl px-6 py-12">
          <Kicker>N · σ · Δl</Kicker>
          <h2 className="mb-4 text-4xl font-bold leading-tight tracking-tight text-balance">{t("axl.title")}</h2>
          <p className="mb-6 max-w-[60ch] text-lg leading-relaxed text-stone-600 dark:text-stone-300">
            <Sub>{t("axl.lead")}</Sub>
          </p>

          <Section kicker="axl.s1.kicker" title="axl.s1.title">
            <Para k="axl.s1.p1" />
            <Para k="axl.s1.p2" />
            <Eq>{t("axl.s1.e1")}</Eq>
            <Eq>{t("axl.s1.e2")}</Eq>
            <Eq>{t("axl.s1.e3")}</Eq>
            <Eq>{t("axl.s1.e4")}</Eq>
          </Section>

          <Section kicker="axl.s2.kicker" title="axl.s2.title">
            <ol className="mb-4 max-w-[66ch] list-decimal space-y-2 pl-6 text-stone-700 dark:text-stone-300">
              <li><Sub>{t("axl.s2.h1")}</Sub></li>
              <li>{t("axl.s2.h2")}</li>
            </ol>
            <div className="mx-auto max-w-md">
              <Figure caption={<Sub>{t("def.f.stvenant")}</Sub>}>
                <SaintVenantFigure label={plain(t("def.f.stvenant"))} />
              </Figure>
            </div>
            <Para k="axl.s2.p1" />
            <div className="mx-auto max-w-md">
              <Figure caption={<Sub>{t("axl.fig2")}</Sub>}>
                <ElementSVG />
              </Figure>
            </div>
            <div className="mx-auto max-w-xs">
              <Figure caption={<Sub>{t("axl.fig3")}</Sub>}>
                <SectionSVG />
              </Figure>
            </div>
            <Para k="axl.s2.p2" />
            <div className="mx-auto max-w-md">
              <Figure caption={<Sub>{t("axl.fig")}</Sub>}>
                <BarSVG />
              </Figure>
            </div>
          </Section>

          <Section kicker="axl.s3.kicker" title="axl.s3.title">
            <div className="mb-4 grid gap-3 sm:grid-cols-2">
              <div className="rounded-lg border border-stone-200 bg-white p-4 dark:border-stone-700 dark:bg-stone-900">
                <p className="mb-1 font-semibold">{t("axl.s3.sizing")}</p>
                <p className="font-mono text-[15px]"><Sub>A_nec ≥ |N| / σ_adm</Sub></p>
              </div>
              <div className="rounded-lg border border-stone-200 bg-white p-4 dark:border-stone-700 dark:bg-stone-900">
                <p className="mb-1 font-semibold">{t("axl.s3.ver")}</p>
                <p className="font-mono text-[15px]"><Sub>|σ| = |N| / A ≤ σ_adm</Sub></p>
              </div>
            </div>
            <Para k="axl.s3.sign" />
            <Para k="axl.s3.p1" />
            <Eq boxed>{"Δ{l} = {N}·{l} / ({A}·{E})"}</Eq>
            <Para k="axl.s3.p2" />
            <ul className="mb-4 max-w-[66ch] list-disc space-y-1.5 pl-5 text-stone-700 dark:text-stone-300">
              {(["l1", "l2", "l3", "l4", "l5"] as const).map((k) => (
                <li key={k}>{t(`axl.s3.${k}` as TranslationKey)}</li>
              ))}
            </ul>
          </Section>

          <Section kicker="axl.s4.kicker" title="axl.s4.title">
            <div className="mb-4 overflow-x-auto">
              <table className="w-full max-w-md text-left text-[15px]">
                <thead>
                  <tr className="border-b border-stone-300 text-stone-500 dark:border-stone-700">
                    <th className="py-2 pr-3 font-medium">{t("axl.s4.th.mat")}</th>
                    <th className="py-2 pr-3 font-medium">{t("axl.s4.th.yield")}</th>
                    <th className="py-2 font-medium"><Sub>{t("axl.s4.th.adm")}</Sub></th>
                  </tr>
                </thead>
                <tbody className="font-mono">
                  <tr className="border-b border-stone-200 dark:border-stone-800">
                    <td className="py-2 pr-3">St 37</td>
                    <td className="py-2 pr-3">3 700 kg/cm²</td>
                    <td className="py-2">1 200 kg/cm²</td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-3">St 42</td>
                    <td className="py-2 pr-3">4 200 kg/cm²</td>
                    <td className="py-2">1 400 kg/cm²</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <Para k="axl.s4.p1" />
          </Section>

          <Section kicker="axl.s5.kicker" title="axl.s5.title">
            <Para k="axl.s5.p1" />
            <Eq boxed>{"σ = {N} / {A} + γ·{l} ≤ σ_adm"}</Eq>
            <Eq boxed>{"{A}_nec ≥ N / (σ_adm − γ·{l})"}</Eq>
            <Para k="axl.s5.p2" />
          </Section>

          <Section kicker="axl.s6.kicker" title="axl.s6.title">
            <div className="mb-4 grid gap-3">
              {(["e1", "e2", "e3"] as const).map((e) => (
                <div
                  key={e}
                  data-testid={`axl-${e}`}
                  className="rounded-lg border border-stone-200 bg-white p-4 dark:border-stone-700 dark:bg-stone-900"
                >
                  <p className="mb-1 font-semibold">{t(`axl.s6.${e}.title` as TranslationKey)}</p>
                  <p className="mb-2 text-[15px] text-stone-600 dark:text-stone-400">
                    <Sub>{t(`axl.s6.${e}.p` as TranslationKey)}</Sub>
                  </p>
                  <p className="whitespace-pre-line font-mono text-[14px] leading-relaxed">
                    <Sub>{t(`axl.s6.${e}.r` as TranslationKey)}</Sub>
                  </p>
                </div>
              ))}
            </div>
          </Section>

          <footer className="mt-12 border-t border-stone-200 pt-6 text-sm leading-relaxed text-stone-500 dark:border-stone-800 dark:text-stone-400">
            <p className="max-w-[64ch]">{t("axl.footer")}</p>
          </footer>
        </article>
      </main>
    </div>
  );
}
