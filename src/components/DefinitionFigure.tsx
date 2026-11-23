"use client";

import React from "react";
import {
  BendingPlaneFigure,
  CauchyFigure,
  ClassificationFigure,
  InvariantsFigure,
  NeutralAxisFigure,
  ObliqueBendingFigure,
  PLANE_FOCI,
  PlaneAreaFigure,
  PureShearFigure,
  ShearFigure,
  ShearForceFigure,
  SlidingFigure,
  SimpleBendingFigure,
  SteinerFigure,
  StressStrainFigure,
  TorsionFigure,
  type PlaneFocus,
  type StressStrainFocus,
} from "@/components/DefinitionFigures";
import { ElementFigure, PlaneVectorFigure } from "@/components/TensionFigures";
import { BifurcationFigure, EndConditionsFigure, EquilibriumBarsFigure, HyperbolaSVG, IdealBarFigure } from "@/components/PandeoFigures";

type Spec =
  | "bending"
  | "plane"
  | "oblique"
  | "neutral"
  | "equil"
  | "bifurcation"
  | "hyperbola"
  | "ends"
  | "ideal"
  | "steiner"
  | "torsion"
  | "shear"
  | "pureShear"
  | "shearForce"
  | "cauchy"
  | "tensorElement"
  | "planeVector"
  | "invariants"
  | "principalElement"
  | "classification"
  | "sliding"
  | PlaneFocus
  | StressStrainFocus;

// The terms ("group.term") that carry a figure; their caption is def.f.<term>. The glossary and /resumen show the same one.
const FIGURES: Record<string, Spec> = {
  "flx.fsimple": "bending",
  "flx.plano": "plane",
  "flx.normal": "oblique",
  "flx.en": "neutral",
  "pln.estatico": "static",
  "pln.baricentro": "centroid",
  "pln.inercia": "inertia",
  "pln.centrifugo": "product",
  "pln.polar": "polar",
  "pln.giro": "gyration",
  "pln.steiner": "steiner",
  "pln.ppales": "principal",
  "pln.mppales": "principalMoments",
  "pnd.equil": "equil",
  "pnd.fk": "bifurcation",
  "pnd.esbeltez": "hyperbola",
  "pnd.l0": "ends",
  "pnd.hipotesis": "ideal",
  "tor.htor": "torsion",
  "tns.tensor": "tensorElement",
  "tns.vector": "planeVector",
  "tns.invariantes": "invariants",
  "tns.tppales": "principalElement",
  "tns.clasif": "classification",
  "shr.cpuro": "pureShear",
  "shr.corte": "shearForce",
  "shr.cauchy": "cauchy",
  "shr.resbal": "sliding",
  "shr.jour": "shear",
  "mat.hooke": "stiffness",
  "mat.rigidez": "stiffness",
  "mat.sp": "P",
  "mat.se": "E",
  "mat.sfl": "Fl",
  "mat.srot": "Rot",
  "mat.seguridad": "safety",
  "mat.defelas": "elastic",
  "mat.ductilidad": "ductility",
  "mat.resiliencia": "resilience",
  "mat.tenacidad": "toughness",
  "mat.tipos": "types",
};

const isPlane = (s: Spec): s is PlaneFocus => (PLANE_FOCI as readonly string[]).includes(s);

export const hasFigure = (id: string) => id in FIGURES;

export function DefinitionFigure({ id, label }: { id: string; label: string }) {
  const spec = FIGURES[id];
  if (spec === "bending") return <SimpleBendingFigure label={label} />;
  if (spec === "plane") return <BendingPlaneFigure label={label} />;
  if (spec === "oblique") return <ObliqueBendingFigure label={label} />;
  if (spec === "neutral") return <NeutralAxisFigure label={label} />;
  if (spec === "equil") return <EquilibriumBarsFigure label={label} />;
  if (spec === "bifurcation") return <BifurcationFigure label={label} />;
  if (spec === "hyperbola") return <HyperbolaSVG label={label} />;
  if (spec === "ends") return <EndConditionsFigure label={label} />;
  if (spec === "ideal") return <IdealBarFigure label={label} />;
  if (spec === "steiner") return <SteinerFigure label={label} />;
  if (spec === "torsion") return <TorsionFigure label={label} />;
  if (spec === "shear") return <ShearFigure label={label} />;
  if (spec === "pureShear") return <PureShearFigure label={label} />;
  if (spec === "shearForce") return <ShearForceFigure label={label} />;
  if (spec === "cauchy") return <CauchyFigure label={label} />;
  if (spec === "tensorElement") return <ElementFigure label={label} />;
  if (spec === "planeVector") return <PlaneVectorFigure label={label} />;
  if (spec === "invariants") return <InvariantsFigure label={label} />;
  if (spec === "principalElement") return <ElementFigure principal label={label} />;
  if (spec === "classification") return <ClassificationFigure label={label} />;
  if (spec === "sliding") return <SlidingFigure label={label} />;
  if (isPlane(spec)) return <PlaneAreaFigure focus={spec} label={label} />;
  return <StressStrainFigure focus={spec} label={label} />;
}
