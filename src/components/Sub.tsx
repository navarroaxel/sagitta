import React from "react";

// Renders "P_z", "e_x", "P_z,max" in a translated string with real subscripts.
export function Sub({ children }: { children: string }) {
  const parts = children.split(/_([A-Za-z]+(?:,[A-Za-z]+)?)/);
  return (
    <>
      {parts.map((p, i) => (i % 2 ? <sub key={i}>{p}</sub> : <React.Fragment key={i}>{p}</React.Fragment>))}
    </>
  );
}
