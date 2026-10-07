"use client";

import { useLanguage, type TranslationKey } from "@/contexts/LanguageContext";
import type { Profile } from "@/lib/profiles";

const VB_W = 490;
const VB_H = 320;
const CX = 200;
const CY = 172;

const LINE = "stroke-stone-500 dark:stroke-stone-400";
const TEXT = "fill-stone-700 dark:fill-stone-200";

// Section sketch drawn to scale (flanges taken as constant thickness; the real IPN/UPN flanges
// are tapered) with the same dimension marks as the CIRSOC table: d, bf, tf, tw, hw, r and
// the two principal axes.
export function SectionDrawing({ p }: { p: Profile }) {
  const channel = p.series === "UPN";
  const k = Math.min(165 / p.h, 130 / p.bf);
  const W = p.bf * k;
  const H = p.h * k;
  const x0 = CX - W / 2;
  const y0 = CY - H / 2;
  const yb = y0 + H;
  const xr = x0 + W;
  const tf = Math.max(p.tf * k, 2);
  const tw = Math.max(p.tw * k, 2);
  const wl = channel ? x0 : CX - tw / 2; // web, left edge
  const wr = channel ? x0 + tw : CX + tw / 2; // web, right edge
  const rk = Math.max(
    Math.min(
      p.r * k,
      (W - tw) / (channel ? 1 : 2) - 0.5,
      (H - 2 * tf) / 2 - 0.5,
    ),
    0,
  );
  const yf = y0 + tf; // underside of the top flange
  const yfb = yb - tf; // top of the bottom flange

  const d = channel
    ? `M${x0},${y0}H${xr}V${yf}H${wr + rk}a${rk} ${rk} 0 0 0 ${-rk} ${rk}V${yfb - rk}a${rk} ${rk} 0 0 0 ${rk} ${rk}H${xr}V${yb}H${x0}Z`
    : `M${x0},${y0}H${xr}V${yf}H${wr + rk}a${rk} ${rk} 0 0 0 ${-rk} ${rk}V${yfb - rk}a${rk} ${rk} 0 0 0 ${rk} ${rk}H${xr}V${yb}H${x0}V${yfb}H${wl - rk}a${rk} ${rk} 0 0 0 ${rk} ${-rk}V${yf + rk}a${rk} ${rk} 0 0 0 ${-rk} ${-rk}H${x0}Z`;

  // Y-Y passes through the centroid: the middle for the I, off-centre for the channel
  const flangeA = W * tf;
  const webA = tw * (H - 2 * tf);
  const yAxisX = channel
    ? (2 * flangeA * (W / 2) + webA * (tw / 2)) / (2 * flangeA + webA) + x0
    : CX;

  const dimX = xr + 90; // d
  const hwX = x0 - 62; // hw
  const hw2 = (p.hw * k) / 2;
  const tfx = xr + 16;
  const twy = CY + H * 0.2;
  // point on the top-right fillet, for the r leader
  const qx = wr + rk - rk * 0.7071;
  const qy = yf + rk - rk * 0.7071;

  return (
    <svg
      viewBox={`0 0 ${VB_W} ${VB_H}`}
      role="img"
      aria-label={p.name}
      className="h-auto w-full max-w-[490px]"
    >
      <defs>
        <marker
          id="dim-arrow"
          viewBox="0 0 10 10"
          refX="10"
          refY="5"
          markerWidth="7"
          markerHeight="7"
          orient="auto-start-reverse"
        >
          <path
            d="M0,1.5 L10,5 L0,8.5 z"
            className="fill-stone-600 dark:fill-stone-300"
          />
        </marker>
      </defs>

      <path
        d={d}
        className="fill-stone-300 stroke-stone-600 dark:fill-stone-600 dark:stroke-stone-300"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />

      {/* axes */}
      <line
        x1={x0 - 14}
        x2={xr + 18}
        y1={CY}
        y2={CY}
        className="stroke-teal-600 dark:stroke-teal-400"
        strokeDasharray="6 3"
        strokeWidth="1.2"
      />
      <text
        x={xr + 22}
        y={CY + 5}
        fontSize="14"
        fontWeight="700"
        className="fill-teal-700 dark:fill-teal-300"
      >
        X-X
      </text>
      <line
        x1={yAxisX}
        x2={yAxisX}
        y1={y0 - 10}
        y2={yb + 14}
        className="stroke-amber-600 dark:stroke-amber-400"
        strokeDasharray="6 3"
        strokeWidth="1.2"
      />
      <text
        x={yAxisX}
        y={yb + 30}
        textAnchor="middle"
        fontSize="14"
        fontWeight="700"
        className="fill-amber-700 dark:fill-amber-300"
      >
        Y-Y
      </text>

      {/* bf */}
      <g className={LINE} strokeWidth="0.8">
        <line x1={x0} x2={x0} y1={y0 - 2} y2={y0 - 28} />
        <line x1={xr} x2={xr} y1={y0 - 2} y2={y0 - 28} />
        <line
          x1={x0}
          x2={xr}
          y1={y0 - 24}
          y2={y0 - 24}
          markerStart="url(#dim-arrow)"
          markerEnd="url(#dim-arrow)"
        />
      </g>
      <text
        x={CX}
        y={y0 - 29}
        textAnchor="middle"
        fontSize="12"
        className={TEXT}
      >
        bf = {p.bf}
      </text>

      {/* d */}
      <g className={LINE} strokeWidth="0.8">
        <line x1={xr + 2} x2={dimX + 4} y1={y0} y2={y0} />
        <line x1={xr + 2} x2={dimX + 4} y1={yb} y2={yb} />
        <line
          x1={dimX}
          x2={dimX}
          y1={y0}
          y2={yb}
          markerStart="url(#dim-arrow)"
          markerEnd="url(#dim-arrow)"
        />
      </g>
      <text x={dimX + 6} y={CY + 4} fontSize="12" className={TEXT}>
        d = {p.h}
      </text>

      {/* hw */}
      <g className={LINE} strokeWidth="0.8">
        <line x1={wl - 2} x2={hwX - 4} y1={CY - hw2} y2={CY - hw2} />
        <line x1={wl - 2} x2={hwX - 4} y1={CY + hw2} y2={CY + hw2} />
        <line
          x1={hwX}
          x2={hwX}
          y1={CY - hw2}
          y2={CY + hw2}
          markerStart="url(#dim-arrow)"
          markerEnd="url(#dim-arrow)"
        />
      </g>
      <text
        x={hwX - 6}
        y={CY + 4}
        textAnchor="end"
        fontSize="12"
        className={TEXT}
      >
        hw = {p.hw}
      </text>

      {/* tf: arrows from outside onto the bottom flange, on the open side (right) */}
      <g className={LINE} strokeWidth="0.8">
        <line x1={xr + 2} x2={tfx + 6} y1={yfb} y2={yfb} />
        <line
          x1={tfx}
          x2={tfx}
          y1={yb + 16}
          y2={yb}
          markerEnd="url(#dim-arrow)"
        />
        <line
          x1={tfx}
          x2={tfx}
          y1={yfb - 16}
          y2={yfb}
          markerEnd="url(#dim-arrow)"
        />
      </g>
      <text x={tfx + 7} y={yfb - 8} fontSize="12" className={TEXT}>
        tf = {p.tf}
      </text>

      {/* tw: arrows from outside onto the web */}
      <g className={LINE} strokeWidth="0.8">
        <line
          x1={wl - 18}
          x2={wl}
          y1={twy}
          y2={twy}
          markerEnd="url(#dim-arrow)"
        />
        <line
          x1={wr + 18}
          x2={wr}
          y1={twy}
          y2={twy}
          markerEnd="url(#dim-arrow)"
        />
      </g>
      <text x={wr + 22} y={twy + 4} fontSize="12" className={TEXT}>
        tw = {p.tw}
      </text>

      {/* r: leader from the top-right root fillet out through the open side */}
      <g className={LINE} strokeWidth="0.8" fill="none">
        <polyline
          points={`${qx},${qy} ${qx + 8},${qy + 12} ${xr + 6},${qy + 12}`}
        />
      </g>
      <circle
        cx={qx}
        cy={qy}
        r="1.6"
        className="fill-stone-600 dark:fill-stone-300"
      />
      <text x={xr + 10} y={qy + 16} fontSize="12" className={TEXT}>
        r = {p.r}
      </text>
    </svg>
  );
}

