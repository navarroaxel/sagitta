"use client";

import React from "react";
import Link from "next/link";
import { useLanguage, type TranslationKey } from "@/contexts/LanguageContext";
import NavMenu from "@/components/NavMenu";
import { Footer } from "@/components/Footer";
import { Sub } from "@/components/Sub";
import { FACES, NeutralAxisExample, ResultantFigure, SectionCutLab, SectionCutSimulator, ShapePolygon } from "@/components/SectionCutGuide";

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
        <li key={k}>
                  <Sub>{t(k)}</Sub>
                </li>
      ))}
    </ul>
  );
}

function CutPartsFigure() {
  const { t } = useLanguage();
  return (
    <figure className="my-5 max-w-xl rounded-lg border border-stone-200 bg-white p-4 shadow-sm dark:border-stone-700 dark:bg-stone-900">
      <svg viewBox="0 0 520 300" className="h-auto w-full" role="img" aria-label={t("cut.fig1.aria")} data-testid="cut-parts-figure">
        {/* column: part A (free body) above the cut, part B below */}
        <rect x="150" y="40" width="34" height="100" fill="#0B8A8A" fillOpacity=".22" stroke="#0B8A8A" strokeWidth="2" />
        <rect x="150" y="140" width="34" height="110" className="fill-stone-200 stroke-stone-500 dark:fill-stone-700" strokeWidth="2" />
        {/* the cut */}
        <line x1="120" y1="140" x2="214" y2="140" stroke="#B7791F" strokeWidth="2.5" strokeDasharray="6 4" />
        <text x="118" y="136" fontSize="12" textAnchor="end" fill="#B7791F" fontWeight="600"><Sub>{t("cut.fig1.cut")}</Sub></text>
        <text x="118" y="154" fontSize="11" textAnchor="end" className="fill-stone-600 dark:fill-stone-300"><Sub>{t("cut.fig1.face")}</Sub></text>
        {/* load on part A */}
        <line x1="60" y1="60" x2="146" y2="60" stroke="#C0392B" strokeWidth="2.5" />
        <polygon points="150,60 138,54 138,66" fill="#C0392B" />
        <text x="60" y="50" fontSize="12" fill="#C0392B" fontWeight="600"><Sub>{t("cut.fig1.load")}</Sub></text>
        {/* fixed support at the base */}
        <line x1="128" y1="250" x2="206" y2="250" className="stroke-stone-700 dark:stroke-stone-200" strokeWidth="3" />
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <line key={i} x1={132 + i * 14} y1="250" x2={124 + i * 14} y2="262" className="stroke-stone-500" strokeWidth="1.5" />
        ))}
        <text x="118" y="276" fontSize="11" textAnchor="end" className="fill-stone-600 dark:fill-stone-300"><Sub>{t("cut.fig1.support")}</Sub></text>
        {/* z axis, z = 0 at the top of the column */}
        <line x1="250" y1="40" x2="250" y2="244" className="stroke-stone-500" strokeWidth="1.5" />
        <polygon points="250,252 244,240 256,240" className="fill-stone-500" />
        <line x1="244" y1="40" x2="256" y2="40" className="stroke-stone-500" strokeWidth="1.5" />
        <text x="262" y="44" fontSize="12" className="fill-stone-700 font-mono dark:fill-stone-200">z = 0</text>
        <text x="262" y="244" fontSize="13" fontWeight="600" className="fill-stone-700 font-mono dark:fill-stone-200">z</text>
        {/* brackets with the two parts */}
        <path d="M 340 42 L 346 42 L 346 138 L 340 138" fill="none" stroke="#0B8A8A" strokeWidth="2" />
        <text x="354" y="84" fontSize="12" fontWeight="600" fill="#0B8A8A">A</text>
        <path d="M 340 142 L 346 142 L 346 248 L 340 248" fill="none" className="stroke-stone-500" strokeWidth="2" />
        <text x="354" y="198" fontSize="12" fontWeight="600" className="fill-stone-600 dark:fill-stone-300">B</text>
      </svg>
      <figcaption className="mt-2 space-y-1 text-[13px] leading-snug text-stone-600 dark:text-stone-400">
        <p><b className="text-teal-700 dark:text-teal-400">A</b> — {t("cut.fig1.a")}</p>
        <p><b>B</b> — {t("cut.fig1.b")}</p>
      </figcaption>
    </figure>
  );
}

