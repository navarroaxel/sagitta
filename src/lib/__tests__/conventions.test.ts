import { diagramSigns } from "@/lib/conventions";

describe("diagramSigns – international convention", () => {
  test("N: sideSign +1, dispSign +1", () => {
    expect(diagramSigns("international", "N")).toEqual({ sideSign: 1, dispSign: 1 });
  });
  test("Q: sideSign +1, dispSign +1", () => {
    expect(diagramSigns("international", "Q")).toEqual({ sideSign: 1, dispSign: 1 });
  });
  test("M: sideSign -1, dispSign +1", () => {
    expect(diagramSigns("international", "M")).toEqual({ sideSign: -1, dispSign: 1 });
  });
});

describe("diagramSigns – argentina convention (UTN FRBA default)", () => {
  test("N: sideSign -1, dispSign +1", () => {
    expect(diagramSigns("argentina", "N")).toEqual({ sideSign: -1, dispSign: 1 });
  });
  test("Q: sideSign +1, dispSign -1", () => {
    expect(diagramSigns("argentina", "Q")).toEqual({ sideSign: 1, dispSign: -1 });
  });
  test("M: sideSign -1, dispSign +1", () => {
    expect(diagramSigns("argentina", "M")).toEqual({ sideSign: -1, dispSign: 1 });
  });
});
