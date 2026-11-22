// One row per guide: topic, formula (language-neutral, rendered through Sub) and what it is used for.
export const ROWS: { id: string; formula: string }[] = [
  { id: "axil", formula: "σ = N/A ; Δl = N·l/(E·A)" },
  { id: "hooke", formula: "σ = E·ε ; ε = Δl/l" },
  { id: "safety", formula: "σ_adm = σ_E/ν" },
  { id: "torsion", formula: "τ = M_t·ρ/J_0 ; φ = M_t·l/(G·J_0) ; J_0 = πd⁴/32" },
  { id: "flexion", formula: "σ = M·y/J ; σ_max = M/W" },
  { id: "shear", formula: "τ = Q·S/(J·s)" },
  { id: "flecha", formula: "1/ρ = M/(E·J) ; f = ∫M·x dx/(E·J)" },
  { id: "pandeo", formula: "F_k = π²·E·J_min/(c²·l²)" },
  { id: "steiner", formula: "J = J_g + A·d²" },
  { id: "stress", formula: "ρ = T·n" },
];
