"use client";

import React, { createContext, useContext, useState } from "react";
import {
  criticalCorner,
  guideCorners,
  guideOutline,
  guideSection,
  halfPlanePolygon,
  neutralIntercepts,
  neutralSegment,
  isUniform,
  plane,
  resultantGuide,
  type GuideSection,
  type Plane,
} from "@/lib/sectionGuide";
import { SIGMA_EPS } from "@/lib/sectionCut";
import { useLanguage, type TranslationKey } from "@/contexts/LanguageContext";
import { Sub, SvgSub } from "@/components/Sub";

// Colours mirror the app: tension teal, compression red; the neutral axis in amber.
const TENS = "#0B8A8A";
const COMP = "#C0392B";
const EN = "#B7791F";
// The column of preset #2. Face 1: the x axis against the strong axis (flanges along x). Face 2: the profile turned.
export const FACES = { 1: guideSection("IPB 120", false), 2: guideSection("IPB 120", true) } as const;
type Face = 1 | 2;

interface State {
  N: number;
  Mx: number;
  My: number;
}
const CASES: { key: TranslationKey; v: State }[] = [
  { key: "cut.case.p2", v: { N: -600, Mx: -300, My: 900 } },
  { key: "cut.case.n", v: { N: -2000, Mx: 0, My: 0 } },
  { key: "cut.case.mx", v: { N: 0, Mx: 600, My: 0 } },
  { key: "cut.case.my", v: { N: 0, Mx: 0, My: 600 } },
  { key: "cut.case.oblique", v: { N: 0, Mx: 600, My: 600 } },
];

// The state of the step-5 simulator (values + face), shared with the resultant diagram of step 8 so both follow the sliders.
interface Lab {
  st: State;
  setSt: (s: State) => void;
  face: Face;
  setFace: (f: Face) => void;
}
const LabContext = createContext<Lab | null>(null);

export function SectionCutLab({ children }: { children: React.ReactNode }) {
  const [st, setSt] = useState<State>(CASES[0].v);
  const [face, setFace] = useState<Face>(2);
  return <LabContext.Provider value={{ st, setSt, face, setFace }}>{children}</LabContext.Provider>;
}

// Inside a SectionCutLab the state is shared; standalone (tests, a single figure) each component keeps its own.
function useLab(): Lab {
  const ctx = useContext(LabContext);
  const [st, setSt] = useState<State>(CASES[0].v);
  const [face, setFace] = useState<Face>(2);
  return ctx ?? { st, setSt, face, setFace };
}

function useFmt() {
  const { language } = useLanguage();
  return (n: number, d = 1) => {
    const s = (Math.abs(n) < 0.5 * 10 ** -d ? 0 : n).toFixed(d).replace("-", "−");
    return language === "es" ? s.replace(".", ",") : s;
  };
}

// The I section as three rectangles: face 1 has horizontal flanges and a vertical web; face 2 (turned) the opposite.
export function shapeRects(s: GuideSection, S: number, cx: number, cy: number) {
  const r: [number, number, number, number][] = s.rotated
    ? [
        [-s.hx, -s.hy, s.tf, 2 * s.hy],
        [s.hx - s.tf, -s.hy, s.tf, 2 * s.hy],
        [-s.hx, -s.tw / 2, 2 * s.hx, s.tw],
      ]
    : [
        [-s.hx, -s.hy, 2 * s.hx, s.tf],
        [-s.hx, s.hy - s.tf, 2 * s.hx, s.tf],
        [-s.tw / 2, -s.hy, s.tw, 2 * s.hy],
      ];
  return r.map(([x, y, w, h], i) => (
    <rect key={i} x={cx + x * S} y={cy - (y + h) * S} width={w * S} height={h * S} />
  ));
}

// The section as ONE polygon (fill + stroke); shapeRects is only for clip paths, where overlaps do not show.
export function ShapePolygon({ s, S, cx, cy, ...rest }: { s: GuideSection; S: number; cx: number; cy: number } & React.SVGProps<SVGPolygonElement>) {
  return <polygon points={guideOutline(s).map(([x, y]) => `${(cx + x * S).toFixed(1)},${(cy - y * S).toFixed(1)}`).join(" ")} strokeLinejoin="round" {...rest} />;
}

