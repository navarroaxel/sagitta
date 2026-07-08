// Shareable-link helpers: encode/decode a FrameModel into a URL-safe string.
// Everything is client-side; a shared link carries the model in the query string
// (?preset=<slug> for a known preset, or ?model=<base64url> for an edited model).
import { FrameModel } from "./types";

function toBase64Url(str: string): string {
  const bytes = new TextEncoder().encode(str);
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(s: string): string {
  const b64 = s.replace(/-/g, "+").replace(/_/g, "/");
  const bin = atob(b64);
  const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

export function encodeModel(model: FrameModel): string {
  return toBase64Url(JSON.stringify(model));
}

export function decodeModel(str: string): FrameModel | null {
  try {
    const m = JSON.parse(fromBase64Url(str)) as FrameModel;
    if (m && Array.isArray(m.nodes) && Array.isArray(m.members)) return m;
  } catch {
    /* malformed link */
  }
  return null;
}
