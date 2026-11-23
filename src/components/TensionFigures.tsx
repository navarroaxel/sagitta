"use client";

import React from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { SvgSub, plain } from "@/components/Sub";
import { principalStresses, tensor } from "@/lib/stressState";

const INK = "#16232E";
const FAINT = "#C9D2D8";
const TENSION = "#0B8A8A";
const LOAD = "#C0392B";

function Txt(props: React.SVGProps<SVGTextElement> & { children: string }) {
  const { children, ...rest } = props;
  return (
    <text fontSize="11" fill={INK} {...rest}>
      <SvgSub>{children}</SvgSub>
    </text>
  );
}

function Arrow({ id, x1, y1, x2, y2, color, w = 2.2 }: { id: string; x1: number; y1: number; x2: number; y2: number; color: string; w?: number }) {
  return <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth={w} markerEnd={`url(#${id})`} />;
}

function Marker({ id, color }: { id: string; color: string }) {
  return (
    <marker id={id} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 0 L 10 5 L 0 10 z" fill={color} />
    </marker>
  );
}

// Oblique element of side a at point B: x right, y up, z toward the viewer (down-left). The three visible faces are the
// positive ones (+z front, +y top, +x right); a positive stress points along the +axis on a positive face.
export function ElementFigure({ principal = false, label: given }: { principal?: boolean; label?: string }) {
  const { t } = useLanguage();
  const id = principal ? "tns-el-p" : "tns-el-g";
  const label = given ?? plain(t(principal ? "tns.f3" : "tns.f1"));
  return (
    <svg viewBox="0 0 260 185" className="h-auto w-full" role="img" aria-label={label}>
      <defs>
        <Marker id={`${id}-n`} color={LOAD} />
        <Marker id={`${id}-t`} color={TENSION} />
        <Marker id={`${id}-a`} color={INK} />
      </defs>
      {/* back edges, hidden */}
      <g stroke={FAINT} strokeWidth="1" strokeDasharray="3 3" fill="none">
        <line x1="120" y1="40" x2="120" y2="120" />
        <line x1="120" y1="120" x2="200" y2="120" />
        <line x1="120" y1="120" x2="80" y2="150" />
      </g>
      <polygon points="80,70 160,70 160,150 80,150" fill={TENSION} fillOpacity="0.1" stroke={INK} strokeWidth="1.5" />
      <polygon points="80,70 160,70 200,40 120,40" fill={TENSION} fillOpacity="0.05" stroke={INK} strokeWidth="1.5" />
      <polygon points="160,70 200,40 200,120 160,150" fill={TENSION} fillOpacity="0.18" stroke={INK} strokeWidth="1.5" />
      {/* normal stresses */}
      <Arrow id={`${id}-n`} x1={120} y1={110} x2={88} y2={134} color={LOAD} w={2.8} />
      <Arrow id={`${id}-n`} x1={140} y1={55} x2={140} y2={24} color={LOAD} w={2.8} />
      <Arrow id={`${id}-n`} x1={180} y1={80} x2={212} y2={80} color={LOAD} w={2.8} />
      <Txt x="82" y="138" textAnchor="end">{principal ? "σ_3" : "σ_z"}</Txt>
      <Txt x="146" y="26">{principal ? "σ_2" : "σ_y"}</Txt>
      <Txt x="216" y="84">{principal ? "σ_1" : "σ_x"}</Txt>
      {!principal && (
        <g>
          {/* shear stresses: on each face the two of the face start at the same point as its normal stress, the centre of the
              face, and go along the two axes of the face (positive along the axes) */}
          <Arrow id={`${id}-t`} x1={120} y1={110} x2={148} y2={110} color={TENSION} />
          <Arrow id={`${id}-t`} x1={120} y1={110} x2={120} y2={82} color={TENSION} />
          <Arrow id={`${id}-t`} x1={140} y1={55} x2={168} y2={55} color={TENSION} />
          <Arrow id={`${id}-t`} x1={140} y1={55} x2={122.4} y2={68.2} color={TENSION} />
          <Arrow id={`${id}-t`} x1={180} y1={80} x2={180} y2={52} color={TENSION} />
          <Arrow id={`${id}-t`} x1={180} y1={80} x2={162.4} y2={93.2} color={TENSION} />
          <Txt x="152" y="114" fill={TENSION}>τ_zx</Txt>
          <Txt x="126" y="88" fill={TENSION}>τ_zy</Txt>
          <Txt x="150" y="69" fill={TENSION}>τ_yx</Txt>
          <Txt x="116" y="64" textAnchor="end" fill={TENSION}>τ_yz</Txt>
          <Txt x="184" y="46" fill={TENSION}>τ_xy</Txt>
          <Txt x="166" y="102" fill={TENSION}>τ_xz</Txt>
        </g>
      )}
      {/* triad */}
      <g>
        <Arrow id={`${id}-a`} x1={24} y1={170} x2={52} y2={170} color={INK} w={1.5} />
        <Arrow id={`${id}-a`} x1={24} y1={170} x2={24} y2={142} color={INK} w={1.5} />
        <Arrow id={`${id}-a`} x1={24} y1={170} x2={6} y2={180} color={INK} w={1.5} />
        <Txt x="56" y="174">x</Txt>
        <Txt x="28" y="146">y</Txt>
        <Txt x="4" y="178" textAnchor="end">z</Txt>
      </g>
    </svg>
  );
}

