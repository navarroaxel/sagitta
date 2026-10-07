// Rolled I sections used in the course (CIRSOC 301-EL/302-EL "Tablas de Perfiles"):
// IPN (IRAM-IAS U 500-511) and IPB (IRAM-IAS U 500-215-2). Transcribed from the table
// the instructors handed out; X-X is the strong axis, Y-Y the weak one.
// Units here are the table's: mm for dimensions, cm² for A, cm³ for S, cm for r, cm⁴ for I and J.

export interface Profile {
  name: string; // "IPN 200", "IPB 300", "IPE 270" (designation, not always = h in the extra series)
  series: "IPN" | "IPB" | "IPBl" | "IPBv" | "IPE" | "UPN";
  h: number; // total depth (= the designation), mm
  bf: number; // flange width, mm
  tf: number; // flange thickness, mm
  tw: number; // web thickness, mm
  A: number; // cm²
  Ix: number; // cm⁴ (strong axis)
  Sx: number; // cm³
  rx: number; // cm
  Iy: number; // cm⁴ (weak axis)
  Sy: number; // cm³
  ry: number; // cm
  J: number; // cm⁴ (torsion constant)
  hw: number; // clear web height between the root fillets (as printed in the table), mm
  r: number; // root fillet radius r1, mm
  r2?: number; // flange-toe radius, mm (only the tapered-flange series: IPN, UPN)
}

// h, bf, tf, tw, A, Ix, Sx, rx, Iy, Sy, ry, J
type Row = [
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
];

const IPN_ROWS: Row[] = [
  [80, 42, 5.9, 3.9, 7.57, 77.8, 19.5, 3.2, 6.29, 3.0, 0.91, 0.71],
  [100, 50, 6.8, 4.5, 10.6, 171, 34.2, 4.01, 12.2, 4.88, 1.07, 1.31],
  [120, 58, 7.7, 5.1, 14.2, 328, 54.7, 4.81, 21.5, 7.41, 1.23, 2.23],
  [140, 66, 8.6, 5.7, 18.2, 573, 81.9, 5.61, 35.2, 10.7, 1.4, 3.56],
  [160, 74, 9.5, 6.3, 22.8, 935, 117, 6.4, 54.7, 14.8, 1.55, 5.4],
  [180, 82, 10.4, 6.9, 27.9, 1450, 161, 7.2, 81.3, 19.8, 1.71, 7.89],
  [200, 90, 11.3, 7.5, 33.4, 2140, 214, 8.0, 117, 26.0, 1.87, 11.2],
  [220, 98, 12.2, 8.1, 39.5, 3060, 278, 8.8, 162, 33.1, 2.02, 15.3],
  [240, 106, 13.1, 8.7, 46.1, 4250, 354, 9.59, 221, 41.7, 2.2, 20.6],
  [260, 113, 14.1, 9.4, 53.3, 5740, 442, 10.4, 288, 51.0, 2.32, 27.5],
  [280, 119, 15.2, 10.1, 61.0, 7590, 542, 11.1, 364, 61.2, 2.45, 36.4],
  [300, 125, 16.2, 10.8, 69.0, 9800, 653, 11.9, 451, 72.2, 2.56, 46.7],
  [320, 131, 17.3, 11.5, 77.7, 12510, 782, 12.7, 555, 84.7, 2.67, 59.7],
  [340, 137, 18.3, 12.2, 86.7, 15700, 923, 13.5, 674, 98.4, 2.8, 74.3],
  [360, 143, 19.5, 13.0, 97.0, 19610, 1090, 14.2, 818, 114, 2.9, 94.2],
  [380, 149, 20.5, 13.7, 107, 24010, 1260, 15.0, 975, 131, 3.02, 115],
  [400, 155, 21.6, 14.4, 118, 29210, 1460, 15.7, 1160, 149, 3.13, 140],
  [425, 163, 23.0, 15.3, 132, 36970, 1740, 16.7, 1440, 176, 3.3, 177],
  [450, 170, 24.3, 16.2, 147, 45850, 2040, 17.7, 1730, 203, 3.43, 220],
  [475, 178, 25.6, 17.1, 163, 56480, 2380, 18.6, 2090, 235, 3.6, 270],
  [500, 185, 27.0, 18.0, 179, 68740, 2750, 19.6, 2480, 268, 3.72, 329],
  [550, 200, 30.0, 19.0, 212, 99180, 3610, 21.6, 3490, 349, 4.02, 472],
  [600, 215, 32.4, 21.6, 254, 139000, 4630, 23.4, 4670, 434, 4.3, 667],
];

