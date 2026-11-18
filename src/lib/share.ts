// Shareable-link helpers: encode/decode a FrameModel into a URL-safe string.
// Everything is client-side; a shared link carries the model in the query string
// (?preset=<slug> for a known preset, or ?model=<base64url> for an edited model).
import { FrameModel, Member } from "./types";

export function toBase64Url(str: string): string {
  const bytes = new TextEncoder().encode(str);
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function fromBase64Url(s: string): string {
  const b64 = s.replace(/-/g, "+").replace(/_/g, "/");
  const bin = atob(b64);
  const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

export function encodeModel(model: FrameModel): string {
  return toBase64Url(JSON.stringify(model));
}

// The checks fields of a link come from outside: keep a `section` / `selfWeight` / `sigmaAdm` only if
// well formed, so the Results tab never renders from garbage.
function validSection(sec: unknown): sec is Member["section"] {
  if (!sec || typeof sec !== "object") return false;
  const s = sec as { kind?: unknown; name?: unknown; series?: unknown };
  if (s.kind === "cable") return true;
  if (s.kind === "profile") return typeof s.name === "string";
  if (s.kind === "size")
    return (
      Array.isArray(s.series) &&
      s.series.every((x) => x === "IPN" || x === "IPB")
    );
  return false;
}

function sanitize(m: FrameModel): FrameModel {
  const members = m.members.map((mem) => {
    const { section, selfWeight, ...rest } = mem;
    const out: Member = { ...rest };
    if (validSection(section)) out.section = section;
    if (selfWeight === true) out.selfWeight = true;
    return out;
  });
  const { sigmaAdm, ...others } = m;
  const out: FrameModel = { ...others, members };
  if (typeof sigmaAdm === "number" && Number.isFinite(sigmaAdm) && sigmaAdm > 0)
    out.sigmaAdm = sigmaAdm;
  return out;
}

export function decodeModel(str: string): FrameModel | null {
  try {
    const m = JSON.parse(fromBase64Url(str)) as FrameModel;
    if (m && Array.isArray(m.nodes) && Array.isArray(m.members))
      return sanitize(m);
  } catch {
    /* malformed link */
  }
  return null;
}
