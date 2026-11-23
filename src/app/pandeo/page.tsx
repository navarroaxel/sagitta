"use client";

import React from "react";
import { useLanguage, type TranslationKey } from "@/contexts/LanguageContext";
import { Sub, SvgSub, plain } from "@/components/Sub";
import { Eq, Figure, GuidePage, Para, Section } from "@/components/guide/GuideBits";
import PandeoCalculator from "@/components/PandeoCalculator";
import { criticalStress, END_CONDITIONS } from "@/lib/buckling";

const INK = "#16232E";
const FAINT = "#C9D2D8";
const LOAD = "#C0392B";
const MOMENT = "#7A2A9A";

// Euler's hyperbola σk(λ) = π²E/λ² for steel.
function HyperbolaSVG() {
  const { t } = useLanguage();
  const E = 2_100_000;
  const x0 = 40, x1 = 330, y0 = 150, y1 = 20;
  const lamMin = 30, lamMax = 200;
  const smax = criticalStress(E, lamMin);
  const px = (lam: number) => x0 + ((lam - lamMin) / (lamMax - lamMin)) * (x1 - x0);
  const py = (s: number) => y0 - (s / smax) * (y0 - y1);
  const pts: string[] = [];
  for (let lam = lamMin; lam <= lamMax; lam += 2) pts.push(`${px(lam).toFixed(1)},${py(criticalStress(E, lam)).toFixed(1)}`);
  return (
    <svg viewBox="0 0 360 180" className="h-auto w-full" role="img" aria-label={plain(t("pnd.s3.fig"))}>
      <line x1={x0} y1={y0} x2={x1 + 10} y2={y0} stroke={INK} strokeWidth="1.5" />
      <line x1={x0} y1={y0} x2={x0} y2={y1 - 6} stroke={INK} strokeWidth="1.5" />
      <polyline points={pts.join(" ")} fill="none" stroke={LOAD} strokeWidth="2.5" />
      <text x={x1 + 12} y={y0 + 4} fontSize="13" fontStyle="italic" fill={INK}>{t("pnd.s3.fig.axis.x")}</text>
      <text x={x0 + 6} y={y1 - 6} fontSize="12" fill={INK}><SvgSub>{t("pnd.s3.fig.axis.y")}</SvgSub></text>
      <text x={x1 - 90} y={y0 - 70} fontSize="12" fill={LOAD}><SvgSub>σ_k = π²·E / λ²</SvgSub></text>
    </svg>
  );
}

// One bar per end condition with its buckled shape (schematic) and l0 = c·l.
function EndConditionSVG({ id }: { id: (typeof END_CONDITIONS)[number]["id"] }) {
  const top = 14, bot = 110;
  const fixedTop = id === "fixed-fixed";
  const fixedBottom = id !== "pinned";
  const shape: Record<string, string> = {
    cantilever: `M 50 ${bot} C 50 ${bot - 50} 75 ${top + 25} 78 ${top}`,
    pinned: `M 50 ${bot} C 80 ${bot - 40} 80 ${top + 40} 50 ${top}`,
    "fixed-pinned": `M 50 ${bot} C 50 ${bot - 35} 76 ${top + 45} 50 ${top}`,
    "fixed-fixed": `M 50 ${bot} C 50 ${bot - 30} 78 ${bot - 34} 78 ${(top + bot) / 2} C 78 ${top + 34} 50 ${top + 30} 50 ${top}`,
  };
  return (
    <svg viewBox="0 0 100 130" className="h-auto w-full" role="img" aria-hidden="true">
      <line x1="50" y1={top} x2="50" y2={bot} stroke={FAINT} strokeWidth="1.5" strokeDasharray="3 3" />
      <path d={shape[id]} fill="none" stroke={MOMENT} strokeWidth="2.5" />
      {fixedBottom ? (
        <g stroke={INK} strokeWidth="1.5">
          <line x1="34" y1={bot} x2="66" y2={bot} />
          {[36, 44, 52, 60].map((x) => <line key={x} x1={x} y1={bot} x2={x - 5} y2={bot + 8} />)}
        </g>
      ) : (
        <polygon points={`50,${bot} 44,${bot + 10} 56,${bot + 10}`} fill="none" stroke={INK} strokeWidth="1.5" />
      )}
      {fixedTop && (
        <g stroke={INK} strokeWidth="1.5">
          <line x1="34" y1={top} x2="66" y2={top} />
          {[36, 44, 52, 60].map((x) => <line key={x} x1={x} y1={top} x2={x - 5} y2={top - 8} />)}
        </g>
      )}
      {!fixedTop && id !== "cantilever" && <polygon points={`${id === "pinned" ? 50 : 50},${top} 44,${top - 10} 56,${top - 10}`} fill="none" stroke={INK} strokeWidth="1.5" />}
      {id === "cantilever" && <circle cx="78" cy={top} r="2.5" fill={LOAD} />}
    </svg>
  );
}

