// Builds a Casio fx-9860G/GII/GIII main-memory archive (.g1m) holding ONE Basic program, from the text lines of
// casioPrograms.ts. Layout (verified byte for byte against real .g1m files exported from a calculator):
//   32-byte standard header, every byte stored inverted (NOT): "USBPower", 0x31, 00 10 00 10 00, C1 = (size+0x41)&255,
//   0x01, size u32 BE, C2 = (size+0xB8)&255, 9 reserved bytes, object count u16 BE;
//   group header (20): "PROGRAM" NUL-padded to 16 + file count u32 BE;
//   file header (24): directory "system" (8), name (8), type 0x01, length u32 BE, 3 reserved;
//   content: 10 bytes (8 of password, none = zeros, + 2 zeros) + the program tokens, each line closed by 0x0D, then 1-4
//   zero bytes so that the content length is a multiple of 4.
// Tokens: ASCII for letters, digits and most symbols; one byte for → (0E) ◢ (0C) ≤ (10) (–) (87) + (89) − (99) × (A9) ÷ (B9)
// Abs (97) √ (86) Cls (D1) ViewWindow (EB); two bytes for If / Then / Else / IfEnd / For / To / Next / Stop / While / WhileEnd / Text / Horizontal / Vertical / F-Line / PlotOn / ClrText / Locate (F7xx), List (7F51) and Getkey (7F8F). Codes from Cahute's
// chars.toml, the same table as the fx-9860G's own. Presentation of the program only; the calculator is the judge.

const KEYWORDS: [string, number[]][] = [
  ["IfEnd", [0xf7, 0x03]],
  ["If ", [0xf7, 0x00]],
  ["Then ", [0xf7, 0x01]],
  ["Then", [0xf7, 0x01]],
  ["Else ", [0xf7, 0x02]],
  ["Else", [0xf7, 0x02]],
  ["For ", [0xf7, 0x04]],
  [" To ", [0xf7, 0x05]],
  ["Next", [0xf7, 0x07]],
  ["Stop", [0xf7, 0x0e]],
  ["Abs ", [0x97]],
  ["List ", [0x7f, 0x51]],
  ["WhileEnd", [0xf7, 0x09]],
  ["While ", [0xf7, 0x08]],
  ["Getkey", [0x7f, 0x8f]],
  ["Cls", [0xd1]],
  ["ViewWindow ", [0xeb]],
  ["Horizontal ", [0xf7, 0xa4]],
  ["F-Line ", [0xf7, 0xa7]],
  ["Text ", [0xf7, 0xa5]],
  ["Vertical ", [0xf7, 0xa3]],
  ["PlotOn ", [0xf7, 0xa8]],
  ["ClrText", [0xf7, 0x18]],
  ["Locate ", [0xf7, 0x10]],
];
// superscript digits of the fx-9860G character set (E5C0-E5C9 in Cahute's table; ² and ³ also in the eActivity files EactMaker
// writes): allowed inside a string, so a label can say CM² / CM³ / CM⁴ or end with the number key of a menu item (¹ ² …)
const SUPERSCRIPT: Record<string, number[]> = Object.fromEntries([..."⁰¹²³⁴⁵⁶⁷⁸⁹"].map((c, d) => [c, [0xe5, 0xc0 + d]]));
// the "Mini Latin" letters of the fx-9860G (E7 followed by the ASCII code: E761-E77A small letters, E741-E75A capitals; EactMaker
// uses them for subscripts): inside a string, the Unicode subscript letters write the subscripts of Mmax, Imin, Pmax…
const MINI: Record<string, number> = { "ₐ": 0x61, "ₘ": 0x6d, "ₓ": 0x78, "ᵢ": 0x69, "ₙ": 0x6e };
const SYMBOLS: Record<string, number> = { "√": 0x86, "→": 0x0e, "◢": 0x0c, "≤": 0x10, "×": 0xa9, "÷": 0xb9 };
// after one of these a minus is the sign of a number, not a subtraction
const OPENS = new Set([0x0d, 0x3a, 0x28, 0x0e, 0x3d, 0x3e, 0x3c, 0x89, 0x99, 0xa9, 0xb9, 0x87, 0x2c, 0x5b, 0x7b]);

export function tokenizeLine(line: string): number[] {
  const out: number[] = [];
  let inString = false;
  let afterKeyword = false; // a minus right after a command (Vertical –M÷B) is a sign
  for (let i = 0; i < line.length; ) {
    const ch = line[i];
    if (inString) {
      const o = ch.charCodeAt(0);
      if (ch in MINI) {
        out.push(0xe7, MINI[ch]);
        i++;
        continue;
      }
      if (ch in SUPERSCRIPT) {
        out.push(...SUPERSCRIPT[ch]);
        i++;
        continue;
      }
      if (ch === '"') inString = false;
      else if (o < 0x20 || o > 0x7e || ch === "+" || ch === "-") throw new Error(`character ${JSON.stringify(ch)} not allowed inside a string`);
      out.push(o);
      i++;
      continue;
    }
    const kw = KEYWORDS.find(([k]) => line.startsWith(k, i));
    if (kw) {
      out.push(...kw[1]);
      i += kw[0].length;
      afterKeyword = true;
      continue;
    }
    if (ch === '"') {
      inString = true;
      out.push(0x22);
    } else if (ch in SYMBOLS) out.push(SYMBOLS[ch]);
    else if (ch === "–" || ch === "-") out.push(out.length === 0 || afterKeyword || OPENS.has(out[out.length - 1]) ? 0x87 : 0x99);
    else if (ch === "+") out.push(0x89);
    else if (ch.charCodeAt(0) >= 0x20 && ch.charCodeAt(0) <= 0x7e) out.push(ch.charCodeAt(0));
    else throw new Error(`no Casio code for ${JSON.stringify(ch)}`);
    afterKeyword = false;
    i++;
  }
  return out;
}

export function programBytes(lines: string[]): number[] {
  return lines.flatMap((l) => [...tokenizeLine(l), 0x0d]);
}

const ascii = (s: string, n: number) => {
  const b = new Array<number>(n).fill(0);
  [...s].forEach((c, i) => (b[i] = c.charCodeAt(0)));
  return b;
};
const u32 = (v: number) => [(v >>> 24) & 255, (v >>> 16) & 255, (v >>> 8) & 255, v & 255];

export const buildG1m = (name: string, lines: string[]): Uint8Array => buildG1mFromBytes(name, programBytes(lines));

// `code`: the program as the calculator stores it (lines closed by 0x0D), without the zero padding.
export function buildG1mFromBytes(name: string, code: number[]): Uint8Array {
  if (!/^[A-Za-z0-9 ]{1,8}$/.test(name)) throw new Error("program name: 1 to 8 letters, digits or spaces");
  const len = 10 + code.length;
  const content = [...new Array<number>(10).fill(0), ...code, ...new Array<number>(4 - (len % 4)).fill(0)];
  const size = 32 + 20 + 24 + content.length;
  const header = [
    ...ascii("USBPower", 8), 0x31, 0x00, 0x10, 0x00, 0x10, 0x00,
    (size + 0x41) & 255, 0x01, ...u32(size), (size + 0xb8) & 255,
    ...new Array<number>(9).fill(0xff), 0x00, 0x01,
  ].map((b) => ~b & 255); // the header is stored inverted; the reserved bytes are 00 once inverted
  return Uint8Array.from([
    ...header,
    ...ascii("PROGRAM", 16), ...u32(1),
    ...ascii("system", 8), ...ascii(name, 8), 0x01, ...u32(content.length), 0, 0, 0,
    ...content,
  ]);
}
