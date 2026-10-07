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
  profile?: string; // IPN/IPB designation (see profiles.ts); overrides A, Iy, Iz, J of the material
  rotated?: boolean; // true: strong axis bends the member in x'-y' instead of x'-z'
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
      from?: number; // loaded span, distances from n1 (default: the whole member)
      to?: number;
    };

export interface Material3D {
  E: number;
  G: number;
  A: number;
  Ix: number; // moment of inertia about the section x axis (bending in the y-z plane)
  Iy: number; // about the section y axis
  J: number;
}

export interface FrameModel3D {
  nodes: FrameNode3D[];
  members: Member3D[];
  loads: Load3D[];
  material: Material3D;
  unit: string; // force unit label only, e.g. 'kN'
  sigmaAdm: number; // allowable normal stress, kN/cm² (stresses assume kN and m)
}
