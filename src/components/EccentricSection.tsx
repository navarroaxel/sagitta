"use client";

import React, { useState } from "react";
import { getProfile, PROFILES } from "@/lib/profiles";
import { eccentricLoad } from "@/lib/eccentric";
import { sectionOutline } from "@/lib/sectionCut";
import { useColors } from "@/contexts/ColorContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Sub } from "@/components/Sub";

const W = 560,
  H = 460;
const CX = 280,
  CY = 230;
const f2 = (v: number) => (Math.abs(v) < 0.005 ? "0.00" : v.toFixed(2));
const parse = (s: string) => {
  const v = parseFloat(s.replace(",", "."));
  return Number.isFinite(v) ? v : 0;
};

const field =
  "w-24 rounded border border-stone-200 bg-white px-2 py-1 text-right font-mono text-sm dark:border-stone-600 dark:bg-stone-800";

function NumField({
  label,
  value,
  onChange,
  step = 0.5,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  step?: number;
}) {
  return (
    <label className="flex items-center justify-between gap-3 text-sm">
      <span>
        <Sub>{label}</Sub>
      </span>
      <input
        type="number"
        step={step}
        aria-label={label}
        className={field}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}

export function EccentricSection() {
  const { t } = useLanguage();
  const colors = useColors();
  const [name, setName] = useState("IPN 300");
  const [rotated, setRotated] = useState(false);
  const [P, setP] = useState("76");
  const [ex, setEx] = useState("10");
  const [ey, setEy] = useState("20");
  const [sigmaAdm, setSigmaAdm] = useState("14");

  const profile = getProfile(name)!;
  const p = parse(P),
    exv = parse(ex),
    eyv = parse(ey),
    sadm = parse(sigmaAdm);
  const r = eccentricLoad({ profile, rotated, P: p, ex: exv, ey: eyv, sigmaAdm: sadm });

  // drawing: section in mm (x right, y up), scaled so the section and the load point fit
  const halfXmm = r.halfX * 10,
    halfYmm = r.halfY * 10;
  const s = Math.min(200 / Math.max(halfXmm, Math.abs(exv) * 10, 1), 170 / Math.max(halfYmm, Math.abs(eyv) * 10, 1));
  const px = (x: number, y: number): [number, number] => [CX + x * 10 * s, CY - y * 10 * s]; // cm → px
  const hw = halfXmm * s,
    hh = halfYmm * s;
  const outline = sectionOutline(profile, rotated)
    .map(([x, y]) => `${CX + x * s},${CY - y * s}`)
    .join(" ");
  const [lx, ly] = px(exv, eyv);
  const tensionColor = colors.tension,
    compressionColor = colors.compression;
  const col = (v: number) => (v >= 0 ? tensionColor : compressionColor);

  // σ ∝ P·(a + b·x + c·y): split the section by the neutral axis into a tension and a compression half
  const a = 1 / r.A,
    b = exv / r.Iy,
    c = eyv / r.Ix;
  const nn = Math.hypot(b, c);
  const halves: { points: string; color: string }[] = [];
  if (nn < 1e-12) {
    halves.push({ points: outline, color: col(p * a) });
  } else {
    const nx = b / nn,
      ny = c / nn; // unit normal toward σ/P > 0
    const p0: [number, number] = [(-a * nx) / nn, (-a * ny) / nn]; // a point of the line, cm
    const R = 1000;
    const d: [number, number] = [-ny, nx];
    const half = (sign: number) =>
      [
        [p0[0] + d[0] * R, p0[1] + d[1] * R],
        [p0[0] - d[0] * R, p0[1] - d[1] * R],
        [p0[0] - d[0] * R + sign * nx * R, p0[1] - d[1] * R + sign * ny * R],
        [p0[0] + d[0] * R + sign * nx * R, p0[1] + d[1] * R + sign * ny * R],
      ]
        .map(([x, y]) => px(x, y).join(","))
        .join(" ");
    const sgn = p >= 0 ? 1 : -1;
    halves.push({ points: half(1), color: col(sgn) }, { points: half(-1), color: col(-sgn) });
  }

  const labelPos: [number, number, "start" | "end"][] = [
    [hw + 8, -hh - 6, "start"],
    [hw + 8, hh + 14, "start"],
    [-hw - 8, -hh - 6, "end"],
    [-hw - 8, hh + 14, "end"],
  ];
  const k = Number.isFinite(r.Pmax) ? sadm / r.Pmax : 0;
  const c0 = r.critical;

  return (
    <div className="mx-auto grid max-w-6xl gap-6 p-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]" data-testid="eccentric">
      <div className="space-y-4">
        <p className="text-sm text-stone-600 dark:text-stone-400">
          <Sub>{t("ecc.intro")}</Sub>
        </p>

        <section className="space-y-2 rounded border border-stone-200 bg-white p-3 dark:border-stone-700 dark:bg-stone-900">
          <h2 className="text-xs font-bold text-stone-600 uppercase dark:text-stone-300">{t("ecc.inputs")}</h2>
          <label className="flex items-center justify-between gap-3 text-sm">
            <span>{t("prof.profile")}</span>
            <select
              aria-label={t("prof.profile")}
              className="rounded border border-stone-200 bg-white px-2 py-1 text-sm dark:border-stone-600 dark:bg-stone-800"
              value={name}
              onChange={(e) => setName(e.target.value)}
            >
              {PROFILES.map((q) => (
                <option key={q.name} value={q.name}>
                  {q.name}
                </option>
              ))}
            </select>
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={rotated} onChange={(e) => setRotated(e.target.checked)} />
            {t("ecc.rotated")}
          </label>
          <NumField label={t("ecc.p")} value={P} onChange={setP} step={1} />
          <NumField label={t("ecc.ex")} value={ex} onChange={setEx} />
          <NumField label={t("ecc.ey")} value={ey} onChange={setEy} />
          <NumField label={t("ecc.sigma_adm")} value={sigmaAdm} onChange={setSigmaAdm} step={1} />
        </section>

        <section
          className="rounded border border-teal-300 bg-teal-50 p-3 dark:border-teal-700 dark:bg-teal-950"
          data-testid="ecc-pmax-box"
        >
          <h2 className="text-xs font-bold text-teal-800 uppercase dark:text-teal-200">{t("ecc.pmax")}</h2>
          <div className="font-mono text-2xl font-bold text-teal-800 dark:text-teal-200" data-testid="ecc-pmax">
            P<sub>z,max</sub> = {Number.isFinite(r.Pmax) ? r.Pmax.toFixed(2) : "∞"} kN
          </div>
          <div className="mt-1 font-mono text-xs text-stone-600 dark:text-stone-300">
            P<sub>z,max</sub> = σ adm / (1/A + e<sub>y</sub>/W<sub>x</sub> + e<sub>x</sub>/W<sub>y</sub>)
            <br />= {sadm} / ({(1 / r.A).toFixed(5)} + {Math.abs(eyv / r.Wx).toFixed(5)} + {Math.abs(exv / r.Wy).toFixed(5)})
            {Number.isFinite(r.Pmax) && <> = {sadm} / {k.toFixed(5)} cm⁻²</>}
          </div>
        </section>

        <section className="space-y-1 text-xs">
          <h2 className="font-bold text-stone-600 uppercase dark:text-stone-300">{t("ecc.reduction")}</h2>
          <table className="font-mono" data-testid="ecc-forces">
            <tbody>
              <tr>
                <td className="pr-3">N = P<sub>z</sub></td>
                <td className="pr-2 text-right">{f2(r.N)}</td>
                <td>kN</td>
              </tr>
              <tr>
                <td className="pr-3">M<sub>x</sub> = P<sub>z</sub>·e<sub>y</sub></td>
                <td className="pr-2 text-right">{f2(r.Mx / 100)}</td>
                <td>kN·m</td>
              </tr>
              <tr>
                <td className="pr-3">M<sub>y</sub> = P<sub>z</sub>·e<sub>x</sub></td>
                <td className="pr-2 text-right">{f2(r.My / 100)}</td>
                <td>kN·m</td>
              </tr>
            </tbody>
          </table>
          <p className="font-mono text-stone-500 dark:text-stone-400">
            A = {r.A} cm² · I<sub>x</sub> = {r.Ix} cm⁴ · W<sub>x</sub> = {r.Wx.toFixed(1)} cm³ · I<sub>y</sub> = {r.Iy} cm⁴ ·
            W<sub>y</sub> = {r.Wy.toFixed(1)} cm³
          </p>
        </section>

        <section className="space-y-1 text-xs">
          <h2 className="font-bold text-stone-600 uppercase dark:text-stone-300">{t("ecc.corners")}</h2>
          <table className="font-mono" data-testid="ecc-corners">
            <thead>
              <tr className="text-stone-500">
                <th className="pr-2 text-left">{t("ecc.corner")} (x, y)</th>
                <th className="px-1">N</th>
                <th className="px-1">M<sub>x</sub></th>
                <th className="px-1">M<sub>y</sub></th>
                <th className="px-1">Σ</th>
              </tr>
            </thead>
            <tbody>
              {r.corners.map((q, i) => (
                <tr key={i} className={q === c0 ? "font-bold" : ""}>
                  <td className="pr-2">
                    ({q.x > 0 ? "+" : "−"}, {q.y > 0 ? "+" : "−"})
                  </td>
                  <td className="px-1 text-right">{f2(q.sN)}</td>
                  <td className="px-1 text-right">{f2(q.sMx)}</td>
                  <td className="px-1 text-right">{f2(q.sMy)}</td>
                  <td className="px-1 text-right">{f2(q.sigma)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p
            data-testid="ecc-check"
            className={`font-mono ${r.ok ? "text-emerald-700 dark:text-emerald-400" : "text-red-600"}`}
          >
            <Sub>{t("ecc.check")}</Sub>: |σ| = {Math.abs(c0.sigma).toFixed(2)} {r.ok ? "≤" : ">"} σ adm = {sadm} kN/cm² →{" "}
            {r.ok ? "✓" : "✗"} ({Number.isFinite(r.ratio) ? (r.ratio * 100).toFixed(0) : "∞"} %)
          </p>
        </section>
      </div>

      <div className="space-y-2">
        <svg
          width="100%"
          viewBox={`0 0 ${W} ${H}`}
          style={{ background: colors.paper, maxWidth: W }}
          data-testid="ecc-svg"
        >
          <defs>
            <clipPath id="ecc-section-clip">
              <polygon points={outline} />
            </clipPath>
          </defs>
          <g clipPath="url(#ecc-section-clip)" data-testid="ecc-zones">
            {halves.map((h, i) => (
              <polygon key={i} points={h.points} fill={h.color} fillOpacity={0.4} />
            ))}
          </g>
          <polygon points={outline} fill="none" stroke={colors.ink} strokeWidth={1.5} />

          {/* centroidal axes */}
          <g stroke={colors.dimensions} fill={colors.dimensions} fontSize={12} fontStyle="italic">
            <line x1={CX - hw - 20} y1={CY} x2={W - 20} y2={CY} strokeDasharray="8 3 2 3" />
            <line x1={CX} y1={CY + hh + 20} x2={CX} y2={20} strokeDasharray="8 3 2 3" />
            <text x={W - 16} y={CY - 6} stroke="none">
              x
            </text>
            <text x={CX + 8} y={30} stroke="none">
              y
            </text>
          </g>

          {/* neutral axis */}
          {r.neutral && (
            <g data-testid="ecc-neutral">
              <line
                x1={px(...r.neutral[0])[0]}
                y1={px(...r.neutral[0])[1]}
                x2={px(...r.neutral[1])[0]}
                y2={px(...r.neutral[1])[1]}
                stroke="#ca8a04"
                strokeWidth={2}
                strokeDasharray="7 4"
              />
              <text x={px(...r.neutral[1])[0] + 6} y={px(...r.neutral[1])[1] - 4} fontSize={11} fill="#a16207">
                {t("ecc.neutral")}
              </text>
            </g>
          )}

          {/* eccentricities: centroid → (e_x, 0) → load point */}
          <g stroke={colors.dimensions} fill={colors.dimensions} fontSize={11}>
            <polyline points={`${CX},${CY} ${lx},${CY} ${lx},${ly}`} fill="none" strokeDasharray="3 3" />
            <text x={(CX + lx) / 2} y={CY + 14} textAnchor="middle" stroke="none">
              e<tspan fontSize={9} dy={3}>x</tspan>
              <tspan dy={-3}> = {f2(exv)} cm</tspan>
            </text>
            <text x={lx + 6} y={(CY + ly) / 2} stroke="none">
              e<tspan fontSize={9} dy={3}>y</tspan>
              <tspan dy={-3}> = {f2(eyv)} cm</tspan>
            </text>
          </g>
          <circle cx={CX} cy={CY} r={3.5} fill={colors.ink} />

          {/* corner totals */}
          {r.corners.map((q, i) => {
            const [ox, oy, anchor] = labelPos[i];
            const [cx, cy] = px(q.x, q.y);
            return (
              <g key={i}>
                <circle cx={cx} cy={cy} r={3} fill={col(q.sigma)} />
                <text
                  data-testid={`ecc-corner-${i}`}
                  x={CX + ox}
                  y={CY + oy}
                  textAnchor={anchor}
                  fontSize={12}
                  fontFamily="monospace"
                  fontWeight={700}
                  fill={col(q.sigma)}
                  style={{ paintOrder: "stroke", stroke: "#fff", strokeWidth: 3 }}
                >
                  {q.sigma >= 0 ? "+" : ""}
                  {f2(q.sigma)}
                </text>
              </g>
            );
          })}

          {/* load point: ⊙ tension (toward the viewer), ⊗ compression */}
          <g stroke={colors.loads} fill={colors.loads} data-testid="ecc-load">
            <circle cx={lx} cy={ly} r={9} fill="#ffffff" strokeWidth={2} />
            {p >= 0 ? (
              <circle cx={lx} cy={ly} r={3} stroke="none" />
            ) : (
              <>
                <line x1={lx - 5} y1={ly - 5} x2={lx + 5} y2={ly + 5} strokeWidth={2} />
                <line x1={lx - 5} y1={ly + 5} x2={lx + 5} y2={ly - 5} strokeWidth={2} />
              </>
            )}
            <text x={lx + 14} y={ly - 10} stroke="none" fontSize={12} fontWeight={700}>
              P<tspan fontSize={9} dy={3}>z</tspan>
              <tspan dy={-3}> = {f2(Math.abs(p))} kN</tspan>
            </text>
          </g>
        </svg>

        <div className="flex gap-4 text-xs">
          <span className="flex items-center gap-1">
            <i className="inline-block h-3 w-3" style={{ background: tensionColor, opacity: 0.6 }} />
            {t("ecc.tension")}
          </span>
          <span className="flex items-center gap-1">
            <i className="inline-block h-3 w-3" style={{ background: compressionColor, opacity: 0.6 }} />
            {t("ecc.compression")}
          </span>
        </div>
        <p className="text-xs text-stone-500 dark:text-stone-400">
          <Sub>{t("ecc.section_note")}</Sub>
        </p>
        {!r.inside && (
          <p
            className="rounded border border-amber-300 bg-amber-50 p-2 text-xs text-amber-900 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-200"
            data-testid="ecc-outside"
          >
            <Sub>{t("ecc.outside")}</Sub>
          </p>
        )}
      </div>
    </div>
  );
}
