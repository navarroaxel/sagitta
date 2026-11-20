import { buildG1m, buildG1mFromBytes, programBytes, tokenizeLine } from "../casioG1m";
import { EXCENTR_LINES, PANDEO_LINES, PERFILES_LINES, SECCION_LINES, REACC_LINES, RETIC_LINES, TRACCION_LINES, VIGACAB_LINES } from "../casioPrograms";

// Independent reader, written like Cahute's: inverts the header, walks group → file headers.
function read(file: Uint8Array) {
  const h = Array.from(file.slice(0, 32)).map((b) => ~b & 255);
  const u32 = (a: number[] | Uint8Array, o: number) => ((a[o] << 24) | (a[o + 1] << 16) | (a[o + 2] << 8) | a[o + 3]) >>> 0;
  const str = (a: Uint8Array, o: number, n: number) => String.fromCharCode(...Array.from(a.slice(o, o + n)).filter((c) => c));
  return {
    id: String.fromCharCode(...h.slice(0, 8)),
    type: h[8],
    c1: h[14],
    size: u32(h, 16),
    c2: h[20],
    objects: (h[30] << 8) | h[31],
    group: str(file, 32, 16),
    groupCount: u32(file, 48),
    dir: str(file, 52, 8),
    name: str(file, 60, 8),
    ft: file[68],
    length: u32(file, 69),
    content: file.slice(76, 76 + u32(file, 69)),
  };
}

// The same table the other way round, for the few tokens the programs use (display text of each code).
const TWO = new Map([["f700", "If "], ["f701", "Then "], ["f702", "Else "], ["f703", "IfEnd"], ["f704", "For "], ["f705", " To "], ["f707", "Next"], ["f70e", "Stop"], ["7f51", "List "], ["f708", "While "], ["f709", "WhileEnd"], ["f7a4", "Horizontal "], ["f7a7", "F-Line "], ["f7a5", "Text "], ["f7a3", "Vertical "], ["f7a8", "PlotOn "], ["7f8f", "Getkey"], ["f718", "ClrText"], ["f710", "Locate "], ...[..."⁰¹²³⁴⁵⁶⁷⁸⁹"].map((c, d) => [`e5c${d}`, c] as [string, string]), ["e761", "ₐ"], ["e76d", "ₘ"], ["e778", "ₓ"], ["e769", "ᵢ"], ["e76e", "ₙ"]]);
const ONE = new Map([[0x0e, "→"], [0x0c, "◢"], [0x10, "≤"], [0x87, "–"], [0x89, "+"], [0x99, "–"], [0xa9, "×"], [0xb9, "÷"], [0x97, "Abs "], [0x86, "√"], [0xd1, "Cls"], [0xeb, "ViewWindow "]]);
function decode(bytes: number[]): string {
  let out = "";
  for (let i = 0; i < bytes.length; i++) {
    const two = bytes.length > i + 1 ? TWO.get(((bytes[i] << 8) | bytes[i + 1]).toString(16).padStart(4, "0")) : undefined;
    if (two !== undefined) {
      out += two;
      i++;
    } else out += ONE.get(bytes[i]) ?? String.fromCharCode(bytes[i]);
  }
  return out;
}

