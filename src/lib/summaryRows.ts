// One row per guide: topic, formula (language-neutral, rendered through Sub), what it is used for (rs.u.<id>), the guide
// that explains it and the glossary terms ("group.term" of definitions.ts) it relies on.
export const ROWS: { id: string; formula: string; guide: string; terms: string[] }[] = [
  { id: "axil", formula: "σ = N/A ; Δl = N·l/(E·A)", guide: "/axil", terms: ["axl.axil", "mat.defesp"] },
  { id: "hooke", formula: "σ = E·ε ; ε = Δl/l", guide: "/propiedades-materiales", terms: ["mat.hooke", "mat.rigidez"] },
  { id: "safety", formula: "σ_adm = σ_E/ν", guide: "/propiedades-materiales", terms: ["mat.seguridad", "mat.se"] },
  { id: "torsion", formula: "τ = M_t·ρ/J_0 ; φ = M_t·l/(G·J_0) ; J_0 = πd⁴/32", guide: "/torsion", terms: ["tor.tsimple", "tor.htor", "tor.g"] },
  { id: "flexion", formula: "σ = M·y/J ; σ_max = M/W", guide: "/flexion", terms: ["flx.fsimple", "flx.en", "flx.w"] },
  { id: "shear", formula: "τ = Q·S/(J·s)", guide: "/corte-en-flexion", terms: ["shr.jour", "shr.corte"] },
  { id: "flecha", formula: "1/ρ = M/(E·J)", guide: "/flecha", terms: ["fla.curvatura", "fla.flecha"] },
  { id: "pandeo", formula: "F_k = π²·E·J_min/(c²·l²)", guide: "/pandeo", terms: ["pnd.fk", "pnd.esbeltez", "pnd.l0"] },
  { id: "steiner", formula: "J = J_g + A·d²", guide: "/superficies-planas", terms: ["pln.steiner", "pln.inercia"] },
  { id: "stress", formula: "ρ = T·n", guide: "/estado-de-tension", terms: ["tns.vector", "tns.tppales"] },
];

// The five exam theory questions, answered with the glossary (same text and figure as /definiciones).
export const EXAM_TERMS = ["tor.htor", "shr.jour", "pnd.equil", "mat.hooke", "pln.steiner"];
