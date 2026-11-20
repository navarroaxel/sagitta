// A tiny interpreter of the Casio Basic subset the programs of casioPrograms.ts use, so the tests can RUN the listings
// (control flow, variables, prompts) and compare their output with the solver. Not a general Casio Basic: If/Then/IfEnd
// (no Else), For/Next, Stop, the graphics commands (Cls, ViewWindow, Horizontal, Vertical, F-Line, PlotOn, Text: recorded in a Gfx) and
// While loops (the waits for a key, While Getkey>0 / =0, are over at once), `"prompt"?→V`, `expr→V`, `{list}→List n`, `expr→List n[i]`, `expr◢`, a lone string, Abs, √, List n[i].
export type Out = string | number;

// What the graphics commands drew (the window, the segments, the texts), for the tests.
export interface Gfx {
  window: number[] | null;
  segments: [number, number, number, number][];
  horizontals: number[];
  verticals: number[];
  plots: [number, number][];
  texts: [number, number, number | string][];
  locates: [number, number, number | string][]; // the text-screen summary of REACC (column, line, value)
  clearTexts: number;
  screens: [number, number, number | string][][]; // the text screens, one per ClrText (what Locate wrote on each)
  clears: number;
}
export const newGfx = (): Gfx => ({ window: null, segments: [], horizontals: [], verticals: [], plots: [], texts: [], locates: [], clearTexts: 0, screens: [[]], clears: 0 });

const splitTop = (line: string, sep: string): string[] => {
  const parts: string[] = [];
  let cur = "";
  let q = false;
  for (const ch of line) {
    if (ch === '"') q = !q;
    if (ch === sep && !q) {
      parts.push(cur);
      cur = "";
    } else cur += ch;
  }
  parts.push(cur);
  return parts;
};

