import React from "react";

const SUB = /_([A-Za-zÁÉÍÓÚáéíóúñ]+(?:,[A-Za-zÁÉÍÓÚáéíóúñ]+)?)/;

// Renders "P_z", "e_x", "P_z,max" in a translated string with real subscripts.
export function Sub({ children }: { children: string }) {
  const parts = children.split(SUB);
  return (
    <>
      {parts.map((p, i) => (i % 2 ? <sub key={i}>{p}</sub> : <React.Fragment key={i}>{p}</React.Fragment>))}
    </>
  );
}

// Same for SVG <text>: <sub> is not valid there, so the subscript is a smaller, lowered <tspan> and the text that
// follows it goes back up.
export function SvgSub({ children }: { children: string }) {
  const parts = children.split(SUB);
  return (
    <>
      {parts.map((p, i) =>
        i % 2 ? (
          <tspan key={i} fontSize="0.75em" dy="0.3em">
            {p}
          </tspan>
        ) : i > 0 ? (
          <tspan key={i} dy="-0.3em">
            {p}
          </tspan>
        ) : (
          <React.Fragment key={i}>{p}</React.Fragment>
        ),
      )}
    </>
  );
}