const PROP_ROWS: { sym: string; key: TranslationKey; formula?: boolean }[] = [
  { sym: "Ag", key: "prof.leg.A" },
  { sym: "I", key: "prof.leg.I" },
  { sym: "r", key: "prof.leg.r", formula: true },
  { sym: "S", key: "prof.leg.S" },
  { sym: "Q", key: "prof.leg.Q" },
  { sym: "Z", key: "prof.leg.Z" },
  { sym: "J", key: "prof.leg.J" },
];

export function ProfileLegend({ p }: { p: Profile }) {
  const { t } = useLanguage();
  const dims: [string, TranslationKey, number][] = [
    ["d", "prof.leg.d", p.h],
    ["bf", "prof.leg.bf", p.bf],
    ["tf", "prof.leg.tf", p.tf],
    ["tw", "prof.leg.tw", p.tw],
    ["hw", "prof.leg.hw", p.hw],
    ["r", "prof.leg.r1", p.r],
  ];
  if (p.r2 !== undefined) dims.push(["r2", "prof.leg.r2", p.r2]);

  return (
    <div
      className="space-y-3 text-sm"
      aria-label={t("prof.leg.title")}
      role="group"
    >
      <dl className="grid grid-cols-[auto_1fr_auto] gap-x-3 gap-y-0.5">
        {dims.map(([sym, key, v]) => (
          <div key={sym} className="contents">
            <dt className="font-bold">{sym}</dt>
            <dd className="text-stone-600 dark:text-stone-300">{t(key)}</dd>
            <dd className="text-right tabular-nums">{v} mm</dd>
          </div>
        ))}
        <div className="contents">
          <dt className="font-bold text-teal-700 dark:text-teal-300">X-X</dt>
          <dd className="col-span-2 text-stone-600 dark:text-stone-300">
            {t("prof.leg.strong")}
          </dd>
        </div>
        <div className="contents">
          <dt className="font-bold text-amber-700 dark:text-amber-300">Y-Y</dt>
          <dd className="col-span-2 text-stone-600 dark:text-stone-300">
            {t("prof.leg.weak")}
          </dd>
        </div>
      </dl>
      <ul className="space-y-0.5 text-stone-600 dark:text-stone-300">
        {PROP_ROWS.map(({ sym, key, formula }) => (
          <li key={sym}>
            <b className="text-stone-900 dark:text-stone-100">{sym}</b> {t(key)}
            {formula && (
              <span className="ml-1 whitespace-nowrap">r = √(I / A)</span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
