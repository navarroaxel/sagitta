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
  "app.share": "Share",
  "app.share_copied": "Link copied!",
  "app.share_title": "Copy a link to this model",
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
  "preset.cat_beams": "Beams",
  "preset.cat_frames": "Frames",
  "preset.cat_trusses": "Trusses",
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
  "preset.truss_three_panel": "Three-Panel Triangle Truss",
  "preset.symmetric_truss": "Symmetric Truss",
  "preset.fixed_beam_hinge_overhang": "Fixed Beam w/ Hinge & Overhang",
  "preset.fixed_beam_udl_hinge": "Fixed Beam (UDL + Hinge)",
  "preset.t_frame_fixed": "T-Frame (fixed base)",
  "preset.symmetric_two_bay": "Symmetric Two-Bay Portal",
  "preset.portal_moment": "Portal w/ Moment",
  "preset.z_frame": "Z-Frame (ceiling roller)",
  "preset.l_frame_hinge_inclined": "L-Frame w/ Hinge (inclined load)",
  "preset.asymmetric_portal_overhang": "Asymmetric Portal w/ Overhang",
  "preset.wall_truss_two_panel": "Wall Truss (2 panels)",

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

  "settings.sign_convention": "Sign convention",
  "settings.sign_convention.argentina": "Argentina",
  "settings.sign_convention.international": "International",

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

  "quiz.link": "Quiz",
  "quiz.back": "← Simulator",
  "quiz.title": "True/False Exam — Statics",
  "quiz.check": "Check",
  "quiz.reset": "Reset",
  "quiz.score": "Score",
  "quiz.correct": "Correct",
  "quiz.incorrect": "Incorrect",
  "quiz.unanswered": "Unanswered",
  "quiz.correctAnswer": "Correct answer:",
  "quiz.true": "True",
  "quiz.false": "False",
  "quiz.more.title": "More theory exams",
  "quiz.more.claude": "Estabilidad — Theory (1st partial), 49 Q",
  "parcial.back": "← Simulator",
  "parcial.title": "True/False Exam — Stability (partial)",

  "claudeQuiz.link": "Estabilidad theory",
  "claudeQuiz.title": "Estabilidad — Theory exam (T/F & multiple choice)",
  "claudeQuiz.intro":
    "49 True/False and multiple-choice questions covering force systems, supports & DOF, kinematic chains, and trusses — with immediate grading and explanations.",
  "claudeQuiz.back": "← Back to /quiz",
  "claudeQuiz.filter.all": "All",
  "claudeQuiz.filter.unanswered": "Unanswered only",
  "claudeQuiz.empty": "No questions match this filter.",
  "claudeQuiz.topic.fuerzas": "Force systems",
  "claudeQuiz.topic.vinculos": "Supports & DOF",
  "claudeQuiz.topic.cadenas": "Kinematic chains",
  "claudeQuiz.topic.reticulados": "Trusses",
  "claudeQuiz.type.vf": "True / False",
  "claudeQuiz.type.mc": "Multiple choice",
  "claudeQuiz.answered": "answered",
  "claudeQuiz.correct": "correct",
  "claudeQuiz.verdict.ok": "Correct",
  "claudeQuiz.verdict.no": "Incorrect",
  "claudeQuiz.shuffle": "Shuffle",
  "claudeQuiz.reset": "Reset",
  "claudeQuiz.result.great": "Solid — ready for the theory part.",
  "claudeQuiz.result.ok": "On track — review the misses and retry.",
  "claudeQuiz.result.low": "Review the weak topics and retry.",

  // ── Characteristic internal forces (N/Q/M) ──
  "esf.link": "Internal forces",
  "esf.title": "Characteristic (internal) forces",
  "esf.lead":
    "The three internal forces — axial, shear and bending moment — that appear when a member in equilibrium is cut, their signs, and how to draw their diagrams.",

  "esf.s1.kicker": "01 — Definition",
  "esf.s1.title": "What are internal forces?",
  "esf.s1.p1":
    "They are the three kinds of action that arise inside a beam or member, also called internal reactions. If we take a member in equilibrium under any system of forces — applied and reactive — and cut it at an arbitrary point, equilibrium is lost.",
  "esf.s1.p2":
    "Equilibrium is restored if the resultant of the forces that came from the removed portion acts on the face of the section. Decomposing that resultant gives the three characteristic forces.",

  "esf.s2.kicker": "02 — Local triad",
  "esf.s2.title": "The member’s axis system",
  "esf.s2.p1":
    "Each member has its own local triad, defined from the member’s start node i toward its end node j:",
  "esf.s2.x": "the member axis, from i to j — the direction of the axial force.",
  "esf.s2.y": "perpendicular to the axis, rotated 90° counter-clockwise from x′ — the direction of the shear.",
  "esf.s2.z": "out of the plane; the positive sense of the moment is measured about this axis (clockwise positive).",
  "esf.s2.p2":
    "The signs of N, Q and M are defined relative to this triad — that is why the same force may read with a different sign depending on how the member is oriented.",

  "esf.s3.kicker": "03 — The three forces",
  "esf.s3.title": "Axial, shear and bending moment",
  "esf.s3.intro":
    "Each force is the projection (or, for the moment, the static moment) of the resultant of all the external forces — applied and reactive — acting to the left of the section, taken with their sign; or of those acting to the right, taken with the sign reversed.",
  "esf.s3.n.name": "Axial force — N (𝔑)",
  "esf.s3.n.def":
    "Projection onto the member axis of the resultant of the external forces on one side of the section.",
  "esf.s3.n.sign":
    "Negative if it tends to shorten or compress the member; positive in tension.",
  "esf.s3.q.name": "Shear force — Q (Ω)",
  "esf.s3.q.def":
    "Projection onto the section of the resultant of the external forces perpendicular to the axis acting on one side of the section.",
  "esf.s3.q.sign":
    "Negative if the force’s sense coincides with the positive y′ axis; positive otherwise.",
  "esf.s3.m.name": "Bending moment — M (𝔐)",
  "esf.s3.m.def":
    "Static moment, about the section’s centroid, of the resultant of the external forces acting on one side of the section.",
  "esf.s3.m.sign":
    "Negative if the sense of rotation is counter-clockwise; positive if clockwise.",
  "esf.s3.cap.n": "N > 0: tension",
  "esf.s3.cap.q": "Q > 0: positive shear",
  "esf.s3.cap.m": "M > 0: clockwise (positive)",
  "esf.s3.n": "lengthens the member",
  "esf.s3.q": "shear on the section",
  "esf.s3.m": "sagging",

  "esf.s4.kicker": "04 — The diagrams",
  "esf.s4.title": "How they are built",
  "esf.s4.p1":
    "A reference axis is taken for each force and, in correspondence with every section, segments are laid off perpendicular to it that — at a chosen scale — represent the values of N, Q and M. The locus of all those points is the diagram of N, Q or M.",
  "esf.s4.p2":
    "In this simulator the diagrams use the Argentina (UTN) convention by default: a negative value is drawn to the left of columns and above beams, and the bending moment is drawn on the tension fibre, continuous across joints.",

  "esf.s5.kicker": "05 — Analytical procedure",
  "esf.s5.title": "Step by step",
  "esf.s5.step1.t": "Supports",
  "esf.s5.step1.d": "Analyse the support conditions and determine whether the structure can be solved.",
  "esf.s5.step2.t": "Free-body diagram",
  "esf.s5.step2.d": "Draw the free-body diagram.",
  "esf.s5.step3.t": "Equilibrium equations",
  "esf.s5.step3.d": "Write the three (or more) equilibrium equations.",
  "esf.s5.step4.t": "Reactions",
  "esf.s5.step4.d": "Solve the system and find the support reactions.",
  "esf.s5.step5.t": "Key points",
  "esf.s5.step5.d": "Identify the structure’s key points and build the table of values.",
  "esf.s5.step6.t": "Traverse and plot",
  "esf.s5.step6.d": "Traverse the structure computing the forces and plot them to scale.",

  "esf.s6.kicker": "06 — Worked example",
  "esf.s6.title": "L-frame, fixed at the base",
  "esf.s6.p1":
    "Column A–B of 3 m, beam B–C of 4 m, a fixed support at A and a load P = 10 kN downward at the free tip C. This is where the local triad shines: the column has no obvious ‘up’.",
  "esf.s6.reac.cap":
    "Reactions at the fixed support. The load is 4 m from the column axis — hence the 40 kN·m moment.",
  "esf.s6.cut.t": "The cut, member by member",
  "esf.s6.cut.p":
    "Beam B→C (x′ to the right). Cut at distance s and isolate the right piece, which only carries the load P at C:",
  "esf.s6.cut.cap":
    "The load tensions the top fibre of the beam (M < 0, hogging). In the column the same reasoning gives N = −10 (compression), Q = 0 and M = −40 constant, because the load is always 4 m from the axis.",
  "esf.s6.diag.t": "The three diagrams",
  "esf.s6.diag.n": "Normal. Column in compression (−10 kN); beam with N = 0.",
  "esf.s6.diag.q": "Shear. Constant +10 kN in the beam; zero in the column.",
  "esf.s6.diag.m":
    "Bending. −40 kN·m constant in the column, linear to 0 at the tip. Continuous at joint B.",
  "esf.s6.th.bar": "Member",
  "esf.s6.th.axis": "Triad x′",
  "esf.s6.th.state": "Axial state",
  "esf.s6.bar.col": "A→B (column)",
  "esf.s6.bar.beam": "B→C (beam)",
  "esf.s6.axis.up": "upward",
  "esf.s6.axis.right": "to the right",
  "esf.state.compression": "Compression",
  "esf.state.zero": "Zero",

  "esf.footer":
    "Definitions and procedure follow the UTN FRBA course notes; the simulator’s diagrams use the Argentina convention.",
} as const;

