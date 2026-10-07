"use client";

import React from "react";
import { FrameModel3D } from "@/lib/types3d";
import { SolveOutput3D } from "@/lib/solve3d";
import { StressResult } from "@/lib/stress3d";
import { cutAt, nearestStation, sectionOutline, SectionCutData } from "@/lib/sectionCut";
import { useColors } from "@/contexts/ColorContext";
import { useLanguage } from "@/contexts/LanguageContext";

export interface CutState {
  on: boolean;
  member: string; // "" = first member with a profile
  t: number; // 0..1 along the member's z axis
}

const W = 560,
  H = 400;
const CX = 270,
  CY = 170;
const f1 = (v: number) => (Math.abs(v) < 0.005 ? "0.00" : v.toFixed(2));

// Resolved cut: member index and station for the current state.
export function resolveCut(model: FrameModel3D, solved: SolveOutput3D | null, cut: CutState) {
  if (!solved) return null;
  let e = model.members.findIndex((m) => m.id === cut.member);
  if (e < 0 || !model.members[e].profile) e = model.members.findIndex((m) => !!m.profile);
  if (e < 0) return null;
  const L = solved.result.geo[e].L;
  const station = nearestStation(solved, e, cut.t * L); // t runs along the member's z axis
  return { e, L, station };
}

// "Z"-shaped linear stress diagram along one axis (a = value at the + end, −a at the − end).
function Bowtie({
  vertical,
  origin,
  half,
  a,
  scale,
  pos,
  neg,
  testId,
}: {
  vertical: boolean;
  origin: [number, number];
  half: number; // px, half the extent along the axis
  a: number; // σ at the + end (up for vertical, right for horizontal), kN/cm²
  scale: number; // px per kN/cm²
  pos: string;
  neg: string;
  testId: string;
}) {
  const d = a * scale;
  // point at axis coordinate u (−half..half) with stress offset v (px) on the screen
  const P = (u: number, v: number): string =>
    vertical ? `${origin[0] + v},${origin[1] - u}` : `${origin[0] + u},${origin[1] + v}`;
  const top = a >= 0 ? pos : neg,
    bottom = a >= 0 ? neg : pos;
  return (
    <g data-testid={testId}>
      <polygon points={`${P(half, 0)} ${P(half, d)} ${P(0, 0)}`} fill={top} fillOpacity={0.45} stroke={top} />
      <polygon points={`${P(-half, 0)} ${P(-half, -d)} ${P(0, 0)}`} fill={bottom} fillOpacity={0.45} stroke={bottom} />
      <line
        x1={vertical ? origin[0] : origin[0] - half}
        y1={vertical ? origin[1] - half : origin[1]}
        x2={vertical ? origin[0] : origin[0] + half}
        y2={vertical ? origin[1] + half : origin[1]}
        stroke="#78716c"
        strokeWidth={1}
      />
    </g>
  );
}

const sg = (v: number, d = 2) => `${v < 0 ? "−" : "+"} ${Math.abs(v).toFixed(d)}`;
const num = (v: number, d = 2) => (v < 0 ? `(${v.toFixed(d)})` : v.toFixed(d));