const pts = (poly: [number, number][], S: number, cx: number, cy: number) =>
  poly.map(([x, y]) => `${(cx + x * S).toFixed(1)},${(cy - y * S).toFixed(1)}`).join(" ");

const ZERO = SIGMA_EPS;

function Zones({ k, s, S, cx, cy, clipId }: { k: Plane; s: GuideSection; S: number; cx: number; cy: number; clipId: string }) {
  if (Math.abs(k.a) < ZERO && Math.abs(k.b) < ZERO && Math.abs(k.c) < ZERO) return null; // zero plane: nothing to colour
  const tp = halfPlanePolygon(k, s, 1),
    cp = halfPlanePolygon(k, s, -1);
  return (
    <>
      {tp.length > 2 && <polygon points={pts(tp, S, cx, cy)} fill={TENS} fillOpacity=".3" clipPath={`url(#${clipId})`} />}
      {cp.length > 2 && <polygon points={pts(cp, S, cx, cy)} fill={COMP} fillOpacity=".3" clipPath={`url(#${clipId})`} />}
    </>
  );
}

function MainFigure({ k, s }: { k: Plane; s: GuideSection }) {
  const fmt = useFmt();
  const { t } = useLanguage();
  const S = 24,
    cx = 280,
    cy = 215;
  const cs = guideCorners(k, s),
    best = criticalCorner(cs),
    seg = neutralSegment(k, s);
  return (
    <svg viewBox="0 0 560 430" className="h-auto w-full" role="img" aria-label={t("cut.sim.aria")} data-testid="cut-main">
      <defs>
        <clipPath id="cut-clip-main">{shapeRects(s, S, cx, cy)}</clipPath>
      </defs>
      <ShapePolygon s={s} S={S} cx={cx} cy={cy} className="fill-stone-200 dark:fill-stone-700" />
      <Zones k={k} s={s} S={S} cx={cx} cy={cy} clipId="cut-clip-main" />
      <rect x={cx - s.hx * S} y={cy - s.hy * S} width={2 * s.hx * S} height={2 * s.hy * S} fill="none" className="stroke-stone-400" strokeDasharray="4 4" />
      <ShapePolygon s={s} S={S} cx={cx} cy={cy} fill="none" className="stroke-stone-800 dark:stroke-stone-200" strokeWidth="1.5" />
      <g className="stroke-stone-400" strokeWidth="1">
        <line x1={cx - 7.3 * S} y1={cy} x2={cx + 7.3 * S} y2={cy} />
        <line x1={cx} y1={cy + 7.3 * S} x2={cx} y2={cy - 7.3 * S} />
      </g>
      <text x={cx + 7.3 * S + 4} y={cy + 4} fontSize="13" className="fill-stone-600 dark:fill-stone-300">X</text>
      <text x={cx - 4} y={cy - 7.3 * S - 5} fontSize="13" className="fill-stone-600 dark:fill-stone-300">Y</text>
      {seg && (
        <>
          <line x1={cx + seg[0][0] * S} y1={cy - seg[0][1] * S} x2={cx + seg[1][0] * S} y2={cy - seg[1][1] * S} stroke={EN} strokeWidth="2.5" />
          <text
            x={cx + seg[1][0] * S + (seg[1][0] >= 0 ? 8 : -8)}
            y={cy - seg[1][1] * S + (seg[1][1] >= 0 ? -6 : 14)}
            fontSize="13"
            fontWeight="600"
            textAnchor={seg[1][0] >= 0 ? "start" : "end"}
            fill={EN}
          >
            {t("cut.en.short")}
          </text>
        </>
      )}
      {cs.map((q, i) => {
        const px = cx + q.x * S,
          py = cy - q.y * S,
          col = q.sigma < 0 ? COMP : TENS,
          up = q.y > 0,
          right = q.x > 0,
          tx = px + (right ? 14 : -14),
          anchor = right ? "start" : "end";
        return (
          <g key={i} data-testid={`cut-corner-${i}`}>
            <circle cx={px} cy={py} r="5" fill={col} />
            {!isUniform(k, s) && q === best && <circle cx={px} cy={py} r="11" fill="none" stroke={EN} strokeWidth="2.5" />}
            <text x={tx} y={py + (up ? -14 : 24)} fontSize="12" fontWeight="600" textAnchor={anchor} fill={col} className="font-mono">
              σ = {fmt(q.sigma)}
            </text>
            <text x={tx} y={py + (up ? 0 : 38)} fontSize="11" textAnchor={anchor} className="fill-stone-500 font-mono dark:fill-stone-400">
              ({fmt(q.x, 0)}; {fmt(q.y, 0)})
            </text>
          </g>
        );
      })}
    </svg>
  );
}