export type TranslationKey = keyof typeof EN;

const ES: Record<TranslationKey, string> = {
  "language.switch_aria": "Cambiar a inglés",

  "app.title": "Simulador de Diagramas de Marco",
  "app.reset": "Reiniciar",
  "app.export_svg": "Exportar SVG",
  "app.export_png": "Exportar PNG",
  "app.share": "Compartir",
  "app.share_copied": "¡Enlace copiado!",
  "app.share_title": "Copiar un enlace a este modelo",
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
  "preset.cat_beams": "Vigas",
  "preset.cat_frames": "Pórticos",
  "preset.cat_trusses": "Reticulados",
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
  "preset.truss_three_panel": "Reticulado de tres paños triangular",
  "preset.symmetric_truss": "Reticulado simétrico",
  "preset.fixed_beam_hinge_overhang": "Viga empotrada con rótula y voladizo",
  "preset.fixed_beam_udl_hinge": "Viga empotrada (distribuida + rótula)",
  "preset.t_frame_fixed": "Pórtico en T (empotrado)",
  "preset.symmetric_two_bay": "Pórtico simétrico de dos vanos",
  "preset.portal_moment": "Pórtico con momento",
  "preset.z_frame": "Pórtico en Z (rodillo en el techo)",
  "preset.l_frame_hinge_inclined": "Pórtico en L con rótula (carga inclinada)",
  "preset.asymmetric_portal_overhang": "Pórtico asimétrico con voladizo",
  "preset.wall_truss_two_panel": "Reticulado en muro (2 paños)",

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

  "settings.sign_convention": "Convención de signos",
  "settings.sign_convention.argentina": "Argentina",
  "settings.sign_convention.international": "Internacional",

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

  "quiz.link": "Quiz",
  "quiz.back": "← Simulador",
  "quiz.title": "Examen V/F — Estática",
  "quiz.check": "Corregir",
  "quiz.reset": "Reiniciar",
  "quiz.score": "Puntaje",
  "quiz.correct": "Correcta",
  "quiz.incorrect": "Incorrecta",
  "quiz.unanswered": "Sin responder",
  "quiz.correctAnswer": "Respuesta correcta:",
  "quiz.true": "Verdadero",
  "quiz.false": "Falso",
  "quiz.more.title": "Más exámenes teóricos",
  "quiz.more.claude": "Estabilidad — Teoría (1.º parcial), 49 preguntas",
  "parcial.back": "← Simulador",
  "parcial.title": "Parcial V/F — Estabilidad",

  "claudeQuiz.link": "Teoría de Estabilidad",
  "claudeQuiz.title": "Estabilidad — Examen teórico (V/F y opción múltiple)",
  "claudeQuiz.intro":
    "49 preguntas de verdadero/falso y opción múltiple sobre sistemas de fuerzas, vínculos y GDL, cadenas cinemáticas y reticulados — con corrección inmediata y explicaciones.",
  "claudeQuiz.back": "← Volver a /quiz",
  "claudeQuiz.filter.all": "Todos",
  "claudeQuiz.filter.unanswered": "Solo sin responder",
  "claudeQuiz.empty": "Ningún resultado coincide con este filtro.",
  "claudeQuiz.topic.fuerzas": "Sistemas de fuerzas",
  "claudeQuiz.topic.vinculos": "Vínculos y GDL",
  "claudeQuiz.topic.cadenas": "Cadenas cinemáticas",
  "claudeQuiz.topic.reticulados": "Reticulados",
  "claudeQuiz.type.vf": "Verdadero / Falso",
  "claudeQuiz.type.mc": "Opción múltiple",
  "claudeQuiz.answered": "respondidas",
  "claudeQuiz.correct": "correctas",
  "claudeQuiz.verdict.ok": "Correcto",
  "claudeQuiz.verdict.no": "Incorrecto",
  "claudeQuiz.shuffle": "Mezclar",
  "claudeQuiz.reset": "Reiniciar",
  "claudeQuiz.result.great": "Muy sólido. Estás listo para la parte teórica.",
  "claudeQuiz.result.ok": "Bien encaminado. Repasá las que fallaste y reintentá.",
  "claudeQuiz.result.low": "Repasá los temas flojos y reintentá.",

  // ── Esfuerzos característicos (N/Q/M) ──
  "esf.link": "Esfuerzos característicos",
  "esf.title": "Esfuerzos característicos",
  "esf.lead":
    "Los tres esfuerzos internos —normal, corte y momento flector— que aparecen al seccionar una pieza en equilibrio, sus signos y cómo trazar sus diagramas.",

  "esf.s1.kicker": "01 — Definición",
  "esf.s1.title": "¿Qué son los esfuerzos internos?",
  "esf.s1.p1":
    "Son los tres tipos de acciones o esfuerzos que se producen en el interior de una viga o pieza, también llamados reacciones internas. Si tomamos una pieza en equilibrio bajo la acción de un sistema cualquiera de fuerzas —activas y reactivas— y la seccionamos en un punto cualquiera, el equilibrio se pierde.",
  "esf.s1.p2":
    "El equilibrio se restablece si sobre la cara de la sección actúa la resultante de las fuerzas que provienen de la porción que fue retirada. Al descomponer esa resultante se obtienen los tres esfuerzos característicos.",

  "esf.s2.kicker": "02 — Terna local",
  "esf.s2.title": "El sistema de ejes de la barra",
  "esf.s2.p1":
    "Cada barra tiene su propia terna local, definida desde el nudo inicial i hacia el nudo final j:",
  "esf.s2.x": "eje de la barra, de i a j — dirección del esfuerzo normal.",
  "esf.s2.y": "perpendicular al eje, girado 90° antihorario respecto de x′ — dirección del corte.",
  "esf.s2.z": "saliente del plano; el sentido positivo del momento se mide alrededor de este eje (horario positivo).",
  "esf.s2.p2":
    "Los signos de N, Q y M se definen respecto de esta terna; por eso el mismo esfuerzo puede leerse con distinto signo según cómo se oriente la barra.",

  "esf.s3.kicker": "03 — Los tres esfuerzos",
  "esf.s3.title": "Normal, corte y momento flector",
  "esf.s3.intro":
    "Cada esfuerzo es la proyección (o, para el momento, el momento estático) de la resultante de todas las fuerzas exteriores —activas y reactivas— que actúan a la izquierda de la sección, tomadas con su signo; o bien las que actúan a la derecha, tomadas con signo cambiado.",
  "esf.s3.n.name": "Esfuerzo normal — N (𝔑)",
  "esf.s3.n.def":
    "Proyección sobre el eje de la barra de la resultante de las fuerzas exteriores que actúan a un lado de la sección.",
  "esf.s3.n.sign":
    "Negativo si tiende a acortar o comprimir la pieza; positivo en caso de tracción.",
  "esf.s3.q.name": "Esfuerzo de corte — Q (Ω)",
  "esf.s3.q.def":
    "Proyección sobre la sección de la resultante de las fuerzas exteriores perpendiculares al eje que actúan a un lado de la sección.",
  "esf.s3.q.sign":
    "Negativo si el sentido de la fuerza coincide con el sentido positivo del eje y′; positivo en caso contrario.",
  "esf.s3.m.name": "Momento flector — M (𝔐)",
  "esf.s3.m.def":
    "Momento estático, respecto del baricentro de la sección, de la resultante de las fuerzas exteriores que actúan a un lado de la sección.",
  "esf.s3.m.sign":
    "Negativo si el sentido de giro es opuesto al de las agujas del reloj; positivo si es horario.",
  "esf.s3.cap.n": "N > 0: tracción",
  "esf.s3.cap.q": "Q > 0: corte positivo",
  "esf.s3.cap.m": "M > 0: horario (positivo)",
  "esf.s3.n": "alarga la pieza",
  "esf.s3.q": "corte en la sección",
  "esf.s3.m": "flexión positiva",

  "esf.s4.kicker": "04 — Los diagramas",
  "esf.s4.title": "Cómo se arman",
  "esf.s4.p1":
    "Se toma un eje de referencia para cada uno de los esfuerzos y, en correspondencia con cada sección, se llevan en forma perpendicular segmentos que —en determinada escala— representan los valores de N, Q y M. El lugar geométrico de todos esos puntos se denomina diagrama de N, Q o M.",
  "esf.s4.p2":
    "En este simulador los diagramas se trazan con la convención Argentina (UTN) por defecto: el valor negativo se grafica a la izquierda de las columnas y por arriba de las vigas, y el momento flector se dibuja sobre la fibra traccionada, continuo en los nudos.",

  "esf.s5.kicker": "05 — Determinación analítica",
  "esf.s5.title": "Paso a paso",
  "esf.s5.step1.t": "Sustentación",
  "esf.s5.step1.d": "Analizar las condiciones de sustentación y determinar si es posible resolverlo.",
  "esf.s5.step2.t": "Diagrama de cuerpo libre",
  "esf.s5.step2.d": "Graficar el diagrama de cuerpo libre.",
  "esf.s5.step3.t": "Ecuaciones de equilibrio",
  "esf.s5.step3.d": "Plantear las tres, o más, ecuaciones de equilibrio.",
  "esf.s5.step4.t": "Reacciones de vínculo",
  "esf.s5.step4.d": "Resolver el sistema y determinar las reacciones de vínculo.",
  "esf.s5.step5.t": "Puntos característicos",
  "esf.s5.step5.d": "Determinar los puntos característicos de la estructura a analizar y confeccionar la tabla de valores.",
  "esf.s5.step6.t": "Recorrer y graficar",
  "esf.s5.step6.d": "Recorrer la estructura calculando los esfuerzos y graficarlos en escala.",

  "esf.s6.kicker": "06 — Ejemplo resuelto",
  "esf.s6.title": "Pórtico en L, empotrado en la base",
  "esf.s6.p1":
    "Columna A–B de 3 m, viga B–C de 4 m, empotramiento en A y una carga P = 10 kN hacia abajo en el extremo libre C. Es el caso donde la terna local se luce: la columna no tiene un ‘arriba’ obvio.",
  "esf.s6.reac.cap":
    "Reacciones en el empotramiento. La carga está a 4 m del eje de la columna, de ahí el momento de 40 kN·m.",
  "esf.s6.cut.t": "El corte, barra por barra",
  "esf.s6.cut.p":
    "Viga B→C (x′ hacia la derecha). Cortamos a distancia s y aislamos el trozo derecho, que sólo tiene la carga P en C:",
  "esf.s6.cut.cap":
    "La carga tracciona la fibra superior de la viga (M < 0, hogging). En la columna el mismo razonamiento da N = −10 (compresión), Q = 0 y M = −40 constante, porque la carga está siempre a 4 m del eje.",
  "esf.s6.diag.t": "Los tres diagramas",
  "esf.s6.diag.n": "Normal. Columna comprimida (−10 kN); viga con N = 0.",
  "esf.s6.diag.q": "Corte. Constante +10 kN en la viga; nulo en la columna.",
  "esf.s6.diag.m":
    "Flector. −40 kN·m constante en la columna, lineal a 0 en la punta. Continuo en el nudo B.",
  "esf.s6.th.bar": "Barra",
  "esf.s6.th.axis": "Terna x′",
  "esf.s6.th.state": "Estado del axil",
  "esf.s6.bar.col": "A→B (columna)",
  "esf.s6.bar.beam": "B→C (viga)",
  "esf.s6.axis.up": "hacia arriba",
  "esf.s6.axis.right": "hacia la derecha",
  "esf.state.compression": "Compresión",
  "esf.state.zero": "Nulo",

  "esf.footer":
    "Definiciones y procedimiento según el apunte de la cátedra (UTN FRBA); los diagramas del simulador siguen la convención Argentina.",
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