export function runBasic(lines: string[], inputs: number[], gfx: Gfx = newGfx()): Out[] {
  const v: Record<string, number> = {};
  const L: Record<number, number[]> = {};
  const out: Out[] = [];
  const input = [...inputs];
  // statements, with `Then x` split into the keyword and its statement
  const st: string[] = [];
  for (const line of lines)
    for (const raw of splitTop(line, ":")) {
      const s = raw.trim();
      if (s.startsWith("Then")) {
        st.push("Then");
        if (s.slice(4).trim()) st.push(s.slice(4).trim());
      } else if (s) st.push(s);
    }
  const args = (a: string) => splitTop(a, ",").map((x) => expr(x.trim()));
  const expr = (e: string): number => {
    const js = e
      .replace(/List (\d)\[/g, "LL[$1][")
      .replace(/Getkey/g, "1") // a key is "pressed" at once: the wait loops do not hang
      .replace(/Abs \(/g, "Math.abs(")
      .replace(/√\(/g, "Math.sqrt(")
      .replace(/×/g, "*")
      .replace(/÷/g, "/")
      .replace(/–/g, "-")
      .replace(/≤/g, "<=")
      .replace(/(?<![<>=!])=(?!=)/g, "===")
      .replace(/\[([A-Z])\]/g, (_, n) => `[v.${n}]`)
      .replace(/(?<![.\w])([A-Z])(?![\w(])/g, "v.$1");
    return Function("v", "LL", `return (${js});`)(v, L) as number;
  };
  const whileStack: number[] = [];
  const forStack: { start: number; name: string; end: number }[] = [];
  let pc = 0;
  let steps = 0;
  while (pc < st.length) {
    if (++steps > 3000000) throw new Error("program does not stop");
    const s = st[pc];
    if (s === "Then" || s === "IfEnd") pc++;
    else if (s === "WhileEnd") pc = whileStack.length ? whileStack[whileStack.length - 1] : pc + 1; // back to the condition
    else if (s === "ClrText") {
      gfx.clearTexts++;
      gfx.screens.push([]);
      pc++;
    } else if (s.startsWith("Locate ")) {
      const [c, r, e] = splitTop(s.slice(7), ",");
      const loc: [number, number, number | string] = [expr(c), expr(r), /^"/.test(e.trim()) ? e.trim().slice(1, -1) : expr(e)];
      gfx.locates.push(loc);
      gfx.screens[gfx.screens.length - 1].push(loc);
      pc++;
    } else if (s === "Cls") {
      gfx.clears++;
      pc++;
    } else if (s.startsWith("ViewWindow ")) {
      gfx.window = args(s.slice(11));
      pc++;
    } else if (s.startsWith("Horizontal ")) {
      gfx.horizontals.push(expr(s.slice(11)));
      pc++;
    } else if (s.startsWith("Vertical ")) {
      gfx.verticals.push(expr(s.slice(9)));
      pc++;
    } else if (s.startsWith("PlotOn ")) {
      gfx.plots.push(args(s.slice(7)) as [number, number]);
      pc++;
    } else if (s.startsWith("F-Line ")) {
      gfx.segments.push(args(s.slice(7)) as [number, number, number, number]);
      pc++;
    } else if (s.startsWith("Text ")) {
      const [r, c, e] = splitTop(s.slice(5), ",");
      gfx.texts.push([expr(r), expr(c), /^"/.test(e.trim()) ? e.trim().slice(1, -1) : expr(e)]);
      pc++;
    } else if (s.startsWith("While ")) {
      // the waits for a key (While Getkey>0 / While Getkey=0) are over at once; any other condition is evaluated
      const go = /Getkey/.test(s) ? false : !!expr(s.slice(6));
      if (go) {
        if (whileStack[whileStack.length - 1] !== pc) whileStack.push(pc);
        pc++;
      } else {
        if (whileStack[whileStack.length - 1] === pc) whileStack.pop();
        let depth = 0;
        for (pc++; pc < st.length; pc++) {
          if (st[pc].startsWith("While ")) depth++;
          if (st[pc] === "WhileEnd" && depth-- === 0) break;
        }
        pc++;
      }
    }
    else if (s === "Stop") break;
    else if (s.startsWith("If ")) {
      if (expr(s.slice(3))) pc++;
      else {
        let depth = 0;
        for (pc++; pc < st.length; pc++) {
          if (st[pc].startsWith("If ")) depth++;
          if (st[pc] === "IfEnd" && depth-- === 0) break;
        }
        pc++;
      }
    } else if (s.startsWith("For ")) {
      const m = /^For (.+)→([A-Z]) To (.+)$/.exec(s)!;
      v[m[2]] = expr(m[1]);
      forStack.push({ start: pc + 1, name: m[2], end: expr(m[3]) });
      pc++;
    } else if (s === "Next") {
      const f = forStack[forStack.length - 1];
      v[f.name]++;
      if (v[f.name] <= f.end) pc = f.start;
      else {
        forStack.pop();
        pc++;
      }
    } else if (s.endsWith("◢")) {
      out.push(expr(s.slice(0, -1)));
      pc++;
    } else if (/^"[^"]*"$/.test(s)) {
      out.push(s.slice(1, -1));
      pc++;
    } else {
      const el = /^(.*)→List (\d)\[(.+)\]$/.exec(s); // value→List n[index]
      if (el) {
        (L[+el[2]] ??= [0])[expr(el[3])] = expr(el[1]);
        pc++;
        continue;
      }
      const m = /^(.*)→(List (\d)|[A-Z])$/.exec(s);
      if (!m) {
        out.push(expr(s)); // a bare expression at the end of the program is displayed
        pc++;
        continue;
      }
      if (m[3]) L[+m[3]] = [0, ...args(m[1].slice(1, -1))];
      else if (/^"[^"]*"\?$/.test(m[1])) {
        const x = input.shift();
        if (x === undefined) throw new Error(`no input left for ${m[1]}`);
        v[m[2]] = x;
      } else v[m[2]] = expr(m[1]);
      pc++;
    }
  }
  if (input.length) throw new Error(`unused inputs: ${input.join(",")}`);
  return out;
}
