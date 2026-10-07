import { filterProfiles } from "../profileSearch";

const base = { text: "", series: "all" as const };

describe("filterProfiles", () => {
  test("no filter returns every profile", () => {
    expect(filterProfiles(base).length).toBeGreaterThan(40);
  });
  test("number matches both series", () => {
    const names = filterProfiles({ ...base, text: "200" }).map((p) => p.name);
    expect(names).toEqual(expect.arrayContaining(["IPN 200", "IPB 200"]));
  });
  test("series + number, with or without space", () => {
    expect(
      filterProfiles({ ...base, text: "ipb 300" }).map((p) => p.name),
    ).toEqual(["IPB 300"]);
    expect(
      filterProfiles({ ...base, text: "IPB300" }).map((p) => p.name),
    ).toEqual(["IPB 300"]);
  });
  test("a series typed in full means that series; a prefix matches several", () => {
    expect(
      filterProfiles({ ...base, text: "ipb" }).every((p) => p.series === "IPB"),
    ).toBe(true);
    expect(
      filterProfiles({ ...base, text: "ipbl 300" }).map((p) => p.name),
    ).toEqual(["IPBl 300"]);
    const prefix = new Set(
      filterProfiles({ ...base, text: "ip" }).map((p) => p.series),
    );
    expect(prefix).toEqual(new Set(["IPN", "IPB", "IPE", "IPBl", "IPBv"]));
  });
  test("IPN and IPB come first by default", () => {
    const all = filterProfiles(base);
    expect(all[0].series).toBe("IPN");
    expect(all.findIndex((p) => p.series === "IPE")).toBeGreaterThan(
      all.findLastIndex((p) => p.series === "IPB"),
    );
  });
  test("series filter", () => {
    expect(
      filterProfiles({ ...base, series: "IPN" }).every(
        (p) => p.series === "IPN",
      ),
    ).toBe(true);
  });
  test("minimums and sort by area give the lightest valid profile first", () => {
    const r = filterProfiles({
      ...base,
      minIx: 5000,
      sortKey: "A",
      sortDir: "asc",
    });
    expect(r.every((p) => p.Ix >= 5000)).toBe(true);
    expect(r[0].A).toBeLessThanOrEqual(r[r.length - 1].A);
  });
});
