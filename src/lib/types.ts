export type Support = "free" | "pinned" | "fixed" | "roller-v" | "roller-h";

export interface FrameNode {
  id: string;
  x: number; // metres, y-up
  y: number;
  support: Support;
}

export interface Member {
  id: string;
  n1: string; // node id
  n2: string; // node id
  relI?: boolean; // moment release (hinge) at the n1 end
  relJ?: boolean; // moment release (hinge) at the n2 end
}

export type Load =
  | {
      id: string;
      type: "nodal";
      node: string;
      fx: number;
      fy: number;
      m: number;
    }
  | {
      id: string;
      type: "mpoint";
      member: string;
      dist: number;
      gx: number;
      gy: number;
    }
  | { id: string; type: "mudl"; member: string; gx: number; gy: number };

export interface Material {
  E: number;
  A: number;
  I: number;
}

export interface FrameModel {
  nodes: FrameNode[];
  members: Member[];
  loads: Load[];
  material: Material;
  unit: string; // display label only, e.g. 'kN' or 'T'
}
