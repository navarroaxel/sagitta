"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useSyncExternalStore,
} from "react";

export type Language = "es" | "en";

const STORAGE_KEY = "sagitta-language";
const STORE_EVENT = "sagitta:language-change";

const EN = {
  "language.switch_aria": "Switch to Spanish",

  "app.title": "Frame Diagram Simulator",
  "app.reset": "Reset",
  "app.export_svg": "Export SVG",
  "app.export_png": "Export PNG",
  "app.error_unstable":
    "⚠ Unstable or singular model — check supports and connectivity. Diagrams cannot be computed.",

  "controls.show": "Show:",
  "controls.reactions": "Reactions",
  "controls.loads": "Loads",
  "controls.values": "Values",
  "controls.grid": "Grid",
  "controls.member_labels": "Members",
  "controls.scale": "Scale:",

  "preset.examples": "Examples ▾",
  "preset.simply_supported": "Simply Supported Beam",
  "preset.cantilever": "Cantilever",
  "preset.portal_fixed": "Portal Frame (fixed)",
  "preset.three_hinged": "Three-Hinged Frame",
  "preset.two_bay": "Two-Bay Portal",
  "preset.portico_reticulado": "Frame + Truss (r1)",

  "forces.member": "Member",
  "forces.state": "State",
  "forces.tension": "Tension",
  "forces.compression": "Compression",
  "forces.zero": "Zero",

  "results.unavailable": "Solve the model to see the results.",
  "results.section.member_forces": "Member forces",
  "results.section.reactions": "Support reactions",
  "results.section.displacements": "Nodal displacements",
  "results.section.equilibrium": "Equilibrium check",
  "results.node": "Node",
  "results.column.q": "Q",
  "results.column.m": "M",
  "results.rx": "Rx",
  "results.ry": "Ry",
  "results.m": "M",
  "results.ux": "ux (mm)",
  "results.uy": "uy (mm)",
  "results.theta": "θ (rad)",
  "results.tip.node": "Node identifier",
  "results.tip.ux": "Horizontal displacement (global X), in millimetres",
  "results.tip.uy": "Vertical displacement (global Y), in millimetres",
  "results.tip.theta": "Node rotation, in radians",
  "results.peak_at": "peak at x =",
  "results.eq_fx": "ΣFx",
  "results.eq_fy": "ΣFy",
  "results.eq_m": "ΣM",
  "results.eq_ok": "≈ 0 ✓",
  "results.eq_fail": "≠ 0 ✗",

  "editor.tab.nodes": "nodes",
  "editor.tab.members": "members",
  "editor.tab.loads": "loads",
  "editor.tab.material": "material",
  "editor.tab.results": "results",

  "editor.nodes.id": "ID",
  "editor.nodes.x": "x",
  "editor.nodes.y": "y",
  "editor.nodes.support": "Support",
  "editor.nodes.support_free": "Free",
  "editor.nodes.support_pinned": "Pinned",
  "editor.nodes.support_fixed": "Fixed",
  "editor.nodes.support_roller_v": "Roller (V)",
  "editor.nodes.support_roller_h": "Roller (H)",
  "editor.nodes.add": "+ Add node",

  "editor.members.id": "ID",
  "editor.members.from": "From",
  "editor.members.to": "To",
  "editor.members.hinge_i": "Hinge i",
  "editor.members.hinge_j": "Hinge j",
  "editor.members.add": "+ Add member",

  "editor.loads.force_unit": "Force unit:",
  "editor.loads.type_nodal": "Nodal",
  "editor.loads.type_mpoint": "Member point",
  "editor.loads.type_mudl": "Member UDL",
  "editor.loads.node": "Node",
  "editor.loads.fx": "fx",
  "editor.loads.fy": "fy",
  "editor.loads.moment": "m (moment)",
  "editor.loads.member": "Member",
  "editor.loads.dist": "dist (from n1)",
  "editor.loads.gx": "gx (global)",
  "editor.loads.gy": "gy (global)",
  "editor.loads.remove": "✕ remove",
  "editor.loads.add": "+ Add load",

  "editor.material.note":
    "Material properties only affect indeterminate frames. For determinate structures the results are independent of E, A, I.",

  "theme.label": "Theme:",
  "github.aria": "View source on GitHub",

  "footer.description":
    "An interactive simulator built as a teaching aid for the Stability course at UTN – FRBA.",
  "footer.also": "Explore more:",
  "footer.relax_teaser": "Electric field & relaxation method",
  "footer.kinelab_teaser": "Circular motion kinematics & dynamics",
  "footer.resonara_teaser": "RLC circuits in AC",
} as const;

export type TranslationKey = keyof typeof EN;