// One effect on its own: it compresses one half of the section.
function MiniFigure({ f, s, label, signs, id }: { f: Plane; s: GuideSection; label: string; signs: [number, number, number][]; id: string }) {
  const S = 9,
    cx = 70,
    cy = 70;
  return (
    <svg viewBox="0 0 140 140" className="mx-auto h-auto w-full max-w-[200px]" role="img" aria-label={label}>
      <defs>
        <clipPath id={id}>{shapeRects(s, S, cx, cy)}</clipPath>
      </defs>
      <ShapePolygon s={s} S={S} cx={cx} cy={cy} className="fill-stone-200 dark:fill-stone-700" />
      <Zones k={f} s={s} S={S} cx={cx} cy={cy} clipId={id} />
      <rect x={cx - s.hx * S} y={cy - s.hy * S} width={2 * s.hx * S} height={2 * s.hy * S} fill="none" className="stroke-stone-400" strokeDasharray="3 3" />
      <ShapePolygon s={s} S={S} cx={cx} cy={cy} fill="none" className="stroke-stone-800 dark:stroke-stone-200" />
      <g className="stroke-stone-400" strokeWidth=".8">
        <line x1="6" y1="70" x2="134" y2="70" />
        <line x1="70" y1="134" x2="70" y2="6" />
      </g>
      {signs.map(([x, y, v], i) => (
        <text key={i} x={x} y={y} fontSize="22" fontWeight="600" textAnchor="middle" fill={v < 0 ? COMP : TENS}>
          {v < 0 ? "−" : "+"}
        </text>
      ))}
    </svg>
  );
}

const range =
  "w-full accent-teal-700 dark:accent-teal-400";
const numField =
  "w-24 rounded border border-stone-200 bg-white px-2 py-1 text-right font-mono text-sm dark:border-stone-600 dark:bg-stone-800";

function Control({
  id,
  label,
  value,
  min,
  max,
  step,
  onChange,
}: {
  id: string;
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
}) {
  const set = (raw: string) => {
    const v = parseFloat(raw.replace(",", "."));
    if (Number.isFinite(v)) onChange(v);
  };
  return (
    <div className="grid grid-cols-[6rem_minmax(0,1fr)_6rem] items-center gap-3">
      <label htmlFor={id} className="font-mono text-sm">
        {label}
      </label>
      <input id={id} type="range" min={min} max={max} step={step} value={value} onChange={(e) => set(e.target.value)} className={range} />
      <input aria-label={label} type="number" step={step} value={value} onChange={(e) => set(e.target.value)} className={numField} />
    </div>
  );
}

