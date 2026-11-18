export type Support = "free" | "pinned" | "fixed" | "roller-v" | "roller-h";

export interface FrameNode {
  id: string;
  x: number; // metres, y-up
  y: number;
  support: Support;
}

// What the "checks" panel does with a member (src/lib/checks.ts). A member without a section is
// only analysed (diagrams); the solver keeps using the model's material for it.
export type MemberSection =
  | { kind: "profile"; name: string } // verify this IPN/IPB against sigmaAdm; its A, Ix feed the solver
  | { kind: "size"; series: ("IPN" | "IPB")[] } // find the lightest profile of those series that passes
  | { kind: "cable" }; // round steel cable (tension only): diameter for sigmaAdm + elongation

export interface Member {
  id: string;
  n1: string; // node id
  n2: string; // node id
  section?: MemberSection;
  // Add the member's own weight (profile's kg/m, straight down) as a distributed load. Needs a
  // `profile` or `size` section; for `size` the weight depends on the profile picked, so the
  // solver iterates until the pick is stable (see solve.ts).
  selfWeight?: boolean;
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
  // Allowable stress for the checks panel, in force/cm² (kg/cm² when the forces are in kg, as in the
  // course; kN/cm² for kN). Lengths are metres, so sections are in cm and M·100 gives force·cm.
  sigmaAdm?: number;
}