// The verification written out with the numbers of the critical corner (kN and cm).
function CheckEquation({ data, sigmaAdm }: { data: SectionCutData; sigmaAdm: number }) {
  const { t } = useLanguage();
  const c = data.critical;
  const A = data.A * 1e4, // cm²
    Ix = data.Ix * 1e8, // cm⁴
    Iy = data.Iy * 1e8;
  const Mx = data.Mx * 100, // kN·cm
    My = data.My * 100;
  const x = c.x * 100,
    y = c.y * 100; // cm
  const ratio = sigmaAdm > 0 ? Math.abs(c.sigma) / sigmaAdm : Infinity;
  const ok = ratio <= 1;
  return (
    <div
      className="rounded border border-stone-200 bg-stone-50 p-2 font-mono text-xs leading-relaxed dark:border-stone-700 dark:bg-stone-800"
      data-testid="cut-equation"
    >
      <div className="mb-1 font-sans font-bold text-stone-600 uppercase dark:text-stone-300">
        {t("f3d.cut.check")}
      </div>
      <div>σ = N/A + Mx·y/Ix + My·x/Iy ≤ σ adm</div>
      <div>
        σ = {num(data.N)}/{A.toFixed(1)} + {num(Mx)}·{num(y, 1)}/{Ix.toFixed(0)} + {num(My)}·{num(x, 1)}/
        {Iy.toFixed(0)}
      </div>
      <div data-testid="cut-equation-terms">
        σ = {c.sN.toFixed(2)} {sg(c.sMx)} {sg(c.sMy)} = {c.sigma.toFixed(2)} kN/cm²
      </div>
      <div data-testid="cut-equation-result" className={ok ? "text-emerald-700 dark:text-emerald-400" : "text-red-600"}>
        |σ| = {Math.abs(c.sigma).toFixed(2)} {ok ? "≤" : ">"} σ adm = {sigmaAdm} kN/cm² → {ok ? "✓" : "✗"} (
        {(ratio * 100).toFixed(0)} %)
      </div>
      <div className="font-sans text-stone-500 dark:text-stone-400">
        N [kN], M [kN·cm], A [cm²], I [cm⁴], x, y [cm]
      </div>
    </div>
  );
}