// Stress vector on a plane (seen edge-on) through B with normal n: ρ = σ·n + τ along the plane.
export function PlaneVectorFigure({ label }: { label?: string }) {
  const { t } = useLanguage();
  const id = "tns-pv";
  return (
    <svg viewBox="0 0 250 170" className="h-auto w-full" role="img" aria-label={label ?? plain(t("tns.f2"))}>
      <defs>
        <Marker id={`${id}-r`} color={LOAD} />
        <Marker id={`${id}-s`} color={TENSION} />
        <Marker id={`${id}-n`} color={INK} />
      </defs>
      <line x1="15.4" y1="155.6" x2="184.6" y2="94.4" stroke={INK} strokeWidth="2" />
      <line x1="127.8" y1="40.4" x2="76.1" y2="59.2" stroke={FAINT} strokeWidth="1" strokeDasharray="3 3" />
      <line x1="127.8" y1="40.4" x2="151.7" y2="106.3" stroke={FAINT} strokeWidth="1" strokeDasharray="3 3" />
      <Arrow id={`${id}-s`} x1={100} y1={125} x2={76.1} y2={59.2} color={TENSION} w={2.8} />
      <Arrow id={`${id}-s`} x1={100} y1={125} x2={151.7} y2={106.3} color={TENSION} w={2.8} />
      <Arrow id={`${id}-r`} x1={100} y1={125} x2={127.8} y2={40.4} color={LOAD} w={3} />
      <Arrow id={`${id}-n`} x1={100} y1={125} x2={88} y2={92} color={INK} w={1.5} />
      <circle cx="100" cy="125" r="3" fill={INK} />
      <Txt x="106" y="140">B</Txt>
      <Txt x="133" y="38" fill={LOAD} fontWeight="600">ρ</Txt>
      <Txt x="70" y="56" textAnchor="end" fill={TENSION} fontWeight="600">σ</Txt>
      <Txt x="156" y="112" fill={TENSION} fontWeight="600">τ</Txt>
      <Txt x="82" y="96" textAnchor="end">n</Txt>
    </svg>
  );
}

// The three Mohr circles (upper halves) of the exercise, drawn to scale from its principal stresses.
export function MohrFigure() {
  const { t } = useLanguage();
  const [s1, s2, s3] = principalStresses(tensor(-20, 30, 0, 10, 0, 5));
  const k = 4; // px per MPa
  const x0 = 130;
  const base = 135;
  const X = (s: number) => x0 + k * s;
  const arc = (a: number, b: number, color: string, w: number) => (
    <path d={`M ${X(a)} ${base} A ${(k * (b - a)) / 2} ${(k * (b - a)) / 2} 0 0 1 ${X(b)} ${base}`} fill="none" stroke={color} strokeWidth={w} />
  );
  const tmax = (s1 - s3) / 2;
  return (
    <svg viewBox="0 0 300 175" className="h-auto w-full" role="img" aria-label={plain(t("tns.f4"))}>
      <line x1="8" y1={base} x2="290" y2={base} stroke={INK} strokeWidth="1.5" />
      <line x1={x0} y1={base + 4} x2={x0} y2="12" stroke={INK} strokeWidth="1.5" />
      {arc(s3, s1, LOAD, 2.5)}
      {arc(s2, s1, TENSION, 2)}
      {arc(s3, s2, TENSION, 2)}
      <line x1={X((s1 + s3) / 2)} y1={base} x2={X((s1 + s3) / 2)} y2={base - k * tmax} stroke={LOAD} strokeWidth="1" strokeDasharray="3 3" />
      {[s3, s2, s1].map((s, i) => (
        <circle key={i} cx={X(s)} cy={base} r="3" fill={INK} />
      ))}
      <Txt x={X(s3)} y={base + 16} textAnchor="middle">σ_3</Txt>
      <Txt x={X(s2)} y={base + 16} textAnchor="middle">σ_2</Txt>
      <Txt x={X(s1)} y={base + 16} textAnchor="middle">σ_1</Txt>
      <Txt x={X((s1 + s3) / 2) + 6} y={base - k * tmax + 12} fill={LOAD}>τ_max</Txt>
      <Txt x="284" y={base - 6} textAnchor="end">σ</Txt>
      <Txt x={x0 + 6} y="20">τ</Txt>
    </svg>
  );
}
