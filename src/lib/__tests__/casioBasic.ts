// A tiny interpreter of the Casio Basic subset the programs of casioPrograms.ts use, so the tests can RUN the listings
// (control flow, variables, prompts) and compare their output with the solver. Not a general Casio Basic: If/Then/IfEnd
// (no Else), For/Next, Stop, `"prompt"?→V`, `expr→V`, `{list}→List n`, `expr◢`, a lone string, Abs, √, List n[i].
export type Out = string | number;

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

export function runBasic(lines: string[], inputs: number[]): Out[] {
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
  const expr = (e: string): number => {
    const js = e
      .replace(/List (\d)\[/g, "LL[$1][")
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
  const forStack: { start: number; name: string; end: number }[] = [];
  let pc = 0;
  let steps = 0;
  while (pc < st.length) {
    if (++steps > 100000) throw new Error("program does not stop");
    const s = st[pc];
    if (s === "Then" || s === "IfEnd") pc++;
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
      const m = /^(.*)→(List (\d)|[A-Z])$/.exec(s);
      if (!m) {
        out.push(expr(s)); // a bare expression at the end of the program is displayed
        pc++;
        continue;
      }
      if (m[3]) L[+m[3]] = [0, ...m[1].slice(1, -1).split(",").map(Number)];
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
