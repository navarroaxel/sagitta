"use client";

import React from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Sub, SvgSub, plain } from "@/components/Sub";
import { Eq, Figure, GuidePage, Para, Section } from "@/components/guide/GuideBits";
import JourawskiSteps from "@/components/JourawskiSteps";
import { tauIFlange, tauIWeb, tauRect, tauRectMax, type ISection } from "@/lib/shear";

const INK = "#16232E";
const SHEAR = "#3A6B8C";

const LOADC = "#C0392B";
const TEAL = "#0B8A8A";

// Cauchy: the four shear arrows of a small element; the pairs meet at the top-right edge.
function CauchySVG() {
  const { t } = useLanguage();
  const arrow = (x1: number, y1: number, x2: number, y2: number) => (
    <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={LOADC} strokeWidth="2.5" markerEnd="url(#shr-arr-a)" />
  );
  return (
    <svg viewBox="0 0 240 180" className="h-auto w-full" role="img" aria-label={plain(t("shr.s2.fig"))}>
      <defs>
        <marker id="shr-arr-a" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" fill={LOADC} />
        </marker>
      </defs>
      <rect x="80" y="45" width="80" height="80" fill={TEAL} fillOpacity="0.12" stroke={INK} strokeWidth="1.5" />
      {arrow(95, 38, 145, 38)}
      {arrow(145, 132, 95, 132)}
      {arrow(168, 110, 168, 60)}
      {arrow(72, 60, 72, 110)}
      <circle cx="160" cy="45" r="3" fill={INK} />
      <text x="120" y="29" fontSize="12" textAnchor="middle" fill={INK}><SvgSub>τ_yx</SvgSub></text>
      <text x="120" y="152" fontSize="12" textAnchor="middle" fill={INK}><SvgSub>τ_yx</SvgSub></text>
      <text x="184" y="88" fontSize="12" fill={INK}><SvgSub>τ_xy</SvgSub></text>
      <text x="58" y="88" fontSize="12" textAnchor="end" fill={INK}><SvgSub>τ_xy</SvgSub></text>
    </svg>
  );
}

// Jourawski: slice dx between sections 1 and 2 in oblique (cabinet) perspective, x along the beam, y up, depth up-right.
// The horizontal cut leaves the part Ω on top; its force dN is balanced by dT on the cut surface.
function SliceSVG() {
  const { t } = useLanguage();
  const tick = (x: number) => <line x1={x} y1="164" x2={x} y2="176" stroke={INK} strokeWidth="1.5" />;
  const force = (x1: number, y1: number, x2: number, y2: number) => (
    <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={LOADC} strokeWidth="2.5" markerEnd="url(#shr-arr-b)" />
  );
  return (
    <svg viewBox="0 0 360 195" className="h-auto w-full" role="img" aria-label={plain(t("shr.s3.fig"))}>
      <defs>
        <marker id="shr-arr-b" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" fill={LOADC} />
        </marker>
      </defs>
      {/* hidden edges */}
      <g stroke={INK} strokeWidth="1" strokeDasharray="3 3" fill="none" opacity="0.5">
        <line x1="106" y1="24" x2="106" y2="124" />
        <line x1="106" y1="124" x2="246" y2="124" />
        <line x1="70" y1="150" x2="106" y2="124" />
      </g>
      {/* part Ω: front, top and right strips above the cut */}
      <polygon points="70,50 210,50 210,80 70,80" fill={TEAL} fillOpacity="0.2" />
      <polygon points="210,50 246,24 246,54 210,80" fill={TEAL} fillOpacity="0.3" />
      <polygon points="70,50 210,50 246,24 106,24" fill={TEAL} fillOpacity="0.1" />
      {/* the cut surface, inside the block */}
      <polygon points="70,80 210,80 246,54 106,54" fill={TEAL} fillOpacity="0.28" stroke={INK} strokeWidth="1" strokeDasharray="2 2" />
      {/* visible faces */}
      <rect x="70" y="50" width="140" height="100" fill="none" stroke={INK} strokeWidth="1.5" />
      <polygon points="70,50 210,50 246,24 106,24" fill="none" stroke={INK} strokeWidth="1.5" />
      <polygon points="210,50 246,24 246,124 210,150" fill="none" stroke={INK} strokeWidth="1.5" />
      <line x1="70" y1="110" x2="210" y2="110" stroke={INK} strokeWidth="1" strokeDasharray="5 3" />
      {/* N on section 1 (left, hidden face) and N + dN on section 2 (right face) over Ω */}
      {force(47, 57, 81, 57)}
      {force(61, 47, 95, 47)}
      {force(265, 57, 221, 57)}
      {force(279, 47, 235, 47)}
      {/* dT on the cut surface, opposite to dN */}
      {force(126, 67, 196, 67)}
      <line x1="200" y1="80" x2="200" y2="110" stroke={INK} strokeWidth="1" />
      <line x1="196" y1="80" x2="204" y2="80" stroke={INK} strokeWidth="1" />
      <line x1="196" y1="110" x2="204" y2="110" stroke={INK} strokeWidth="1" />
      <line x1="70" y1="164" x2="210" y2="164" stroke={INK} strokeWidth="1" />
      {tick(70)}
      {tick(210)}
      <text x="106" y="14" fontSize="12" textAnchor="middle" fill={INK}>1</text>
      <text x="246" y="14" fontSize="12" textAnchor="middle" fill={INK}>2</text>
      <text x="100" y="74" fontSize="12" textAnchor="middle" fill={INK}>Ω</text>
      <text x="40" y="52" fontSize="12" textAnchor="end" fill={INK}>N</text>
      <text x="284" y="51" fontSize="12" fill={INK}>N + dN</text>
      <text x="160" y="77" fontSize="11" textAnchor="middle" fill={LOADC}>dT</text>
      <text x="208" y="99" fontSize="12" fill={INK}>y</text>
      <text x="64" y="114" fontSize="11" textAnchor="end" fill={INK}>E.N.</text>
      <text x="140" y="188" fontSize="12" textAnchor="middle" fill={INK}>dx</text>
    </svg>
  );
}