describe("Casio .g1m builder", () => {
  test("container: inverted standard header, group and file headers, checksums, padding", () => {
    const f = buildG1m("REACC", ["1→A"]);
    const r = read(f);
    expect(r.id).toBe("USBPower");
    expect(r.type).toBe(0x31);
    expect(r.size).toBe(f.length);
    expect(r.c1).toBe((f.length + 0x41) & 255);
    expect(r.c2).toBe((f.length + 0xb8) & 255);
    expect(r.objects).toBe(1);
    expect([r.group, r.groupCount, r.dir, r.name, r.ft]).toEqual(["PROGRAM", 1, "system", "REACC", 1]);
    expect(r.length % 4).toBe(0);
    expect(f.length).toBe(32 + 20 + 24 + r.length);
    expect(Array.from(r.content.slice(0, 10))).toEqual(new Array(10).fill(0)); // no password
    expect(decode(Array.from(r.content.slice(10))).replace(/\0+$/, "")).toBe("1→A\r");
  });

  test("padding: 1 to 4 zeros, so the content is a multiple of 4 (4 when it already is)", () => {
    for (let n = 0; n < 8; n++) {
      const code = new Array(n).fill(0x41); // n program bytes
      const r = read(buildG1mFromBytes("T", code));
      const zeros = r.length - 10 - n;
      expect(zeros).toBeGreaterThanOrEqual(1);
      expect(zeros).toBeLessThanOrEqual(4);
      expect(r.length % 4).toBe(0);
    }
  });

  test("tokens: two-byte commands, one-byte symbols, unary versus binary minus", () => {
    const hex = (l: string) => tokenizeLine(l).map((b) => b.toString(16).padStart(2, "0")).join(" ");
    expect(hex("If T=2:Then X→Z:IfEnd")).toBe("f7 00 54 3d 32 3a f7 01 58 0e 5a 3a f7 03");
    expect(hex("For 1→C To N")).toBe("f7 04 31 0e 43 f7 05 4e");
    expect(hex("Next")).toBe("f7 07");
    expect(hex("Stop")).toBe("f7 0e");
    expect(hex("List 1[I]÷20→D")).toBe("7f 51 31 5b 49 5d b9 32 30 0e 44");
    expect(hex("Abs (M–W)")).toBe("97 28 4d 99 57 29");
    expect(hex("–F◢")).toBe("87 46 0c"); // (–) at the start of a line
    expect(hex("√(M×M)→L")).toBe("86 28 4d a9 4d 29 0e 4c");
    expect(hex("While Getkey=0:WhileEnd")).toBe("f7 08 7f 8f 3d 30 3a f7 09");
    expect(hex("ViewWindow 0,L,L÷4,–1.25×M,0.35×M,M")).toBe("eb 30 2c 4c 2c 4c b9 34 2c 87 31 2e 32 35 a9 4d 2c 30 2e 33 35 a9 4d 2c 4d");
    expect(hex("F-Line X,–Y,B,–E")).toBe("f7 a7 58 2c 87 59 2c 42 2c 87 45");
    expect(hex("Text 1,1,M")).toBe("f7 a5 31 2c 31 2c 4d");
    expect(hex("Horizontal 0")).toBe("f7 a4 30");
    expect(hex("ClrText")).toBe("f7 18");
    expect(hex('"CM²"')).toBe("22 43 4d e5 c2 22"); // superscript digits inside a string (CM² CM³ CM⁴)
    expect(hex('"CM³ CM⁴"')).toBe("22 43 4d e5 c3 20 43 4d e5 c4 22");
    expect(hex('"Mₘₐₓ"')).toBe("22 4d e7 6d e7 61 e7 78 22"); // M with the subscript max: the Mini Latin letters m a x
    expect(hex('"Iₘᵢₙ"')).toBe("22 49 e7 6d e7 69 e7 6e 22");
    expect(hex('"SALIR⁰ A¹"')).toBe("22 53 41 4c 49 52 e5 c0 20 41 e5 c1 22"); // the number keys of the menu items
    expect(hex('Locate 1,2,"FX"')).toBe("f7 10 31 2c 32 2c 22 46 58 22");
    expect(hex("Locate 4,2,–F")).toBe("f7 10 34 2c 32 2c 87 46"); // (–) as a value after a comma
    expect(hex("Vertical –M÷B")).toBe("f7 a3 87 4d b9 42"); // (–) right after a command
    expect(hex("U×L→U")).toBe("55 a9 4c 0e 55");
    expect(hex("If U≤S:Then")).toBe("f7 00 55 10 53 3a f7 01");
    expect(hex('"N KG (TRAC POS)"?→N')).toBe(Array.from('"N KG (TRAC POS)"').map((c) => c.charCodeAt(0).toString(16)).join(" ") + " 3f 0e 4e");
  });

  test("a string keeps its text as ASCII, even if it contains command words; + and – are refused inside it", () => {
    expect(tokenizeLine('"IfEnd Next"').every((b) => b < 0x80)).toBe(true);
    expect(() => tokenizeLine('"A+B"')).toThrow();
    expect(() => tokenizeLine('"A–B"')).toThrow();
    expect(() => tokenizeLine("ñ")).toThrow();
  });

  test("REACC and SECCION: every line decodes back to the line typed, and the files are well formed", () => {
    for (const [name, lines] of [["REACC", REACC_LINES], ["PERFIL", SECCION_LINES], ["VIGACAB", VIGACAB_LINES], ["TRACCION", TRACCION_LINES], ["PANDEO", PANDEO_LINES], ["RETIC", RETIC_LINES], ["PERFILES", PERFILES_LINES], ["EXCENTR", EXCENTR_LINES]] as const) {
      const f = buildG1m(name, lines);
      const r = read(f);
      expect(r.name).toBe(name);
      const code = Array.from(r.content.slice(10));
      while (code[code.length - 1] === 0) code.pop();
      expect(code).toEqual(programBytes(lines));
      // the Then token is displayed with a trailing space
      expect(decode(code).split("\r").slice(0, -1).map((l) => l.trimEnd())).toEqual(lines);
      expect(f.length).toBeLessThan(8000); // fits the calculator's memory (tens of KB) with room to spare
    }
  });

  test("program name: 1 to 8 letters, digits or spaces", () => {
    expect(() => buildG1m("", ["A"])).toThrow();
    expect(() => buildG1m("TOOLONGNAME", ["A"])).toThrow();
    expect(() => buildG1m("A-B", ["A"])).toThrow();
    expect(() => buildG1m("SECCION", ["A"])).not.toThrow();
  });
});