export function SectionCutSimulator() {
  const { t } = useLanguage();
  const fmt = useFmt();
  const { st, setSt, face, setFace } = useLab();
  const sec = FACES[face];
  const k = plane(st.N, st.Mx, st.My, sec);
  const peak = (f: Face) => Math.abs(criticalCorner(guideCorners(plane(st.N, st.Mx, st.My, FACES[f]), FACES[f])).sigma);
  const peaks = { 1: peak(1), 2: peak(2) };
  const cs = guideCorners(k, sec),
    best = criticalCorner(cs);
  const maxT = cs.reduce((a, b) => (b.sigma > a.sigma ? b : a)),
    maxC = cs.reduce((a, b) => (b.sigma < a.sigma ? b : a));
  const sgn = (n: number) => (n < 0 ? "−" : "+") + fmt(Math.abs(n));
  const sigTone = (n: number) => (n < 0 ? "text-[#C0392B] dark:text-red-400" : "text-teal-700 dark:text-teal-400");

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)]">
      <div className="rounded-lg border border-stone-200 bg-white p-4 shadow-sm dark:border-stone-700 dark:bg-stone-900">
        <MainFigure k={k} s={sec} />
        <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-[13px] text-stone-600 dark:text-stone-400">
          <span><b style={{ color: TENS }}>■</b> {t("cut.leg.tension")}</span>
          <span><b style={{ color: COMP }}>■</b> {t("cut.leg.compression")}</span>
          <span><b style={{ color: EN }}>—</b> {t("cut.leg.en")}</span>
          <span><b style={{ color: EN }}>◎</b> {t("cut.leg.critical")}</span>
        </div>
      </div>

      <div className="flex flex-col gap-4 rounded-lg border border-stone-200 bg-white p-4 shadow-sm dark:border-stone-700 dark:bg-stone-900">
        <div className="flex flex-wrap gap-2" role="group">
          {CASES.map((c) => {
            const on = c.v.N === st.N && c.v.Mx === st.Mx && c.v.My === st.My;
            return (
              <button
                key={c.key}
                type="button"
                aria-pressed={on}
                onClick={() => setSt(c.v)}
                className={`rounded border px-2.5 py-1 text-sm transition-colors ${
                  on
                    ? "border-teal-700 bg-teal-700 text-white dark:border-teal-400 dark:bg-teal-500 dark:text-stone-950"
                    : "border-stone-200 bg-stone-100 hover:bg-stone-200 dark:border-stone-600 dark:bg-stone-800 dark:hover:bg-stone-700"
                }`}
              >
                {t(c.key)}
              </button>
            );
          })}
        </div>
        <Control id="cut-n" label="N (kg)" value={st.N} min={-5000} max={5000} step={50} onChange={(v) => setSt({ ...st, N: v })} />
        <Control id="cut-mx" label="Mx (kg·m)" value={st.Mx} min={-3000} max={3000} step={10} onChange={(v) => setSt({ ...st, Mx: v })} />
        <Control id="cut-my" label="My (kg·m)" value={st.My} min={-3000} max={3000} step={10} onChange={(v) => setSt({ ...st, My: v })} />
        <div className="flex flex-wrap gap-2" role="group" aria-label={t("cut.face.label")}>
          {([1, 2] as const).map((f) => (
            <button
              key={f}
              type="button"
              aria-pressed={face === f}
              onClick={() => setFace(f)}
              className={`rounded border px-2.5 py-1 text-sm transition-colors ${
                face === f
                  ? "border-amber-700 bg-amber-700 text-white dark:border-amber-400 dark:bg-amber-500 dark:text-stone-950"
                  : "border-stone-200 bg-stone-100 hover:bg-stone-200 dark:border-stone-600 dark:bg-stone-800 dark:hover:bg-stone-700"
              }`}
            >
              {t(f === 1 ? "cut.face.1" : "cut.face.2")}
            </button>
          ))}
        </div>
        <p className="font-mono text-xs uppercase tracking-wide text-stone-500 dark:text-stone-400" data-testid="cut-section-line">
          {t("cut.sim.section")} · A = {fmt(sec.A, 0)} cm² · Ix = {fmt(sec.Ix, 0)} cm⁴ · Iy = {fmt(sec.Iy, 0)} cm⁴
        </p>
        <p className="text-[14px] leading-relaxed" data-testid="cut-compare">
          <Sub>{t("cut.face.compare")}</Sub> {t("cut.face.1.short")} <b>{fmt(peaks[1])}</b> · {t("cut.face.2.short")} <b>{fmt(peaks[2])}</b> kg/cm² →{" "}
          <b className="text-amber-700 dark:text-amber-400">
            {peaks[1] === peaks[2] ? t("cut.face.tie") : peaks[1] < peaks[2] ? t("cut.face.1.short") : t("cut.face.2.short")}
          </b>
        </p>
        <div className="border-l-4 border-amber-600 pl-3 text-[15px] leading-relaxed" data-testid="cut-reading">
          {!isUniform(k, sec) ? (
            <>
              <p>
                {t("cut.read.critical")} ({fmt(best.x, 0)}; {fmt(best.y, 0)}): σ ={" "}
                <b className={sigTone(best.sigma)}>{fmt(best.sigma)} kg/cm²</b> — {best.sigma < 0 ? t("cut.read.in_comp") : t("cut.read.in_tens")}.
              </p>
              <p className="mt-1">
                {t("cut.read.max_tens")} <b className="text-teal-700 dark:text-teal-400">{fmt(maxT.sigma)}</b> ({fmt(maxT.x, 0)}; {fmt(maxT.y, 0)}).{" "}
                {t("cut.read.max_comp")} <b className="text-[#C0392B] dark:text-red-400">{fmt(maxC.sigma)}</b> ({fmt(maxC.x, 0)}; {fmt(maxC.y, 0)}).
              </p>
              <p className="mt-1">
                {Math.abs(k.c) < 1e-9 ? t("cut.read.centroid_on") : k.c < 0 ? t("cut.read.centroid_comp") : t("cut.read.centroid_tens")}
              </p>
            </>
          ) : (
            <p>{Math.abs(k.c) < SIGMA_EPS ? t("cut.read.zero") : k.c < 0 ? t("cut.read.uniform_comp") : t("cut.read.uniform_tens")}</p>
          )}
        </div>
        <ThreeEffects k={k} s={sec} />
        <CornerTable k={k} s={sec} sgn={sgn} fmt={fmt} />
      </div>
    </div>
  );
}

