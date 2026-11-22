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
  "preset.beam_ipb300_check": "Beam IPB 300 (check)",
  "preset.truss_cable_beam": "Truss + cable + beam (sizing)",
  "preset.truss_cable_beam_ipb260": "Truss + cable + beam IPB 260 (check and sizing)",

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

  "editor.members.section": "Section",
  "editor.members.self_weight": "Own wt",
  "editor.members.self_weight_hint":
    "Add the member's own weight (profile kg/m) as a distributed load; needs a profile or a size",
  "editor.section.none": "— (analysis only)",
  "editor.section.cable": "Cable",
  "editor.section.size": "Size (lightest that passes)",
  "editor.section.verify": "Check profile",
  "editor.material.sigma_adm": "σ adm",
  "editor.material.sigma_note":
    "Used by the Results tab for members with a section (check a profile, size one, or size a cable). Forces in kg and lengths in m give kg/cm²; E is then in kg/m² (steel: 2.1e10).",
  "checks.title": "Verification and sizing",
  "checks.self_weight": "Own weight added to the supports and the members (the beam itself is verified / sized for the loads alone)",
  "checks.d_min_long": "Minimum cable diameter",
  "checks.d_adopted": "adopt",
  "checks.deflection": "Max deflection f (bending of the member alone, relative to the chord between its ends)",
  "checks.no_sigma": "Set σ adm in the Material tab to run the checks.",
  "checks.member": "Member",
  "checks.profile": "Profile",
  "checks.result": "Result",
  "checks.pass": "✓ passes",
  "checks.fail": "✗ does not pass",
  "checks.lightest": "Lightest that passes",
  "checks.none": "none in the table",
  "checks.unloaded": "no load: any profile",
  "checks.cable": "Cable",
  "checks.cable_bending":
    "carries bending or shear: it is not a cable (give it hinges at both ends)",
  "checks.not_converged":
    "The own-weight iteration did not settle: the picks may be out of date.",
  "checks.note_hyperstatic":
    "Forces are those of the current model; in a hyperstatic structure they change once the profile is applied, so check again after assigning it.",
  "editor.section.aria": "Section of member",
  "checks.not_tension": "not in tension: a cable cannot take compression",
  "checks.note_buckling":
    "σ = N/A + M/W is checked; members in compression must also stay below Euler's buckling load P_cr = π²·E·Iy/L² (pinned ends, weak axis, safety coefficient 1).",

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

  "nav.guides": "Guides",

  "f3d.title": "3D Frame Simulator",
  "f3d.link": "3D frames",
  "f3d.back_2d": "← 2D simulator",
  "f3d.reset": "Reset",
  "f3d.peak": "Largest |σ|: bar {member} ({profile}), {pct} % of σ adm — {where}",
  "f3d.peak.node_fixed": "at the fixed support {node}",
  "f3d.peak.node_pinned": "at the support {node}",
  "f3d.peak.node_free": "at joint {node}",
  "f3d.peak.inside": "inside the bar, {dist} m from {node} (not at a node: look for the interior maximum)",
  "f3d.peak.constant": "the same along the whole bar",
  "f3d.fullscreen.enter": "Full screen",
  "f3d.fullscreen.exit": "Exit full screen",
  "f3d.panel.hide": "Hide the nodes / members / loads panel",
  "f3d.panel.show": "Show the nodes / members / loads panel",
  "f3d.example.t_frame": "#1 3D T-frame (fixed)",
  "f3d.example.t_frame_kg": "#2 3D T-frame (fixed)",
  "f3d.example.t_frame_qy": "#3 3D T-frame (fixed)",
  "f3d.example.frame_right_beam": "#4 3D frame (fixed)",
  "f3d.example.frame_overhang": "#5 3D frame (fixed) · σ max inside the bar",
  "f3d.example.l_torsion": "#8 L space frame (torsion)",
  "f3d.example.eccentric_tension": "#7 Eccentric tension on IPN 300 (P_z,max)",
  "f3d.example.cantilever_kg": "#6 Cantilever IPN 320 (max length)",
  "f3d.example.column_kg": "#9 3D column (fixed)",
  "f3d.diagram": "Diagram:",
  "f3d.diagram_none": "None",
  "f3d.note":
    "Oblique view: x right, z up, y toward the viewer (global axes, the course's left-handed triad). Local triad of each member: z along the member (down or to the left), x out of the plane, y to the right (columns) or down (beams). Moments are drawn on the tension side.",
  "f3d.nodes.z": "z",
  "f3d.material.note":
    "E, G in {u}/m², A in m², Ix/Iy/J in m⁴. Local axes: z along the member, x out of the plane, y in the section; Ix is the inertia about x (bending in the y-z plane), Iy about y.",
  "f3d.error":
    "⚠ Unstable, singular or malformed 3D model — check supports, members and loads. Diagrams cannot be computed.",
  "f3d.results.peaks": "Peak internal forces",
  "f3d.members.profile": "Profile",
  "f3d.members.profile_none": "— (material tab)",
  "f3d.members.rotate": "Rotate 90°",
  "f3d.members.rotate_title":
    "The strong axis bends the member in the x-z plane instead of the y-z plane",
  "f3d.material.sigma_adm": "σ adm ({u}/cm²)",
  "f3d.results.stress": "Normal stress",
  "f3d.results.profile": "Profile",
  "f3d.results.sigma_max": "σ max ({u}/cm²)",
  "f3d.results.ratio": "σ/σ adm",
  "f3d.results.no_profile":
    "Assign an IPN/IPB profile to a member (members tab) to check its stress.",
  "f3d.results.stress_note":
    "σ = N/A + Mx·y/Ix + My·x/Iy at the most stressed corner of the section (Mx, My > 0 tension the +y, +x fibres). Assumes {u} and m. Profiles: CIRSOC tables (IPN, IPB).",
  "f3d.view.stress_colors": "Color by σ/σ adm",
  "f3d.view.local_axes": "Local axes",
  "f3d.loads.from": "from (m)",
  "f3d.loads.to": "to (m)",
  "f3d.cut.check": "Check at the critical corner",
  "f3d.cut.toggle": "Section cut",
  "f3d.cut.title": "Section cut",
  "f3d.cut.member": "Member",
  "f3d.cut.aria_member": "cut member",
  "f3d.cut.aria_member_fs": "cut member (full screen)",
  "f3d.cut.aria_pos": "cut position",
  "f3d.cut.aria_pos_fs": "cut position (full screen)",
  "f3d.cut.peak": "Go to σ max",
  "f3d.cut.no_profile":
    "Assign an IPN/IPB profile to a member (members tab) to see its section cut.",
  "f3d.cut.view_note":
    "Section seen with z into the page: x to the right, y up. The 'Z' diagrams are σ from N, Mx and My; the corner values are their sum. Fillets are not drawn.",
  "f3d.cut.neutral": "neutral axis",
  "f3d.cut.reaction": "Reaction at",
  "f3d.cut.point_load": "Load",
  "f3d.cut.joint_load": "Load received at",
  "f3d.cut.local": "section axes (local)",
  "f3d.cut.neutral_short": "N.A.",
  "f3d.cut.uniform": "Uniform σ",
  "f3d.cut.uniform_why": "Only N acts here (no bending): there is no neutral axis.",
  "f3d.cut.uniform_zero": "σ = 0 at this cut",
  "f3d.cut.uniform_zero_why": "N, Mx and My are zero here, so there is no normal stress (shear and torque, if any, do not produce σ).",
  "f3d.cut.critical": "most stressed corner",
  "f3d.cut.resultant": "Resultant diagram (N + Mx + My)",
  "f3d.cut.smax": "σ max",
  "f3d.cut.smin": "σ min",
  "f3d.cut.tension": "tension fibres",
  "f3d.cut.compression": "compression fibres",
  "f3d.cut.prism_note":
    "The whole member in 3D (z runs into the page, up and to the right; z = 0 is the front end). The sides are painted with σ at every z, so you see how it varies along the member; the plate that slides with the slider is the cut. Blue: distributed load; red: point load on the free end of the member, or (at a joint at the z = 0 end) what the rest of the structure hands to the member there; purple: support reaction — only those between the z = 0 end and the cut, which is the part the internal forces balance (the applied load shared with other members at a joint is not listed itself) — in the section's own axes (the axial part is drawn along z). Darker = larger |σ| (scaled by the member's largest); the ring marks the most stressed corner of the cut.",
  "f3d.cut.forces": "Forces at the cut",
  "f3d.cut.corner": "Corner",
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
  "prof.link": "Steel profiles",
  "ecc.link": "Eccentric load",
  "cut.link": "Section cut guide",
  "cut.kicker": "Oblique compound bending · section cut",
  "cut.title": "Where the compressed fibres are",
  "cut.lead": "The section-cut diagram is built from three things: the sign of σ at each corner, the neutral axis (E.N.) and the side of the E.N. where σ is negative. This page explains the idea and goes through the steps in the order you do them on paper, including which face of the profile to use, with the base of a clamped column as the worked example.",
  "cut.s1.kicker": "Step 1",
  "cut.s1.title": "Choose the cut and the part to study",
  "cut.s1.p1": "Cutting a member leaves two parts, and you can study either one. Take the part with fewer loads and no supports, usually the one with a free end, so you do not need the reactions. If both are equally simple, take the part between z = 0 and the cut.",
  "cut.s1.b1": "The part between z = 0 and the cut: N, Qx, Qy, T, Mx and My are the forces on its +z face and balance every load and reaction on that part.",
  "cut.s1.b2": "The part from the cut to the other end: N, Mx and My come out the same, because they are defined by what they do to the fibres (tension, tension on +y, tension on +x). Only the shears and the torque are read on the face you chose, and they do not enter σ.",
  "cut.s1.p2": "Whichever part you take the result must be the same, so working both is a good check of your free body.",
  "cut.fig1.a": "Part A: z from 0 to the cut. The free body we study.",
  "cut.fig1.b": "Part B: from the cut to the other end.",
  "cut.fig1.cut": "cut at z",
  "cut.fig1.load": "loads on part A",
  "cut.fig1.face": "N, Q, M act on the +z face",
  "cut.fig1.support": "support",
  "cut.fig1.aria": "A column cut in two parts: part A above the cut, part B below, with z running down from the top",
  "cut.s2.kicker": "Step 2",
  "cut.s2.title": "Get N, Mx and My on the cut, in the local triad",
  "cut.s2.tri.p": "The cut uses the local triad of the member, not the global axes. Express every load and moment in it before you add them up. It is the course's triad: left-handed, and independent of how the member's nodes are ordered.",
  "cut.s2.tri.z": "z along the member: down for a column, to the left for a horizontal member. z = 0 is the end from which z grows: the top of a column, the right end of a horizontal member.",
  "cut.s2.tri.x": "x out of the plane: for a frame in the x–z plane it is −Y of the global axes. The global Y is drawn toward the viewer, so x points away from the viewer.",
  "cut.s2.tri.y": "y in the plane of the frame: to the right for a column and down for a beam.",
  "cut.s2.tri.note": "When you draw the section, put x to the right, y up and z into the page. In the column of the example below, z goes down, x = −Y and y = +X, so a 300 kg force toward +Y is a force along −x of the cut.",
  "cut.s2.p1": "Draw the free body of the part you chose, with the loads and reactions that act on it. Then:",
  "cut.s2.n": "N: add the loads along the member axis. If they push the part toward the cut, N is negative (compression). If they pull it away, N is positive (tension).",
  "cut.s2.m": "Mx and My: imagine the part clamped at the cut. Each load tries to bend it, and the fibres on the side the load pushes toward are compressed while the opposite ones are in tension. The moment is the load times its lever arm to the centroid of the cut. Mx is positive when it tensions +y, My when it tensions +x.",
  "cut.s2.example": "Example: a 3 m column clamped at the base, with a 3 m beam on top (1 m to the left and 2 m to the right of the column), q = 200 kg/m over the whole beam and P = 300 kg at the joint toward +Y. Cut at the base and take the part above it. N: the beam weighs 200·3 = 600 kg and pushes toward the cut, so N = −600 kg. Mx: the right arm weighs 200·2 = 400 kg at 1 m and the left arm 200·1 = 200 kg at 0.5 m, so the net moment is 400 − 100 = 300 kg·m, which compresses the +y fibres: Mx = −300 kg·m. My: P pushes toward −x with a 3 m lever, so My = 300·3 = 900 kg·m, compressing −x and tensioning +x: My is positive.",
  "cut.s2.units": "Units: the solver prints moments in kg·m. Multiply by 100 to get kg·cm, because A, Ix and Iy of the table are in cm.",
  "cut.f.kicker": "Step 3",
  "cut.f.title": "Choose face 1 or face 2 of the profile",
  "cut.f.p1": "The profile can be placed two ways. Face 1: the X axis against the strong axis of the profile, so Ix is the large moment of inertia of the table and the depth runs along Y. Face 2: the profile turned, so the X axis falls on the weak axis: Ix and Iy swap, and so do the half sides.",
  "cut.f.b1": "Mx bends about the X axis, so it is resisted by Ix, and My is resisted by Iy. Face 1 gives the large inertia to Mx and face 2 gives it to My.",
  "cut.f.b2": "Rule of thumb: put the larger moment against the strong axis. Face 1 if |Mx| is the larger one, face 2 if |My| is.",
  "cut.f.b3": "The rule is not a proof: N and the shape of the section also count. Compute |σ|_max on both faces and keep the lower one. The simulator below does it for you.",
  "cut.f.p2": "Example, base of the column: My = 900 kg·m is the larger moment. Face 1 puts the weak Iy = 318 cm⁴ against it and gives |σ|_max = 1 924 kg/cm², which fails σ_adm = 1 400. Face 2 puts the strong Iy = 864 cm⁴ against it and gives 1 209 kg/cm², which passes. That is why the exercise uses the profile turned.",
  "cut.fig3.f1": "Face 1: X on the strong axis",
  "cut.fig3.f2": "Face 2: profile turned",
  "cut.fig3.strong": "strong",
  "cut.fig3.weak": "weak",
  "cut.fig3.cap": "The same IPB 120, the same X (right) and Y (up). Mx bends about the X axis and is resisted by Ix; My is resisted by Iy. Turning the profile swaps which of the two is the strong one.",
  "cut.fig3.aria": "Two drawings of the I section with the X and Y axes: face 1 with the flanges along X, face 2 with the profile turned",
  "cut.g.kicker": "Step 4",
  "cut.g.title": "Know which fibres each effect compresses",
  "cut.g.p1": "Before adding anything, decide where each effect compresses on its own. A fibre is compressed when its σ is negative, and each effect gives a sign that depends only on where the fibre is:",
  "cut.g.n": "N: the same sign over the whole section. N < 0 compresses every fibre and N > 0 tensions every fibre.",
  "cut.g.mx": "Mx: the sign depends on y. Mx > 0 tensions the +y fibres and compresses the −y ones; Mx < 0 does the opposite. The line y = 0 separates them.",
  "cut.g.my": "My: the sign depends on x. My > 0 tensions the +x fibres and compresses the −x ones; My < 0 does the opposite. The line x = 0 separates them.",
  "cut.g.p2": "Sketch each effect as a half-section, like the three small figures in the next step. Then take each corner and add the three signs: where all three compress, that corner is the most compressed, and where all three tension it is the most in tension. When they disagree, the larger value decides, and the next steps give you the numbers. In the example column N < 0, Mx < 0 and My > 0, so the fibre (−x, +y) is compressed by all three.",
  "cut.face.label": "Face of the profile",
  "cut.face.1": "Face 1 (X on the strong axis)",
  "cut.face.2": "Face 2 (profile turned)",
  "cut.face.1.short": "face 1",
  "cut.face.2.short": "face 2",
  "cut.face.compare": "|σ|_max:",
  "cut.face.tie": "same",
  "cut.s3.kicker": "Step 5",
  "cut.s3.title": "Add the three effects, corner by corner",
  "cut.s3.p1": "Now give each corner its number: add the three effects. The sign of the sum tells you whether the corner is compressed (red) or in tension (green). Change the values, switch the face, and watch the three small figures and the large one; on paper, do the same with one small sketch per effect.",
  "cut.s3.p2": "The section is doubly symmetric, so the largest |σ| is always at one of the four corners of its bounding rectangle. The critical corner is the one with the largest absolute value, and its sign says whether it is a tension or a compression corner.",
  "cut.s4.kicker": "Step 6",
  "cut.s4.title": "Find the neutral axis",
  "cut.s4.p1": "The E.N. is the line where σ = 0. It is a straight line, so two points are enough. Set σ = 0 once with y = 0 and once with x = 0:",
  "cut.s4.p2": "Join both points and extend the line to the border of the section. With the numbers of the base of the column:",
  "cut.s4.b1": "If My = 0 or Mx = 0 the E.N. is parallel to the X or the Y axis, and one of the two points does not exist.",
  "cut.s4.b2": "If N = 0 the E.N. goes through the centroid and both points are the origin. Use the slope instead: y = −(My/Iy)/(Mx/Ix)·x.",
  "cut.s4.b3": "The E.N. is not the axis of the moment. With oblique bending, or with N ≠ 0, it is tilted and shifted from the centroid. The larger N is compared with the moments, the farther it moves away.",
  "cut.en.example": "Neutral axis, base of the example column",
  "cut.s5.kicker": "Step 7",
  "cut.s5.title": "Mark the compressed zone",
  "cut.s5.p1": "The E.N. splits the section into two zones, one in tension and one in compression. Two ways to know which is which, and they must agree with the signs of step 4:",
  "cut.s5.b1": "The centroid. At the origin σ = N/A. If N is negative, the side of the E.N. that contains the centroid is compressed. If N is positive, it is in tension.",
  "cut.s5.b2": "A corner. Evaluate σ at a corner: negative means it is in the compressed zone. The most compressed fibre is the corner farthest from the E.N. on that side, because σ grows in proportion to the distance to the E.N.",
  "cut.s5.b4": "On the exam drawing: shade the compressed zone, mark the corner with the most negative σ with a ring, and write its value.",
  "cut.s5.p2": "In the base of the example column the most compressed corner is (−6; +6): the −x fibres are compressed by My, the +y fibres by Mx, and N adds a little. That is σ = −1 208.7 kg/cm², the largest in absolute value, so it governs the check against 1 400 kg/cm².",
  "cut.s8.kicker": "Step 8",
  "cut.s8.title": "Draw the resultant diagram of the cut",
  "cut.s8.p1": "You now have the E.N. and σ at the four corners. The resultant diagram shows σ in the plane of the section, tilted with the E.N. It is built in five moves:",
  "cut.s8.1": "Draw the section and the E.N. through it.",
  "cut.s8.2": "Find the two extreme fibres: the corners with the largest and the smallest σ. They are the corners farthest from the E.N., one on each side of it.",
  "cut.s8.3": "Through each of them draw a line parallel to the E.N. σ is the same along each parallel, because it only changes in the direction perpendicular to the E.N.",
  "cut.s8.4": "Draw the baseline perpendicular to the E.N., away from the section, so that it crosses both parallels and the E.N. Its three crossings are σ_max, σ_min and σ = 0.",
  "cut.s8.5": "Along each parallel plot the ordinate from the baseline, proportional to σ: take the larger of |σ_max| and |σ_min| to a convenient length and scale the other. Positive ordinates point away from the section and negative ones fold back toward it. Join the tips with the point where the E.N. crosses the baseline: you get a triangle in tension and one in compression, each with its circled sign.",
  "cut.s8.p2": "Write σ_max and σ_min at the ends of the baseline. If σ has the same sign on the whole section the E.N. falls outside it and you get one trapezoid instead of two triangles; if σ is the same everywhere (only N) there is no E.N. and no diagram: write ‘σ uniform’.",
  "cut.res.smax": "σ_max",
  "cut.res.smin": "σ_min",
  "cut.res.baseline": "base ⟂ E.N.",
  "cut.res.cap": "The two lines through the extreme corners are parallel to the E.N.; the baseline is perpendicular to it, and the ordinates run along the parallels. The diagram follows the values and the face of step 5: change them there.",
  "cut.res.zero": "σ = 0 over the whole cut: there is no E.N. and no diagram to draw.",
  "cut.res.uniform": "σ is uniform (only N): there is no E.N. and no diagram. Write ‘σ uniform’.",
  "cut.res.aria": "Resultant diagram: the section, the neutral axis, two parallels through the extreme corners and a perpendicular baseline with a tension and a compression triangle",
  "cut.s6.kicker": "Whole procedure",
  "cut.s6.title": "Building the complete section cut",
  "cut.full.1": "Pick the member, the position z of the cut and the part to study (step 1).",
  "cut.full.2": "Draw the free body of that part, write its loads in the member's local triad and get N, Mx and My (step 2). Write the moments in kg·cm.",
  "cut.full.3": "Choose face 1 or face 2 of the profile: compute |σ|_max on both and keep the lower one, which puts the larger moment against the strong axis (step 3).",
  "cut.full.4": "Write the section data for that face: profile, A, Ix, Iy and the half sides x_max and y_max. Face 2 swaps Ix with Iy and the two half sides.",
  "cut.full.5": "Decide which fibres each effect compresses from the signs of N, Mx and My (step 4).",
  "cut.full.6": "Compute σ of each effect at the four corners: N/A, Mx·y/Ix and My·x/Iy (step 5).",
  "cut.full.7": "Add them in each corner, write the four σ and mark the circled + or − of each one. The largest |σ| is the critical corner.",
  "cut.full.8": "Find the two points of the E.N. (step 6), draw the line through the section and label it E.N.",
  "cut.full.9": "Shade the compressed zone and the tension zone (step 7). Check with the centroid: σ = N/A tells which side contains it.",
  "cut.full.10": "Draw the resultant diagram: parallels to the E.N. through the extreme fibres, a baseline perpendicular to the E.N., ordinates along the parallels, σ_max and σ_min at the ends (step 8).",
  "cut.full.11": "Compare |σ|_max with σ_adm and write the ratio and the verdict.",
  "cut.s6.note": "This check covers the normal stress only. Shear and torsion stresses are not included.",
  "cut.err.title": "Where it usually goes wrong",
  "cut.err.1": "Pairing Mx with x and My with y. It is the other way around: Mx multiplies y and My multiplies x.",
  "cut.err.2": "Using Ix and Iy of the wrong face: face 1 has the strong axis along X, and face 2 (the profile turned) swaps Ix with Iy.",
  "cut.err.3": "Forgetting the factor 100 when going from kg·m to kg·cm. σ comes out a hundred times too small and the E.N. falls far outside the section.",
  "cut.err.4": "Deciding the compressed side from the moment alone. What counts is the sum of the signs of N, Mx and My at that fibre.",
  "cut.err.5": "Using the global axes instead of the member's local triad. A load toward +Y is along −x in the column of the example, so it tensions the +x fibres.",
  "cut.sim.aria": "Section with tension and compression zones and the neutral axis",
  "cut.sim.section": "IPB 120 · half sides 6 cm",
  "cut.case.p2": "Example column",
  "cut.case.n": "Only N",
  "cut.case.mx": "Only Mx",
  "cut.case.my": "Only My",
  "cut.case.oblique": "Oblique bending, N = 0",
  "cut.leg.tension": "σ > 0, tension",
  "cut.leg.compression": "σ < 0, compression",
  "cut.leg.en": "neutral axis (σ = 0)",
  "cut.leg.critical": "critical corner",
  "cut.en.short": "E.N.",
  "cut.read.critical": "Critical corner",
  "cut.read.in_comp": "compression",
  "cut.read.in_tens": "tension",
  "cut.read.max_tens": "Largest tension",
  "cut.read.max_comp": "Largest compression",
  "cut.read.centroid_on": "The centroid is on the E.N.",
  "cut.read.centroid_comp": "The centroid is on the compressed side (N/A < 0).",
  "cut.read.centroid_tens": "The centroid is on the tension side (N/A > 0).",
  "cut.read.zero": "σ = 0 over the whole cut: there is no E.N.",
  "cut.read.uniform_comp": "σ is uniform and negative: the whole section is compressed and there is no E.N.",
  "cut.read.uniform_tens": "σ is uniform and positive: the whole section is in tension and there is no E.N.",
  "cut.eff.n": "σ from N",
  "cut.eff.mx": "σ from Mx",
  "cut.eff.my": "σ from My",
  "cut.eff.none": "Zero: no effect.",
  "cut.eff.n.comp": "Whole section compressed.",
  "cut.eff.n.tens": "Whole section in tension.",
  "cut.eff.mx.top": "Compresses above (y > 0).",
  "cut.eff.mx.bottom": "Compresses below (y < 0).",
  "cut.eff.my.right": "Compresses the right (x > 0).",
  "cut.eff.my.left": "Compresses the left (x < 0).",
  "cut.tbl.corner": "Corner (x; y) cm",
  "ecc.title": "Eccentric axial load on a profile (oblique compound bending)",
  "ecc.intro":
    "A load P_z along the member axis, applied e_x (perpendicular to the web) and e_y (parallel to the web) off the centroid, equals N = P_z plus the moments M_x = P_z·e_y and M_y = P_z·e_x. σ = N/A + M_x·y/I_x + M_y·x/I_y.",
  "ecc.inputs": "Data",
  "ecc.intro_rot":
    "A load P_z along the member axis, applied e_x (parallel to the web, horizontal) and e_y (perpendicular to the web, vertical) off the centroid, equals N = P_z plus the moments M_x = P_z·e_y and M_y = P_z·e_x. σ = N/A + M_x·y/I_x + M_y·x/I_y.",
  "ecc.rotated": "Rotated (web horizontal)",
  "ecc.p": "P_z (kN, + tension)",
  "ecc.ex": "e_x (cm), ⟂ web",
  "ecc.ey": "e_y (cm), ∥ web",
  "ecc.ex_rot": "e_x (cm), ∥ web",
  "ecc.ey_rot": "e_y (cm), ⟂ web",
  "ecc.sigma_adm": "σ adm (kN/cm²)",
  "ecc.reduction": "Reduction to the centroid",
  "ecc.corners": "Stress at the corners (kN/cm²)",
  "ecc.corner": "Corner",
  "ecc.pmax": "Maximum load",
  "ecc.check": "Check at the given P_z",
  "ecc.neutral": "neutral axis",
  "ecc.tension": "tension",
  "ecc.compression": "compression",
  "ecc.section_note":
    "Section seen from the free end: ⊙ tension points toward the viewer, ⊗ compression away from it.",
  "ecc.outside":
    "The load point lies outside the section (beyond half its extent along x or y): it is applied through a bracket or rigid plate. Only the moments P·e matter.",
  "prof.profile": "Profile",
  "prof.title": "Steel profiles (IPN / IPB)",
  "prof.search": "Search: 200, ipb 300, ipn…",
  "prof.all": "All",
  "prof.min_label": "Minimum required",
  "prof.count": "profiles",
  "prof.none": "No profile matches.",
  "prof.hint":
    "Click a row to see the section and copy values. Click a column header to sort. Use the minimums to find the lightest profile that meets Ix, Sx or A.",
  "prof.copied": "Copied",
  "prof.copy": "Click to copy",
  "prof.grp.geometry": "Geometry",
  "prof.grp.section": "Section & torsion",
  "prof.grp.x": "Strong axis X-X",
  "prof.grp.y": "Weak axis Y-Y",
  "prof.lightest": "Smallest area first",
  "prof.detail": "Selected profile",
  "prof.leg.title": "Legend",
  "prof.leg.A": "= Gross cross-sectional area.",
  "prof.leg.w": "= Weight per metre of length (A · 7850 kg/m³).",
  "prof.leg.I": "= Moment of inertia of the section about the principal axes.",
  "prof.leg.r": "= Radius of gyration",
  "prof.leg.S": "= Elastic section modulus.",
  "prof.leg.Q": "= Static moment of half the section.",
  "prof.leg.Z": "= Plastic section modulus.",
  "prof.leg.J": "= Torsion constant.",
  "prof.leg.d": "total depth",
  "prof.leg.bf": "flange width",
  "prof.leg.tf": "flange thickness",
  "prof.leg.tw": "web thickness",
  "prof.leg.hw": "clear web height",
  "prof.leg.r1": "root fillet radius",
  "prof.leg.r2": "flange-toe radius",
  "prof.leg.strong": "strong axis",
  "prof.leg.weak": "weak axis",
  "prof.tab.rolled": "Rolled profiles",
  "prof.tab.chs": "Circular tubes",
  "prof.tab.shs": "Square tubes",
  "prof.tab.rhs": "Rectangular tubes",
  "prof.tab.shapes": "Basic shapes",
  "prof.shapes.note": "Area, centroid and moments of inertia of the basic shapes (the course's table). Axes X, Y through O as drawn; X_g, Y_g through the centroid G. Lengths in any unit: the results come out in that unit (², ⁴).",
  "prof.shapes.pick": "Shape",
  "prof.shapes.dims": "Dimensions",
  "prof.shapes.alpha_hint": "α is the half-angle, in degrees (0–180).",
  "prof.shapes.invalid": "Check the dimensions (all positive; ring: r < R; sector: α up to 180°).",
  "prof.shapes.g_cg": "Centroid and area",
  "prof.shapes.g_o": "About the axes X, Y through O",
  "prof.shapes.g_g": "About the centroidal axes X_g, Y_g",
  "prof.shapes.formula": "Formula",
  "prof.shapes.value": "Value",
  "prof.shape.square": "Square",
  "prof.shape.rectangle": "Rectangle",
  "prof.shape.right_triangle": "Right triangle",
  "prof.shape.isosceles_triangle": "Isosceles triangle",
  "prof.shape.rhombus": "Rhombus",
  "prof.shape.trapezoid": "Trapezoid",
  "prof.shape.hexagon": "Regular hexagon",
  "prof.shape.circle": "Circle",
  "prof.shape.semicircle": "Semicircle",
  "prof.shape.quarter_circle": "Quarter circle",
  "prof.shape.sector": "Circular sector",
  "prof.shape.ring": "Circular ring",
  "prof.tube.H": "outer depth",
  "prof.tube.search": "Search: 168 6.35, 100…",
  "prof.tube.title": "Steel tubes (IRAM-IAS U 500-218 / 2592)",
  "prof.tube.D": "outer diameter",
  "prof.tube.B": "outer width",
  "prof.tube.t": "wall thickness",
  "prof.tube.R": "outer corner radius = 2.00 t",
  "prof.tube.g": "weight per metre",
  "prof.tube.A": "= Gross cross-sectional area.",
  "prof.tube.I": "= Moment of inertia.",
  "prof.tube.S": "= Elastic section modulus.",
  "prof.tube.r": "= Radius of gyration",
  "prof.tube.Z": "= Plastic section modulus.",
  "prof.tube.J": "= Torsion constant.",
  "prof.tube.C": "= Torsional constant (2·A·t, A enclosed by the mid-line).",
  "prof.tube.units":
    "Units: mm for dimensions · cm² · kg/m · cm⁴ · cm³ · cm. Circular rows are computed from D and t; square and rectangular rows are transcribed from the table (rectangular: Ix, Sx, rx, Zx about X-X, depth H).",
  "prof.units":
    "Units: mm for dimensions · cm² · cm³ · cm · cm⁴. X-X is the strong axis.",
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
  "quiz.more.parcial": "Estabilidad — 1st partial (Jul 7, 2026)",
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
  "esf.s2.x":
    "the member axis, from i to j — the direction of the axial force.",
  "esf.s2.y":
    "perpendicular to the axis, rotated 90° counter-clockwise from x′ — the direction of the shear.",
  "esf.s2.z":
    "out of the plane; the positive sense of the moment is measured about this axis (clockwise positive).",
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
  "esf.s5.step1.d":
    "Analyse the support conditions and determine whether the structure can be solved.",
  "esf.s5.step2.t": "Free-body diagram",
  "esf.s5.step2.d": "Draw the free-body diagram.",
  "esf.s5.step3.t": "Equilibrium equations",
  "esf.s5.step3.d": "Write the three (or more) equilibrium equations.",
  "esf.s5.step4.t": "Reactions",
  "esf.s5.step4.d": "Solve the system and find the support reactions.",
  "esf.s5.step5.t": "Key points",
  "esf.s5.step5.d":
    "Identify the structure’s key points and build the table of values.",
  "esf.s5.step6.t": "Traverse and plot",
  "esf.s5.step6.d":
    "Traverse the structure computing the forces and plot them to scale.",

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

  "flx.link":
    "Bending",
  "flx.title":
    "Bending (flexión)",
  "flx.lead":
    "Simple bending, straight and oblique: where the formula σ = M·y / J_x comes from, what the neutral axis is, and how to use it to verify and size a section. Based on the course notes (AMS 2020).",
  "flx.s1.kicker":
    "01 — Definition",
  "flx.s1.title":
    "Simple bending",
  "flx.s1.p1":
    "Simple bending is the loading for which the reduction to the centroid of the section, of the forces acting on both sides of it, is limited to two couples normal to the plane of the section, with or without shear. With no shear it is called pure bending; otherwise, bending and shear.",
  "flx.s1.p2":
    "The bending plane is the plane in which the bending couples act, and the line of forces is its trace on the plane of the section.",
  "flx.s1.normal":
    "The line of forces coincides with one of the principal axes of inertia of the section: simple normal (straight) bending.",
  "flx.s1.oblique":
    "The line of forces makes an angle α with that axis: simple oblique bending.",
  "flx.s2.kicker":
    "02 — Review",
  "flx.s2.title":
    "Principal axes of inertia",
  "flx.s2.p1":
    "Among all the pairs of axes through a point, the moments of inertia of a section reach their maximum and minimum about two perpendicular axes: the principal axes of inertia. The product of inertia about them is zero, and the corresponding moments are the principal moments of inertia.",
  "flx.s2.p2":
    "When the two principal moments are different, that orthogonal pair is unique. When they are equal (a circle, a square) every orthogonal pair through the centroid is principal.",
  "flx.s3.kicker":
    "03 — Straight bending",
  "flx.s3.title":
    "When a bar works in straight bending",
  "flx.s3.intro":
    "A bar assumed horizontal works in straight bending when:",
  "flx.s3.a":
    "The axis of the bar is straight or has a small curvature.",
  "flx.s3.b":
    "The bar has a vertical plane of symmetry α.",
  "flx.s3.c":
    "The loads P_i act perpendicular to the axis of the bar and lie in the plane α.",
  "flx.s3.note":
    "Plane α is the plane of forces (of bending) and the axis y–y is the axis of symmetry of the piece, hence a principal axis of inertia: it can be the one with J_max or the one with J_min.",
  "flx.s4.kicker":
    "04 — Deformation",
  "flx.s4.title":
    "The neutral axis",
  "flx.s4.p1":
    "The longitudinal axis of the piece bends under the system of forces P_i. The sections CD and EF, originally a rectangle, form a trapezoid once loaded: the distance CE gets shorter and DF gets longer. The upper part has been compressed and the lower part has been put in tension.",
  "flx.s4.p2":
    "So between the two extreme fibres there is a middle fibre that has not been deformed and therefore carries no stress: the neutral axis (N.A.) of the piece.",
  "flx.s4.fig":
    "Before and after bending: the top fibre shortens (compression), the bottom fibre lengthens (tension), and the neutral axis keeps its length.",
  "flx.s4.fig.tension":
    "tension",
  "flx.s4.fig.compression":
    "compression",
  "flx.s4.fig.na":
    "N.A.",
  "flx.s5.kicker":
    "05 — The formula",
  "flx.s5.title":
    "From equilibrium to σ = M·y / J_x",
  "flx.s5.p1":
    "An element of area dA at a distance y from the neutral axis is loaded by an internal force σ·dA, where σ is the stress at that element: tension or compression depending on whether it is below or above the N.A. For the section to be in equilibrium, the sum of all internal forces must be zero and the sum of their moments about the N.A. must equal the moment M of the external forces at that section:",
  "flx.s5.p2":
    "A fibre at a distance y from the N.A. changes length in proportion to its distance. If σ_1 is the stress on the unit of area at distance 1 from the N.A. and σ the one at distance y:",
  "flx.s5.p3":
    "Substituting σ = σ_1·y into (1) and (2):",
  "flx.s5.p4":
    "Since σ_1 ≠ 0, (4) gives ∫y dA = 0 (6): the first moment of the area is zero, so the neutral axis is a centroidal axis. The axis X–X lies in the cross-section and crosses the longitudinal axis of the bar at the centroid.",
  "flx.s5.p5":
    "In (5) the integral ∫y² dA = J_x is the moment of inertia of the section about the neutral axis X–X, so M = σ_1·J_x and, from (3):",
  "flx.s5.p6":
    "This gives the stress σ at a generic point at distance y of a section loaded by a moment M. For safety, M_max is taken together with the farthest fibre from the neutral axis, v:",
  "flx.s5.p7":
    "J_x / v is called the section modulus W_x (cm³), and the formula becomes:",
  "flx.s6.kicker":
    "06 — Use",
  "flx.s6.title":
    "Verification and sizing",
  "flx.s6.ver":
    "Verification",
  "flx.s6.siz":
    "Sizing",
  "flx.s6.p1":
    "If the centroid of the section is not at mid-height there are two section moduli, W_1 = J_x / v_1 and W_2 = J_x / v_2, and for safety the smaller one is used.",
  "flx.s6.p2":
    "This is exactly the check the app’s results tab performs for a member with a section (σ = |N|/A + |M|·100/S_x ≤ σ_adm).",
  "flx.footer":
    "Transcribed and ordered from the course notes “Flexión AMS 2020”; the equation numbers are the notes’.",

  "tor.link":
    "Torsion",
  "tor.title":
    "Torsion of circular shafts",
  "tor.lead":
    "Straight circular bars under a torque M_t: the shear strain γ, the stress τ = M_t·ρ / J_0, the angle of twist φ and how to verify or size a solid or hollow shaft. Based on Raffo, Estática y Resistencia de Materiales, ch. XXIII.",
  "tor.s1.kicker":
    "01 — Definition",
  "tor.s1.title":
    "Simple torsion",
  "tor.s1.p1":
    "A solid is in simple torsion when the forces on one side of a section reduce to a single couple lying in the plane of that section. Its moment M_t is the torque. The usual case is a straight piece loaded at its ends by couples of equal magnitude and opposite sense, each in the plane of an end section; or a piece clamped at one end and twisted by a couple at the other, the clamp providing the opposite reaction couple. Transmission shafts of machines are the typical example.",
  "tor.s1.p2":
    "Here we study straight circular torsion: a prism of constant circular cross-section, solid or hollow.",
  "tor.s2.kicker":
    "02 — What the bar does",
  "tor.s2.title":
    "Hypotheses and deformation",
  "tor.s2.p1":
    "Take a bar clamped at one end and twisted by M_t at the other. Experiments show that:",
  "tor.s2.h1":
    "The geometric axis stays straight.",
  "tor.s2.h2":
    "The other longitudinal fibres become helices.",
  "tor.s2.h3":
    "Each cross-section stays plane and perpendicular to the axis: the whole section just rotates about its centre O.",
  "tor.s2.p2":
    "So a point B of a section at distance l from the clamp moves to B′ along an arc, and the straight fibre BB_0 tilts by the shear strain γ. The section has turned an angle φ (radians) relative to the clamped one.",
  "tor.s2.fig":
    "Section before and after twisting: the point at radius ρ moves along an arc of angle φ, and the fibre of length l tilts by γ.",
  "tor.s2.p3":
    "From the geometry, the arc BB′ is ρ·φ and also γ·l, hence:",
  "tor.s3.kicker":
    "03 — Stress",
  "tor.s3.title":
    "From the strain to τ = M_t·ρ / J_0",
  "tor.s3.p1":
    "Shear strain and shear stress are linked by Hooke’s law for shear, with the shear modulus G (kg/cm²), related to E by G = 0.385·E (about 0.4·E for steel, the value used in the examples):",
  "tor.s3.p2":
    "Substituting γ = ρ·φ/l shows that τ is proportional to the distance ρ from the centre: zero at the centre, maximum on the outer fibres.",
  "tor.s3.p3":
    "To balance the torque, the elementary force τ·dA at distance ρ must have a moment about O equal to M_t when added over the whole section. Since G and φ/l are constants:",
  "tor.s3.p4":
    "where J_0 = ∫ρ² dA is the polar moment of inertia. So the unit twist is φ/l = M_t / (G·J_0). The product G·J_0 is the torsional rigidity of the bar. Eliminating φ/l gives the resistance equation, the analogue of σ = M·y / J_x in bending (valid for circular sections only):",
  "tor.s3.fig":
    "τ grows linearly with ρ: zero at the centre, τ_max at the surface.",
  "tor.s4.kicker":
    "04 — Solid section",
  "tor.s4.title":
    "The formulas you use",
  "tor.s4.p1":
    "For a solid circle J_0 = π·D⁴/32. With ρ = D/2 at the surface:",
  "tor.s4.p2":
    "And the total angle of twist of a bar of length l, in radians (multiply by 180/π for degrees):",
  "tor.s4.p3":
    "Units: M_t in kg·cm, l and D in cm, G in kg/cm², J_0 in cm⁴, φ in radians. Careful with kg·m: 1 kg·m = 100 kg·cm.",
  "tor.s5.kicker":
    "05 — Hollow section",
  "tor.s5.title":
    "Hollow circular shafts",
  "tor.s5.p1":
    "The same procedure holds. With outer diameter D_e, inner D_i and n = D_i / D_e:",
  "tor.s5.p2":
    "The material near the centre carries almost no stress, so a hollow shaft weighs less for the same τ_max. Equal torque and equal τ_max give D = D_e·∛(1 − n⁴). For D_e = 40 cm and D_i = 20 cm (n = 1/2) that is D ≈ 39 cm for the solid shaft, and the hollow one weighs about 79 % of it (areas 40² − 20² against 39²): roughly 20 % cheaper.",
  "tor.s6.kicker":
    "06 — Transmission shafts",
  "tor.s6.title":
    "Sizing a shaft from the power",
  "tor.s6.p1":
    "The torque comes from the power N (in CV) and the revolutions per minute n. With P = 7500·N kg·cm/s and ω = π·n/30:",
  "tor.s6.p2":
    "and, replacing in the sizing formula, the minimum diameter of the shaft (ignoring bending from pulleys and self-weight):",
  "tor.s7.kicker":
    "07 — Worked examples",
  "tor.s7.title":
    "Two exercises",
  "tor.s7.e1.title":
    "Verify a bar",
  "tor.s7.e1.p":
    "Steel round bar, D = 6 cm, l = 3 m, M_t = 200 kg·m. Find τ_max and φ. G = 0.4·2 100 000 = 840 000 kg/cm².",
  "tor.s7.e1.r":
    "M_t = 20 000 kg·cm; J_0 = π·6⁴/32 = 127 cm⁴; τ_max = 16·20 000 / (π·6³) ≈ 472 kg/cm²; φ = 20 000·300 / (840 000·127) = 0.056 rad ≈ 3°12′.",
  "tor.s7.e2.title":
    "Size a bar",
  "tor.s7.e2.p":
    "Steel bar, l = 2 m, loaded by a 500 kg force with a 120 cm arm at the free end. τ_adm = 600 kg/cm², G = 800 000 kg/cm². Find D and φ.",
  "tor.s7.e2.r":
    "M_t = 500·120 = 60 000 kg·cm; R = ∛(2·60 000 / (π·600)) ≈ 4 cm, so D = 8 cm; J_0 = π·8⁴/32 ≈ 402 cm⁴; φ = 60 000·200 / (800 000·402) ≈ 0.037 rad ≈ 2°7′.",
  "tor.note":
    "A note on the source: the book prints τ_max = 549 kg/cm² for the first exercise, but its own formula gives 472 kg/cm²; the value above is recomputed.",
  "tor.footer":
    "Summarised and recomputed from Raffo, C. M., Estática y Resistencia de Materiales (ch. XXIII, Torsión); equation numbers are not kept.",
  "axl.link":
    "Axial load",
  "axl.title":
    "Axial load (tension and compression)",
  "axl.lead":
    "Simple tension and compression: the hypotheses that make σ = N/A uniform, the sizing and verification formulas, the elongation Δl = N·l/(A·E), self-weight, and three worked exercises. From the course notes “Axil AMS”.",
  "axl.s1.kicker":
    "01 — Definition",
  "axl.s1.title":
    "Simple axial load",
  "axl.s1.p1":
    "A bar is in simple tension or compression when the load P is applied at the centroid and equals N over the whole section, with Q = M_f = M_t = 0. (The notes call the area F; here it is A, to avoid confusion with a force.)",
  "axl.s1.p2":
    "Equilibrium of the section gives six conditions. Only the first one is not zero:",
  "axl.s1.e1":
    "N = ∫ σ dA",
  "axl.s1.e2":
    "0 = ∫ τ_xy dA        0 = ∫ τ_xz dA",
  "axl.s1.e3":
    "0 = ∫ (τ_xz·y − τ_xy·z) dA",
  "axl.s1.e4":
    "0 = ∫ σ·z dA        0 = ∫ σ·y dA",
  "axl.s2.kicker":
    "02 — Hypotheses",
  "axl.s2.title":
    "Why σ is uniform",
  "axl.s2.h1":
    "Hooke’s law: σ = E·ε, with E = tan α the slope of the σ–ε line.",
  "axl.s2.h2":
    "Saint-Venant: the cross-section stays plane and parallel to itself after the deformation, if it is far from the ends; so there is no stress concentration.",
  "axl.s2.p1":
    "The shear strains must then be zero or constant. If γ = 0 then τ = 0. If γ were a nonzero constant, τ would be constant and ∫τ dA = 0 could not hold. So τ_xy = τ_xz = 0 and conditions 2, 3 and 4 are identically satisfied.",
  "axl.s2.p2":
    "Since the sections just translate parallel to themselves, ε = Δl/l is constant, hence σ = E·ε is constant. Then ∫σ·z dA = σ·∫z dA and ∫σ·y dA = σ·∫y dA are the static moments of the area about the centroidal axes y and z: zero, so conditions 5 and 6 hold. The first one gives σ·A = N.",
  "axl.fig":
    "A bar under N: every cross-section carries the same σ = N/A.",
  "axl.s3.kicker":
    "03 — Formulas",
  "axl.s3.title":
    "Sizing, verification and elongation",
  "axl.s3.sizing":
    "Sizing",
  "axl.s3.ver":
    "Verification",
  "axl.s3.p1":
    "The elongation comes from σ = E·ε with ε = Δl/l, so N/A = E·Δl/l:",
  "axl.s3.sign":
    "Sign: in compression N is negative, so sizing and verification use |N| and |σ|; the signed N is kept for the elongation (a shortening).",
  "axl.s3.p2":
    "Validity limits of these formulas:",
  "axl.s3.l1":
    "Only in the elastic range of the material.",
  "axl.s3.l2":
    "Only for a centred load, with uniformly distributed stress.",
  "axl.s3.l3":
    "In compression, only for short bars (longer ones buckle).",
  "axl.s3.l4":
    "The self-weight of the bar does not take part (see below).",
  "axl.s3.l5":
    "Holes concentrate stresses and weaken the bar.",
  "axl.s4.kicker":
    "04 — Steel data",
  "axl.s4.title":
    "Values used in the course",
  "axl.s4.th.mat":
    "Steel",
  "axl.s4.th.yield":
    "Tensile strength",
  "axl.s4.th.adm":
    "σ_adm",
  "axl.s4.p1":
    "E = 2 100 000 kg/cm² and γ = 7 800 kg/m³ for every steel. The safety factor is ν = 3: σ_adm is about the tensile strength divided by 3 (3 700 / 3 ≈ 1 233 → 1 200). The number in the name, St 37, is that strength in kg/mm².",
  "axl.s5.kicker":
    "05 — Self-weight",
  "axl.s5.title":
    "When the weight of the bar counts",
  "axl.s5.p1":
    "If the bar’s own weight takes part, the weight per unit area at the top is γ·l (l the length of the hanging bar), and it adds to the stress:",
  "axl.s5.p2":
    "Units: with γ in kg/m³ and l in m, γ·l comes out in kg/m². Divide by 10 000 to get kg/cm² before combining it with σ_adm.",
  "axl.s6.kicker":
    "06 — Worked exercises",
  "axl.s6.title":
    "Three exercises",
  "axl.s6.e1.title":
    "Size a cable and its elongation",
  "axl.s6.e1.p":
    "A steel cable passes over pulleys along 7 m + 10 m + 6 m + 2 m and holds 5 000 kg. σ_adm = 1 400 kg/cm², E = 2 100 000 kg/cm². Find the radius and the elongation. Then find the radius needed to keep the elongation to 10 % of that value.",
  "axl.s6.e1.r":
    "A_nec = 5 000 / 1 400 = 3.57 cm² = π·r² → r = 1.066 cm. Total length 700 + 1 000 + 600 + 200 = 2 500 cm. Δl = 5 000·2 500 / (3.57·2 100 000) = 1.67 cm. For Δl′ = 0.167 cm: A = 5 000·2 500 / (0.167·2 100 000) = 35.7 cm² → r = 3.37 cm.",
  "axl.s6.e2.title":
    "Admissible load of a wire",
  "axl.s6.e2.p":
    "A hanging wire, 6 m long, radius 0.50 cm, σ_adm = 1 600 kg/cm². Find the admissible load.",
  "axl.s6.e2.r":
    "A = π·0.5² = 0.7854 cm²; F_adm = σ_adm·A = 1 600·0.7854 = 1 256.6 kg.",
  "axl.s6.e3.title":
    "Imposed elongation",
  "axl.s6.e3.p":
    "The same cable (A = 3.57 cm², l = 25 m) is forced to elongate 5 cm. What load does that imply, and is it admissible?",
  "axl.s6.e3.r":
    "F = Δl·A·E / l = 5·3.57·2 100 000 / 2 500 ≈ 15 000 kg; σ = F/A ≈ 4 202 kg/cm² > σ_adm = 1 400: it does NOT verify.",
  "axl.footer":
    "Transcribed from the handwritten course notes “Axil AMS”; numbers in the exercises were recomputed and agree with the notes.",
  "fla.link":
    "Deflection",
  "fla.title":
    "Deflection of beams",
  "fla.lead":
    "From the curvature 1/ρ = M/(E·J) to the elastic line and the deflection f = ∫M·x dx/(E·J), plus the seven usual cases and a calculator. From the course notes “Flecha AMS 2020”.",
  "fla.s1.kicker":
    "01 — Curvature",
  "fla.s1.title":
    "Deformation in normal pure bending",
  "fla.s1.p1":
    "A section of the beam rotates about its neutral axis. By similar triangles, a fibre at distance y from the neutral axis has strain ε = y/ρ, where ρ is the radius of curvature of the beam’s axis (C is the centre of curvature):",
  "fla.s1.e1":
    "1/ρ = ε / y",
  "fla.s1.p2":
    "With Hooke’s law ε = σ/E and the bending stress σ = M·y/J_x:",
  "fla.s1.e2":
    "ε = σ/E = M·y / (J_x·E)",
  "fla.s1.p3":
    "Substituting gives the curvature, and the radius, whose units check out: (kg/cm²)·cm⁴ / (kg·cm) = cm.",
  "fla.s1.fig":
    "An element ds of the beam’s axis: ρ is the radius of curvature, dθ the angle between the two sections.",
  "fla.s2.kicker":
    "02 — Elastic line",
  "fla.s2.title":
    "The differential equation",
  "fla.s2.p1":
    "For an element of the axis, ds = ρ·dθ, so 1/ρ = dθ/ds, and for small slopes ds ≈ dz. Also tan θ = dy/dz ≈ θ. Therefore:",
  "fla.s2.e1":
    "1/ρ = dθ/dz = d²y/dz²",
  "fla.s2.p2":
    "With the axes the notes adopt (z grows while θ decreases) the sign is negative, 1/ρ = −d²y/dz², and equating with the curvature gives the differential equation of the elastic line:",
  "fla.s2.p3":
    "Integrating it once gives the slope θ(z), and twice, the deflection y(z), with the integration constants fixed by the supports.",
  "fla.s3.kicker":
    "03 — Deflection at a point",
  "fla.s3.title":
    "The deflection as an integral",
  "fla.s3.p1":
    "Take an element CD of length dx at distance x from the end where we want the deflection. The two sections rotate a relative angle dα, with dx = ρ·dα, so dα = dx/ρ. The tangent at D deviates from that at C, at the end, by:",
  "fla.s3.p2":
    "and adding over the whole length:",
  "fla.s3.p3":
    "That is the moment of the M/(E·J) diagram about the end where the deflection is measured: the first moment-area theorem. For a cantilever, with x from the free end, it gives f directly.",
  "fla.s4.kicker":
    "04 — Usual cases",
  "fla.s4.title":
    "The seven cases",
  "fla.s4.p1":
    "Maximum deflection of the most common beams. In every case l is the span, E the elastic modulus and J_x the moment of inertia; q, P and p are the load (p is the maximum ordinate of a triangular load).",
  "fla.case.ss-udl":
    "Simply supported, uniform load",
  "fla.case.ss-point":
    "Simply supported, point load at mid-span",
  "fla.case.cant-udl":
    "Cantilever, uniform load",
  "fla.case.cant-point":
    "Cantilever, point load at the free end",
  "fla.case.cant-tri-down":
    "Cantilever, decreasing triangular load (max at the fixed end)",
  "fla.case.cant-tri-up":
    "Cantilever, increasing triangular load (max at the free end)",
  "fla.case.ss-tri":
    "Simply supported, triangular load",
  "fla.case.ss-tri.z":
    "The maximum is at z = 0.519·l from the end where the load is zero.",
  "fla.s4.note":
    "Each coefficient is checked in the app’s test suite against a numerical double integration of M/(E·J).",
  "fla.calc.title":
    "Calculator",
  "fla.calc.case":
    "Case",
  "fla.calc.load.point":
    "P (kg)",
  "fla.calc.load.dist":
    "load (kg/cm)",
  "fla.calc.l":
    "l (cm)",
  "fla.calc.E":
    "E (kg/cm²)",
  "fla.calc.J":
    "J_x (cm⁴)",
  "fla.calc.result":
    "f_max",
  "fla.calc.ratio":
    "= l / ",
  "fla.footer":
    "Transcribed from the handwritten course notes “Flecha AMS 2020”.",
  "shr.link":
    "Shear in bending",
  "shr.title":
    "Shear stresses in bending",
  "shr.lead":
    "From pure shear and Cauchy’s theorem to the Jourawski–Colignon formula τ = Q·S/(J·s), the parabolic distribution in a rectangle and the profile of a double-T. From the course notes “Tensiones de corte en la flexión”.",
  "shr.s1.kicker":
    "01 — Pure shear",
  "shr.s1.title":
    "Pure shear",
  "shr.s1.p1":
    "Pure shear occurs, exactly or approximately, in shearing and in rivets or bolts joining plates under tensile forces: the stress is taken as uniform over the area A that resists,",
  "shr.s1.e1":
    "τ = Q / A",
  "shr.s1.p2":
    "(The notes write the tangential stress with the same letter as the normal one; here τ is always tangential.)",
  "shr.s2.kicker":
    "02 — Cauchy",
  "shr.s2.title":
    "Cauchy’s theorem and sliding stresses",
  "shr.s2.p1":
    "On two normal planes whose intersection defines an edge, the components of the tangential stresses perpendicular to that edge are equal in magnitude and both go towards, or both away from, the edge:",
  "shr.s2.e1":
    "τ_xy = τ_yx        τ_xz = τ_zx        τ_yz = τ_zy",
  "shr.s2.p2":
    "In a beam under shear and moment, the horizontal stresses needed to keep equilibrium would produce sliding on horizontal planes: shear on vertical planes necessarily implies shear on horizontal planes, and vice versa. These are the sliding stresses τ_L, present in all fibres (stacked planks that slide against each other are the picture).",
  "shr.s2.p3":
    "The shear Q at a section is the resultant of all the forces on its left; by equilibrium, the resultant of those on the right is equal and opposite, acting on an infinitely close section.",
  "shr.s3.kicker":
    "03 — Jourawski",
  "shr.s3.title":
    "The Jourawski–Colignon formula",
  "shr.s3.p1":
    "The existence of shear produces tangential stresses in the plane of the section. Take a beam of constant section and a slice of length dx between sections 1 and 2. Because of bending, at a distance y from the neutral axis the stress is σ = M·y/J_x on section 1 and σ + dσ = (M + dM)·y/J_x on section 2.",
  "shr.s3.p2":
    "Now cut off part of the slice by a cylindrical surface of width s. On the hatched part (area Ω) the normal stresses give a force N on section 1 and N + dN on section 2; both are coaxial and their resultant is",
  "shr.s3.e1":
    "dN = ∫Ω (dM/J_x)·y dΩ",
  "shr.s3.p3":
    "That force tends to slide the part above the surface against the rest. Tangential stresses τ on the separating surface oppose it; they are parallel to the axis and vary continuously. With s the length of the curve where the surface meets the section, dT = dx·∫τ ds, and equilibrium requires dT = dN:",
  "shr.s3.e2":
    "(dM/J_x)·∫Ω y dΩ = dx·∫s τ ds",
  "shr.s3.p4":
    "The integral on the left is the static moment S_x of the area Ω about the neutral axis, and the one on the right is τ_m·s, with τ_m the mean value of τ along s. As dM/dx = Q:",
  "shr.s3.p5":
    "By Cauchy’s theorem these longitudinal sliding stresses give, in the plane of the section, tangential stresses normal to the curve s at every point; τ_m is their mean value. S_x is the static moment of the part of the section on one side of the cut, and s is the width of the cut.",
  "shr.s4.kicker":
    "04 — Rectangle",
  "shr.s4.title":
    "Distribution in a rectangular section",
  "shr.s4.p1":
    "For b × h, with the cut at a height y above the neutral axis, s = b, J_x = b·h³/12 and the static moment of the part above is S_x = b·(h/2 − y)·[(h/2 − y)/2 + y] = ½·b·(h²/4 − y²). Replacing:",
  "shr.s4.p2":
    "The distribution is a parabola, zero at the top and bottom fibres and largest at the neutral axis (y = 0):",
  "shr.s4.p3":
    "that is 50 % more than the mean shear Q/area.",
  "shr.s4.ex":
    "Example: b = 10 cm, h = 20 cm, Q = 1 000 kg → mean Q/A = 5 kg/cm², τ_max = 1.5·1 000 / 200 = 7.5 kg/cm².",
  "shr.s4.fig":
    "Rectangle: τ is parabolic, with its maximum at the neutral axis.",
  "shr.s5.kicker":
    "05 — Double-T",
  "shr.s5.title":
    "Double-T profile",
  "shr.s5.p1":
    "With flange width b, overall depth h, clear depth h_0 between flanges (the web is δ_1 thick, each flange δ thick) and J_x of the whole profile, the same formula gives, for a cut through the flange and through the web:",
  "shr.s5.flange":
    "In the flange",
  "shr.s5.web":
    "In the web",
  "shr.s5.p2":
    "At the junction of the web and the flange the width of the cut goes from b to δ_1, so τ jumps by the factor b/δ_1: the web carries almost all the shear, and in the flanges the stresses are small. This is why, in practice, the shear of an I-beam is checked as Q divided by the area of the web.",
  "shr.s5.fig":
    "Double-T: τ is small in the flanges, jumps at the junction and is almost constant in the web.",
  "shr.footer":
    "Transcribed from the handwritten course notes “Tensiones de corte en la flexión”; the formulas are checked in the test suite (the stresses add up to Q).",
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
  "preset.beam_ipb300_check": "Viga IPB 300 (verificación)",
  "preset.truss_cable_beam": "Reticulado + cable + viga (dimensionado)",
  "preset.truss_cable_beam_ipb260": "Reticulado + cable + viga IPB 260 (verificación y dimensionado)",

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

  "editor.members.section": "Sección",
  "editor.members.self_weight": "Peso propio",
  "editor.members.self_weight_hint":
    "Suma el peso propio de la barra (kg/m del perfil) como carga distribuida; necesita un perfil o un dimensionado",
  "editor.section.none": "— (solo análisis)",
  "editor.section.cable": "Cable",
  "editor.section.size": "Dimensionar (el más liviano que cumple)",
  "editor.section.verify": "Verificar perfil",
  "editor.material.sigma_adm": "σ adm",
  "editor.material.sigma_note":
    "Lo usa la pestaña de resultados para las barras con sección (verificar un perfil, dimensionarlo o dimensionar un cable). Fuerzas en kg y longitudes en m dan kg/cm²; E queda en kg/m² (acero: 2,1e10).",
  "checks.title": "Verificación y dimensionado",
  "checks.self_weight": "Peso propio sumado a los apoyos y a las demás barras (la propia viga se verifica / dimensiona solo con las cargas)",
  "checks.d_min_long": "Diámetro mínimo del cable",
  "checks.d_adopted": "adoptar",
  "checks.deflection": "Flecha máxima f (solo la flexión de la barra, respecto de la cuerda entre sus extremos)",
  "checks.no_sigma": "Cargá σ adm en la pestaña Material para hacer las verificaciones.",
  "checks.member": "Barra",
  "checks.profile": "Perfil",
  "checks.result": "Resultado",
  "checks.pass": "✓ cumple",
  "checks.fail": "✗ no cumple",
  "checks.lightest": "El más liviano que cumple",
  "checks.none": "ninguno de la tabla",
  "checks.unloaded": "sin carga: cualquier perfil",
  "checks.cable": "Cable",
  "checks.cable_bending":
    "tiene flexión o corte: no es un cable (ponele rótulas en los dos extremos)",
  "checks.not_converged":
    "La iteración del peso propio no convergió: los perfiles pueden estar desactualizados.",
  "checks.note_hyperstatic":
    "Los esfuerzos son los del modelo actual; en una estructura hiperestática cambian al aplicar el perfil, así que verificá de nuevo después de asignarlo.",
  "editor.section.aria": "Sección de la barra",
  "checks.not_tension": "no está a tracción: un cable no resiste compresión",
  "checks.note_buckling":
    "Se verifica σ = N/A + M/W; las barras comprimidas además deben quedar por debajo de la carga crítica de pandeo de Euler P_cr = π²·E·Iy/L² (extremos articulados, eje débil, coeficiente de seguridad 1).",

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

  "nav.guides": "Guías",

  "f3d.title": "Simulador de Pórticos 3D",
  "f3d.link": "Pórticos 3D",
  "f3d.back_2d": "← Simulador 2D",
  "f3d.reset": "Reiniciar",
  "f3d.peak": "|σ| máximo: barra {member} ({profile}), {pct} % de σ adm — {where}",
  "f3d.peak.node_fixed": "en el empotramiento {node}",
  "f3d.peak.node_pinned": "en el apoyo {node}",
  "f3d.peak.node_free": "en la unión {node}",
  "f3d.peak.inside": "dentro de la barra, a {dist} m de {node} (no en un nodo: hay que buscar el máximo interior)",
  "f3d.peak.constant": "igual a lo largo de toda la barra",
  "f3d.fullscreen.enter": "Pantalla completa",
  "f3d.fullscreen.exit": "Salir de pantalla completa",
  "f3d.panel.hide": "Ocultar el panel de nodos / barras / cargas",
  "f3d.panel.show": "Mostrar el panel de nodos / barras / cargas",
  "f3d.example.t_frame": "#1 Pórtico T 3D (empotrado)",
  "f3d.example.t_frame_kg": "#2 Pórtico T 3D (empotrado)",
  "f3d.example.t_frame_qy": "#3 Pórtico T 3D (empotrado)",
  "f3d.example.frame_right_beam": "#4 Pórtico 3D (empotrado)",
  "f3d.example.frame_overhang": "#5 Pórtico 3D (empotrado) · σ máx dentro de la barra",
  "f3d.example.l_torsion": "#8 Pórtico en L espacial (torsión)",
  "f3d.example.eccentric_tension": "#7 Tracción excéntrica en IPN 300 (P_z máx)",
  "f3d.example.cantilever_kg": "#6 Voladizo IPN 320 (longitud máx)",
  "f3d.example.column_kg": "#9 Columna 3D (empotrada)",
  "f3d.diagram": "Diagrama:",
  "f3d.diagram_none": "Ninguno",
  "f3d.note":
    "Vista oblicua: x a la derecha, z arriba, y hacia quien mira (ejes globales, terna izquierda del curso). Terna local de cada barra: z a lo largo de la barra (hacia abajo o hacia la izquierda), x saliente al plano, y hacia la derecha (columnas) o hacia abajo (vigas). Los momentos se dibujan del lado traccionado.",
  "f3d.nodes.z": "z",
  "f3d.material.note":
    "E, G en {u}/m², A en m², Ix/Iy/J en m⁴. Ejes locales: z a lo largo de la barra, x saliente al plano, y en la sección; Ix es la inercia respecto de x (flexión en el plano y-z) e Iy respecto de y.",
  "f3d.error":
    "⚠ Modelo 3D inestable, singular o mal formado — revisá apoyos, barras y cargas. No se pueden calcular los diagramas.",
  "f3d.results.peaks": "Esfuerzos máximos",
  "f3d.members.profile": "Perfil",
  "f3d.members.profile_none": "— (pestaña material)",
  "f3d.members.rotate": "Girar 90°",
  "f3d.members.rotate_title":
    "El eje fuerte flexa la barra en el plano x-z en vez del plano y-z",
  "f3d.material.sigma_adm": "σ adm ({u}/cm²)",
  "f3d.results.stress": "Tensión normal",
  "f3d.results.profile": "Perfil",
  "f3d.results.sigma_max": "σ máx ({u}/cm²)",
  "f3d.results.ratio": "σ/σ adm",
  "f3d.results.no_profile":
    "Asigná un perfil IPN/IPB a una barra (pestaña barras) para verificar su tensión.",
  "f3d.results.stress_note":
    "σ = N/A + Mx·y/Ix + My·x/Iy en la esquina más exigida de la sección (Mx, My > 0 traccionan las fibras +y, +x). Supone {u} y m. Perfiles: tablas CIRSOC (IPN, IPB).",
  "f3d.view.stress_colors": "Colorear por σ/σ adm",
  "f3d.view.local_axes": "Ternas locales",
  "f3d.loads.from": "desde (m)",
  "f3d.loads.to": "hasta (m)",
  "f3d.cut.check": "Verificación en la esquina crítica",
  "f3d.cut.toggle": "Corte de sección",
  "f3d.cut.title": "Corte de sección",
  "f3d.cut.member": "Barra",
  "f3d.cut.aria_member": "barra del corte",
  "f3d.cut.aria_member_fs": "barra del corte (pantalla completa)",
  "f3d.cut.aria_pos": "posición del corte",
  "f3d.cut.aria_pos_fs": "posición del corte (pantalla completa)",
  "f3d.cut.peak": "Ir a σ máx",
  "f3d.cut.no_profile":
    "Asigná un perfil IPN/IPB a una barra (pestaña barras) para ver su corte de sección.",
  "f3d.cut.view_note":
    "Sección vista con z entrando al plano: x a la derecha, y arriba. Los diagramas en 'Z' son σ por N, Mx y My; los valores en las esquinas son su suma. No se dibujan los radios de acuerdo.",
  "f3d.cut.neutral": "eje neutro",
  "f3d.cut.reaction": "Reacción en",
  "f3d.cut.point_load": "Carga",
  "f3d.cut.joint_load": "Carga recibida en",
  "f3d.cut.local": "ejes de la sección (locales)",
  "f3d.cut.neutral_short": "E.N.",
  "f3d.cut.uniform": "σ uniforme",
  "f3d.cut.uniform_why": "Solo actúa N (sin flexión): no hay eje neutro.",
  "f3d.cut.uniform_zero": "σ = 0 en este corte",
  "f3d.cut.uniform_zero_why": "N, Mx y My son nulos acá, así que no hay tensión normal (el corte y la torsión, si los hay, no producen σ).",
  "f3d.cut.critical": "esquina más exigida",
  "f3d.cut.resultant": "Diagrama resultante (N + Mx + My)",
  "f3d.cut.smax": "σ máx",
  "f3d.cut.smin": "σ mín",
  "f3d.cut.tension": "fibras traccionadas",
  "f3d.cut.compression": "fibras comprimidas",
  "f3d.cut.prism_note":
    "La barra completa en 3D (z entra al plano, hacia arriba y a la derecha; z = 0 es el extremo de adelante). Las caras laterales se pintan con σ en cada z, así se ve cómo varía a lo largo de la barra; la placa que se mueve con el slider es el corte. Azul: carga distribuida; rojo: carga puntual en el extremo libre de la barra o, en un nudo del extremo z = 0, lo que el resto de la estructura le transmite a la barra; violeta: reacción del vínculo — solo las del tramo entre el extremo z = 0 y el corte, que es el que equilibran los esfuerzos internos (la carga aplicada que se reparte con otras barras en un nudo no se lista en sí) — en los ejes propios de la sección (la parte axial se dibuja según z). Más oscuro = mayor |σ| (escalado por el mayor de la barra); el aro marca la esquina más exigida del corte.",
  "f3d.cut.forces": "Esfuerzos en el corte",
  "f3d.cut.corner": "Esquina",
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
  "prof.link": "Perfiles de acero",
  "ecc.link": "Carga excéntrica",
  "cut.link": "Guía del corte de sección",
  "cut.kicker": "Flexión compuesta oblicua · corte de sección",
  "cut.title": "Dónde están las fibras comprimidas",
  "cut.lead": "El diagrama del corte se arma con tres cosas: el signo de σ en cada esquina, el eje neutro (E.N.) y el lado del E.N. donde σ es negativa. Esta página explica la idea y recorre los pasos en el orden en que se hacen en el papel, incluida la cara del perfil que conviene usar, con la base de una columna empotrada como ejemplo resuelto.",
  "cut.s1.kicker": "Paso 1",
  "cut.s1.title": "Elegir el corte y el tramo a estudiar",
  "cut.s1.p1": "Al cortar una barra quedan dos tramos y se puede estudiar cualquiera. Tomá el que tiene menos cargas y ningún apoyo, normalmente el del extremo libre, así no necesitás las reacciones. Si los dos son igual de simples, tomá el tramo entre z = 0 y el corte.",
  "cut.s1.b1": "El tramo entre z = 0 y el corte: N, Qx, Qy, T, Mx y My son las fuerzas de su cara +z y equilibran todas las cargas y reacciones de ese tramo.",
  "cut.s1.b2": "El tramo desde el corte hasta el otro extremo: N, Mx y My dan igual, porque se definen por lo que le hacen a las fibras (tracción, tracción en +y, tracción en +x). Solo los cortantes y el torsor se leen en la cara que elegiste, y no entran en σ.",
  "cut.s1.p2": "Con cualquiera de los dos tramos el resultado tiene que ser el mismo, así que resolver los dos es una buena comprobación del cuerpo libre.",
  "cut.fig1.a": "Tramo A: z de 0 al corte. El cuerpo libre que estudiamos.",
  "cut.fig1.b": "Tramo B: del corte al otro extremo.",
  "cut.fig1.cut": "corte en z",
  "cut.fig1.load": "cargas sobre el tramo A",
  "cut.fig1.face": "N, Q, M actúan en la cara +z",
  "cut.fig1.support": "apoyo",
  "cut.fig1.aria": "Una columna cortada en dos tramos: el A arriba del corte y el B abajo, con z creciendo hacia abajo desde el tope",
  "cut.s2.kicker": "Paso 2",
  "cut.s2.title": "Sacar N, Mx y My en el corte, en la terna local",
  "cut.s2.tri.p": "El corte usa la terna local de la barra, no los ejes globales. Pasá cada carga y cada momento a esa terna antes de sumarlos. Es la terna del curso: levógira, e independiente del orden en que se definieron los nodos de la barra.",
  "cut.s2.tri.z": "z a lo largo de la barra: hacia abajo en una columna y hacia la izquierda en una barra horizontal. z = 0 es el extremo desde el que crece z: el tope de una columna, el extremo derecho de una barra horizontal.",
  "cut.s2.tri.x": "x saliente del plano: para un pórtico en el plano x–z es −Y de los ejes globales. El Y global se dibuja hacia el observador, así que x apunta alejándose del observador.",
  "cut.s2.tri.y": "y en el plano del pórtico: hacia la derecha en una columna y hacia abajo en una viga.",
  "cut.s2.tri.note": "Al dibujar la sección, poné x a la derecha, y hacia arriba y z hacia adentro de la hoja. En la columna del ejemplo de abajo, z va hacia abajo, x = −Y e y = +X, así que una fuerza de 300 kg hacia +Y es una fuerza según −x del corte.",
  "cut.s2.p1": "Dibujá el cuerpo libre del tramo elegido, con las cargas y reacciones que actúan sobre él. Después:",
  "cut.s2.n": "N: sumá las cargas a lo largo del eje de la barra. Si empujan el tramo hacia el corte, N es negativa (compresión). Si lo tiran hacia afuera, N es positiva (tracción).",
  "cut.s2.m": "Mx y My: imaginá el tramo empotrado en el corte. Cada carga trata de doblarlo, y las fibras del lado hacia donde empuja la carga se comprimen mientras las opuestas se traccionan. El momento es la carga por su brazo hasta el baricentro del corte. Mx es positivo cuando tracciona +y y My cuando tracciona +x.",
  "cut.s2.example": "Ejemplo: una columna de 3 m empotrada en la base, con una viga de 3 m arriba (1 m a la izquierda y 2 m a la derecha de la columna), q = 200 kg/m en toda la viga y P = 300 kg en el nudo hacia +Y. Cortá en la base y tomá el tramo de arriba. N: la viga pesa 200·3 = 600 kg y empuja hacia el corte, así que N = −600 kg. Mx: el brazo derecho pesa 200·2 = 400 kg a 1 m y el izquierdo 200·1 = 200 kg a 0,5 m, así que el momento neto es 400 − 100 = 300 kg·m, que comprime las fibras +y: Mx = −300 kg·m. My: P empuja hacia −x con 3 m de brazo, así que My = 300·3 = 900 kg·m, que comprime −x y tracciona +x: My es positivo.",
  "cut.s2.units": "Unidades: el solver da los momentos en kg·m. Multiplicalos por 100 para pasarlos a kg·cm, porque A, Ix e Iy de la tabla están en cm.",
  "cut.f.kicker": "Paso 3",
  "cut.f.title": "Elegir la cara 1 o la cara 2 del perfil",
  "cut.f.p1": "El perfil se puede poner de dos maneras. Cara 1: el eje X contra el eje fuerte del perfil, así Ix es el momento de inercia grande de la tabla y la altura corre a lo largo de Y. Cara 2: el perfil girado, así el eje X cae sobre el eje débil: se intercambian Ix e Iy, y también los semilados.",
  "cut.f.b1": "Mx flexa alrededor del eje X, así que lo resiste Ix, y My lo resiste Iy. La cara 1 le da la inercia grande a Mx y la cara 2 se la da a My.",
  "cut.f.b2": "Regla práctica: poné el momento mayor contra el eje fuerte. Cara 1 si |Mx| es el mayor, cara 2 si lo es |My|.",
  "cut.f.b3": "La regla no es una demostración: N y la forma de la sección también cuentan. Calculá |σ|_máx en las dos caras y quedate con la menor. El simulador de abajo lo hace por vos.",
  "cut.f.p2": "Ejemplo, base de la columna: My = 900 kg·m es el momento mayor. La cara 1 le pone el Iy débil = 318 cm⁴ y da |σ|_máx = 1 924 kg/cm², que no verifica σ_adm = 1 400. La cara 2 le pone el Iy fuerte = 864 cm⁴ y da 1 209 kg/cm², que verifica. Por eso el ejercicio usa el perfil girado.",
  "cut.fig3.f1": "Cara 1: X contra el eje fuerte",
  "cut.fig3.f2": "Cara 2: perfil girado",
  "cut.fig3.strong": "fuerte",
  "cut.fig3.weak": "débil",
  "cut.fig3.cap": "El mismo IPB 120, el mismo X (a la derecha) y el mismo Y (hacia arriba). Mx flexa alrededor del eje X y lo resiste Ix; My lo resiste Iy. Girar el perfil intercambia cuál de los dos es el fuerte.",
  "cut.fig3.aria": "Dos dibujos de la sección en I con los ejes X e Y: la cara 1 con las alas a lo largo de X y la cara 2 con el perfil girado",
  "cut.g.kicker": "Paso 4",
  "cut.g.title": "Saber qué fibras comprime cada efecto",
  "cut.g.p1": "Antes de sumar nada, decidí dónde comprime cada efecto por separado. Una fibra está comprimida cuando su σ es negativa, y cada efecto da un signo que depende solo de dónde está la fibra:",
  "cut.g.n": "N: el mismo signo en toda la sección. N < 0 comprime todas las fibras y N > 0 las tracciona todas.",
  "cut.g.mx": "Mx: el signo depende de y. Mx > 0 tracciona las fibras +y y comprime las −y; Mx < 0 hace lo contrario. La recta y = 0 las separa.",
  "cut.g.my": "My: el signo depende de x. My > 0 tracciona las fibras +x y comprime las −x; My < 0 hace lo contrario. La recta x = 0 las separa.",
  "cut.g.p2": "Dibujá cada efecto como una media sección, como las tres figuras chicas del paso siguiente. Después tomá cada esquina y sumá los tres signos: donde los tres comprimen, esa esquina es la más comprimida, y donde los tres traccionan es la más traccionada. Cuando no coinciden, decide el valor mayor, y los pasos siguientes te dan los números. En la columna del ejemplo N < 0, Mx < 0 y My > 0, así que la fibra (−x, +y) está comprimida por los tres.",
  "cut.face.label": "Cara del perfil",
  "cut.face.1": "Cara 1 (X contra el eje fuerte)",
  "cut.face.2": "Cara 2 (perfil girado)",
  "cut.face.1.short": "cara 1",
  "cut.face.2.short": "cara 2",
  "cut.face.compare": "|σ|_máx:",
  "cut.face.tie": "igual",
  "cut.s3.kicker": "Paso 5",
  "cut.s3.title": "Sumar los tres efectos, esquina por esquina",
  "cut.s3.p1": "Ahora dale a cada esquina su número: sumá los tres efectos. El signo de la suma dice si la esquina está comprimida (roja) o traccionada (verde). Cambiá los valores y la cara y mirá las tres figuras chicas y la grande; en papel, hacé lo mismo con un croquis chico por cada efecto.",
  "cut.s3.p2": "La sección es doblemente simétrica, así que el máximo de |σ| está siempre en una de las cuatro esquinas de su rectángulo envolvente. La esquina crítica es la de mayor valor absoluto, y su signo dice si es de tracción o de compresión.",
  "cut.s4.kicker": "Paso 6",
  "cut.s4.title": "Sacar el eje neutro",
  "cut.s4.p1": "El E.N. es la recta donde σ = 0. Es una recta, así que alcanzan dos puntos. Igualá σ = 0 una vez con y = 0 y otra con x = 0:",
  "cut.s4.p2": "Unís los dos puntos y prolongás la recta hasta el borde de la sección. Con los números de la base de la columna:",
  "cut.s4.b1": "Si My = 0 o Mx = 0 el E.N. es paralelo al eje X o al eje Y, y uno de los dos puntos no existe.",
  "cut.s4.b2": "Si N = 0 el E.N. pasa por el baricentro y los dos puntos son el origen. Usá la pendiente: y = −(My/Iy)/(Mx/Ix)·x.",
  "cut.s4.b3": "El E.N. no es el eje del momento. Con flexión oblicua, o con N ≠ 0, queda inclinado y corrido respecto del baricentro. Cuanto mayor es N frente a los momentos, más se aleja.",
  "cut.en.example": "Eje neutro, base de la columna del ejemplo",
  "cut.s5.kicker": "Paso 7",
  "cut.s5.title": "Marcar la zona comprimida",
  "cut.s5.p1": "El E.N. divide la sección en dos zonas, una traccionada y otra comprimida. Hay dos formas de saber cuál es cuál, y tienen que coincidir con los signos del paso 4:",
  "cut.s5.b1": "El baricentro. En el origen σ = N/A. Si N es negativa, el lado del E.N. que contiene el baricentro está comprimido. Si es positiva, está traccionado.",
  "cut.s5.b2": "Una esquina. Evaluá σ en una esquina: si da negativa, está en la zona comprimida. La fibra más comprimida es la esquina más lejana al E.N. de ese lado, porque σ crece en proporción a la distancia al E.N.",
  "cut.s5.b4": "En el dibujo del examen: rayá la zona comprimida, marcá con un círculo la esquina con la σ más negativa y escribí su valor.",
  "cut.s5.p2": "En la base de la columna del ejemplo la esquina más comprimida es (−6; +6): las fibras −x las comprime My, las +y las comprime Mx, y N suma un poco. Eso es σ = −1 208,7 kg/cm², la mayor en valor absoluto, así que gobierna la verificación contra 1 400 kg/cm².",
  "cut.s8.kicker": "Paso 8",
  "cut.s8.title": "Dibujar el corte resultante",
  "cut.s8.p1": "Ya tenés el E.N. y σ en las cuatro esquinas. El corte resultante muestra σ en el plano de la sección, inclinado junto con el E.N. Se arma en cinco movimientos:",
  "cut.s8.1": "Dibujá la sección y el E.N. atravesándola.",
  "cut.s8.2": "Ubicá las dos fibras extremas: las esquinas con la mayor y la menor σ. Son las esquinas más lejanas al E.N., una de cada lado.",
  "cut.s8.3": "Por cada una trazá una paralela al E.N. σ vale lo mismo a lo largo de cada paralela, porque solo cambia en la dirección perpendicular al E.N.",
  "cut.s8.4": "Trazá la línea base perpendicular al E.N., alejada de la sección, de modo que corte las dos paralelas y el E.N. Sus tres cruces son σ_máx, σ_mín y σ = 0.",
  "cut.s8.5": "Sobre cada paralela llevá la ordenada desde la línea base, proporcional a σ: tomá el mayor de |σ_máx| y |σ_mín| con una longitud cómoda y escalá el otro. Las ordenadas positivas apuntan alejándose de la sección y las negativas se pliegan hacia ella. Unís las puntas con el punto donde el E.N. cruza la línea base: queda un triángulo traccionado y otro comprimido, cada uno con su signo encerrado.",
  "cut.s8.p2": "Escribí σ_máx y σ_mín en los extremos de la línea base. Si σ tiene el mismo signo en toda la sección el E.N. cae afuera y queda un trapecio en vez de dos triángulos; si σ es igual en todos lados (solo N) no hay E.N. ni diagrama: escribí ‘σ uniforme’.",
  "cut.res.smax": "σ_máx",
  "cut.res.smin": "σ_mín",
  "cut.res.baseline": "base ⟂ E.N.",
  "cut.res.cap": "Las dos rectas por las esquinas extremas son paralelas al E.N.; la línea base es perpendicular a él y las ordenadas van sobre las paralelas. El diagrama sigue los valores y la cara del paso 5: cambialos ahí.",
  "cut.res.zero": "σ = 0 en todo el corte: no hay E.N. ni diagrama que dibujar.",
  "cut.res.uniform": "σ es uniforme (solo N): no hay E.N. ni diagrama. Escribí ‘σ uniforme’.",
  "cut.res.aria": "Corte resultante: la sección, el eje neutro, dos paralelas por las esquinas extremas y una línea base perpendicular con un triángulo de tracción y otro de compresión",
  "cut.s6.kicker": "Procedimiento completo",
  "cut.s6.title": "Armar el corte completo",
  "cut.full.1": "Elegí la barra, la posición z del corte y el tramo a estudiar (paso 1).",
  "cut.full.2": "Dibujá el cuerpo libre de ese tramo, pasá sus cargas a la terna local de la barra y sacá N, Mx y My (paso 2). Pasá los momentos a kg·cm.",
  "cut.full.3": "Elegí la cara 1 o la cara 2 del perfil: calculá |σ|_máx en las dos y quedate con la menor, que pone el momento mayor contra el eje fuerte (paso 3).",
  "cut.full.4": "Anotá los datos de la sección en esa cara: perfil, A, Ix, Iy y los semilados x_max e y_max. La cara 2 intercambia Ix con Iy y los dos semilados.",
  "cut.full.5": "Decidí qué fibras comprime cada efecto con los signos de N, Mx y My (paso 4).",
  "cut.full.6": "Calculá σ de cada efecto en las cuatro esquinas: N/A, Mx·y/Ix y My·x/Iy (paso 5).",
  "cut.full.7": "Sumalos en cada esquina, escribí las cuatro σ y marcá el + o − encerrado de cada una. La mayor |σ| es la esquina crítica.",
  "cut.full.8": "Sacá los dos puntos del E.N. (paso 6), trazá la recta por la sección y rotulala E.N.",
  "cut.full.9": "Rayá la zona comprimida y la traccionada (paso 7). Verificá con el baricentro: σ = N/A dice qué lado lo contiene.",
  "cut.full.10": "Dibujá el corte resultante: paralelas al E.N. por las fibras extremas, línea base perpendicular al E.N., ordenadas sobre las paralelas, σ_máx y σ_mín en los extremos (paso 8).",
  "cut.full.11": "Compará |σ|_máx con σ_adm y escribí la relación y el veredicto.",
  "cut.s6.note": "Esta verificación cubre solo la tensión normal. Las tensiones por corte y torsión no están incluidas.",
  "cut.err.title": "Dónde se suele errar",
  "cut.err.1": "Asociar Mx con x y My con y. Es al revés: Mx multiplica a y y My multiplica a x.",
  "cut.err.2": "Usar Ix e Iy de la cara equivocada: la cara 1 tiene el eje fuerte en X y la cara 2 (perfil girado) intercambia Ix con Iy.",
  "cut.err.3": "Olvidar el factor 100 al pasar de kg·m a kg·cm. σ da cien veces más chica y el E.N. cae lejos fuera de la sección.",
  "cut.err.4": "Decidir el lado comprimido solo por el momento. Lo que cuenta es la suma de los signos de N, Mx y My en esa fibra.",
  "cut.err.5": "Usar los ejes globales en vez de la terna local de la barra. Una carga hacia +Y va según −x en la columna del ejemplo, así que traccionan las fibras +x.",
  "cut.sim.aria": "Sección con zonas de tracción y compresión y el eje neutro",
  "cut.sim.section": "IPB 120 · semilados 6 cm",
  "cut.case.p2": "Columna del ejemplo",
  "cut.case.n": "Solo N",
  "cut.case.mx": "Solo Mx",
  "cut.case.my": "Solo My",
  "cut.case.oblique": "Flexión oblicua, N = 0",
  "cut.leg.tension": "σ > 0, tracción",
  "cut.leg.compression": "σ < 0, compresión",
  "cut.leg.en": "eje neutro (σ = 0)",
  "cut.leg.critical": "esquina crítica",
  "cut.en.short": "E.N.",
  "cut.read.critical": "Esquina crítica",
  "cut.read.in_comp": "compresión",
  "cut.read.in_tens": "tracción",
  "cut.read.max_tens": "Mayor tracción",
  "cut.read.max_comp": "Mayor compresión",
  "cut.read.centroid_on": "El baricentro está sobre el E.N.",
  "cut.read.centroid_comp": "El baricentro cae del lado comprimido (N/A < 0).",
  "cut.read.centroid_tens": "El baricentro cae del lado traccionado (N/A > 0).",
  "cut.read.zero": "σ = 0 en todo el corte: no hay E.N.",
  "cut.read.uniform_comp": "σ es uniforme y negativa: toda la sección está comprimida y no hay E.N.",
  "cut.read.uniform_tens": "σ es uniforme y positiva: toda la sección está traccionada y no hay E.N.",
  "cut.eff.n": "σ por N",
  "cut.eff.mx": "σ por Mx",
  "cut.eff.my": "σ por My",
  "cut.eff.none": "Cero: no aporta.",
  "cut.eff.n.comp": "Toda la sección comprimida.",
  "cut.eff.n.tens": "Toda la sección traccionada.",
  "cut.eff.mx.top": "Comprime arriba (y > 0).",
  "cut.eff.mx.bottom": "Comprime abajo (y < 0).",
  "cut.eff.my.right": "Comprime la derecha (x > 0).",
  "cut.eff.my.left": "Comprime la izquierda (x < 0).",
  "cut.tbl.corner": "Esquina (x; y) cm",
  "ecc.title": "Carga axial excéntrica en un perfil (flexión compuesta oblicua)",
  "ecc.intro":
    "Una carga P_z a lo largo del eje de la barra, aplicada a e_x (perpendicular al alma) y e_y (paralela al alma) del baricentro, equivale a N = P_z más los momentos M_x = P_z·e_y y M_y = P_z·e_x. σ = N/A + M_x·y/I_x + M_y·x/I_y.",
  "ecc.inputs": "Datos",
  "ecc.intro_rot":
    "Una carga P_z a lo largo del eje de la barra, aplicada a e_x (paralela al alma, horizontal) y e_y (perpendicular al alma, vertical) del baricentro, equivale a N = P_z más los momentos M_x = P_z·e_y y M_y = P_z·e_x. σ = N/A + M_x·y/I_x + M_y·x/I_y.",
  "ecc.rotated": "Girado (alma horizontal)",
  "ecc.p": "P_z (kN, + tracción)",
  "ecc.ex": "e_x (cm), ⟂ alma",
  "ecc.ey": "e_y (cm), ∥ alma",
  "ecc.ex_rot": "e_x (cm), ∥ alma",
  "ecc.ey_rot": "e_y (cm), ⟂ alma",
  "ecc.sigma_adm": "σ adm (kN/cm²)",
  "ecc.reduction": "Reducción al baricentro",
  "ecc.corners": "Tensiones en las esquinas (kN/cm²)",
  "ecc.corner": "Esquina",
  "ecc.pmax": "Carga máxima",
  "ecc.check": "Verificación con el P_z dado",
  "ecc.neutral": "eje neutro",
  "ecc.tension": "tracción",
  "ecc.compression": "compresión",
  "ecc.section_note":
    "Sección vista desde el extremo libre: ⊙ la tracción apunta hacia quien mira, ⊗ la compresión se aleja.",
  "ecc.outside":
    "El punto de aplicación queda fuera de la sección (más allá de la mitad de su extensión en x o en y): la carga se aplica mediante una ménsula o placa rígida. Solo importan los momentos P·e.",
  "prof.profile": "Perfil",
  "prof.title": "Perfiles de acero (IPN / IPB)",
  "prof.search": "Buscar: 200, ipb 300, ipn…",
  "prof.all": "Todos",
  "prof.min_label": "Mínimo requerido",
  "prof.count": "perfiles",
  "prof.none": "Ningún perfil cumple.",
  "prof.hint":
    "Tocá una fila para ver la sección y copiar valores. Tocá el encabezado de una columna para ordenar. Usá los mínimos para encontrar el perfil más liviano que cumpla Ix, Sx o A.",
  "prof.copied": "Copiado",
  "prof.copy": "Click para copiar",
  "prof.grp.geometry": "Geometría",
  "prof.grp.section": "Sección y torsión",
  "prof.grp.x": "Eje fuerte X-X",
  "prof.grp.y": "Eje débil Y-Y",
  "prof.lightest": "Menor área primero",
  "prof.detail": "Perfil seleccionado",
  "prof.leg.title": "Leyenda",
  "prof.leg.A": "= Área bruta de la sección transversal.",
  "prof.leg.w": "= Peso por metro de longitud (A · 7850 kg/m³).",
  "prof.leg.I":
    "= Momento de inercia de la sección respecto de los ejes principales.",
  "prof.leg.r": "= Radio de giro",
  "prof.leg.S": "= Módulo resistente elástico de la sección.",
  "prof.leg.Q": "= Momento estático de media sección.",
  "prof.leg.Z": "= Módulo plástico de la sección.",
  "prof.leg.J": "= Módulo de torsión.",
  "prof.leg.d": "altura total",
  "prof.leg.bf": "ancho del ala",
  "prof.leg.tf": "espesor del ala",
  "prof.leg.tw": "espesor del alma",
  "prof.leg.hw": "altura libre del alma",
  "prof.leg.r1": "radio de acuerdo",
  "prof.leg.r2": "radio de la punta del ala",
  "prof.leg.strong": "eje fuerte",
  "prof.leg.weak": "eje débil",
  "prof.tab.rolled": "Perfiles laminados",
  "prof.tab.chs": "Tubos circulares",
  "prof.tab.shs": "Tubos cuadrados",
  "prof.tab.rhs": "Tubos rectangulares",
  "prof.tab.shapes": "Figuras básicas",
  "prof.shapes.note": "Área, baricentro y momentos de inercia de las figuras básicas (la tabla de la cátedra). Ejes X, Y por O como en el dibujo; X_g, Y_g por el baricentro G. Longitudes en cualquier unidad: los resultados salen en esa unidad (², ⁴).",
  "prof.shapes.pick": "Figura",
  "prof.shapes.dims": "Dimensiones",
  "prof.shapes.alpha_hint": "α es el semiángulo, en grados (0–180).",
  "prof.shapes.invalid": "Revisá las dimensiones (todas positivas; corona: r < R; sector: α hasta 180°).",
  "prof.shapes.g_cg": "Baricentro y área",
  "prof.shapes.g_o": "Respecto de los ejes X, Y por O",
  "prof.shapes.g_g": "Respecto de los ejes baricéntricos X_g, Y_g",
  "prof.shapes.formula": "Fórmula",
  "prof.shapes.value": "Valor",
  "prof.shape.square": "Cuadrado",
  "prof.shape.rectangle": "Rectángulo",
  "prof.shape.right_triangle": "Triángulo rectángulo",
  "prof.shape.isosceles_triangle": "Triángulo isósceles",
  "prof.shape.rhombus": "Rombo",
  "prof.shape.trapezoid": "Trapecio",
  "prof.shape.hexagon": "Hexágono regular",
  "prof.shape.circle": "Círculo",
  "prof.shape.semicircle": "Semicírculo",
  "prof.shape.quarter_circle": "Cuarto de círculo",
  "prof.shape.sector": "Sector circular",
  "prof.shape.ring": "Corona circular",
  "prof.tube.H": "alto exterior",
  "prof.tube.search": "Buscar: 168 6.35, 100…",
  "prof.tube.title": "Tubos de acero (IRAM-IAS U 500-218 / 2592)",
  "prof.tube.D": "diámetro exterior",
  "prof.tube.B": "ancho exterior",
  "prof.tube.t": "espesor de pared",
  "prof.tube.R": "radio de esquina exterior = 2,00 t",
  "prof.tube.g": "peso por metro lineal",
  "prof.tube.A": "= Sección bruta.",
  "prof.tube.I": "= Momento de inercia.",
  "prof.tube.S": "= Módulo elástico resistente.",
  "prof.tube.r": "= Radio de giro",
  "prof.tube.Z": "= Módulo plástico.",
  "prof.tube.J": "= Módulo de torsión.",
  "prof.tube.C":
    "= Constante torsional (2·A·t, A encerrada por la línea media).",
  "prof.tube.units":
    "Unidades: mm en dimensiones · cm² · kg/m · cm⁴ · cm³ · cm. Los circulares se calculan desde D y t; los cuadrados y rectangulares están transcriptos de la tabla (rectangulares: Ix, Sx, rx, Zx respecto de X-X, alto H).",
  "prof.units":
    "Unidades: mm en dimensiones · cm² · cm³ · cm · cm⁴. X-X es el eje fuerte.",
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
  "quiz.more.parcial": "Estabilidad — 1.º parcial (7/7/2026)",
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
  "claudeQuiz.result.ok":
    "Bien encaminado. Repasá las que fallaste y reintentá.",
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
  "esf.s2.y":
    "perpendicular al eje, girado 90° antihorario respecto de x′ — dirección del corte.",
  "esf.s2.z":
    "saliente del plano; el sentido positivo del momento se mide alrededor de este eje (horario positivo).",
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
  "esf.s5.step1.d":
    "Analizar las condiciones de sustentación y determinar si es posible resolverlo.",
  "esf.s5.step2.t": "Diagrama de cuerpo libre",
  "esf.s5.step2.d": "Graficar el diagrama de cuerpo libre.",
  "esf.s5.step3.t": "Ecuaciones de equilibrio",
  "esf.s5.step3.d": "Plantear las tres, o más, ecuaciones de equilibrio.",
  "esf.s5.step4.t": "Reacciones de vínculo",
  "esf.s5.step4.d":
    "Resolver el sistema y determinar las reacciones de vínculo.",
  "esf.s5.step5.t": "Puntos característicos",
  "esf.s5.step5.d":
    "Determinar los puntos característicos de la estructura a analizar y confeccionar la tabla de valores.",
  "esf.s5.step6.t": "Recorrer y graficar",
  "esf.s5.step6.d":
    "Recorrer la estructura calculando los esfuerzos y graficarlos en escala.",

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

  "flx.link":
    "Flexión",
  "flx.title":
    "Flexión",
  "flx.lead":
    "Flexión simple, recta y oblicua: de dónde sale la fórmula σ = M·y / J_x, qué es el eje neutro y cómo se usa para verificar y dimensionar una sección. Según el apunte de la cátedra (AMS 2020).",
  "flx.s1.kicker":
    "01 — Definición",
  "flx.s1.title":
    "Flexión simple",
  "flx.s1.p1":
    "Se denomina flexión simple a la forma de solicitación para la cual la reducción al baricentro de la sección considerada, de las fuerzas que actúan a ambos lados de la misma, se limita a dos pares normales al plano de ella, con o sin esfuerzo de corte. De no haber corte se la denomina flexión pura; de lo contrario, flexión y corte.",
  "flx.s1.p2":
    "Se denomina plano de flexión a aquel en el cual actúan los pares flexores, y línea de fuerzas a la traza de dicho plano con el plano de la sección.",
  "flx.s1.normal":
    "La línea de fuerzas coincide con uno de los ejes principales de inercia de la sección: flexión simple normal (recta).",
  "flx.s1.oblique":
    "La línea de fuerzas forma un ángulo α con ese eje: flexión simple oblicua.",
  "flx.s2.kicker":
    "02 — Repaso",
  "flx.s2.title":
    "Ejes principales de inercia",
  "flx.s2.p1":
    "Entre todos los pares de ejes que pasan por un punto, los momentos de inercia de una sección alcanzan su máximo y su mínimo respecto de dos ejes perpendiculares entre sí: los ejes principales de inercia. El momento centrífugo respecto de ellos es nulo, y los momentos correspondientes son los momentos principales de inercia.",
  "flx.s2.p2":
    "Cuando los dos momentos principales son distintos, ese par ortogonal es único. Cuando son iguales (un círculo, un cuadrado) todo par ortogonal que pase por el baricentro es principal.",
  "flx.s3.kicker":
    "03 — Flexión recta",
  "flx.s3.title":
    "Cuándo una barra trabaja a flexión recta",
  "flx.s3.intro":
    "Una barra supuesta horizontal trabaja a flexión recta cuando se cumple lo siguiente:",
  "flx.s3.a":
    "El eje de la barra es recto o de pequeña curvatura.",
  "flx.s3.b":
    "La barra tiene un plano α de simetría vertical.",
  "flx.s3.c":
    "Las cargas P_i actúan perpendicularmente al eje de la barra y se hallan en el plano α.",
  "flx.s3.note":
    "El plano α es el plano de fuerzas (de flexión) y el eje y–y es eje de simetría de la pieza, siendo eje principal de inercia: puede ser el que tiene el J_max o el J_min.",
  "flx.s4.kicker":
    "04 — Deformación",
  "flx.s4.title":
    "El eje neutro",
  "flx.s4.p1":
    "El eje longitudinal de la pieza se curva bajo la acción del sistema de fuerzas P_i. Las secciones CD y EF, que originalmente formaban un rectángulo, luego de cargada la viga forman un trapecio: la distancia CE es menor que la original y la distancia DF ha aumentado. La parte superior se ha comprimido y la inferior se ha traccionado.",
  "flx.s4.p2":
    "Entre ambas fibras extremas hay entonces una fibra media que no ha sufrido deformación y por lo tanto no tiene tensión: el eje neutro (E.N.) de la pieza.",
  "flx.s4.fig":
    "Antes y después de flexar: la fibra superior se acorta (compresión), la inferior se alarga (tracción) y el eje neutro conserva su longitud.",
  "flx.s4.fig.tension":
    "tracción",
  "flx.s4.fig.compression":
    "compresión",
  "flx.s4.fig.na":
    "E.N.",
  "flx.s5.kicker":
    "05 — La fórmula",
  "flx.s5.title":
    "Del equilibrio a σ = M·y / J_x",
  "flx.s5.p1":
    "Un elemento de área dA situado a una distancia y del eje neutro está solicitado por un esfuerzo interior σ·dA, siendo σ la tensión en ese elemento: de tracción o de compresión según se halle abajo o arriba del E.N. Para que la sección esté en equilibrio, la suma de todos los esfuerzos interiores debe ser nula y la suma de sus momentos respecto al E.N. debe ser igual al momento M de las fuerzas exteriores en la sección:",
  "flx.s5.p2":
    "Una fibra a una distancia y del E.N. varía su longitud en proporción a esa distancia. Si σ_1 es la tensión sobre la unidad de área distante 1 del E.N. y σ la de la distante y:",
  "flx.s5.p3":
    "Reemplazando σ = σ_1·y en (1) y (2):",
  "flx.s5.p4":
    "Como σ_1 ≠ 0, de (4) resulta ∫y dA = 0 (6): el momento estático del área es nulo, por lo tanto el eje neutro es un eje baricéntrico. El eje X–X está en la sección transversal y cruza el eje longitudinal de la barra en el baricentro.",
  "flx.s5.p5":
    "En (5) la integral ∫y² dA = J_x es el momento de inercia de la sección respecto al eje neutro X–X, de modo que M = σ_1·J_x y, de (3):",
  "flx.s5.p6":
    "Esta fórmula da la tensión σ en un punto genérico a distancia y de una sección solicitada por un momento M. Por seguridad se toma M_max junto con la fibra más alejada del eje neutro, v:",
  "flx.s5.p7":
    "J_x / v se denomina momento resistente de la sección W_x (cm³), y la fórmula queda:",
  "flx.s6.kicker":
    "06 — Uso",
  "flx.s6.title":
    "Verificación y dimensionado",
  "flx.s6.ver":
    "Verificación",
  "flx.s6.siz":
    "Dimensionado",
  "flx.s6.p1":
    "Si el centro de gravedad de la sección no está a mitad de la altura del perfil habrá dos módulos resistentes, W_1 = J_x / v_1 y W_2 = J_x / v_2, y por seguridad se usa el menor.",
  "flx.s6.p2":
    "Es exactamente la verificación que hace la pestaña de resultados de la app para una barra con sección (σ = |N|/A + |M|·100/S_x ≤ σ_adm).",
  "flx.footer":
    "Transcripto y ordenado del apunte “Flexión AMS 2020” de la cátedra; la numeración de las ecuaciones es la del apunte.",

  "tor.link":
    "Torsión",
  "tor.title":
    "Torsión de ejes circulares",
  "tor.lead":
    "Barras rectas de sección circular bajo un momento torsor M_t: la distorsión γ, la tensión τ = M_t·ρ / J_0, el ángulo de torsión φ y cómo verificar o dimensionar un eje macizo o hueco. Según Raffo, Estática y Resistencia de Materiales, cap. XXIII.",
  "tor.s1.kicker":
    "01 — Definición",
  "tor.s1.title":
    "Torsión simple",
  "tor.s1.p1":
    "Un sólido trabaja a torsión simple si las fuerzas de un lado de la sección se reducen a una única cupla situada en el plano de esa sección. Su momento M_t es el momento torsor. El caso más común es una pieza recta solicitada en sus extremos por cuplas de igual intensidad y sentido opuesto, cada una en el plano de una sección extrema; o una pieza empotrada en un extremo y torsionada por una cupla en el otro, donde el empotramiento aporta la cupla de reacción opuesta. Los árboles de transmisión de las máquinas son el ejemplo típico.",
  "tor.s1.p2":
    "Aquí se estudia la torsión circular recta: un prisma de sección circular constante, maciza o hueca.",
  "tor.s2.kicker":
    "02 — Qué hace la barra",
  "tor.s2.title":
    "Hipótesis y deformación",
  "tor.s2.p1":
    "Sea una barra empotrada en un extremo y torsionada por M_t en el otro. La experiencia muestra que:",
  "tor.s2.h1":
    "El eje geométrico sigue siendo recto.",
  "tor.s2.h2":
    "Las demás fibras longitudinales se transforman en hélices.",
  "tor.s2.h3":
    "Cada sección recta permanece plana y perpendicular al eje: toda la sección simplemente gira en torno a su centro O.",
  "tor.s2.p2":
    "Así, un punto B de una sección a distancia l del empotramiento pasa a B′ siguiendo un arco, y la fibra recta BB_0 se inclina la distorsión γ. La sección ha girado un ángulo φ (radianes) respecto de la empotrada.",
  "tor.s2.fig":
    "Sección antes y después de torsionar: el punto a radio ρ se mueve sobre un arco de ángulo φ, y la fibra de longitud l se inclina γ.",
  "tor.s2.p3":
    "Por geometría, el arco BB′ es ρ·φ y también γ·l, de donde:",
  "tor.s3.kicker":
    "03 — Tensión",
  "tor.s3.title":
    "De la distorsión a τ = M_t·ρ / J_0",
  "tor.s3.p1":
    "Distorsión y tensión tangencial se vinculan por la ley de Hooke al corte, con el módulo de elasticidad transversal G (kg/cm²), relacionado con E por G = 0,385·E (cerca de 0,4·E para el acero, valor que usan los ejemplos):",
  "tor.s3.p2":
    "Al reemplazar γ = ρ·φ/l se ve que τ es proporcional a la distancia ρ al centro: nula en el centro, máxima en las fibras exteriores.",
  "tor.s3.p3":
    "Para equilibrar el momento torsor, el momento de la fuerza elemental τ·dA a distancia ρ respecto de O, sumado en toda la sección, debe valer M_t. Como G y φ/l son constantes:",
  "tor.s3.p4":
    "donde J_0 = ∫ρ² dA es el momento de inercia polar. Resulta φ/l = M_t / (G·J_0), el ángulo unitario de torsión; el producto G·J_0 es el módulo de rigidez a la torsión. Eliminando φ/l queda la ecuación de resistencia, análoga a σ = M·y / J_x de la flexión (vale solo para secciones circulares):",
  "tor.s3.fig":
    "τ crece linealmente con ρ: nula en el centro, τ_max en la superficie.",
  "tor.s4.kicker":
    "04 — Sección maciza",
  "tor.s4.title":
    "Las fórmulas de uso",
  "tor.s4.p1":
    "Para un círculo macizo J_0 = π·D⁴/32. Con ρ = D/2 en la superficie:",
  "tor.s4.p2":
    "Y el ángulo total de torsión de una barra de longitud l, en radianes (multiplicar por 180/π para grados):",
  "tor.s4.p3":
    "Unidades: M_t en kg·cm, l y D en cm, G en kg/cm², J_0 en cm⁴, φ en radianes. Ojo con los kg·m: 1 kg·m = 100 kg·cm.",
  "tor.s5.kicker":
    "05 — Sección hueca",
  "tor.s5.title":
    "Ejes circulares huecos",
  "tor.s5.p1":
    "Vale el mismo procedimiento. Con diámetro exterior D_e, interior D_i y n = D_i / D_e:",
  "tor.s5.p2":
    "El material cercano al centro casi no trabaja, así que un eje hueco pesa menos para la misma τ_max. A igual momento torsor e igual τ_max resulta D = D_e·∛(1 − n⁴). Para D_e = 40 cm y D_i = 20 cm (n = 1/2) el eje macizo es D ≈ 39 cm, y el hueco pesa alrededor del 79 % (áreas 40² − 20² contra 39²): unos 20 % más económico.",
  "tor.s6.kicker":
    "06 — Árboles de transmisión",
  "tor.s6.title":
    "Dimensionar un eje a partir de la potencia",
  "tor.s6.p1":
    "El momento torsor sale de la potencia N (en CV) y las revoluciones por minuto n. Con P = 7500·N kg·cm/s y ω = π·n/30:",
  "tor.s6.p2":
    "y, reemplazando en la fórmula de dimensionado, el diámetro mínimo del árbol (sin considerar la flexión de las poleas ni el peso propio):",
  "tor.s7.kicker":
    "07 — Ejemplos resueltos",
  "tor.s7.title":
    "Dos ejercicios",
  "tor.s7.e1.title":
    "Verificar una barra",
  "tor.s7.e1.p":
    "Barra redonda de acero, D = 6 cm, l = 3 m, M_t = 200 kg·m. Hallar τ_max y φ. G = 0,4·2 100 000 = 840 000 kg/cm².",
  "tor.s7.e1.r":
    "M_t = 20 000 kg·cm; J_0 = π·6⁴/32 = 127 cm⁴; τ_max = 16·20 000 / (π·6³) ≈ 472 kg/cm²; φ = 20 000·300 / (840 000·127) = 0,056 rad ≈ 3°12′.",
  "tor.s7.e2.title":
    "Dimensionar una barra",
  "tor.s7.e2.p":
    "Barra de acero, l = 2 m, cargada por una fuerza de 500 kg con brazo de 120 cm en el extremo libre. τ_adm = 600 kg/cm², G = 800 000 kg/cm². Hallar D y φ.",
  "tor.s7.e2.r":
    "M_t = 500·120 = 60 000 kg·cm; R = ∛(2·60 000 / (π·600)) ≈ 4 cm, o sea D = 8 cm; J_0 = π·8⁴/32 ≈ 402 cm⁴; φ = 60 000·200 / (800 000·402) ≈ 0,037 rad ≈ 2°7′.",
  "tor.note":
    "Una aclaración sobre la fuente: el libro imprime τ_max = 549 kg/cm² en el primer ejercicio, pero con su propia fórmula da 472 kg/cm²; el valor de arriba está recalculado.",
  "tor.footer":
    "Resumido y recalculado a partir de Raffo, C. M., Estática y Resistencia de Materiales (cap. XXIII, Torsión); no se conserva la numeración de las ecuaciones.",
  "axl.link":
    "Esfuerzo axil",
  "axl.title":
    "Esfuerzo axil (tracción y compresión)",
  "axl.lead":
    "Tracción y compresión simple: las hipótesis que hacen uniforme a σ = N/A, las fórmulas de dimensionado y verificación, el alargamiento Δl = N·l/(A·E), el peso propio y tres ejercicios resueltos. Según el apunte “Axil AMS” de la cátedra.",
  "axl.s1.kicker":
    "01 — Definición",
  "axl.s1.title":
    "Solicitación axil simple",
  "axl.s1.p1":
    "Una barra trabaja a tracción o compresión simple cuando la carga P se aplica en el baricentro y vale N en toda la sección, con Q = M_f = M_t = 0. (El apunte llama F al área; acá es A, para no confundirla con una fuerza.)",
  "axl.s1.p2":
    "El equilibrio de la sección da seis condiciones. Solo la primera no es nula:",
  "axl.s1.e1":
    "N = ∫ σ dA",
  "axl.s1.e2":
    "0 = ∫ τ_xy dA        0 = ∫ τ_xz dA",
  "axl.s1.e3":
    "0 = ∫ (τ_xz·y − τ_xy·z) dA",
  "axl.s1.e4":
    "0 = ∫ σ·z dA        0 = ∫ σ·y dA",
  "axl.s2.kicker":
    "02 — Hipótesis",
  "axl.s2.title":
    "Por qué σ es uniforme",
  "axl.s2.h1":
    "Ley de Hooke: σ = E·ε, con E = tan α la pendiente de la recta σ–ε.",
  "axl.s2.h2":
    "Saint-Venant: la sección normal al eje se mantiene plana y paralela a sí misma luego de la deformación, si está alejada de los extremos; por lo tanto no hay concentración de tensiones.",
  "axl.s2.p1":
    "Las distorsiones deben ser entonces nulas o constantes. Si γ = 0 entonces τ = 0. Si γ fuera una constante no nula, τ sería constante y no podría cumplirse ∫τ dA = 0. Luego τ_xy = τ_xz = 0 y las condiciones 2, 3 y 4 se verifican idénticamente.",
  "axl.s2.p2":
    "Como las secciones se desplazan paralelamente, ε = Δl/l es constante y por lo tanto σ = E·ε también. Entonces ∫σ·z dA = σ·∫z dA y ∫σ·y dA = σ·∫y dA son los momentos estáticos del área respecto de los ejes baricéntricos y y z: nulos, así que se verifican la 5 y la 6. La primera da σ·A = N.",
  "axl.fig":
    "Una barra bajo N: toda sección recta soporta la misma σ = N/A.",
  "axl.s3.kicker":
    "03 — Fórmulas",
  "axl.s3.title":
    "Dimensionado, verificación y alargamiento",
  "axl.s3.sizing":
    "Dimensionado",
  "axl.s3.ver":
    "Verificación",
  "axl.s3.p1":
    "El alargamiento sale de σ = E·ε con ε = Δl/l, o sea N/A = E·Δl/l:",
  "axl.s3.sign":
    "Signo: en compresión N es negativo, así que el dimensionado y la verificación usan |N| y |σ|; el N con signo se conserva para el alargamiento (un acortamiento).",
  "axl.s3.p2":
    "Límites de validez de estas fórmulas:",
  "axl.s3.l1":
    "Solo para la zona elástica del material.",
  "axl.s3.l2":
    "Solo para la carga centrada, con reparto uniforme de tensiones.",
  "axl.s3.l3":
    "En compresión, solo para barras cortas (las largas pandean).",
  "axl.s3.l4":
    "No interviene el peso propio de la barra (ver más abajo).",
  "axl.s3.l5":
    "Los orificios concentran tensiones y debilitan la barra.",
  "axl.s4.kicker":
    "04 — Datos del acero",
  "axl.s4.title":
    "Valores que usa la cátedra",
  "axl.s4.th.mat":
    "Acero",
  "axl.s4.th.yield":
    "Tensión de rotura",
  "axl.s4.th.adm":
    "σ_adm",
  "axl.s4.p1":
    "E = 2 100 000 kg/cm² y γ = 7 800 kg/m³ para todos los aceros. El coeficiente de seguridad es ν = 3: σ_adm es aproximadamente la tensión de rotura dividida por 3 (3 700 / 3 ≈ 1 233 → 1 200). El número del nombre, St 37, es esa resistencia en kg/mm².",
  "axl.s5.kicker":
    "05 — Peso propio",
  "axl.s5.title":
    "Cuando el peso de la barra cuenta",
  "axl.s5.p1":
    "Si interviene el peso propio, el peso por unidad de área en el extremo superior es γ·l (l, la longitud de la barra colgada), y se suma a la tensión:",
  "axl.s5.p2":
    "Unidades: con γ en kg/m³ y l en m, γ·l sale en kg/m². Dividí por 10 000 para tener kg/cm² antes de combinarlo con σ_adm.",
  "axl.s6.kicker":
    "06 — Ejercicios resueltos",
  "axl.s6.title":
    "Tres ejercicios",
  "axl.s6.e1.title":
    "Dimensionar un cable y su alargamiento",
  "axl.s6.e1.p":
    "Un cable de acero pasa por poleas a lo largo de 7 m + 10 m + 6 m + 2 m y sostiene 5 000 kg. σ_adm = 1 400 kg/cm², E = 2 100 000 kg/cm². Hallar el radio y el alargamiento. Luego, el radio necesario para que el alargamiento sea el 10 % de ese valor.",
  "axl.s6.e1.r":
    "A_nec = 5 000 / 1 400 = 3,57 cm² = π·r² → r = 1,066 cm. Longitud total 700 + 1 000 + 600 + 200 = 2 500 cm. Δl = 5 000·2 500 / (3,57·2 100 000) = 1,67 cm. Para Δl′ = 0,167 cm: A = 5 000·2 500 / (0,167·2 100 000) = 35,7 cm² → r = 3,37 cm.",
  "axl.s6.e2.title":
    "Carga admisible de un alambre",
  "axl.s6.e2.p":
    "Un alambre colgado de 6 m, radio 0,50 cm, σ_adm = 1 600 kg/cm². Hallar la carga admisible.",
  "axl.s6.e2.r":
    "A = π·0,5² = 0,7854 cm²; F_adm = σ_adm·A = 1 600·0,7854 = 1 256,6 kg.",
  "axl.s6.e3.title":
    "Alargamiento impuesto",
  "axl.s6.e3.p":
    "El mismo cable (A = 3,57 cm², l = 25 m) se fuerza a alargarse 5 cm. ¿Qué carga implica y es admisible?",
  "axl.s6.e3.r":
    "F = Δl·A·E / l = 5·3,57·2 100 000 / 2 500 ≈ 15 000 kg; σ = F/A ≈ 4 202 kg/cm² > σ_adm = 1 400: NO verifica.",
  "axl.footer":
    "Transcripto del apunte manuscrito “Axil AMS” de la cátedra; los números de los ejercicios se recalcularon y coinciden con el apunte.",
  "fla.link":
    "Flecha",
  "fla.title":
    "Flecha de vigas",
  "fla.lead":
    "De la curvatura 1/ρ = M/(E·J) a la elástica y a la flecha f = ∫M·x dx/(E·J), más los siete casos habituales y una calculadora. Según el apunte “Flecha AMS 2020” de la cátedra.",
  "fla.s1.kicker":
    "01 — Curvatura",
  "fla.s1.title":
    "Deformaciones en la flexión pura normal",
  "fla.s1.p1":
    "Una sección de la viga gira alrededor de su eje neutro. Por semejanza de triángulos, una fibra a distancia y del eje neutro tiene una deformación específica ε = y/ρ, donde ρ es el radio de curvatura del eje de la viga (C es el centro de curvatura):",
  "fla.s1.e1":
    "1/ρ = ε / y",
  "fla.s1.p2":
    "Con la ley de Hooke ε = σ/E y la tensión de flexión σ = M·y/J_x:",
  "fla.s1.e2":
    "ε = σ/E = M·y / (J_x·E)",
  "fla.s1.p3":
    "Reemplazando resulta la curvatura, y el radio, cuyas unidades cierran: (kg/cm²)·cm⁴ / (kg·cm) = cm.",
  "fla.s1.fig":
    "Un elemento ds del eje de la viga: ρ es el radio de curvatura, dθ el ángulo entre las dos secciones.",
  "fla.s2.kicker":
    "02 — Elástica",
  "fla.s2.title":
    "La ecuación diferencial",
  "fla.s2.p1":
    "Para un elemento del eje, ds = ρ·dθ, o sea 1/ρ = dθ/ds, y para pendientes chicas ds ≈ dz. Además tg θ = dy/dz ≈ θ. Entonces:",
  "fla.s2.e1":
    "1/ρ = dθ/dz = d²y/dz²",
  "fla.s2.p2":
    "Con los ejes que adopta el apunte (z crece mientras θ decrece) el signo es negativo, 1/ρ = −d²y/dz², e igualando con la curvatura queda la ecuación diferencial de la línea elástica:",
  "fla.s2.p3":
    "Integrándola una vez se obtiene la pendiente θ(z), y dos veces, la flecha y(z), con las constantes de integración fijadas por los vínculos.",
  "fla.s3.kicker":
    "03 — Flecha en un punto",
  "fla.s3.title":
    "La flecha como integral",
  "fla.s3.p1":
    "Sea un elemento CD de longitud dx a distancia x del extremo donde se quiere la flecha. Las dos secciones giran un ángulo relativo dα, con dx = ρ·dα, o sea dα = dx/ρ. La tangente en D se aparta de la de C, en el extremo, en:",
  "fla.s3.p2":
    "y sumando en toda la longitud:",
  "fla.s3.p3":
    "Es el momento del diagrama M/(E·J) respecto del extremo donde se mide la flecha: el primer teorema del área de momentos. En una ménsula, con x desde el extremo libre, da f directamente.",
  "fla.s4.kicker":
    "04 — Casos habituales",
  "fla.s4.title":
    "Los siete casos",
  "fla.s4.p1":
    "Flecha máxima de las vigas más comunes. En todos l es la luz, E el módulo de elasticidad y J_x el momento de inercia; q, P y p son la carga (p es la ordenada máxima de una carga triangular).",
  "fla.case.ss-udl":
    "Simplemente apoyada con carga repartida",
  "fla.case.ss-point":
    "Simplemente apoyada con carga concentrada al centro",
  "fla.case.cant-udl":
    "Empotrada con carga distribuida",
  "fla.case.cant-point":
    "Empotrada con carga concentrada en el extremo libre",
  "fla.case.cant-tri-down":
    "Empotrada con carga triangular decreciente (máx. en el empotramiento)",
  "fla.case.cant-tri-up":
    "Empotrada con carga triangular creciente (máx. en el extremo libre)",
  "fla.case.ss-tri":
    "Simplemente apoyada con diagrama triangular",
  "fla.case.ss-tri.z":
    "El máximo está a z = 0,519·l del extremo donde la carga es nula.",
  "fla.s4.note":
    "Cada coeficiente se verifica en los tests de la app contra una doble integración numérica de M/(E·J).",
  "fla.calc.title":
    "Calculadora",
  "fla.calc.case":
    "Caso",
  "fla.calc.load.point":
    "P (kg)",
  "fla.calc.load.dist":
    "carga (kg/cm)",
  "fla.calc.l":
    "l (cm)",
  "fla.calc.E":
    "E (kg/cm²)",
  "fla.calc.J":
    "J_x (cm⁴)",
  "fla.calc.result":
    "f_max",
  "fla.calc.ratio":
    "= l / ",
  "fla.footer":
    "Transcripto del apunte manuscrito “Flecha AMS 2020” de la cátedra.",
  "shr.link":
    "Corte en flexión",
  "shr.title":
    "Tensiones de corte en la flexión",
  "shr.lead":
    "Del corte puro y el teorema de Cauchy a la fórmula de Jourawski–Colignon τ = Q·S/(J·s), la distribución parabólica en un rectángulo y el perfil doble T. Según el apunte “Tensiones de corte en la flexión” de la cátedra.",
  "shr.s1.kicker":
    "01 — Corte puro",
  "shr.s1.title":
    "Corte puro",
  "shr.s1.p1":
    "El corte puro se produce, exacta o aproximadamente, en la cizalladura y en remaches o tornillos que unen chapas sometidas a fuerzas de tracción: la tensión se toma uniforme en el área A que resiste,",
  "shr.s1.e1":
    "τ = Q / A",
  "shr.s1.p2":
    "(El apunte escribe la tensión tangencial con la misma letra que la normal; acá τ es siempre tangencial.)",
  "shr.s2.kicker":
    "02 — Cauchy",
  "shr.s2.title":
    "Teorema de Cauchy y tensiones de resbalamiento",
  "shr.s2.p1":
    "En dos planos normales cuya intersección define una arista, las componentes normales a ésta de las tensiones tangenciales que actúan en dichos planos son de igual intensidad y concurren o se alejan de la arista:",
  "shr.s2.e1":
    "τ_xy = τ_yx        τ_xz = τ_zx        τ_yz = τ_zy",
  "shr.s2.p2":
    "En una viga sometida a corte y momento, las tensiones horizontales necesarias para mantener el equilibrio producirían un deslizamiento en planos horizontales: el corte en planos verticales implica necesariamente corte en planos horizontales, y viceversa. Son las tensiones de resbalamiento τ_L, presentes en todas las fibras (la imagen es la de tablones apilados que resbalan unos contra otros).",
  "shr.s2.p3":
    "El corte Q en una sección es la resultante de todas las fuerzas que actúan a la izquierda de la sección considerada; por razones de equilibrio, la resultante de todas las de la derecha es igual y opuesta, y actúa sobre una sección infinitamente próxima.",
  "shr.s3.kicker":
    "03 — Jourawski",
  "shr.s3.title":
    "La fórmula de Jourawski–Colignon",
  "shr.s3.p1":
    "La existencia del corte origina tensiones tangenciales en el plano de la sección. Sea una viga de sección constante y una rebanada de largo dx entre las secciones 1 y 2. Por la flexión, a una distancia y del eje neutro la tensión es σ = M·y/J_x en la sección 1 y σ + dσ = (M + dM)·y/J_x en la 2.",
  "shr.s3.p2":
    "Ahora separamos una parte de la rebanada por una superficie cilíndrica de ancho s. En la parte rayada (área Ω) las tensiones normales generan una fuerza N en la sección 1 y N + dN en la 2; ambas son coaxiales y su resultante es",
  "shr.s3.e1":
    "dN = ∫Ω (dM/J_x)·y dΩ",
  "shr.s3.p3":
    "Esa fuerza tiende a deslizar la parte superior respecto del resto. A esa acción se oponen tensiones tangenciales τ que actúan en la superficie de separación; son paralelas al eje de la pieza y varían en forma continua. Siendo s la longitud de la curva de intersección de la superficie con el plano de la sección, dT = dx·∫τ ds, y por equilibrio dT = dN:",
  "shr.s3.e2":
    "(dM/J_x)·∫Ω y dΩ = dx·∫s τ ds",
  "shr.s3.p4":
    "La integral de la izquierda es el momento estático S_x del área Ω respecto del eje neutro, y la de la derecha es τ_m·s, con τ_m el valor medio de τ a lo largo de s. Como dM/dx = Q:",
  "shr.s3.p5":
    "Por el teorema de Cauchy, estas tensiones de resbalamiento longitudinal dan origen, en el plano de la sección, a tensiones tangenciales normales a la curva s en cada punto; τ_m es su valor medio. S_x es el momento estático de la parte de la sección a un lado del corte, y s es el ancho del corte.",
  "shr.s4.kicker":
    "04 — Rectángulo",
  "shr.s4.title":
    "Distribución en una sección rectangular",
  "shr.s4.p1":
    "Para b × h, con el corte a una altura y sobre el eje neutro, s = b, J_x = b·h³/12 y el momento estático de la parte superior es S_x = b·(h/2 − y)·[(h/2 − y)/2 + y] = ½·b·(h²/4 − y²). Reemplazando:",
  "shr.s4.p2":
    "La distribución es una parábola, nula en las fibras extremas y máxima en el eje neutro (y = 0):",
  "shr.s4.p3":
    "o sea un 50 % más que el corte medio Q/superficie.",
  "shr.s4.ex":
    "Ejemplo: b = 10 cm, h = 20 cm, Q = 1 000 kg → medio Q/A = 5 kg/cm², τ_max = 1,5·1 000 / 200 = 7,5 kg/cm².",
  "shr.s4.fig":
    "Rectángulo: τ es parabólica, con máximo en el eje neutro.",
  "shr.s5.kicker":
    "05 — Doble T",
  "shr.s5.title":
    "Perfil doble T",
  "shr.s5.p1":
    "Con ancho de ala b, altura total h, altura libre h_0 entre alas (el alma tiene espesor δ_1 y cada ala δ) y J_x de todo el perfil, la misma fórmula da, para un corte por el ala y por el alma:",
  "shr.s5.flange":
    "En el ala",
  "shr.s5.web":
    "En el alma",
  "shr.s5.p2":
    "En la unión del alma con el ala el ancho del corte pasa de b a δ_1, así que τ salta en el factor b/δ_1: el alma absorbe casi todo el corte, y en las alas las tensiones son chicas. Por eso, en la práctica, el corte de una viga doble T se verifica como Q dividido el área del alma.",
  "shr.s5.fig":
    "Doble T: τ es chica en las alas, salta en la unión y es casi constante en el alma.",
  "shr.footer":
    "Transcripto del apunte manuscrito “Tensiones de corte en la flexión” de la cátedra; las fórmulas se verifican en los tests (las tensiones suman Q).",
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