function ProfileFacesFigure() {
  const { t, language } = useLanguage();
  const num = (n: number) => (language === "es" ? String(n).replace(".", ",") : String(n));
  const S = 11,
    cx = 130,
    cy = 122;
  return (
    <figure className="my-5 max-w-2xl rounded-lg border border-stone-200 bg-white p-4 shadow-sm dark:border-stone-700 dark:bg-stone-900" data-testid="cut-faces-figure">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2" role="img" aria-label={t("cut.fig3.aria")}>
        {([1, 2] as const).map((f) => {
          const s = FACES[f];
          const strongIx = s.Ix > s.Iy;
          return (
            <svg key={f} viewBox="0 0 260 250" className="h-auto w-full">
              <text x="130" y="18" fontSize="13" fontWeight="600" textAnchor="middle" className="fill-stone-800 dark:fill-stone-100">
                {t(f === 1 ? "cut.fig3.f1" : "cut.fig3.f2")}
              </text>
              <rect x={cx - s.hx * S} y={cy - s.hy * S} width={2 * s.hx * S} height={2 * s.hy * S} fill="none" className="stroke-stone-400" strokeDasharray="3 3" />
              <ShapePolygon s={s} S={S} cx={cx} cy={cy} className="fill-stone-300 stroke-stone-700 dark:fill-stone-600 dark:stroke-stone-200" strokeWidth="1.5" />
              <g className="stroke-stone-500" strokeWidth="1.5">
                <line x1={cx - 7.5 * S} y1={cy} x2={cx + 7.5 * S} y2={cy} />
                <line x1={cx} y1={cy + 7.5 * S} x2={cx} y2={cy - 7.5 * S} />
              </g>
              <polygon points={`${cx + 7.5 * S + 7},${cy} ${cx + 7.5 * S - 3},${cy - 4} ${cx + 7.5 * S - 3},${cy + 4}`} className="fill-stone-500" />
              <polygon points={`${cx},${cy - 7.5 * S - 7} ${cx - 4},${cy - 7.5 * S + 3} ${cx + 4},${cy - 7.5 * S + 3}`} className="fill-stone-500" />
              <text x={cx + 7.5 * S + 4} y={cy + 18} fontSize="13" fontWeight="600" className="fill-stone-700 font-mono dark:fill-stone-200">X</text>
              <text x={cx + 8} y={cy - 7.5 * S - 2} fontSize="13" fontWeight="600" className="fill-stone-700 font-mono dark:fill-stone-200">Y</text>
              <text x="130" y="228" fontSize="12" textAnchor="middle" className="fill-stone-700 font-mono dark:fill-stone-200">
                <tspan fill={strongIx ? "#0B8A8A" : "#C0392B"} fontWeight="600">Ix = {num(s.Ix)} cm⁴</tspan>
                {" · "}
                <tspan fill={strongIx ? "#C0392B" : "#0B8A8A"} fontWeight="600">Iy = {num(s.Iy)} cm⁴</tspan>
              </text>
              <text x="130" y="244" fontSize="11" textAnchor="middle" className="fill-stone-500 dark:fill-stone-400">
                {t(strongIx ? "cut.fig3.strong" : "cut.fig3.weak")} / {t(strongIx ? "cut.fig3.weak" : "cut.fig3.strong")}
              </text>
            </svg>
          );
        })}
      </div>
      <figcaption className="mt-2 text-[13px] leading-snug text-stone-600 dark:text-stone-400"><Sub>{t("cut.fig3.cap")}</Sub></figcaption>
    </figure>
  );
}