// Rectangle with the parabolic τ(y) drawn from the shared formula.
function RectSVG() {
  const { t } = useLanguage();
  const b = 10;
  const h = 20;
  const top = 20;
  const H = 140;
  const tmax = tauRectMax(1, b, h);
  const pts: string[] = [];
  for (let i = 0; i <= 40; i++) {
    const y = h / 2 - (i / 40) * h;
    pts.push(`${(130 + (tauRect(1, b, h, y) / tmax) * 70).toFixed(1)},${(top + (i / 40) * H).toFixed(1)}`);
  }
  return (
    <svg viewBox="0 0 240 180" className="h-auto w-full" role="img" aria-label={plain(t("shr.s4.fig"))}>
      <rect x="40" y={top} width="70" height={H} fill="#E7EEF2" stroke={INK} strokeWidth="2" />
      <line x1="30" y1={top + H / 2} x2="215" y2={top + H / 2} stroke={INK} strokeWidth="1.2" strokeDasharray="3 3" />
      <polygon points={`130,${top} ${pts.join(" ")} 130,${top + H}`} fill={SHEAR} opacity="0.3" stroke={SHEAR} strokeWidth="1.8" />
      <line x1="130" y1={top - 6} x2="130" y2={top + H + 6} stroke={INK} strokeWidth="1" />
      <text x="202" y={top + H / 2 - 6} fontSize="12" fill={INK}><SvgSub>τ_max</SvgSub></text>
      <text x="26" y={top + H / 2 - 6} fontSize="12" fill={INK} textAnchor="end" fontStyle="italic">G</text>
      <text x="76" y="172" fontSize="12" textAnchor="middle" fill={INK} fontStyle="italic">b</text>
    </svg>
  );
}

// Double-T with τ drawn from the formulas of the notes (jump at the web–flange junction).
function IProfileSVG() {
  const { t } = useLanguage();
  const s: ISection = { b: 20, h: 30, h0: 26.8, tw: 1.1 };
  const k = 5; // px per cm
  const cy = 90;
  const cx = 70;
  const tmax = tauIWeb(1, s, 0);
  const x = (v: number) => 150 + (v / tmax) * 60;
  // Sample each piece with its own formula and include BOTH sides of the web–flange boundaries, so the
  // discontinuity (a jump by b/tw) is drawn as a vertical step instead of a ramp.
  const seg = (y0: number, y1: number, f: (y: number) => number, n: number) =>
    Array.from({ length: n + 1 }, (_, i) => {
      const y = y0 + ((y1 - y0) * i) / n;
      return [y, f(y)] as const;
    });
  const flange = (y: number) => tauIFlange(1, s, y);
  const web = (y: number) => tauIWeb(1, s, y);
  const samples = [
    ...seg(s.h / 2, s.h0 / 2, flange, 8),
    ...seg(s.h0 / 2, -s.h0 / 2, web, 40),
    ...seg(-s.h0 / 2, -s.h / 2, flange, 8),
  ];
  const poly = samples.map(([y, v]) => `${x(v).toFixed(1)},${(cy - y * k).toFixed(1)}`).join(" ");
  const fl = ((s.h - s.h0) / 2) * k;
  return (
    <svg viewBox="0 0 240 180" className="h-auto w-full" role="img" aria-label={plain(t("shr.s5.fig"))}>
      <rect x={cx - (s.b * k) / 2} y={cy - (s.h * k) / 2} width={s.b * k} height={fl} fill="#E7EEF2" stroke={INK} strokeWidth="1.8" />
      <rect x={cx - (s.b * k) / 2} y={cy + (s.h * k) / 2 - fl} width={s.b * k} height={fl} fill="#E7EEF2" stroke={INK} strokeWidth="1.8" />
      <rect x={cx - (s.tw * k) / 2} y={cy - (s.h0 * k) / 2} width={s.tw * k} height={s.h0 * k} fill="#E7EEF2" stroke={INK} strokeWidth="1.8" />
      <line x1="20" y1={cy} x2="225" y2={cy} stroke={INK} strokeWidth="1.2" strokeDasharray="3 3" />
      <polygon points={`150,${cy - (s.h * k) / 2} ${poly} 150,${cy + (s.h * k) / 2}`} fill={SHEAR} opacity="0.3" stroke={SHEAR} strokeWidth="1.8" />
      <line x1="150" y1={cy - (s.h * k) / 2 - 4} x2="150" y2={cy + (s.h * k) / 2 + 4} stroke={INK} strokeWidth="1" />
      <text x="212" y={cy - 6} fontSize="12" fill={INK}><SvgSub>τ_max</SvgSub></text>
    </svg>
  );
}