function ThreeEffects({ k, s }: { k: Plane; s: GuideSection }) {
  const { t } = useLanguage();
  const col = (v: number) => (v < 0 ? -1 : 1);
  const items = [
    {
      title: t("cut.eff.n"),
      f: { a: 0, b: 0, c: k.c },
      signs: (k.c === 0 ? [] : [[70, 78, col(k.c)]]) as [number, number, number][],
      note: k.c === 0 ? t("cut.eff.none") : k.c < 0 ? t("cut.eff.n.comp") : t("cut.eff.n.tens"),
      id: "cut-clip-n",
    },
    {
      title: t("cut.eff.mx"),
      f: { a: 0, b: k.b, c: 0 },
      signs: (k.b === 0 ? [] : [[104, 40, col(k.b)], [104, 112, -col(k.b)]]) as [number, number, number][],
      note: k.b === 0 ? t("cut.eff.none") : k.b < 0 ? t("cut.eff.mx.top") : t("cut.eff.mx.bottom"),
      id: "cut-clip-mx",
    },
    {
      title: t("cut.eff.my"),
      f: { a: k.a, b: 0, c: 0 },
      signs: (k.a === 0 ? [] : [[36, 78, -col(k.a)], [104, 78, col(k.a)]]) as [number, number, number][],
      note: k.a === 0 ? t("cut.eff.none") : k.a < 0 ? t("cut.eff.my.right") : t("cut.eff.my.left"),
      id: "cut-clip-my",
    },
  ];
  return (
    <div className="grid grid-cols-3 gap-2" data-testid="cut-effects">
      {items.map((it) => (
        <div key={it.id} className="flex flex-col gap-1 text-center">
          <p className="font-mono text-xs font-semibold uppercase tracking-wide text-stone-500 dark:text-stone-400">{it.title}</p>
          <MiniFigure f={it.f} s={s} label={it.title} signs={it.signs} id={it.id} />
          <p className="text-[12px] leading-snug text-stone-600 dark:text-stone-400">{it.note}</p>
        </div>
      ))}
    </div>
  );
}