export default function CorteDeSeccionPage() {
  const { t } = useLanguage();
  const full: TranslationKey[] = [
    "cut.full.1", "cut.full.2", "cut.full.3", "cut.full.4", "cut.full.5",
    "cut.full.6", "cut.full.7", "cut.full.8", "cut.full.9", "cut.full.10", "cut.full.11",
  ];
  return (
    <div className="flex min-h-screen flex-col bg-stone-50 text-stone-900 dark:bg-stone-950 dark:text-stone-100">
      <header className="z-10 flex items-center gap-3 border-b border-stone-200 bg-white px-4 py-2 shadow-sm dark:border-stone-700 dark:bg-stone-900">
        <Link href="/" className="text-sm text-stone-500 transition-colors hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-100">
          {t("quiz.back")}
        </Link>
        <span className="text-stone-300 dark:text-stone-600">|</span>
        <h1 className="text-base font-semibold tracking-tight text-stone-800 dark:text-stone-100"><Sub>{t("cut.link")}</Sub></h1>
        <div className="ml-auto">
          <NavMenu />
        </div>
      </header>

      <main className="flex-1">
        <SectionCutLab>
        <article className="mx-auto max-w-5xl px-6 py-12">
          <Kicker><Sub>{t("cut.kicker")}</Sub></Kicker>
          <h2 className="mb-4 max-w-3xl text-4xl font-bold leading-tight tracking-tight text-balance"><Sub>{t("cut.title")}</Sub></h2>
          <p className="mb-6 max-w-[62ch] text-lg leading-relaxed text-stone-600 dark:text-stone-300"><Sub>{t("cut.lead")}</Sub></p>

          <section className={SECTION}>
            <Kicker><Sub>{t("cut.s1.kicker")}</Sub></Kicker>
            <h3 className="mb-3 text-2xl font-semibold tracking-tight"><Sub>{t("cut.s1.title")}</Sub></h3>
            <p className={P}><Sub>{t("cut.s1.p1")}</Sub></p>
            <CutPartsFigure />
            <Bullets keys={["cut.s1.b1", "cut.s1.b2"]} />
            <p className={P}><Sub>{t("cut.s1.p2")}</Sub></p>
          </section>

          <section className={SECTION}>
            <Kicker><Sub>{t("cut.s2.kicker")}</Sub></Kicker>
            <h3 className="mb-3 text-2xl font-semibold tracking-tight"><Sub>{t("cut.s2.title")}</Sub></h3>
            <p className={P}><Sub>{t("cut.s2.tri.p")}</Sub></p>
            <Bullets keys={["cut.s2.tri.z", "cut.s2.tri.x", "cut.s2.tri.y"]} />
            <p className={P}><Sub>{t("cut.s2.tri.note")}</Sub></p>
            <p className={`${P} mt-4`}><Sub>{t("cut.s2.p1")}</Sub></p>
            <Bullets keys={["cut.s2.n", "cut.s2.m"]} />
            <p className={P}><Sub>{t("cut.s2.example")}</Sub></p>
            <div className={EQ}>σ(x, y) = N/A + Mx·y/Ix + My·x/Iy</div>
            <p className={P}><Sub>{t("cut.s2.units")}</Sub></p>
          </section>

          <section className={SECTION}>
            <Kicker><Sub>{t("cut.f.kicker")}</Sub></Kicker>
            <h3 className="mb-3 text-2xl font-semibold tracking-tight"><Sub>{t("cut.f.title")}</Sub></h3>
            <p className={P}><Sub>{t("cut.f.p1")}</Sub></p>
            <ProfileFacesFigure />
            <Bullets keys={["cut.f.b1", "cut.f.b2", "cut.f.b3"]} />
            <p className={P}><Sub>{t("cut.f.p2")}</Sub></p>
          </section>

          <section className={SECTION}>
            <Kicker><Sub>{t("cut.g.kicker")}</Sub></Kicker>
            <h3 className="mb-3 text-2xl font-semibold tracking-tight"><Sub>{t("cut.g.title")}</Sub></h3>
            <p className={P}><Sub>{t("cut.g.p1")}</Sub></p>
            <Bullets keys={["cut.g.n", "cut.g.mx", "cut.g.my"]} />
            <p className={P}><Sub>{t("cut.g.p2")}</Sub></p>
          </section>

          <section className={SECTION}>
            <Kicker><Sub>{t("cut.s3.kicker")}</Sub></Kicker>
            <h3 className="mb-3 text-2xl font-semibold tracking-tight"><Sub>{t("cut.s3.title")}</Sub></h3>
            <p className="mb-5 max-w-[66ch] leading-relaxed text-stone-700 dark:text-stone-300"><Sub>{t("cut.s3.p1")}</Sub></p>
            <SectionCutSimulator />
            <p className="mt-5 max-w-[66ch] leading-relaxed text-stone-700 dark:text-stone-300"><Sub>{t("cut.s3.p2")}</Sub></p>
          </section>

          <section className={SECTION}>
            <Kicker><Sub>{t("cut.s4.kicker")}</Sub></Kicker>
            <h3 className="mb-3 text-2xl font-semibold tracking-tight"><Sub>{t("cut.s4.title")}</Sub></h3>
            <p className={P}><Sub>{t("cut.s4.p1")}</Sub></p>
            <div className={EQ}>x₀ = −N·Iy / (A·My) &nbsp;→ (x₀; 0)</div>
            <div className={EQ}>y₀ = −N·Ix / (A·Mx) &nbsp;→ (0; y₀)</div>
            <p className={`${P} mb-3`}><Sub>{t("cut.s4.p2")}</Sub></p>
            <NeutralAxisExample />
            <Bullets keys={["cut.s4.b1", "cut.s4.b2", "cut.s4.b3"]} />
          </section>

          <section className={SECTION}>
            <Kicker><Sub>{t("cut.s5.kicker")}</Sub></Kicker>
            <h3 className="mb-3 text-2xl font-semibold tracking-tight"><Sub>{t("cut.s5.title")}</Sub></h3>
            <p className={P}><Sub>{t("cut.s5.p1")}</Sub></p>
            <Bullets keys={["cut.s5.b1", "cut.s5.b2", "cut.s5.b4"]} />
            <p className={P}><Sub>{t("cut.s5.p2")}</Sub></p>
          </section>

          <section className={SECTION}>
            <Kicker><Sub>{t("cut.s8.kicker")}</Sub></Kicker>
            <h3 className="mb-3 text-2xl font-semibold tracking-tight"><Sub>{t("cut.s8.title")}</Sub></h3>
            <p className={P}><Sub>{t("cut.s8.p1")}</Sub></p>
            <ol className="my-3 max-w-[70ch] list-decimal space-y-3 pl-6 text-[15px] leading-relaxed text-stone-700 marker:font-mono marker:font-semibold marker:text-teal-700 dark:text-stone-300 dark:marker:text-teal-400">
              {(["cut.s8.1", "cut.s8.2", "cut.s8.3", "cut.s8.4", "cut.s8.5"] as TranslationKey[]).map((k) => (
                <li key={k}>
                  <Sub>{t(k)}</Sub>
                </li>
              ))}
            </ol>
            <ResultantFigure />
            <p className={P}>
              <Sub>{t("cut.s8.p2")}</Sub>
            </p>
          </section>

          <section className={SECTION}>
            <Kicker><Sub>{t("cut.s6.kicker")}</Sub></Kicker>
            <h3 className="mb-3 text-2xl font-semibold tracking-tight"><Sub>{t("cut.s6.title")}</Sub></h3>
            <ol className="my-3 max-w-[70ch] list-decimal space-y-3 pl-6 text-[15px] leading-relaxed text-stone-700 marker:font-mono marker:font-semibold marker:text-teal-700 dark:text-stone-300 dark:marker:text-teal-400">
              {full.map((k) => (
                <li key={k}>
                  <Sub>{t(k)}</Sub>
                </li>
              ))}
            </ol>
            <p className={P}><Sub>{t("cut.s6.note")}</Sub></p>
          </section>

          <section className="mt-12 rounded-lg border border-[#C0392B] p-5">
            <h3 className="mb-3 text-xl font-semibold tracking-tight"><Sub>{t("cut.err.title")}</Sub></h3>
            <Bullets keys={["cut.err.1", "cut.err.2", "cut.err.3", "cut.err.4", "cut.err.5"]} />
          </section>
        </article>
        </SectionCutLab>
      </main>
      <Footer />
    </div>
  );
}
