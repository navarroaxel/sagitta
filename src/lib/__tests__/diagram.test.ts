import { buildMemberDiagram, BuildDiagramOptions } from "../diagram";
import { Transform } from "../geometry";
import { Station } from "../sampling";
import { FrameNode } from "../types";

// A trivial, deterministic world→screen transform: x→x, y→-y (k=1, no offset).
// Keeps the diagram arithmetic easy to reason about in assertions.
const idTransform: Transform = {
  toSX: (x) => x,
  toSY: (y) => -y,
  k: 1,
  ox: 0,
  oy: 0,
  box: { minX: 0, maxX: 10, minY: 0, maxY: 0, diagLen: 10 },
};

const nodeI: FrameNode = { id: "I", x: 0, y: 0, support: "free" };
const nodeJ: FrameNode = { id: "J", x: 10, y: 0, support: "free" };

function opts(
  stations: Station[],
  over: Partial<BuildDiagramOptions> = {},
): BuildDiagramOptions {
  return {
    transform: idTransform,
    nodeI,
    nodeJ,
    stations,
    key: "M",
    scale: 1,
    sideSign: -1,
    globalMax: 100,
    diagLen: 10,
    ...over,
  };
}

function station(x: number, M: number): Station {
  return { x, N: 0, Q: 0, M };
}

const allFinite = (...ns: number[]) => ns.every((n) => Number.isFinite(n));

describe("buildMemberDiagram – point counts", () => {
  test("same-sign stations produce one point per station (no zero inserted)", () => {
    const stations = [station(0, 10), station(5, 50), station(10, 20)];
    const d = buildMemberDiagram(opts(stations));
    expect(d.points).toHaveLength(stations.length);
  });

  test("a sign change inserts exactly one zero-crossing point", () => {
    const stations = [station(0, 10), station(10, -10)];
    const d = buildMemberDiagram(opts(stations));
    expect(d.points).toHaveLength(3);
    // inserted crossing sits at the midpoint with value 0
    expect(d.points[1].value).toBe(0);
    expect(d.points[1].bx).toBeCloseTo(5, 9);
  });
});

describe("buildMemberDiagram – degenerate values", () => {
  test("all-zero stations yield finite coordinates (no NaN/Infinity)", () => {
    const stations = [station(0, 0), station(5, 0), station(10, 0)];
    const d = buildMemberDiagram(opts(stations, { globalMax: 0 }));
    for (const p of d.points) {
      expect(allFinite(p.bx, p.by, p.ox, p.oy, p.value)).toBe(true);
    }
    expect(d.offsetPolyline).not.toMatch(/NaN|Infinity/);
    for (const lbl of [d.iLabel, d.jLabel, d.extremumLabel]) {
      expect(allFinite(lbl.x, lbl.y, lbl.v)).toBe(true);
    }
  });

  test("globalMax = 0 collapses offsets onto the baseline (zero scale)", () => {
    const stations = [station(0, 10), station(5, 50), station(10, 20)];
    const d = buildMemberDiagram(opts(stations, { globalMax: 0 }));
    for (const p of d.points) {
      expect(p.ox).toBeCloseTo(p.bx, 9);
      expect(p.oy).toBeCloseTo(p.by, 9);
    }
  });

  test("globalMax below the 1e-10 epsilon also collapses to zero scale", () => {
    const stations = [station(0, 1e-12), station(10, 1e-12)];
    const d = buildMemberDiagram(opts(stations, { globalMax: 1e-12 }));
    for (const p of d.points) {
      expect(p.ox).toBeCloseTo(p.bx, 12);
      expect(p.oy).toBeCloseTo(p.by, 12);
    }
  });
});

describe("buildMemberDiagram – sideSign", () => {
  test("flipping sideSign mirrors offsets about the baseline", () => {
    const stations = [station(0, 10), station(5, 50), station(10, 20)];
    const pos = buildMemberDiagram(opts(stations, { sideSign: 1 }));
    const neg = buildMemberDiagram(opts(stations, { sideSign: -1 }));
    expect(pos.points).toHaveLength(neg.points.length);
    for (let i = 0; i < pos.points.length; i++) {
      const p = pos.points[i];
      const n = neg.points[i];
      // bases identical, offset displacement negated
      expect(n.bx).toBeCloseTo(p.bx, 9);
      expect(n.by).toBeCloseTo(p.by, 9);
      expect(n.ox - n.bx).toBeCloseTo(-(p.ox - p.bx), 9);
      expect(n.oy - n.by).toBeCloseTo(-(p.oy - p.by), 9);
    }
  });
});
