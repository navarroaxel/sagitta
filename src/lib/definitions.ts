// Glossary of the guides: each group links to its guide; the terms are keys def.t.<id> / def.d.<id>.
export const DEFINITION_GROUPS: { id: string; href: string; terms: string[] }[] = [
  { id: "pln", href: "/superficies-planas", terms: ["estatico", "baricentro", "inercia", "centrifugo", "polar", "giro", "steiner", "ppales", "mppales"] },
  { id: "mat", href: "/propiedades-materiales", terms: ["fvol", "fsup", "tension", "estado", "defesp", "defelas", "hooke", "sp", "se", "sfl", "srot", "seguridad", "rigidez", "ductilidad", "resiliencia", "tenacidad", "dureza", "tipos"] },
  { id: "tns", href: "/estado-de-tension", terms: ["tensor", "vector", "invariantes", "tppales", "clasif"] },
  { id: "axl", href: "/axil", terms: ["axil", "stvenant"] },
  { id: "flx", href: "/flexion", terms: ["fsimple", "plano", "normal", "en", "w"] },
  { id: "shr", href: "/corte-en-flexion", terms: ["cpuro", "corte", "cauchy", "resbal", "jour"] },
  { id: "tor", href: "/torsion", terms: ["tsimple", "htor", "g", "unitario"] },
  { id: "fla", href: "/flecha", terms: ["curvatura", "flecha"] },
  { id: "pnd", href: "/pandeo", terms: ["equil", "fk", "esbeltez", "l0", "hipotesis"] },
];
