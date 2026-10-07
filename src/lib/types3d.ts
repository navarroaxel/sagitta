// Id-based 3D frame model (the 3D counterpart of types.ts). World coords in metres, z up.

export type Support3D = "free" | "pinned" | "fixed";

export interface FrameNode3D {
  id: string;
  x: number;
  y: number;
  z: number;
  support: Support3D;
}

export interface Member3D {
  id: string;
  n1: string; // node id
  n2: string; // node id
}

export type Load3D =
  | {
      id: string;
      type: "nodal";
      node: string;
      fx: number;
      fy: number;
      fz: number;
      mx: number;
      my: number;
      mz: number;
    }
  | {
      id: string;
      type: "mpoint";
      member: string;
      dist: number;
      gx: number;
      gy: number;
      gz: number;
    }
  | {
      id: string;
      type: "mudl";
      member: string;
      gx: number;
      gy: number;
      gz: number;
    };

export interface Material3D {
  E: number;
  G: number;
  A: number;
  Iy: number;
  Iz: number;
  J: number;
}

export interface FrameModel3D {
  nodes: FrameNode3D[];
  members: Member3D[];
  loads: Load3D[];
  material: Material3D;
  unit: string; // force unit label only, e.g. 'kN'
}