const ES: Record<TranslationKey, string> = {
  "language.switch_aria": "Cambiar a inglés",

  "app.title": "Simulador de Diagramas de Marco",
  "app.reset": "Reiniciar",
  "app.export_svg": "Exportar SVG",
  "app.export_png": "Exportar PNG",
  "app.error_unstable":
    "⚠ Modelo inestable o singular — verificá los vínculos y la conectividad. No es posible calcular los diagramas.",

  "controls.show": "Mostrar:",
  "controls.reactions": "Reacciones",
  "controls.loads": "Cargas",
  "controls.values": "Valores",
  "controls.grid": "Grilla",
  "controls.member_labels": "Barras",
  "controls.scale": "Escala:",

  "preset.examples": "Ejemplos ▾",
  "preset.simply_supported": "Viga simplemente apoyada",
  "preset.cantilever": "Ménsula",
  "preset.portal_fixed": "Pórtico (empotrado)",
  "preset.three_hinged": "Arco de tres rótulas",
  "preset.two_bay": "Pórtico de dos vanos",
  "preset.portico_reticulado": "Pórtico + Reticulado (r1)",

  "forces.member": "Barra",
  "forces.state": "Estado",
  "forces.tension": "Tracción",
  "forces.compression": "Compresión",
  "forces.zero": "Nula",

  "results.unavailable": "Resolvé el modelo para ver los resultados.",
  "results.section.member_forces": "Esfuerzos en barras",
  "results.section.reactions": "Reacciones de apoyo",
  "results.section.displacements": "Desplazamientos nodales",
  "results.section.equilibrium": "Verificación de equilibrio",
  "results.node": "Nodo",
  "results.column.q": "Q",
  "results.column.m": "M",
  "results.rx": "Rx",
  "results.ry": "Ry",
  "results.m": "M",
  "results.ux": "ux (mm)",
  "results.uy": "uy (mm)",
  "results.theta": "θ (rad)",
  "results.tip.node": "Identificador del nodo",
  "results.tip.ux": "Desplazamiento horizontal (X global), en milímetros",
  "results.tip.uy": "Desplazamiento vertical (Y global), en milímetros",
  "results.tip.theta": "Giro del nodo, en radianes",
  "results.peak_at": "máx. en x =",
  "results.eq_fx": "ΣFx",
  "results.eq_fy": "ΣFy",
  "results.eq_m": "ΣM",
  "results.eq_ok": "≈ 0 ✓",
  "results.eq_fail": "≠ 0 ✗",

  "editor.tab.nodes": "nodos",
  "editor.tab.members": "barras",
  "editor.tab.loads": "cargas",
  "editor.tab.material": "material",
  "editor.tab.results": "resultados",

  "editor.nodes.id": "ID",
  "editor.nodes.x": "x",
  "editor.nodes.y": "y",
  "editor.nodes.support": "Vínculo",
  "editor.nodes.support_free": "Libre",
  "editor.nodes.support_pinned": "Articulado",
  "editor.nodes.support_fixed": "Empotrado",
  "editor.nodes.support_roller_v": "Apoyo simple (V)",
  "editor.nodes.support_roller_h": "Apoyo simple (H)",
  "editor.nodes.add": "+ Agregar nodo",

  "editor.members.id": "ID",
  "editor.members.from": "Desde",
  "editor.members.to": "Hasta",
  "editor.members.hinge_i": "Rótula i",
  "editor.members.hinge_j": "Rótula j",
  "editor.members.add": "+ Agregar barra",

  "editor.loads.force_unit": "Unidad de fuerza:",
  "editor.loads.type_nodal": "Nodal",
  "editor.loads.type_mpoint": "Punto en barra",
  "editor.loads.type_mudl": "Carga distribuida",
  "editor.loads.node": "Nodo",
  "editor.loads.fx": "fx",
  "editor.loads.fy": "fy",
  "editor.loads.moment": "m (momento)",
  "editor.loads.member": "Barra",
  "editor.loads.dist": "dist (desde n1)",
  "editor.loads.gx": "gx (global)",
  "editor.loads.gy": "gy (global)",
  "editor.loads.remove": "✕ quitar",
  "editor.loads.add": "+ Agregar carga",

  "editor.material.note":
    "Las propiedades del material solo afectan a las estructuras hiperestáticas. Para estructuras isostáticas, los resultados son independientes de E, A, I.",

  "theme.label": "Tema:",
  "github.aria": "Ver código fuente en GitHub",

  "footer.description":
    "Simulador interactivo desarrollado como apoyo didáctico en el marco de la cátedra de Estabilidad de la UTN – FRBA.",
  "footer.also": "Ver también:",
  "footer.relax_teaser": "Teoría de Campos",
  "footer.kinelab_teaser": "Mecánica Técnica",
  "footer.resonara_teaser": "Electrotécnica I",
};

const translations: Record<Language, Record<TranslationKey, string>> = {
  en: EN,
  es: ES,
};

function detectBrowserLanguage(): Language {
  if (typeof navigator === "undefined") return "en";
  return navigator.language.toLowerCase().startsWith("es") ? "es" : "en";
}

function readLanguage(): Language {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === "en" || stored === "es") return stored;
  return detectBrowserLanguage();
}

function writeLanguage(lang: Language) {
  localStorage.setItem(STORAGE_KEY, lang);
  window.dispatchEvent(new Event(STORE_EVENT));
}

function subscribe(callback: () => void) {
  window.addEventListener(STORE_EVENT, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(STORE_EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

interface LanguageContextValue {
  language: Language;
  toggle: () => void;
  t: (key: TranslationKey) => string;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  // useSyncExternalStore handles the SSR/hydration split: the server snapshot
  // ("en") matches the static export HTML, and on the client React reads the
  // real value from localStorage/navigator synchronously during hydration —
  // before paint — with no hydration warning.
  const language = useSyncExternalStore<Language>(
    subscribe,
    readLanguage,
    () => "en",
  );

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const toggle = useCallback(() => {
    writeLanguage(readLanguage() === "en" ? "es" : "en");
  }, []);

  const t = useCallback(
    (key: TranslationKey): string => translations[language][key],
    [language],
  );

  return (
    <LanguageContext.Provider value={{ language, toggle, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
}
