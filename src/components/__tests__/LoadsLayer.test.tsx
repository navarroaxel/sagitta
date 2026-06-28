import { render } from "@testing-library/react";
import { LoadsLayer } from "../canvas/LoadsLayer";
import { makeTransform } from "@/lib/geometry";
import { FrameModel } from "@/lib/types";
import { SVG_W, SVG_H } from "../canvas/constants";

// Minimal model: horizontal member from (0,0) to (4,0) with a downward UDL
const model: FrameModel = {
  nodes: [
    { id: "A", x: 0, y: 0, support: "pinned" },
    { id: "B", x: 4, y: 0, support: "roller-v" },
  ],
  members: [{ id: "m1", n1: "A", n2: "B" }],
  loads: [{ id: "udl1", type: "mudl", member: "m1", gx: 0, gy: -10 }],
  material: { E: 200000, A: 0.01, I: 0.0001 },
  unit: "kN",
};

describe("LoadsLayer – UDL profile line", () => {
  const tr = makeTransform(model.nodes, SVG_W, SVG_H);

  test("renders a udl-profile line element for a mudl load", () => {
    const { container } = render(
      <svg>
        <LoadsLayer model={model} tr={tr} />
      </svg>,
    );

    const profileLine = container.querySelector(
      '[data-testid="udl-profile-udl1"]',
    );
    expect(profileLine).not.toBeNull();
    expect(profileLine!.tagName.toLowerCase()).toBe("line");
  });

  test("profile line endpoints sit at the arrow tails of the i- and j-end arrows", () => {
    const { container } = render(
      <svg>
        <LoadsLayer model={model} tr={tr} />
      </svg>,
    );

    // Reproduce the component's math for this fixture:
    // mag = hypot(0, -10) = 10
    // maxF = 10  →  k = (40 / 10) * 1 = 4
    // len = 10 * 4 * 0.6 = 24
    // angle = atan2(-(-10), 0) = atan2(10, 0) = π/2
    // dx = cos(π/2) * 24 ≈ 0
    // dy = sin(π/2) * 24 = 24
    const mag = Math.hypot(0, -10); // 10
    const k = (40 / mag) * 1; // 4
    const len = mag * k * 0.6; // 24
    const angle = Math.atan2(-(-10), 0); // π/2

    const dx = Math.cos(angle) * len;
    const dy = Math.sin(angle) * len;

    // i-end node A = (0,0), j-end node B = (4,0)
    const s0x = tr.toSX(0);
    const s0y = tr.toSY(0);
    const s1x = tr.toSX(4);
    const s1y = tr.toSY(0);

    const expectedX1 = s0x - dx;
    const expectedY1 = s0y - dy;
    const expectedX2 = s1x - dx;
    const expectedY2 = s1y - dy;

    const profileLine = container.querySelector(
      '[data-testid="udl-profile-udl1"]',
    )!;

    expect(Number(profileLine.getAttribute("x1"))).toBeCloseTo(expectedX1, 3);
    expect(Number(profileLine.getAttribute("y1"))).toBeCloseTo(expectedY1, 3);
    expect(Number(profileLine.getAttribute("x2"))).toBeCloseTo(expectedX2, 3);
    expect(Number(profileLine.getAttribute("y2"))).toBeCloseTo(expectedY2, 3);

    // Sanity: for a downward load (gy < 0), the profile line sits ABOVE the
    // member (screen y decreases upward), i.e. y1 < toSY(0).
    expect(expectedY1).toBeLessThan(tr.toSY(0));
    // The profile line is horizontal (same y on both ends since member is horizontal)
    expect(Number(profileLine.getAttribute("y1"))).toBeCloseTo(
      Number(profileLine.getAttribute("y2")),
      3,
    );
  });

  test("profile line is rendered before arrows (appears first in the group)", () => {
    const { container } = render(
      <svg>
        <LoadsLayer model={model} tr={tr} />
      </svg>,
    );

    const group = container.querySelector('[data-testid="load-udl1"]')!;
    expect(group).not.toBeNull();
    // The first child of the group should be the profile line
    const firstChild = group.firstElementChild!;
    expect(firstChild.getAttribute("data-testid")).toBe("udl-profile-udl1");
  });
});
