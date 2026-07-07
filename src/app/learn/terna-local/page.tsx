"use client";

import React from "react";
import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";
import { SettingsPanel } from "@/components/SettingsPanel";

// Semantic colors — mirror the simulator / example-SVG palette.
const INK = "#16232E";
const FAINT = "#C9D2D8";
const TENSION = "#0B8A8A";
const LOAD = "#C0392B";
const REACT = "#1A73E8";
const MOMENT = "#7A2A9A";
const SHEAR = "#3A6B8C";

// ─── Reusable bits ────────────────────────────────────────────────────────────

function Kicker({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-2 font-mono text-xs font-medium uppercase tracking-wider text-teal-700 dark:text-teal-400">
      {children}
    </p>
  );
}

function Figure({
  children,
  caption,
}: {
  children: React.ReactNode;
  caption?: React.ReactNode;
}) {
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

// ─── Diagrams ───────────────────────────────────────────────────────────────

function TriadSVG() {
  return (
    <svg viewBox="0 0 320 200" className="h-auto w-full" role="img" aria-label="Local triad">
      <line x1="90" y1="155" x2="270" y2="80" stroke={INK} strokeWidth="3" strokeLinecap="round" />
      <circle cx="90" cy="155" r="4.5" fill={INK} />
      <circle cx="270" cy="80" r="4.5" fill={INK} />
      <text x="80" y="172" fontSize="14" fontWeight="600" fill={INK} textAnchor="end">i</text>
      <text x="278" y="74" fontSize="14" fontWeight="600" fill={INK}>j</text>
      <line x1="90" y1="155" x2="167" y2="123" stroke={MOMENT} strokeWidth="2.5" />
      <polygon points="176,119 161,116 165,127" fill={MOMENT} />
      <text x="150" y="140" fontSize="14" fontWeight="600" fontFamily="monospace" fill={MOMENT}>x′</text>
      <line x1="90" y1="155" x2="60" y2="83" stroke={MOMENT} strokeWidth="2.5" />
      <polygon points="56,74 68,84 55,87" fill={MOMENT} />
      <text x="40" y="74" fontSize="14" fontWeight="600" fontFamily="monospace" fill={MOMENT}>y′</text>
      <circle cx="90" cy="155" r="9" fill="none" stroke={MOMENT} strokeWidth="2" />
      <circle cx="90" cy="155" r="2.4" fill={MOMENT} />
      <text x="106" y="180" fontSize="13" fontWeight="600" fontFamily="monospace" fill={MOMENT}>z′ ↺ +M</text>
    </svg>
  );
}

// ─── Page ───────────────────────────────────────────────────────────────────

export default function TernaLocalPage() {
  const { t } = useLanguage();

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-stone-50 text-stone-900 dark:bg-stone-950 dark:text-stone-100">
      {/* Header */}
      <header className="z-10 flex items-center gap-3 border-b border-stone-200 bg-white px-4 py-2 shadow-sm dark:border-stone-700 dark:bg-stone-900">
        <Link
          href="/"
          className="text-sm text-stone-500 transition-colors hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-100"
        >
          {t("learn.back")}
        </Link>
        <span className="text-stone-300 dark:text-stone-600">|</span>
        <Link
          href="/learn"
          className="text-sm text-stone-500 transition-colors hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-100"
        >
          {t("learn.title")}
        </Link>
        <span className="text-stone-300 dark:text-stone-600">|</span>
        <h1 className="text-base font-semibold tracking-tight text-stone-800 dark:text-stone-100">
          {t("terna.title")}
        </h1>
        <div className="flex-1" />
        <SettingsPanel />
      </header>

      {/* Scrollable article */}
      <main className="flex-1 overflow-auto">
        <article className="mx-auto max-w-3xl px-6 py-12">
          {/* Hero */}
          <Kicker>{t("terna.s1.kicker").split("—")[0].trim()} · N · Q · M</Kicker>
          <h2 className="mb-4 text-4xl font-bold leading-tight tracking-tight text-balance">
            {t("terna.title")}
          </h2>
          <p className="mb-6 max-w-[60ch] text-lg leading-relaxed text-stone-600 dark:text-stone-300">
            {t("terna.lead")}
          </p>
          <div className="mx-auto max-w-sm">
            <Figure>
              <TriadSVG />
            </Figure>
          </div>

          {/* 01 — what it is */}
          <section className="mt-12 border-t border-stone-200 pt-8 dark:border-stone-800">
            <Kicker>{t("terna.s1.kicker")}</Kicker>
            <h3 className="mb-3 text-2xl font-semibold tracking-tight">{t("terna.s1.title")}</h3>
            <p className="mb-4 max-w-[66ch] leading-relaxed text-stone-700 dark:text-stone-300">
              {t("terna.s1.p1")}
            </p>
            <ul className="mb-4 space-y-2 text-[15px] text-stone-600 dark:text-stone-400">
              <li>
                <span className="font-mono font-semibold text-[#7A2A9A]">x′</span> — {t("terna.s1.x")}
              </li>
              <li>
                <span className="font-mono font-semibold text-[#7A2A9A]">y′</span> — {t("terna.s1.y")}
              </li>
              <li>
                <span className="font-mono font-semibold text-[#7A2A9A]">z′</span> — {t("terna.s1.z")}
              </li>
            </ul>
            <p className="max-w-[66ch] leading-relaxed text-stone-700 dark:text-stone-300">
              {t("terna.s1.p2")}
            </p>
          </section>

          {/* 02 — three components */}
          <section className="mt-12 border-t border-stone-200 pt-8 dark:border-stone-800">
            <Kicker>{t("terna.s2.kicker")}</Kicker>
            <h3 className="mb-3 text-2xl font-semibold tracking-tight">{t("terna.s2.title")}</h3>
            <p className="mb-4 max-w-[66ch] leading-relaxed text-stone-700 dark:text-stone-300">
              {t("terna.s2.p1")}
            </p>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-[15px]">
                <thead>
                  <tr className="border-b-2 border-stone-800 text-left font-mono text-xs uppercase tracking-wide text-stone-500 dark:border-stone-300 dark:text-stone-400">
                    <th className="py-2 pr-3 font-medium">{t("terna.s2.th1")}</th>
                    <th className="py-2 pr-3 font-medium">{t("terna.s2.th2")}</th>
                    <th className="py-2 font-medium">{t("terna.s2.th3")}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-stone-200 dark:border-stone-800">
                    <td className="py-2.5 pr-3"><span className="font-mono font-semibold text-[#0B8A8A]">N</span> {t("terna.s2.n")}</td>
                    <td className="py-2.5 pr-3">x′</td>
                    <td className="py-2.5">{t("terna.s2.n.pos")}</td>
                  </tr>
                  <tr className="border-b border-stone-200 dark:border-stone-800">
                    <td className="py-2.5 pr-3"><span className="font-mono font-semibold text-[#3A6B8C]">Q</span> {t("terna.s2.q")}</td>
                    <td className="py-2.5 pr-3">y′</td>
                    <td className="py-2.5">{t("terna.s2.q.pos")}</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 pr-3"><span className="font-mono font-semibold text-[#7A2A9A]">M</span> {t("terna.s2.m")}</td>
                    <td className="py-2.5 pr-3">z′</td>
                    <td className="py-2.5">{t("terna.s2.m.pos")}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="mt-4 max-w-[66ch] leading-relaxed text-stone-700 dark:text-stone-300">
              {t("terna.s2.p2")}
            </p>
          </section>

          {/* 03 — signs */}
          <section className="mt-12 border-t border-stone-200 pt-8 dark:border-stone-800">
            <Kicker>{t("terna.s3.kicker")}</Kicker>
            <h3 className="mb-3 text-2xl font-semibold tracking-tight">{t("terna.s3.title")}</h3>
            <p className="mb-2 max-w-[66ch] leading-relaxed text-stone-700 dark:text-stone-300">
              {t("terna.s3.p1")}
            </p>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <Figure caption={t("terna.s3.cap.n")}>
                <svg viewBox="0 0 150 110" className="h-auto w-full" role="img" aria-label="N>0">
                  <rect x="40" y="42" width="70" height="26" fill="rgba(11,138,138,.12)" stroke={TENSION} strokeWidth="1.5" />
                  <line x1="40" y1="55" x2="12" y2="55" stroke={TENSION} strokeWidth="2.5" />
                  <polygon points="6,55 18,50 18,60" fill={TENSION} />
                  <line x1="110" y1="55" x2="138" y2="55" stroke={TENSION} strokeWidth="2.5" />
                  <polygon points="144,55 132,50 132,60" fill={TENSION} />
                  <text x="75" y="24" fontSize="13" fontWeight="700" fill={TENSION} textAnchor="middle">N &gt; 0</text>
                  <text x="75" y="92" fontSize="12" fill="#5C6B77" textAnchor="middle">{t("terna.s3.n")}</text>
                </svg>
              </Figure>
              <Figure caption={t("terna.s3.cap.q")}>
                <svg viewBox="0 0 150 110" className="h-auto w-full" role="img" aria-label="Q>0">
                  <rect x="45" y="34" width="60" height="42" fill="rgba(58,107,140,.12)" stroke={SHEAR} strokeWidth="1.5" />
                  <line x1="105" y1="30" x2="105" y2="80" stroke={SHEAR} strokeWidth="2.5" />
                  <polygon points="105,84 100,72 110,72" fill={SHEAR} />
                  <line x1="45" y1="80" x2="45" y2="30" stroke={SHEAR} strokeWidth="2.5" />
                  <polygon points="45,26 40,38 50,38" fill={SHEAR} />
                  <text x="75" y="20" fontSize="13" fontWeight="700" fill={SHEAR} textAnchor="middle">Q &gt; 0</text>
                  <text x="75" y="101" fontSize="11" fill="#5C6B77" textAnchor="middle">{t("terna.s3.q")}</text>
                </svg>
              </Figure>
              <Figure caption={t("terna.s3.cap.m")}>
                <svg viewBox="0 0 150 110" className="h-auto w-full" role="img" aria-label="M>0">
                  <path d="M20,50 Q75,84 130,50" fill="none" stroke={MOMENT} strokeWidth="2.5" />
                  <path d="M20,42 Q75,76 130,42" fill="none" stroke={MOMENT} strokeWidth="2.5" opacity=".35" />
                  <path d="M28,52 A40,40 0 0 1 46,45" fill="none" stroke={MOMENT} strokeWidth="2" />
                  <polygon points="46,45 37,44 42,52" fill={MOMENT} />
                  <path d="M122,52 A40,40 0 0 0 104,45" fill="none" stroke={MOMENT} strokeWidth="2" />
                  <polygon points="104,45 113,44 108,52" fill={MOMENT} />
                  <text x="75" y="24" fontSize="13" fontWeight="700" fill={MOMENT} textAnchor="middle">M &gt; 0</text>
                  <text x="75" y="101" fontSize="11" fill="#5C6B77" textAnchor="middle">{t("terna.s3.m")}</text>
                </svg>
              </Figure>
            </div>
            <div className="mt-4 rounded-lg border border-stone-200 border-l-4 border-l-teal-700 bg-white px-5 py-4 dark:border-stone-700 dark:border-l-teal-500 dark:bg-stone-900">
              <p className="text-[15px] leading-relaxed text-stone-700 dark:text-stone-300">
                {t("terna.s3.callout")}
              </p>
            </div>
          </section>

          {/* 04 — procedure */}
          <section className="mt-12 border-t border-stone-200 pt-8 dark:border-stone-800">
            <Kicker>{t("terna.s4.kicker")}</Kicker>
            <h3 className="mb-5 text-2xl font-semibold tracking-tight">{t("terna.s4.title")}</h3>
            <ol className="space-y-5">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <li key={n} className="flex gap-4">
                  <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border border-stone-300 bg-white font-mono text-sm font-semibold text-teal-700 dark:border-stone-600 dark:bg-stone-900 dark:text-teal-400">
                    {String(n).padStart(2, "0")}
                  </span>
                  <div>
                    <h4 className="font-semibold">{t(`terna.s4.step${n}.t` as never)}</h4>
                    <p className="text-[15px] leading-relaxed text-stone-600 dark:text-stone-400">
                      {t(`terna.s4.step${n}.d` as never)}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </section>

          {/* 05 — worked example */}
          <section className="mt-12 border-t border-stone-200 pt-8 dark:border-stone-800">
            <Kicker>{t("terna.s5.kicker")}</Kicker>
            <h3 className="mb-3 text-2xl font-semibold tracking-tight">{t("terna.s5.title")}</h3>
            <p className="mb-4 max-w-[66ch] leading-relaxed text-stone-700 dark:text-stone-300">
              {t("terna.s5.p1")}
            </p>

            <Figure caption={t("terna.s5.reac.cap")}>
              <div className="grid grid-cols-1 items-center gap-2 sm:grid-cols-2">
                <svg viewBox="0 0 300 250" className="h-auto w-full" role="img" aria-label="L-frame geometry">
                  <line x1="56" y1="205" x2="56" y2="60" stroke={INK} strokeWidth="4" strokeLinecap="round" />
                  <line x1="56" y1="60" x2="248" y2="60" stroke={INK} strokeWidth="4" strokeLinecap="round" />
                  <line x1="30" y1="205" x2="82" y2="205" stroke={INK} strokeWidth="2.5" />
                  <g stroke={INK} strokeWidth="1.6">
                    <line x1="34" y1="205" x2="26" y2="214" /><line x1="44" y1="205" x2="36" y2="214" />
                    <line x1="54" y1="205" x2="46" y2="214" /><line x1="64" y1="205" x2="56" y2="214" />
                    <line x1="74" y1="205" x2="66" y2="214" />
                  </g>
                  <circle cx="56" cy="205" r="4.5" fill={INK} />
                  <circle cx="56" cy="60" r="4.5" fill={INK} />
                  <circle cx="248" cy="60" r="4.5" fill={INK} />
                  <text x="44" y="222" fontSize="14" fontWeight="600" fill={INK}>A</text>
                  <text x="42" y="56" fontSize="14" fontWeight="600" fill={INK}>B</text>
                  <text x="254" y="56" fontSize="14" fontWeight="600" fill={INK}>C</text>
                  <line x1="248" y1="18" x2="248" y2="55" stroke={LOAD} strokeWidth="2.5" />
                  <polygon points="248,60 242,48 254,48" fill={LOAD} />
                  <text x="256" y="34" fontSize="13" fontWeight="700" fill={LOAD}>P = 10</text>
                  <line x1="24" y1="248" x2="24" y2="214" stroke={REACT} strokeWidth="2.5" />
                  <polygon points="24,205 18,217 30,217" fill={REACT} />
                  <text x="8" y="240" fontSize="12.5" fontWeight="700" fill={REACT}>Vₐ=10</text>
                  <path d="M86,183 A22,22 0 1 1 78,225" fill="none" stroke={REACT} strokeWidth="2.2" />
                  <polygon points="78,225 74,213 86,216" fill={REACT} />
                  <text x="92" y="200" fontSize="12.5" fontWeight="700" fill={REACT}>Mₐ=40</text>
                </svg>
                <div className="px-2 font-mono text-[13.5px] leading-loose text-stone-700 dark:text-stone-600">
                  ΣFₓ=0 → Hₐ = 0<br />
                  ΣF_y=0 → Vₐ = 10 kN ↑<br />
                  ΣMₐ=0 → Mₐ = 10·4<br />
                  <span className="pl-[6.2em]">= 40 kN·m ↺</span>
                </div>
              </div>
            </Figure>

            <h4 className="mb-2 mt-8 text-lg font-semibold">{t("terna.s5.cut.t")}</h4>
            <p className="mb-3 max-w-[66ch] leading-relaxed text-stone-700 dark:text-stone-300">
              {t("terna.s5.cut.p")}
            </p>

            <Figure caption={t("terna.s5.cut.cap")}>
              <svg viewBox="0 0 340 170" className="h-auto w-full" role="img" aria-label="Cut free body">
                <line x1="40" y1="70" x2="300" y2="70" stroke={FAINT} strokeWidth="4" strokeLinecap="round" />
                <line x1="190" y1="70" x2="300" y2="70" stroke={INK} strokeWidth="4" strokeLinecap="round" />
                <circle cx="40" cy="70" r="4" fill={FAINT} /><circle cx="300" cy="70" r="4.5" fill={INK} />
                <text x="34" y="60" fontSize="13" fontWeight="600" fill="#8B98A2">B</text>
                <text x="304" y="60" fontSize="13" fontWeight="600" fill={INK}>C</text>
                <line x1="190" y1="44" x2="190" y2="96" stroke="#5C6B77" strokeWidth="1.5" strokeDasharray="4 3" />
                <text x="190" y="112" fontSize="12" fontFamily="monospace" fill="#5C6B77" textAnchor="middle">s</text>
                <line x1="300" y1="30" x2="300" y2="65" stroke={LOAD} strokeWidth="2.5" />
                <polygon points="300,70 294,58 306,58" fill={LOAD} />
                <text x="308" y="44" fontSize="12.5" fontWeight="700" fill={LOAD}>P=10</text>
                <line x1="190" y1="70" x2="190" y2="40" stroke={SHEAR} strokeWidth="2.5" />
                <polygon points="190,34 185,46 195,46" fill={SHEAR} />
                <text x="168" y="40" fontSize="12.5" fontWeight="700" fill={SHEAR} textAnchor="end">Q</text>
                <path d="M210,58 A20,20 0 0 1 210,82" fill="none" stroke={MOMENT} strokeWidth="2" />
                <polygon points="210,82 205,71 215,73" fill={MOMENT} />
                <text x="224" y="74" fontSize="12.5" fontWeight="700" fill={MOMENT}>M</text>
                <line x1="190" y1="132" x2="300" y2="132" stroke="#9aa0a6" strokeWidth="1" />
                <line x1="190" y1="128" x2="190" y2="136" stroke="#9aa0a6" /><line x1="300" y1="128" x2="300" y2="136" stroke="#9aa0a6" />
                <text x="245" y="148" fontSize="12" fontFamily="monospace" fill="#5C6B77" textAnchor="middle">4 − s</text>
              </svg>
              <div className="mt-2 text-left font-mono text-[13px] leading-loose text-stone-700 dark:text-stone-600">
                ΣFₓ=0 → <span style={{ color: TENSION }}>N = 0</span> &nbsp;·&nbsp;
                ΣF_y=0 → <span style={{ color: SHEAR }}>Q = +10 kN</span><br />
                ΣM=0 → <span style={{ color: MOMENT }}>M = −10·(4−s)</span> &nbsp;⇒&nbsp; −40 (B) → 0 (C)
              </div>
            </Figure>

            <h4 className="mb-2 mt-8 text-lg font-semibold">{t("terna.s5.diag.t")}</h4>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <Figure caption={t("terna.s5.diag.n")}>
                <svg viewBox="0 0 190 250" className="h-auto w-full" role="img" aria-label="N diagram">
                  <g stroke={FAINT} strokeWidth="3" strokeLinecap="round">
                    <line x1="96" y1="205" x2="96" y2="60" /><line x1="96" y1="60" x2="176" y2="60" />
                  </g>
                  <rect x="70" y="60" width="26" height="145" fill="rgba(192,57,43,.16)" stroke={LOAD} strokeWidth="1.5" />
                  <text x="83" y="140" fontSize="13" fontWeight="700" fill={LOAD} textAnchor="middle" transform="rotate(-90 83 140)">−10</text>
                  <text x="20" y="52" fontSize="13" fontWeight="700" fill={INK}>N</text>
                </svg>
              </Figure>
              <Figure caption={t("terna.s5.diag.q")}>
                <svg viewBox="0 0 190 250" className="h-auto w-full" role="img" aria-label="Q diagram">
                  <g stroke={FAINT} strokeWidth="3" strokeLinecap="round">
                    <line x1="40" y1="205" x2="40" y2="60" /><line x1="40" y1="60" x2="176" y2="60" />
                  </g>
                  <rect x="40" y="34" width="136" height="26" fill="rgba(58,107,140,.16)" stroke={SHEAR} strokeWidth="1.5" />
                  <text x="108" y="52" fontSize="13" fontWeight="700" fill={SHEAR} textAnchor="middle">+10</text>
                  <text x="160" y="230" fontSize="13" fontWeight="700" fill={INK} textAnchor="end">Q</text>
                </svg>
              </Figure>
              <Figure caption={t("terna.s5.diag.m")}>
                <svg viewBox="0 0 190 250" className="h-auto w-full" role="img" aria-label="M diagram">
                  <g stroke={FAINT} strokeWidth="3" strokeLinecap="round">
                    <line x1="56" y1="205" x2="56" y2="60" /><line x1="56" y1="60" x2="176" y2="60" />
                  </g>
                  <rect x="16" y="60" width="40" height="145" fill="rgba(122,42,154,.15)" stroke={MOMENT} strokeWidth="1.5" />
                  <text x="34" y="140" fontSize="12.5" fontWeight="700" fill={MOMENT} textAnchor="middle" transform="rotate(-90 34 140)">−40</text>
                  <polygon points="56,60 56,20 176,60" fill="rgba(122,42,154,.15)" stroke={MOMENT} strokeWidth="1.5" />
                  <text x="66" y="34" fontSize="12.5" fontWeight="700" fill={MOMENT}>−40</text>
                  <text x="168" y="52" fontSize="12" fontWeight="700" fill={MOMENT} textAnchor="end">0</text>
                  <text x="150" y="230" fontSize="13" fontWeight="700" fill={INK}>M</text>
                </svg>
              </Figure>
            </div>

            <div className="mt-4 overflow-x-auto">
              <table className="w-full border-collapse text-[15px]">
                <thead>
                  <tr className="border-b-2 border-stone-800 text-left font-mono text-xs uppercase tracking-wide text-stone-500 dark:border-stone-300 dark:text-stone-400">
                    <th className="py-2 pr-3 font-medium">{t("terna.s5.th.bar")}</th>
                    <th className="py-2 pr-3 font-medium">{t("terna.s5.th.axis")}</th>
                    <th className="py-2 pr-3 text-right font-medium tabular-nums">N</th>
                    <th className="py-2 pr-3 text-right font-medium tabular-nums">Q</th>
                    <th className="py-2 pr-3 text-right font-medium tabular-nums">M</th>
                    <th className="py-2 font-medium">{t("terna.s5.th.state")}</th>
                  </tr>
                </thead>
                <tbody className="font-mono tabular-nums">
                  <tr className="border-b border-stone-200 dark:border-stone-800">
                    <td className="py-2.5 pr-3">{t("terna.s5.bar.col")}</td>
                    <td className="py-2.5 pr-3 font-sans">{t("terna.s5.axis.up")}</td>
                    <td className="py-2.5 pr-3 text-right">−10</td>
                    <td className="py-2.5 pr-3 text-right">0</td>
                    <td className="py-2.5 pr-3 text-right">−40</td>
                    <td className="py-2.5 font-sans">
                      <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-semibold text-red-800 dark:bg-red-950 dark:text-red-300">
                        {t("terna.state.compression")}
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2.5 pr-3">{t("terna.s5.bar.beam")}</td>
                    <td className="py-2.5 pr-3 font-sans">{t("terna.s5.axis.right")}</td>
                    <td className="py-2.5 pr-3 text-right">0</td>
                    <td className="py-2.5 pr-3 text-right">+10</td>
                    <td className="py-2.5 pr-3 text-right">−40→0</td>
                    <td className="py-2.5 font-sans">
                      <span className="rounded-full bg-stone-200 px-2.5 py-0.5 text-xs font-semibold text-stone-600 dark:bg-stone-800 dark:text-stone-400">
                        {t("terna.state.zero")}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* 06 — truss */}
          <section className="mt-12 border-t border-stone-200 pt-8 dark:border-stone-800">
            <Kicker>{t("terna.s6.kicker")}</Kicker>
            <h3 className="mb-3 text-2xl font-semibold tracking-tight">{t("terna.s6.title")}</h3>
            <p className="mb-4 max-w-[66ch] leading-relaxed text-stone-700 dark:text-stone-300">
              {t("terna.s6.p1")}
            </p>
            <div className="rounded-lg border border-stone-200 border-l-4 border-l-teal-700 bg-white px-5 py-4 dark:border-stone-700 dark:border-l-teal-500 dark:bg-stone-900">
              <p className="text-[15px] leading-relaxed text-stone-700 dark:text-stone-300">
                {t("terna.s6.callout")}
              </p>
            </div>
          </section>

          {/* Footer */}
          <footer className="mt-12 border-t border-stone-200 pt-6 text-sm leading-relaxed text-stone-500 dark:border-stone-800 dark:text-stone-400">
            <p className="max-w-[64ch]">{t("terna.footer")}</p>
          </footer>
        </article>
      </main>
    </div>
  );
}
