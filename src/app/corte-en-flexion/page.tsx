"use client";

import React from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { SvgSub } from "@/components/Sub";
import { Eq, Figure, GuidePage, Para, Section } from "@/components/guide/GuideBits";
import { tauIFlange, tauIWeb, tauRect, tauRectMax, type ISection } from "@/lib/shear";

const INK = "#16232E";
const SHEAR = "#3A6B8C";

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
    <svg viewBox="0 0 240 180" className="h-auto w-full" role="img" aria-label={t("shr.s4.fig")}>
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
    <svg viewBox="0 0 240 180" className="h-auto w-full" role="img" aria-label={t("shr.s5.fig")}>
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
        <Eq boxed>τ = Q / A</Eq>
        <Para k="shr.s1.p2" />
      </Section>

      <Section kicker="shr.s2.kicker" title="shr.s2.title">
        <Para k="shr.s2.p1" />
        <Eq>{t("shr.s2.e1")}</Eq>
        <Para k="shr.s2.p2" />
        <Para k="shr.s2.p3" />
      </Section>

      <Section kicker="shr.s3.kicker" title="shr.s3.title">
        <Para k="shr.s3.p1" />
        <Para k="shr.s3.p2" />
        <Eq>{t("shr.s3.e1")}</Eq>
        <Para k="shr.s3.p3" />
        <Eq>{t("shr.s3.e2")}</Eq>
        <Para k="shr.s3.p4" />
        <Eq boxed>τ_m = Q·S_x / (J_x·s)</Eq>
        <Para k="shr.s3.p5" />
      </Section>

      <Section kicker="shr.s4.kicker" title="shr.s4.title">
        <Para k="shr.s4.p1" />
        <Eq boxed>τ_zy = (3/2)·Q/(b·h)·[1 − (2y/h)²]</Eq>
        <Para k="shr.s4.p2" />
        <Eq boxed>τ_max = 3·Q / (2·b·h) = 1,5·Q/A</Eq>
        <Para k="shr.s4.p3" />
        <div className="mx-auto max-w-xs">
          <Figure caption={t("shr.s4.fig")}>
            <RectSVG />
          </Figure>
        </div>
        <p data-testid="shr-rect-example" className="mb-4 max-w-[66ch] rounded-md bg-stone-100 px-4 py-2 font-mono text-[14px] dark:bg-stone-900">
          {t("shr.s4.ex")}
        </p>
      </Section>

      <Section kicker="shr.s5.kicker" title="shr.s5.title">
        <Para k="shr.s5.p1" />
        <p className="mb-1 text-sm font-semibold">{t("shr.s5.flange")}</p>
        <Eq boxed>τ = Q/(2·J_x) · (h²/4 − y²)</Eq>
        <p className="mb-1 text-sm font-semibold">{t("shr.s5.web")}</p>
        <Eq boxed>τ = Q/(2·δ_1·J_x) · [ b/4·(h² − h_0²) + δ_1·(h_0²/4 − y²) ]</Eq>
        <Para k="shr.s5.p2" />
        <div className="mx-auto max-w-xs">
          <Figure caption={t("shr.s5.fig")}>
            <IProfileSVG />
          </Figure>
        </div>
      </Section>
    </GuidePage>
  );
}
