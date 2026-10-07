import { PROFILES, type Profile } from "./profiles";
import {
  IPBL_PROFILES,
  IPBV_PROFILES,
  IPE_PROFILES,
  UPN_PROFILES,
} from "./profilesExtra";

// IPN and IPB first (the ones used most), then the rest of the series.
export const ALL_PROFILES: Profile[] = [
  ...PROFILES,
  ...IPE_PROFILES,
  ...IPBL_PROFILES,
  ...IPBV_PROFILES,
  ...UPN_PROFILES,
];
export const SERIES: Profile["series"][] = [
  "IPN",
  "IPB",
  "IPE",
  "IPBl",
  "IPBv",
  "UPN",
];

export type SortKey = Exclude<keyof Profile, "name" | "series" | "r2">;
export type SeriesFilter = "all" | Profile["series"];

export interface ProfileQuery {
  text: string;
  series: SeriesFilter;
  minIx?: number;
  minSx?: number;
  minA?: number;
  sortKey?: SortKey;
  sortDir?: "asc" | "desc";
}

// "ipb 300", "300", "ipn" and "IPB300" all work. Text is split into a series part (letters)
// and a number part; a series typed in full ("ipb") means exactly that series, while a
// shorter prefix ("ip") matches every series that starts with it.
export function filterProfiles(
  q: ProfileQuery,
  all: Profile[] = ALL_PROFILES,
): Profile[] {
  const tokens = q.text.toLowerCase().match(/[a-z]+|[\d/.,]+/g) ?? [];
  const exact = new Set(all.map((p) => p.series.toLowerCase()));
  const out = all.filter((p) => {
    if (q.series !== "all" && p.series !== q.series) return false;
    const series = p.series.toLowerCase();
    const designation = p.name.slice(p.series.length + 1).toLowerCase();
    const ok = tokens.every((tk) =>
      /^[a-z]/.test(tk)
        ? exact.has(tk)
          ? series === tk
          : series.startsWith(tk)
        : designation.includes(tk),
    );
    if (!ok) return false;
    if (q.minIx !== undefined && p.Ix < q.minIx) return false;
    if (q.minSx !== undefined && p.Sx < q.minSx) return false;
    if (q.minA !== undefined && p.A < q.minA) return false;
    return true;
  });
  if (q.sortKey) {
    const k = q.sortKey;
    const dir = q.sortDir === "desc" ? -1 : 1;
    out.sort((a, b) => (a[k] - b[k]) * dir);
  }
  return out;
}