const IPB_ROWS: Row[] = [
  [100, 100, 10, 6, 26, 450, 89.9, 4.16, 167, 33.5, 2.53, 7.24],
  [120, 120, 11, 6.5, 34, 864, 144, 5.04, 318, 52.9, 3.06, 11.5],
  [140, 140, 12, 7, 43, 1510, 216, 5.93, 550, 78.5, 3.58, 17.5],
  [160, 160, 13, 8, 54.3, 2490, 311, 6.77, 889, 111, 4.05, 25.7],
  [180, 180, 14, 8.5, 65.3, 3830, 426, 7.66, 1360, 151, 4.56, 36.0],
  [200, 200, 15, 9, 78.1, 5700, 570, 8.54, 2000, 200, 5.06, 49.1],
  [220, 220, 16, 9.5, 91.0, 8090, 736, 9.43, 2840, 258, 5.59, 65.4],
  [240, 240, 17, 10, 106, 11260, 938, 10.3, 3920, 327, 6.08, 85.5],
  [260, 260, 17.5, 10, 118, 14920, 1150, 11.2, 5130, 395, 6.59, 100],
  [280, 280, 18, 10.5, 131, 19270, 1380, 12.1, 6590, 471, 7.09, 118],
  [300, 300, 19, 11, 149, 25170, 1680, 13.0, 8560, 571, 7.58, 149],
  [320, 300, 20.5, 11.5, 161, 30820, 1930, 13.8, 9240, 616, 7.58, 186],
  [340, 300, 21.5, 12, 171, 36660, 2160, 14.6, 9690, 646, 7.53, 216],
  [360, 300, 22.5, 12.5, 181, 43190, 2400, 15.4, 10140, 676, 7.48, 248],
  [400, 300, 24, 13.5, 198, 57680, 2880, 17.1, 10820, 721, 7.39, 305],
  [450, 300, 26, 14, 218, 79890, 3550, 19.1, 11720, 781, 7.33, 388],
  [500, 300, 28, 14.5, 239, 107200, 4290, 21.2, 12620, 842, 7.27, 484],
  [550, 300, 29, 15, 254, 136700, 4970, 23.2, 13080, 872, 7.18, 543],
  [600, 300, 30, 15.5, 270, 171000, 5700, 25.2, 13530, 902, 7.08, 607],
  [650, 300, 31, 16, 286, 210600, 6480, 27.1, 13980, 932, 6.99, 676],
  [700, 300, 32, 17, 306, 256900, 7340, 29.0, 14440, 963, 6.87, 760],
  [800, 300, 33, 17.5, 334, 359100, 8980, 32.8, 14900, 994, 6.68, 850],
  [900, 300, 35, 18.5, 371, 494100, 10980, 36.5, 15820, 1050, 6.53, 1033],
  [1000, 300, 36, 19, 400, 644700, 12890, 40.1, 16280, 1090, 6.38, 1145],
];

// hw, r (r1) and, for the tapered-flange series, r2 — one entry per row, same order.
export type Geo = [number, number, number?];

// IPN: r1 = tw (the table's "tw=r1"); r2 is the toe radius.
const IPN_HW = [
  59, 75, 92, 109, 125, 142, 159, 176, 192, 208, 225, 241, 258, 274, 290, 306,
  323, 343, 363, 384, 404, 445, 485,
];
const IPN_R2 = [
  2.3, 2.7, 3.1, 3.4, 3.8, 4.1, 4.5, 4.9, 5.2, 5.6, 6.1, 6.5, 6.9, 7.3, 7.8,
  8.2, 8.6, 9.2, 9.7, 10.3, 10.8, 11.9, 13.0,
];
const IPN_GEO: Geo[] = IPN_HW.map((hw, i) => [hw, IPN_ROWS[i][3], IPN_R2[i]]);

// IPB: r = (h − 2tf − hw)/2 (the printed "tw=r1" column is tw; the fillet itself is the
// standard 12/15/18/21/24/27/30 mm of the parallel-flange series).
const IPB_HW = [
  56, 74, 92, 104, 122, 134, 152, 164, 177, 196, 208, 225, 243, 261, 298, 344,
  390, 438, 486, 534, 582, 674, 770, 868,
];
const IPB_R = [
  12, 12, 12, 15, 15, 18, 18, 21, 24, 24, 27, 27, 27, 27, 27, 27, 27, 27, 27,
  27, 27, 30, 30, 30,
];
const IPB_GEO: Geo[] = IPB_HW.map((hw, i) => [hw, IPB_R[i]]);

export function build(
  series: Profile["series"],
  rows: Row[],
  geo: Geo[],
): Profile[] {
  return rows.map(([h, bf, tf, tw, A, Ix, Sx, rx, Iy, Sy, ry, J], i) => ({
    name: `${series} ${h}`,
    series,
    h,
    bf,
    tf,
    tw,
    A,
    Ix,
    Sx,
    rx,
    Iy,
    Sy,
    ry,
    J,
    hw: geo[i][0],
    r: geo[i][1],
    ...(geo[i][2] !== undefined && { r2: geo[i][2] }),
  }));
}

export const IPN_PROFILES: Profile[] = build("IPN", IPN_ROWS, IPN_GEO);
export const IPB_PROFILES: Profile[] = build("IPB", IPB_ROWS, IPB_GEO);
export const PROFILES: Profile[] = [...IPN_PROFILES, ...IPB_PROFILES];

const BY_NAME = new Map(PROFILES.map((p) => [p.name, p]));
export const getProfile = (name: string | undefined): Profile | undefined =>
  name ? BY_NAME.get(name) : undefined;