export default function SectionCut({
  model,
  solved,
  stress,
  cut,
  onChange,
}: {
  model: FrameModel3D;
  solved: SolveOutput3D | null;
  stress: StressResult | null;
  cut: CutState;
  onChange: (c: CutState) => void;
}) {
  const { t } = useLanguage();
  const colors = useColors();
  const r = resolveCut(model, solved, cut);
  const withProfile = model.members.filter((m) => m.profile);
  if (!solved || !solved.result.stable || !r)
    return (
      <p className="p-3 text-sm text-stone-500 dark:text-stone-400" data-testid="section-cut">
        {t("f3d.cut.no_profile")}
      </p>
    );
  const data = cutAt(model, solved, r.e, r.station)!;
  const member = model.members[r.e];
  const p = data.profile;

  // scale of the section drawing and of the stress diagrams
  const wMm = data.rotated ? p.h : p.bf,
    hMm = data.rotated ? p.bf : p.h;
  const s = 190 / Math.max(wMm, hMm);
  const hw = (wMm / 2) * s,
    hh = (hMm / 2) * s; // half extents in px
  const toPx = (x: number, y: number): [number, number] => [CX + x * 1000 * s, CY - y * 1000 * s];
  const maxContrib = Math.max(
    1e-9,
    ...data.corners.flatMap((c) => [Math.abs(c.sN), Math.abs(c.sMx), Math.abs(c.sMy)]),
  );
  const ps = 55 / maxContrib;
  const pos = colors.tension,
    neg = colors.compression;
  const col = (v: number) => (v >= 0 ? pos : neg);
  const ccorner = data.corners[0]; // (+x, +y)
  const outline = sectionOutline(p, data.rotated)
    .map(([x, y]) => `${CX + x * s},${CY - y * s}`)
    .join(" ");
  const labelPos: [number, number, "start" | "end"][] = [
    [hw + 8, -hh - 6, "start"],
    [hw + 8, hh + 14, "start"],
    [-hw - 8, -hh - 6, "end"],
    [-hw - 8, hh + 14, "end"],
  ];
  const stationsOf = solved.stations[r.e];
  const zVal = stationsOf[r.station].z;
  const peakT = stress?.[r.e] ? stress[r.e]!.max.z / r.L : 0;

  return (
    <div className="space-y-2" data-testid="section-cut">
      <div className="flex flex-wrap items-center gap-3 text-sm">
        <label className="flex items-center gap-1">
          {t("f3d.cut.member")}
          <select
            aria-label="cut member"
            className="rounded border border-stone-200 bg-white px-1 py-0.5 text-xs dark:border-stone-600 dark:bg-stone-800"
            value={member.id}
            onChange={(e) => onChange({ ...cut, member: e.target.value })}
          >
            {withProfile.map((m) => (
              <option key={m.id} value={m.id}>
                {m.id} ({m.profile})
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-1 items-center gap-2">
          <span className="font-mono text-xs whitespace-nowrap" data-testid="cut-x">
            z = {zVal.toFixed(2)} / {r.L.toFixed(2)} m
          </span>
          <input
            type="range"
            aria-label="cut position"
            className="min-w-32 flex-1"
            min={0}
            max={1}
            step={0.005}
            value={cut.t}
            onChange={(e) => onChange({ ...cut, t: parseFloat(e.target.value) })}
          />
        </label>
        <button
          type="button"
          className="rounded border border-stone-200 bg-stone-100 px-2 py-0.5 text-xs hover:bg-stone-200 dark:border-stone-600 dark:bg-stone-800 dark:hover:bg-stone-700"
          onClick={() => onChange({ ...cut, member: member.id, t: peakT })}
        >
          {t("f3d.cut.peak")}
        </button>
      </div>

      <svg
        width="100%"
        viewBox={`0 0 ${W} ${H}`}
        style={{ background: colors.paper, maxWidth: W }}
        data-testid="section-cut-svg"
      >
        {/* σ from N: uniform */}
        <g data-testid="cut-diagram-N">
          <text x={CX - hw - 95} y={CY - hh - 14} fontSize={11} fill={colors.ink}>
            σ(N)
          </text>
          <rect
            x={Math.min(CX - hw - 70, CX - hw - 70 + ccorner.sN * ps)}
            y={CY - hh}
            width={Math.abs(ccorner.sN * ps)}
            height={2 * hh}
            fill={col(ccorner.sN)}
            fillOpacity={0.45}
            stroke={col(ccorner.sN)}
          />
          <line x1={CX - hw - 70} y1={CY - hh} x2={CX - hw - 70} y2={CY + hh} stroke="#78716c" />
        </g>

        {/* section */}
        <polygon points={outline} fill="#e7e5e4" stroke={colors.ink} strokeWidth={1.5} />
        <line x1={CX - hw - 14} y1={CY} x2={CX + hw + 14} y2={CY} stroke="#a8a29e" strokeDasharray="4 3" />
        <line x1={CX} y1={CY - hh - 14} x2={CX} y2={CY + hh + 14} stroke="#a8a29e" strokeDasharray="4 3" />

        {/* neutral axis */}
        {data.neutral && (
          <g data-testid="cut-neutral">
            <line
              x1={toPx(...data.neutral[0])[0]}
              y1={toPx(...data.neutral[0])[1]}
              x2={toPx(...data.neutral[1])[0]}
              y2={toPx(...data.neutral[1])[1]}
              stroke="#ca8a04"
              strokeWidth={2}
              strokeDasharray="7 4"
            />
            <text
              x={toPx(...data.neutral[1])[0] + 6}
              y={toPx(...data.neutral[1])[1] - 4}
              fontSize={10}
              fill="#a16207"
            >
              {t("f3d.cut.neutral")}
            </text>
          </g>
        )}

        {/* axes: x right, y up, z into the page (left-handed triad, z along the member) */}
        <g stroke={colors.dimensions} fill={colors.dimensions} fontSize={11} fontWeight={600}>
          <line x1={CX} y1={CY} x2={CX + hw + 40} y2={CY} />
          <polygon points={`${CX + hw + 48},${CY} ${CX + hw + 40},${CY - 3} ${CX + hw + 40},${CY + 3}`} stroke="none" />
          <text x={CX + hw + 52} y={CY - 6} stroke="none">
            x
          </text>
          <line x1={CX} y1={CY} x2={CX} y2={CY - hh - 40} />
          <polygon points={`${CX},${CY - hh - 48} ${CX - 3},${CY - hh - 40} ${CX + 3},${CY - hh - 40}`} stroke="none" />
          <text x={CX + 6} y={CY - hh - 44} stroke="none">
            y
          </text>
          <circle cx={CX} cy={CY} r={5} fill="none" />
          <line x1={CX - 3.5} y1={CY - 3.5} x2={CX + 3.5} y2={CY + 3.5} />
          <line x1={CX - 3.5} y1={CY + 3.5} x2={CX + 3.5} y2={CY - 3.5} />
          <text x={CX - 16} y={CY + 16} stroke="none">
            z
          </text>
        </g>

        {/* corner totals */}
        {data.corners.map((c, i) => {
          const [lx, ly, anchor] = labelPos[i];
          const [px, py] = toPx(c.x, c.y);
          return (
            <g key={i}>
              <circle cx={px} cy={py} r={3} fill={col(c.sigma)} />
              <text
                data-testid={`cut-corner-${i}`}
                x={CX + lx}
                y={CY + ly}
                textAnchor={anchor}
                fontSize={12}
                fontFamily="monospace"
                fontWeight={700}
                fill={col(c.sigma)}
                style={{ paintOrder: "stroke", stroke: "#fff", strokeWidth: 3 }}
              >
                {c.sigma >= 0 ? "+" : ""}
                {f1(c.sigma)}
              </text>
            </g>
          );
        })}

        {/* σ from Mx: varies along y, vertical "Z" on the right */}
        <text x={CX + hw + 78} y={CY - hh - 14} fontSize={11} fill={colors.ink}>
          σ(Mx)
        </text>
        <Bowtie
          vertical
          origin={[CX + hw + 100, CY]}
          half={hh}
          a={ccorner.sMx}
          scale={ps}
          pos={pos}
          neg={neg}
          testId="cut-diagram-Mx"
        />
        <text x={CX + hw + 100 + ccorner.sMx * ps + (ccorner.sMx >= 0 ? 4 : -4)} y={CY - hh + 4} fontSize={10} fontFamily="monospace" textAnchor={ccorner.sMx >= 0 ? "start" : "end"} fill={col(ccorner.sMx)}>
          {f1(ccorner.sMx)}
        </text>

        {/* σ from My: varies along x, horizontal "Z" below */}
        <text x={CX - hw} y={CY + hh + 54} fontSize={11} fill={colors.ink}>
          σ(My)
        </text>
        <Bowtie
          vertical={false}
          origin={[CX, CY + hh + 85]}
          half={hw}
          a={ccorner.sMy}
          scale={ps}
          pos={pos}
          neg={neg}
          testId="cut-diagram-My"
        />
        <text x={CX + hw + 6} y={CY + hh + 85 + ccorner.sMy * ps + 4} fontSize={10} fontFamily="monospace" fill={col(ccorner.sMy)}>
          {f1(ccorner.sMy)}
        </text>
      </svg>

      <p className="text-xs text-stone-500 dark:text-stone-400">{t("f3d.cut.view_note")}</p>

      <CheckEquation data={data} sigmaAdm={model.sigmaAdm} />

      <div className="grid gap-3 text-xs sm:grid-cols-2">
        <div>
          <h4 className="mb-1 font-bold uppercase text-stone-600 dark:text-stone-300">{t("f3d.cut.forces")}</h4>
          <table className="font-mono" data-testid="cut-forces">
            <tbody>
              {(
                [
                  ["N", data.N, model.unit],
                  ["Mx", data.Mx, `${model.unit}·m`],
                  ["My", data.My, `${model.unit}·m`],
                  ["T", data.T, `${model.unit}·m`],
                  ["Qx", data.Qx, model.unit],
                  ["Qy", data.Qy, model.unit],
                ] as [string, number, string][]
              ).map(([k, v, u]) => (
                <tr key={k}>
                  <td className="pr-3">{k}</td>
                  <td className="pr-2 text-right">{v.toFixed(2)}</td>
                  <td>{u}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div>
          <h4 className="mb-1 font-bold uppercase text-stone-600 dark:text-stone-300">σ (kN/cm²)</h4>
          <table className="font-mono" data-testid="cut-corners">
            <thead>
              <tr className="text-stone-500">
                <th className="pr-2 text-left">{t("f3d.cut.corner")} (x, y)</th>
                <th className="px-1">N</th>
                <th className="px-1">Mx</th>
                <th className="px-1">My</th>
                <th className="px-1">Σ</th>
              </tr>
            </thead>
            <tbody>
              {data.corners.map((c, i) => (
                <tr key={i}>
                  <td className="pr-2">
                    ({c.x > 0 ? "+" : "−"}, {c.y > 0 ? "+" : "−"})
                  </td>
                  <td className="px-1 text-right">{f1(c.sN)}</td>
                  <td className="px-1 text-right">{f1(c.sMx)}</td>
                  <td className="px-1 text-right">{f1(c.sMy)}</td>
                  <td className="px-1 text-right font-bold">{f1(c.sigma)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