export default function CorteEnFlexionPage() {
  const { t } = useLanguage();
  return (
    <GuidePage title="shr.title" kicker="Q · S_x · J_x · τ" lead="shr.lead" footer="shr.footer">
      <Section kicker="shr.s1.kicker" title="shr.s1.title">
        <Para k="shr.s1.p1" />
        <Eq boxed>{"τ = {Q} / {A}"}</Eq>
        <Para k="shr.s1.p2" />
      </Section>

      <Section kicker="shr.s2.kicker" title="shr.s2.title">
        <Para k="shr.s2.p1" />
        <Eq>{t("shr.s2.e1")}</Eq>
        <div className="mx-auto max-w-xs">
          <Figure caption={<Sub>{t("shr.s2.fig")}</Sub>}>
            <CauchySVG />
          </Figure>
        </div>
        <Para k="shr.s2.p2" />
        <Para k="shr.s2.p3" />
      </Section>

      <Section kicker="shr.s3.kicker" title="shr.s3.title">
        <Para k="shr.s3.p1" />
        <JourawskiSteps />
        <Para k="shr.s3.p2" />
        <div className="mx-auto max-w-md">
          <Figure caption={<Sub>{t("shr.s3.fig")}</Sub>}>
            <SliceSVG />
          </Figure>
        </div>
        <Eq>{t("shr.s3.e1")}</Eq>
        <Para k="shr.s3.p3" />
        <Eq>{t("shr.s3.e2")}</Eq>
        <Para k="shr.s3.p4" />
        <Eq boxed>{"τ_m = {Q}·{S}_x / ({J}_x·s)"}</Eq>
        <Para k="shr.s3.p5" />
      </Section>

      <Section kicker="shr.s4.kicker" title="shr.s4.title">
        <Para k="shr.s4.p1" />
        <Eq boxed>{"τ_zy = (3/2)·{Q}/({b}·{h})·[1 − (2{y}/{h})²]"}</Eq>
        <Para k="shr.s4.p2" />
        <Eq boxed>{"τ_max = 3·{Q} / (2·{b}·{h}) = 1,5·{Q}/{A}"}</Eq>
        <Para k="shr.s4.p3" />
        <div className="mx-auto max-w-xs">
          <Figure caption={<Sub>{t("shr.s4.fig")}</Sub>}>
            <RectSVG />
          </Figure>
        </div>
        <p data-testid="shr-rect-example" className="mb-4 max-w-[66ch] rounded-md bg-stone-100 px-4 py-2 font-mono text-[14px] dark:bg-stone-900">
          <Sub>{t("shr.s4.ex")}</Sub>
        </p>
      </Section>

      <Section kicker="shr.s5.kicker" title="shr.s5.title">
        <Para k="shr.s5.p1" />
        <p className="mb-1 text-sm font-semibold">{t("shr.s5.flange")}</p>
        <Eq boxed>{"τ = {Q}/(2·{J}_x) · ({h}²/4 − {y}²)"}</Eq>
        <p className="mb-1 text-sm font-semibold">{t("shr.s5.web")}</p>
        <Eq boxed>{"τ = {Q}/(2·δ_1·{J}_x) · [ {b}/4·({h}² − {h}_0²) + δ_1·({h}_0²/4 − {y}²) ]"}</Eq>
        <Para k="shr.s5.p2" />
        <div className="mx-auto max-w-xs">
          <Figure caption={<Sub>{t("shr.s5.fig")}</Sub>}>
            <IProfileSVG />
          </Figure>
        </div>
      </Section>
    </GuidePage>
  );
}
