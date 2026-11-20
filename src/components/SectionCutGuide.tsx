"use client";

import React, { useState } from "react";
import {
  criticalCorner,
  guideCorners,
  guideOutline,
  guideSection,
  halfPlanePolygon,
  neutralIntercepts,
  neutralSegment,
  plane,
  type GuideSection,
  type Plane,
} from "@/lib/sectionGuide";
import { useLanguage, type TranslationKey } from "@/contexts/LanguageContext";

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

function Zones({ k, s, S, cx, cy, clipId }: { k: Plane; s: GuideSection; S: number; cx: number; cy: number; clipId: string }) {
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
            {seg && q === best && <circle cx={px} cy={py} r="11" fill="none" stroke={EN} strokeWidth="2.5" />}
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
  const [st, setSt] = useState<State>(CASES[0].v);
  const [face, setFace] = useState<Face>(2);
  const sec = FACES[face];
  const k = plane(st.N, st.Mx, st.My, sec);
  const peak = (f: Face) => Math.abs(criticalCorner(guideCorners(plane(st.N, st.Mx, st.My, FACES[f]), FACES[f])).sigma);
  const peaks = { 1: peak(1), 2: peak(2) };
  const cs = guideCorners(k, sec),
    best = criticalCorner(cs);
  const maxT = cs.reduce((a, b) => (b.sigma > a.sigma ? b : a)),
    maxC = cs.reduce((a, b) => (b.sigma < a.sigma ? b : a));
  const seg = neutralSegment(k, sec);
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
          {t("cut.face.compare")} {t("cut.face.1.short")} <b>{fmt(peaks[1])}</b> · {t("cut.face.2.short")} <b>{fmt(peaks[2])}</b> kg/cm² →{" "}
          <b className="text-amber-700 dark:text-amber-400">
            {peaks[1] === peaks[2] ? t("cut.face.tie") : peaks[1] < peaks[2] ? t("cut.face.1.short") : t("cut.face.2.short")}
          </b>
        </p>
        <div className="border-l-4 border-amber-600 pl-3 text-[15px] leading-relaxed" data-testid="cut-reading">
          {seg ? (
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
            <p>{Math.abs(k.c) < 1e-9 ? t("cut.read.zero") : k.c < 0 ? t("cut.read.uniform_comp") : t("cut.read.uniform_tens")}</p>
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
      signs: [[70, 78, col(k.c)]] as [number, number, number][],
      note: k.c === 0 ? t("cut.eff.none") : k.c < 0 ? t("cut.eff.n.comp") : t("cut.eff.n.tens"),
      id: "cut-clip-n",
    },
    {
      title: t("cut.eff.mx"),
      f: { a: 0, b: k.b, c: 0 },
      signs: [[104, 40, col(k.b)], [104, 112, -col(k.b)]] as [number, number, number][],
      note: k.b === 0 ? t("cut.eff.none") : k.b < 0 ? t("cut.eff.mx.top") : t("cut.eff.mx.bottom"),
      id: "cut-clip-mx",
    },
    {
      title: t("cut.eff.my"),
      f: { a: k.a, b: 0, c: 0 },
      signs: [[36, 78, -col(k.a)], [104, 78, col(k.a)]] as [number, number, number][],
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
    uniform = !neutralSegment(k, s); // equal σ everywhere: no corner is "the" critical one
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