const EXAMPLES = ["e1", "e2", "e3", "e4"] as const;

export default function PandeoPage() {
  const { t, language } = useLanguage();
  const cases = [
    { k: "c1", cls: "border-teal-600" },
    { k: "c2", cls: "border-amber-500" },
    { k: "c3", cls: "border-red-600" },
  ] as const;
  return (
    <GuidePage title="pnd.title" kicker="F_k · λ · c" lead="pnd.lead" footer="pnd.footer">
      <Section kicker="pnd.s1.kicker" title="pnd.s1.title">
        <Para k="pnd.s1.p1" />
        <Para k="pnd.s1.p2" />
        <div className="mb-4 grid gap-3 sm:grid-cols-3">
          {cases.map(({ k, cls }) => (
            <div key={k} data-testid={`pnd-${k}`} className={`rounded-lg border-l-4 bg-white p-3 dark:bg-stone-900 ${cls}`}>
              <p className="mb-1 font-semibold"><Sub>{t(`pnd.s1.${k}.t` as TranslationKey)}</Sub></p>
              <p className="text-[15px] text-stone-600 dark:text-stone-400">{t(`pnd.s1.${k}.d` as TranslationKey)}</p>
            </div>
          ))}
        </div>
        <Para k="pnd.s1.p3" />
      </Section>

      <Section kicker="pnd.s2.kicker" title="pnd.s2.title">
        <ol className="mb-4 max-w-[66ch] list-decimal space-y-2 pl-6 text-stone-700 dark:text-stone-300">
          {(["h1", "h2", "h3", "h4"] as const).map((k) => (
            <li key={k}>
              <Sub>{t(`pnd.s2.${k}` as TranslationKey)}</Sub>
            </li>
          ))}
        </ol>
      </Section>

      <Section kicker="pnd.s3.kicker" title="pnd.s3.title">
        <Para k="pnd.s3.p1" />
        <Eq boxed>{"{F}_k = π²·{E}·{J}_min / (c²·{l}²)"}</Eq>
        <Para k="pnd.s3.p2" />
        <Eq>{"λ = {l} / i_min        {F}_k = π²·{E}·{A} / (c²·λ²)"}</Eq>
        <Para k="pnd.s3.p3" />
        <Eq boxed>{"σ_k = {F}_k / {A} = π²·{E} / (c²·λ²)"}</Eq>
        <div className="mx-auto max-w-md">
          <Figure caption={<Sub>{t("pnd.s3.fig")}</Sub>}>
            <HyperbolaSVG />
          </Figure>
        </div>
        <Para k="pnd.s3.p4" />
      </Section>

      <Section kicker="pnd.s4.kicker" title="pnd.s4.title">
        <Para k="pnd.s4.p1" />
        <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {END_CONDITIONS.map((ec) => (
            <div key={ec.id} data-testid={`pnd-end-${ec.id}`} className="rounded-lg border border-stone-200 bg-white p-2 text-center dark:border-stone-700 dark:bg-stone-100">
              <EndConditionSVG id={ec.id} />
              <p className="text-[13px] text-stone-600">
                {t(`pnd.s4.${ec.id.replace(/-/g, "")}` as TranslationKey)}
              </p>
              <p className="font-mono text-sm text-stone-800">c = {String(ec.c).replace(".", language === "es" ? "," : ".")}</p>
            </div>
          ))}
        </div>
        <Para k="pnd.s4.p2" />
      </Section>

      <Section kicker="pnd.s5.kicker" title="pnd.s5.title">
        <div className="mb-4 grid gap-3">
          {EXAMPLES.map((e) => (
            <div key={e} data-testid={`pnd-${e}`} className="rounded-lg border border-stone-200 bg-white p-4 dark:border-stone-700 dark:bg-stone-900">
              <p className="mb-1 text-[15px] font-semibold"><Sub>{t(`pnd.s5.${e}.t` as TranslationKey)}</Sub></p>
              <p className="font-mono text-[14px] leading-relaxed"><Sub>{t(`pnd.s5.${e}.r` as TranslationKey)}</Sub></p>
            </div>
          ))}
        </div>
        <p className="mb-2 max-w-[66ch] text-sm leading-relaxed text-amber-700 dark:text-amber-400"><Sub>{t("pnd.s5.note")}</Sub></p>
        <PandeoCalculator />
      </Section>
    </GuidePage>
  );
}
