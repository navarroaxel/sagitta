// Shareable links for /frame3d: ?preset=<key> for a preset as it is, ?model=<base64url> for an
// edited model. A link comes from outside, so the decoded model is checked before the solver
// sees it (dangling ids, non-finite numbers, a member from a node to itself…).
import { fromBase64Url, toBase64Url } from "./share";
import { PRESETS_3D } from "./presets3d";
import type { FrameModel3D } from "./types3d";

// What a link may ask the page to draw: a distributed load is a row of arrows every 1.5 m of its
// member, so a member 1e8 m long would be tens of millions of SVG nodes. These limits are far above
// anything a course exercise needs (the presets stay under 10 m and 10 items).
export const MAX_COORD = 1000; // m, per axis
export const MAX_ITEMS = 100; // nodes, members and loads, each

const num = (v: unknown): v is number => typeof v === "number" && Number.isFinite(v);
const str = (v: unknown): v is string => typeof v === "string" && v.length > 0;
const obj = (v: unknown): v is Record<string, unknown> => typeof v === "object" && v !== null;

export function isModel3D(m: unknown): m is FrameModel3D {
  if (!obj(m) || !Array.isArray(m.nodes) || !Array.isArray(m.members) || !Array.isArray(m.loads)) return false;
  if (m.nodes.length > MAX_ITEMS || m.members.length > MAX_ITEMS || m.loads.length > MAX_ITEMS) return false;
  const nodes = new Set<string>();
  for (const n of m.nodes) {
    if (!obj(n) || !str(n.id) || nodes.has(n.id)) return false;
    if (!num(n.x) || !num(n.y) || !num(n.z)) return false;
    if (Math.abs(n.x) > MAX_COORD || Math.abs(n.y) > MAX_COORD || Math.abs(n.z) > MAX_COORD) return false;
    if (n.support !== "free" && n.support !== "pinned" && n.support !== "fixed") return false;
    nodes.add(n.id);
  }
  const members = new Set<string>();
  for (const e of m.members) {
    if (!obj(e) || !str(e.id) || members.has(e.id)) return false;
    if (!str(e.n1) || !str(e.n2) || e.n1 === e.n2 || !nodes.has(e.n1) || !nodes.has(e.n2)) return false;
    if (e.profile !== undefined && typeof e.profile !== "string") return false;
    if (e.rotated !== undefined && typeof e.rotated !== "boolean") return false; // "false" would count as true
    members.add(e.id);
  }
  const loads = new Set<string>(); // the editor keys and removes loads by id
  for (const l of m.loads) {
    if (!obj(l) || !str(l.id) || loads.has(l.id)) return false;
    loads.add(l.id);
    if (l.type === "nodal") {
      if (!str(l.node) || !nodes.has(l.node)) return false;
      if (![l.fx, l.fy, l.fz, l.mx, l.my, l.mz].every(num)) return false;
    } else if (l.type === "mpoint" || l.type === "mudl") {
      if (!str(l.member) || !members.has(l.member)) return false;
      if (![l.gx, l.gy, l.gz].every(num)) return false;
      if (l.type === "mpoint" && !num(l.dist)) return false;
      if (l.type === "mudl" && ((l.from !== undefined && !num(l.from)) || (l.to !== undefined && !num(l.to)))) return false;
    } else return false;
  }
  const mat = m.material;
  if (!obj(mat) || ![mat.E, mat.G, mat.A, mat.Ix, mat.Iy, mat.J].every(num)) return false;
  return typeof m.unit === "string" && num(m.sigmaAdm);
}

export const encodeModel3D = (model: FrameModel3D): string => toBase64Url(JSON.stringify(model));

export function decodeModel3D(str: string): FrameModel3D | null {
  try {
    const m: unknown = JSON.parse(fromBase64Url(str));
    return isModel3D(m) ? m : null;
  } catch {
    return null; // malformed link
  }
}

// The preset a link names: by key ("frame_overhang") or by its permanent number ("5" or "#5").
export function findPreset3D(ref: string) {
  const n = /^#?(\d+)$/.exec(ref.trim());
  return n ? PRESETS_3D[Number(n[1]) - 1] : PRESETS_3D.find((p) => p.key === ref.trim());
}

// What the "share" button copies: a pristine preset (same object as the one in PRESETS_3D) as the
// short ?preset=<key>, anything edited as ?model=.
export function shareQuery3D(model: FrameModel3D): string {
  const preset = PRESETS_3D.find((p) => p.model === model);
  return preset ? `preset=${preset.key}` : `model=${encodeModel3D(model)}`;
}

// The model a location's query string asks for, or null.
export function modelFromQuery3D(search: string): FrameModel3D | null {
  const q = new URLSearchParams(search);
  const model = q.get("model");
  if (model) return decodeModel3D(model);
  const preset = q.get("preset");
  return preset ? (findPreset3D(preset)?.model ?? null) : null;
}
