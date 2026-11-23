import React from "react";

const SUBSCRIPT = "_([A-Za-zÁÉÍÓÚáéíóúñ0-9′]+(?:,[A-Za-zÁÉÍÓÚáéíóúñ0-9′]+)?)";
// {y} marks a math variable (italic, so a lone "y" is not read as the Spanish "y"); _x is a subscript.
const TOKEN = new RegExp(`\\{([^{}]*)\\}|${SUBSCRIPT}`, "g");

type Tok = { kind: "text" | "var" | "sub"; text: string };

function tokenize(s: string): Tok[] {
  const out: Tok[] = [];
  let last = 0;
  for (const m of s.matchAll(TOKEN)) {
    if (m.index! > last)
      out.push({ kind: "text", text: s.slice(last, m.index) });
    if (m[1] !== undefined) out.push({ kind: "var", text: m[1] });
    else out.push({ kind: "sub", text: m[2] });
    last = m.index! + m[0].length;
  }
  if (last < s.length) out.push({ kind: "text", text: s.slice(last) });
  return out;
}

// Removes the markup (for aria-labels and plain-text uses).
export function plain(s: string): string {
  return s.replace(/\{([^{}]*)\}/g, "$1");
}

// Renders "P_z", "e_x", "P_z,max" in a translated string with real subscripts, and "{y}" as a serif italic (a slanted
// sans-serif y is too close to the upright one, so the variable gets the look of a math symbol).
export function Sub({ children }: { children: string }) {
  return (
    <>
      {tokenize(children).map((tk, i) =>
        tk.kind === "sub" ? (
          <sub key={i}>{tk.text}</sub>
        ) : tk.kind === "var" ? (
          <i key={i} className="font-serif text-[1.06em]">
            {tk.text}
          </i>
        ) : (
          <React.Fragment key={i}>{tk.text}</React.Fragment>
        ),
      )}
    </>
  );
}

// Same for SVG <text>: <sub> is not valid there, so the subscript is a smaller, lowered <tspan> and the text that
// follows it goes back up.
export function SvgSub({ children }: { children: string }) {
  const toks = tokenize(children);
  return (
    <>
      {toks.map((tk, i) => {
        const wasSub = i > 0 && toks[i - 1].kind === "sub";
        if (tk.kind === "sub")
          return (
            <tspan key={i} fontSize="0.75em" dy="0.4em">
              {tk.text}
            </tspan>
          );
        if (tk.kind === "var")
          return (
            <tspan
              key={i}
              fontStyle="italic"
              fontFamily="Georgia, serif"
              dy={wasSub ? "-0.3em" : undefined}
            >
              {tk.text}
            </tspan>
          );
        return wasSub ? (
          <tspan key={i} dy="-0.3em">
            {tk.text}
          </tspan>
        ) : (
          <React.Fragment key={i}>{tk.text}</React.Fragment>
        );
      })}
    </>
  );
}