function CornerTable({ k, s, sgn, fmt }: { k: Plane; s: GuideSection; sgn: (n: number) => string; fmt: (n: number, d?: number) => string }) {
  const { t } = useLanguage();
  const cs = guideCorners(k, s),
    best = criticalCorner(cs),
    uniform = isUniform(k, s); // equal σ everywhere: no corner is "the" critical one
  return (
    <div className="overflow-x-auto">
      <table className="w-full font-mono text-[13px] tabular-nums" data-testid="cut-table">
        <thead>
          <tr className="text-left text-[11px] uppercase tracking-wide text-stone-500 dark:text-stone-400">
            <th className="py-1 pr-2 font-medium">{t("cut.tbl.corner")}</th>
            <th className="px-2 text-right font-medium">N/A</th>
            <th className="px-2 text-right font-medium">Mx·y/Ix</th>
            <th className="px-2 text-right font-medium">My·x/Iy</th>
            <th className="pl-2 text-right font-medium">σ</th>
          </tr>
        </thead>
        <tbody>
          {cs.map((q, i) => (
            <tr key={i} className={`border-t border-stone-200 dark:border-stone-700 ${!uniform && q === best ? "bg-amber-100/60 font-semibold dark:bg-amber-900/30" : ""}`}>
              <td className="py-1 pr-2">({fmt(q.x, 0)}; {fmt(q.y, 0)})</td>
              <td className="px-2 text-right">{sgn(q.sN)}</td>
              <td className="px-2 text-right">{sgn(q.sMx)}</td>
              <td className="px-2 text-right">{sgn(q.sMy)}</td>
              <td data-testid={`cut-sigma-${i}`} className={`pl-2 text-right ${q.sigma < 0 ? "text-[#C0392B] dark:text-red-400" : "text-teal-700 dark:text-teal-400"}`}>
                {fmt(q.sigma)}
                {!uniform && q === best ? " ◎" : ""}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// The two neutral-axis points of the preset #2 base, worked out live from the formula (step 4 of the page).
export function NeutralAxisExample() {
  const { t } = useLanguage();
  const fmt = useFmt();
  const k = plane(-600, -300, 900, FACES[2]);
  const { x0, y0 } = neutralIntercepts(k);
  return (
    <div className="rounded-lg border border-stone-200 bg-white p-4 font-mono text-sm leading-relaxed shadow-sm dark:border-stone-700 dark:bg-stone-900" data-testid="cut-en-example">
      <p className="mb-1 font-sans text-xs uppercase tracking-wide text-stone-500 dark:text-stone-400">{t("cut.en.example")}</p>
      <p>(0; y₀) → y₀ = −N·Ix/(A·Mx) = −(−600)(318)/(34·(−30000)) = <b>{fmt(y0 ?? 0, 3)} cm</b></p>
      <p>(x₀; 0) → x₀ = −N·Iy/(A·My) = −(−600)(864)/(34·90000) = <b>{fmt(x0 ?? 0, 3)} cm</b></p>
    </div>
  );
}

// Step 8: the resultant diagram of the example (face 2), built exactly as the list says.
export function ResultantFigure() {
  const { t } = useLanguage();
  const fmt = useFmt();
  const { st, face } = useLab();
  const s = FACES[face];
  const k = plane(st.N, st.Mx, st.My, s);
  const r = resultantGuide(k, s, 11);
  if (!r) {
    // σ is the same everywhere (zero, or only N): there is no E.N. and so no diagram
    return (
      <figure className="my-5 max-w-2xl rounded-lg border border-stone-200 bg-white p-4 shadow-sm dark:border-stone-700 dark:bg-stone-900" data-testid="cut-resultant-figure">
        <p data-testid="cut-resultant-uniform" className="text-[15px] leading-relaxed text-stone-700 dark:text-stone-300">
          {Math.abs(k.c) < SIGMA_EPS ? t("cut.res.zero") : t("cut.res.uniform")}
        </p>
      </figure>
    );
  }
  const S = 12; // px per cm
  const P = (x: number, y: number): [number, number] => [x * S, -y * S];
  const f = (v: [number, number]) => `${v[0].toFixed(1)},${v[1].toFixed(1)}`;
  const K = 5; // cm of the largest ordinate
  const kk = K / Math.max(Math.abs(r.hi.sigma), Math.abs(r.lo.sigma));
  const at = (tt: number) => r.at(tt);
  const ord = (tt: number): [number, number] => {
    const [x, y] = at(tt);
    const v = r.gn * tt * kk;
    return [x + r.n[0] * v, y + r.n[1] * v];
  };
  const tLo = Math.min(r.lo.t, r.hi.t),
    tHi = Math.max(r.lo.t, r.hi.t);
  const par = (end: { corner: [number, number]; t: number }) => {
    const b = at(end.t);
    const d = Math.hypot(end.corner[0] - b[0], end.corner[1] - b[1]);
    const w: [number, number] = [(end.corner[0] - b[0]) / d, (end.corner[1] - b[1]) / d];
    return { from: b, to: [end.corner[0] + w[0] * 2, end.corner[1] + w[1] * 2] as [number, number] };
  };
  const b0 = at(0);
  const lam = -(b0[0] * r.e[0] + b0[1] * r.e[1]);
  const reach = lam + (lam >= 0 ? 1 : -1) * 9;
  const enEnd: [number, number] = [b0[0] + r.e[0] * reach, b0[1] + r.e[1] * reach];
  // with σ of both signs the E.N. falls inside the baseline: two triangles. Otherwise one trapezoid.
  const crosses = r.lo.sigma < 0 && r.hi.sigma > 0;
  const parts: { key: string; pts: [number, number][]; sign: number }[] = crosses
    ? [
        { key: "neg", pts: [at(r.lo.t), ord(r.lo.t), at(0)], sign: -1 },
        { key: "pos", pts: [at(0), ord(r.hi.t), at(r.hi.t)], sign: 1 },
      ]
    : [{ key: r.hi.sigma > 0 ? "pos" : "neg", pts: [at(r.lo.t), ord(r.lo.t), ord(r.hi.t), at(r.hi.t)], sign: r.hi.sigma > 0 ? 1 : -1 }];
  // with a big N and little bending the E.N. is far from the section: it is left out (and out of the framing)
  const enNear = Math.abs(k.c) / r.gn <= 27;
  const label = (end: typeof r.hi, other: typeof r.hi, name: string) => {
    const dir = end.t >= other.t ? 1 : -1;
    const [bx, by] = at(end.t + dir * 1.4);
    const right = dir * r.u[0] >= 0;
    return { x: bx, y: by, anchor: right ? "start" : "end", text: `${name} = ${fmt(end.sigma)}` };
  };
  const lh = label(r.hi, r.lo, t("cut.res.smax")),
    ll = label(r.lo, r.hi, t("cut.res.smin"));
  // the baseline label sits on the section side of the baseline, clear of both triangles
  const tl = crosses ? (Math.abs(tHi) >= Math.abs(tLo) ? tHi : tLo) * 0.5 : (tLo + tHi) / 2; // clear of the junction and of the end labels
  const bl = at(tl);
  const side = tl >= 0 ? 1 : -1; // the ordinates lie on the +n side where σ > 0 and fold back where σ < 0: label on the other
  const bm: [number, number] = [bl[0] - r.n[0] * 0.9 * side, bl[1] - r.n[1] * 0.9 * side];
  const ang = (Math.atan2(-r.u[1], r.u[0]) * 180) / Math.PI;
  const baseAngle = ang > 90 ? ang - 180 : ang < -90 ? ang + 180 : ang; // keep the text upright
  const all: [number, number][] = [
    [-s.hx, -s.hy], [s.hx, s.hy], ...(enNear ? [b0, enEnd] : []), at(tLo - 1.5), at(tHi + 1.5), par(r.hi).to, par(r.lo).to, ord(r.hi.t), ord(r.lo.t),
    [lh.x + (lh.anchor === "start" ? 14 : -14), lh.y], [ll.x + (ll.anchor === "start" ? 14 : -14), ll.y],
  ];
  const xs = all.map((q) => P(q[0], q[1])[0]),
    ys = all.map((q) => P(q[0], q[1])[1]);
  const M = 26,
    x0 = Math.min(...xs) - M,
    y0 = Math.min(...ys) - M,
    w = Math.max(...xs) - Math.min(...xs) + 2 * M + 40,
    h = Math.max(...ys) - Math.min(...ys) + 2 * M;
  const outline = guideOutline(s).map(([x, y]) => f(P(x, y))).join(" ");
  const line = (a: [number, number], b: [number, number], props: React.SVGProps<SVGLineElement>) => {
    const A = P(a[0], a[1]),
      B = P(b[0], b[1]);
    return <line x1={A[0]} y1={A[1]} x2={B[0]} y2={B[1]} {...props} />;
  };
  return (
    <figure className="my-5 max-w-2xl rounded-lg border border-stone-200 bg-white p-4 shadow-sm dark:border-stone-700 dark:bg-stone-900" data-testid="cut-resultant-figure">
      <svg viewBox={`${x0} ${y0} ${w} ${h}`} className="h-auto w-full" role="img" aria-label={t("cut.res.aria")}>
        <polygon points={outline} strokeLinejoin="round" className="fill-stone-200 stroke-stone-800 dark:fill-stone-700 dark:stroke-stone-200" strokeWidth="1.5" />
        {[r.hi, r.lo].map((end, i) => {
          const pl = par(end);
          const col = end.sigma < 0 ? COMP : TENS;
          return (
            <g key={i}>
              {line(pl.from, pl.to, { stroke: col, strokeWidth: 1.4 })}
              <circle cx={P(end.corner[0], end.corner[1])[0]} cy={P(end.corner[0], end.corner[1])[1]} r="3.5" fill={col} />
            </g>
          );
        })}
        {enNear && (
          <>
            {line(b0, enEnd, { stroke: EN, strokeWidth: 2, strokeDasharray: "7 4" })}
            <text x={P(enEnd[0], enEnd[1])[0] + 6} y={P(enEnd[0], enEnd[1])[1] - 6} fontSize="12" fontWeight="600" fill={EN}>{t("cut.en.short")}</text>
          </>
        )}
        {line(at(tLo - 1.5), at(tHi + 1.5), { className: "stroke-stone-500", strokeWidth: 1.2 })}
        {parts.map(({ key, pts, sign }) => {
          const c: [number, number] = [pts.reduce((a, q) => a + q[0], 0) / pts.length, pts.reduce((a, q) => a + q[1], 0) / pts.length];
          const [cx, cy] = P(c[0], c[1]);
          const col = sign < 0 ? COMP : TENS;
          return (
            <g key={key}>
              <polygon points={pts.map((q) => f(P(q[0], q[1]))).join(" ")} fill={col} fillOpacity=".4" stroke={col} />
              <circle cx={cx} cy={cy} r="7" fill="none" stroke={col} strokeWidth="1.5" />
              <text x={cx} y={cy + 4.5} fontSize="13" fontWeight="700" textAnchor="middle" fill={col}>{sign < 0 ? "−" : "+"}</text>
            </g>
          );
        })}
        {[{ l: lh, end: r.hi }, { l: ll, end: r.lo }].map(({ l, end }, i) => {
          const [lx, ly] = P(l.x, l.y);
          return (
            <text key={i} x={lx + (l.anchor === "start" ? 6 : -6)} y={ly + 4} fontSize="12" fontWeight="700" textAnchor={l.anchor as "start" | "end"} fill={end.sigma < 0 ? COMP : TENS} className="font-mono">
              <SvgSub>{l.text}</SvgSub>
            </text>
          );
        })}
        <text x={P(bm[0], bm[1])[0]} y={P(bm[0], bm[1])[1]} fontSize="11" textAnchor="middle" transform={`rotate(${baseAngle.toFixed(1)} ${P(bm[0], bm[1])[0].toFixed(1)} ${P(bm[0], bm[1])[1].toFixed(1)})`} className="fill-stone-600 dark:fill-stone-300">{t("cut.res.baseline")}</text>
      </svg>
      <figcaption className="mt-2 text-[13px] leading-snug text-stone-600 dark:text-stone-400"><Sub>{t("cut.res.cap")}</Sub></figcaption>
    </figure>
  );
}
