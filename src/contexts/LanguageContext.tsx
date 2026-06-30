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
  "controls.dimensions": "Dimensions",
  "controls.scale": "Scale:",

  "preset.examples": "Examples ▾",
  "preset.simply_supported": "Simply Supported Beam",
  "preset.cantilever": "Cantilever",
  "preset.portal_fixed": "Portal Frame (fixed)",
  "preset.three_hinged": "Three-Hinged Frame",
  "preset.two_bay": "Two-Bay Portal",
  "preset.portico_reticulado": "Frame + Truss",
  "preset.reticulado_r2": "Simple Truss",
  "preset.portico_r3": "Frame w/ Hinge",
  "preset.l_frame_hinge": "L-Frame w/ Hinge",
  "preset.l_frame_overhang": "L-Frame w/ Overhang",
  "preset.two_column_portal": "Two-Column Portal",
  "preset.truss_wall": "Wall Truss",
  "preset.truss_cantilever": "Cantilever Truss",
  "preset.truss_tower": "Tower Truss",
  "preset.truss_triangular": "Triangular Truss",
  "preset.symmetric_truss": "Symmetric Truss",

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

  "settings.title": "Settings",
  "settings.section.colors": "Colors",
  "settings.section.diagrams": "Diagrams",
  "settings.section.interface": "Interface",
  "settings.reset": "Restore defaults",
  "settings.high_contrast": "High contrast",
  "settings.section.preferences": "Preferences",
  "settings.remember_work": "Remember my work",
  "settings.show_load_units": "Load units on canvas",
  "settings.snap": "Grid snap (m)",
  "settings.on": "On",
  "settings.off": "Off",
  "settings.language": "Language",
  "settings.theme": "Theme",
  "settings.color.loads": "Loads",
  "settings.color.reactions": "Reactions",
  "settings.color.members": "Members / bars",
  "settings.color.nodes": "Nodes",
  "settings.color.labels": "Labels",
  "settings.color.grid": "Grid",
  "settings.color.dimensions": "Dimension lines",
  "settings.color.background": "Background",
  "settings.color.n_tension": "N — tension",
  "settings.color.n_compression": "N — compression",
  "settings.color.shear": "Shear (Q)",
  "settings.color.moment": "Moment (M)",

  "github.aria": "View source on GitHub",

  "footer.description":
    "An interactive simulator built as a teaching aid for the Stability course at UTN – FRBA.",
  "footer.also": "Explore more:",
  "footer.relax_teaser": "Electric field & relaxation method",
  "footer.kinelab_teaser": "Circular motion kinematics & dynamics",
  "footer.resonara_teaser": "RLC circuits in AC",

  "learn.link": "Learn the method",
  "learn.back": "← Simulator",
  "learn.title": "Tangent Method (Mohr's Theorems)",
  "learn.step": "Step",
  "learn.of": "of",
  "learn.prev": "← Previous",
  "learn.next": "Next →",
  "learn.preset.two_bay": "Two-Bay Portal",
  "learn.preset.l_frame_hinge": "L-Frame (Hinge)",
  "learn.preset.l_frame_overhang": "L-Frame (Overhang)",
  "learn.preset.frame_truss": "Frame + Truss",
  "learn.step.0.title": "The structural model",
  "learn.step.0.desc":
    "We start by identifying the nodes, members, supports and loads. Each node has coordinates and boundary conditions; each member connects two nodes and carries internal forces N, Q and M.",
  "learn.step.1.title": "Support reactions",
  "learn.step.1.desc":
    "Applying global equilibrium (ΣFx = 0, ΣFy = 0, ΣM = 0) we calculate the reactions at the supports. For statically indeterminate structures the stiffness method is used — the simulator solves it automatically.",
  "learn.step.2.title": "Shear diagram (Q)",
  "learn.step.2.desc":
    "The shear diagram is obtained by integrating the transverse loads along each member: dQ/dx = −q. At a concentrated force there is a sudden jump equal to the magnitude of that force.",
  "learn.step.3.title": "Bending moment diagram (M)",
  "learn.step.3.desc":
    "The moment diagram is obtained by integrating the shear: dM/dx = Q. Where Q = 0, M has a local maximum or minimum. At hinges (moment releases), M is always zero.",
  "learn.step.tangent.title": "The 1m trick — tangent directions",
  "learn.step.tangent.desc":
    "To draw the tangent to the M curve at the end of a distributed load WITHOUT integrating: advance 1m along the member axis and mark the Q value on the moment scale — that point defines the tangent direction. The units work out: Q [kN] × 1 [m] = [kN·m], directly on the moment scale. Do this from both ends A and B to get two tangent lines.",
  "learn.step.polo.title": "The pole and bisections",
  "learn.step.polo.desc":
    "The two tangents (from A and from B) intersect at the POLE P — the control point of the parabola. To find intermediate points: mark the midpoint of A→P and the midpoint of P→B; the midpoint of those two segments lies ON the parabola. Repeat for each sub-interval until you have enough points. The M diagram shown is exactly the parabola built this way.",
  "learn.step.4.title": "Theorem I — Slope change",
  "learn.step.4.desc":
    "The change in slope of the elastic curve between two points A and B equals the area of the M/EI diagram between them. Zones with large M contribute most to the rotation change.",
  "learn.step.5.title": "Theorem II — Full picture",
  "learn.step.5.desc":
    "The tangential deviation of B from the tangent at A equals the first moment of the M/EI area about B. With both theorems we can find rotations and deflections at any point in the structure.",
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
  "controls.dimensions": "Cotas",
  "controls.scale": "Escala:",

  "preset.examples": "Ejemplos ▾",
  "preset.simply_supported": "Viga simplemente apoyada",
  "preset.cantilever": "Ménsula",
  "preset.portal_fixed": "Pórtico (empotrado)",
  "preset.three_hinged": "Arco de tres rótulas",
  "preset.two_bay": "Pórtico de dos vanos",
  "preset.portico_reticulado": "Pórtico + Reticulado",
  "preset.reticulado_r2": "Reticulado simple",
  "preset.portico_r3": "Pórtico articulado",
  "preset.l_frame_hinge": "Pórtico en L con rótula",
  "preset.l_frame_overhang": "Pórtico en L con voladizo",
  "preset.two_column_portal": "Pórtico de dos columnas",
  "preset.truss_wall": "Reticulado en muro",
  "preset.truss_cantilever": "Reticulado con voladizo",
  "preset.truss_tower": "Reticulado en torre",
  "preset.truss_triangular": "Reticulado triangular",
  "preset.symmetric_truss": "Reticulado simétrico",

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

  "settings.title": "Configuración",
  "settings.section.colors": "Colores",
  "settings.section.diagrams": "Diagramas",
  "settings.section.interface": "Interfaz",
  "settings.reset": "Restaurar valores",
  "settings.high_contrast": "Alto contraste",
  "settings.section.preferences": "Preferencias",
  "settings.remember_work": "Recordar mi trabajo",
  "settings.show_load_units": "Unidades en cargas",
  "settings.snap": "Ajuste de grilla (m)",
  "settings.on": "Sí",
  "settings.off": "No",
  "settings.language": "Idioma",
  "settings.theme": "Tema",
  "settings.color.loads": "Cargas",
  "settings.color.reactions": "Reacciones",
  "settings.color.members": "Barras",
  "settings.color.nodes": "Nodos",
  "settings.color.labels": "Etiquetas",
  "settings.color.grid": "Grilla",
  "settings.color.dimensions": "Líneas de cota",
  "settings.color.background": "Fondo",
  "settings.color.n_tension": "N — tracción",
  "settings.color.n_compression": "N — compresión",
  "settings.color.shear": "Cortante (Q)",
  "settings.color.moment": "Momento (M)",

  "github.aria": "Ver código fuente en GitHub",

  "footer.description":
    "Simulador interactivo desarrollado como apoyo didáctico en el marco de la cátedra de Estabilidad de la UTN – FRBA.",
  "footer.also": "Ver también:",
  "footer.relax_teaser": "Teoría de Campos",
  "footer.kinelab_teaser": "Mecánica Técnica",
  "footer.resonara_teaser": "Electrotécnica I",

  "learn.link": "Aprendé el método",
  "learn.back": "← Simulador",
  "learn.title": "Método de las Tangentes (Teoremas de Mohr)",
  "learn.step": "Paso",
  "learn.of": "de",
  "learn.prev": "← Anterior",
  "learn.next": "Siguiente →",
  "learn.preset.two_bay": "Pórtico 2 Vanos",
  "learn.preset.l_frame_hinge": "Pórtico en L (rótula)",
  "learn.preset.l_frame_overhang": "Pórtico en L (voladizo)",
  "learn.preset.frame_truss": "Pórtico + Reticulado",
  "learn.step.0.title": "El modelo estructural",
  "learn.step.0.desc":
    "Identificamos los nodos, barras, vínculos y cargas del sistema. Cada nodo tiene coordenadas y condiciones de borde; cada barra conecta dos nodos y transmite esfuerzos internos N, Q y M.",
  "learn.step.1.title": "Reacciones de apoyo",
  "learn.step.1.desc":
    "Aplicando equilibrio global (ΣFx = 0, ΣFy = 0, ΣM = 0) calculamos las reacciones en los apoyos. Para estructuras hiperestáticas se usa el método de las rigideces — el simulador lo resuelve automáticamente.",
  "learn.step.2.title": "Diagrama de Cortante (Q)",
  "learn.step.2.desc":
    "El diagrama de cortante se obtiene integrando las cargas transversales a lo largo de cada barra: dQ/dx = −q. En una carga puntual hay un salto brusco igual a la magnitud de esa fuerza.",
  "learn.step.3.title": "Diagrama de Momentos (M)",
  "learn.step.3.desc":
    "El diagrama de momentos se obtiene integrando el cortante: dM/dx = Q. Donde Q = 0, M tiene un extremo local. En rótulas (liberación de momento), M es siempre cero.",
  "learn.step.tangent.title": "El truco del 1m — dirección de las tangentes",
  "learn.step.tangent.desc":
    "Para trazar la tangente a la curva M en el extremo de una carga distribuida SIN INTEGRAR: avanzás 1m sobre el eje de la barra y marcás el valor de Q en la escala del diagrama de momentos — ese punto define la dirección de la tangente. Las unidades cierran: Q [kN] × 1 [m] = [kN·m], directo en la escala del diagrama M. Hacés esto desde ambos extremos A y B para obtener dos tangentes.",
  "learn.step.polo.title": "El polo y las mediatrices",
  "learn.step.polo.desc":
    "Las dos tangentes (desde A y desde B) se cruzan en el POLO P — el punto de control de la parábola. Para encontrar puntos intermedios: marcás el punto medio de A→P y el punto medio de P→B; el punto medio de esos dos segmentos está SOBRE LA PARÁBOLA. Repetís para cada subintervalo hasta tener la precisión deseada. El diagrama M que ves es exactamente la parábola construida de esta forma.",
  "learn.step.4.title": "Teorema I — Cambio de pendiente",
  "learn.step.4.desc":
    "El cambio de pendiente de la curva elástica entre dos puntos A y B es igual al área del diagrama M/EI entre esos puntos. Las zonas con M grande contribuyen más al cambio de giro.",
  "learn.step.5.title": "Teorema II — Vista completa",
  "learn.step.5.desc":
    "La desviación tangencial del punto B respecto a la tangente trazada en A es igual al momento estático del área M/EI respecto a B. Con ambos teoremas podemos hallar giros y flechas en cualquier punto de la estructura.",
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
