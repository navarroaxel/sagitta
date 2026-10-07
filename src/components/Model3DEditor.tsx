"use client";

import React, { useState } from "react";
import { FrameModel3D, FrameNode3D, Load3D, Material3D, Member3D, Support3D } from "@/lib/types3d";
import { SolveOutput3D } from "@/lib/solve3d";
import Results3DPanel from "@/components/Results3DPanel";
import { IPN_PROFILES, IPB_PROFILES } from "@/lib/profiles";
import { StressResult } from "@/lib/stress3d";
import { useLanguage } from "@/contexts/LanguageContext";

type Tab = "nodes" | "members" | "loads" | "material" | "results";
const SUPPORTS: Support3D[] = ["free", "pinned", "fixed"];

const uid = () => Math.random().toString(36).slice(2, 6);
const inputBaseCls =
  "rounded border border-stone-200 bg-white px-1 py-0.5 font-mono text-xs text-stone-800 dark:border-stone-600 dark:bg-stone-800 dark:text-stone-200";
const inputCls = `w-full ${inputBaseCls}`;
const selectCls =
  "rounded border border-stone-200 bg-white px-1 py-0.5 text-xs text-stone-800 dark:border-stone-600 dark:bg-stone-800 dark:text-stone-200";
const btnCls =
  "mt-2 rounded border border-stone-200 bg-stone-100 px-2 py-1 text-xs text-stone-700 hover:bg-stone-200 dark:border-stone-600 dark:bg-stone-800 dark:text-stone-300 dark:hover:bg-stone-700";

function Num({
  value,
  onChange,
  label,
}: {
  value: number;
  onChange: (v: number) => void;
  label: string;
}) {
  return (
    <input
      type="number"
      aria-label={label}
      value={value}
      step={0.1}
      className={inputCls}
      onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
    />
  );
}

const TAB_KEYS = {
  nodes: "editor.tab.nodes",
  members: "editor.tab.members",
  loads: "editor.tab.loads",
  material: "editor.tab.material",
  results: "editor.tab.results",
} as const;

export default function Model3DEditor({
  model,
  onChange,
  solved,
  stress = null,
}: {
  model: FrameModel3D;
  onChange: (m: FrameModel3D) => void;
  solved: SolveOutput3D | null;
  stress?: StressResult | null;
}) {
  const { t } = useLanguage();
  const [tab, setTab] = useState<Tab>("nodes");

  const setNode = (i: number, patch: Partial<FrameNode3D>) =>
    onChange({
      ...model,
      nodes: model.nodes.map((n, k) => (k === i ? { ...n, ...patch } : n)),
    });
  const setMember = (i: number, patch: Partial<Member3D>) =>
    onChange({
      ...model,
      members: model.members.map((m, k) => (k === i ? { ...m, ...patch } : m)),
    });
  const setLoad = (i: number, next: Load3D) =>
    onChange({ ...model, loads: model.loads.map((l, k) => (k === i ? next : l)) });
  const setMaterial = (patch: Partial<Material3D>) =>
    onChange({ ...model, material: { ...model.material, ...patch } });

  // removing a node drops the members and loads that reference it
  const removeNode = (id: string) => {
    const members = model.members.filter((m) => m.n1 !== id && m.n2 !== id);
    const ids = new Set(members.map((m) => m.id));
    onChange({
      ...model,
      nodes: model.nodes.filter((n) => n.id !== id),
      members,
      loads: model.loads.filter((l) =>
        l.type === "nodal" ? l.node !== id : ids.has(l.member),
      ),
    });
  };
  const removeMember = (id: string) =>
    onChange({
      ...model,
      members: model.members.filter((m) => m.id !== id),
      loads: model.loads.filter((l) => l.type === "nodal" || l.member !== id),
    });

  return (
    <div className="flex h-full flex-col text-sm text-stone-800 dark:text-stone-200">
      <div className="flex border-b border-stone-200 dark:border-stone-700">
        {(Object.keys(TAB_KEYS) as Tab[]).map((k) => (
          <button
            key={k}
            onClick={() => setTab(k)}
            className={`flex-1 px-1 py-2 text-xs font-medium capitalize ${
              tab === k
                ? "border-b-2 border-sky-600 text-sky-700 dark:text-sky-400"
                : "text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-200"
            }`}
          >
            {t(TAB_KEYS[k])}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-auto p-2">
        {tab === "nodes" && (
          <div>
            <div className="grid grid-cols-[2.5rem_1fr_1fr_1fr_4.5rem_1.2rem] gap-1 text-xs font-semibold text-stone-500">
              <span>{t("editor.nodes.id")}</span>
              <span>x</span>
              <span>y</span>
              <span>{t("f3d.nodes.z")}</span>
              <span>{t("editor.nodes.support")}</span>
              <span />
            </div>
            {model.nodes.map((n, i) => (
              <div
                key={n.id}
                className="mt-1 grid grid-cols-[2.5rem_1fr_1fr_1fr_4.5rem_1.2rem] items-center gap-1"
              >
                <span className="font-mono text-xs">{n.id}</span>
                <Num label={`${n.id} x`} value={n.x} onChange={(v) => setNode(i, { x: v })} />
                <Num label={`${n.id} y`} value={n.y} onChange={(v) => setNode(i, { y: v })} />
                <Num label={`${n.id} z`} value={n.z} onChange={(v) => setNode(i, { z: v })} />
                <select
                  aria-label={`${n.id} support`}
                  className={selectCls}
                  value={n.support}
                  onChange={(e) => setNode(i, { support: e.target.value as Support3D })}
                >
                  {SUPPORTS.map((s) => (
                    <option key={s} value={s}>
                      {t(`editor.nodes.support_${s}` as const)}
                    </option>
                  ))}
                </select>
                <button
                  aria-label={`remove ${n.id}`}
                  onClick={() => removeNode(n.id)}
                  className="text-stone-400 hover:text-red-600"
                >
                  ✕
                </button>
              </div>
            ))}
            <button
              className={btnCls}
              onClick={() =>
                onChange({
                  ...model,
                  nodes: [
                    ...model.nodes,
                    { id: `N${uid()}`, x: 0, y: 0, z: 0, support: "free" },
                  ],
                })
              }
            >
              {t("editor.nodes.add")}
            </button>
          </div>
        )}

        {tab === "members" && (
          <div>
            {model.members.map((m, i) => (
              <div key={m.id} className="mt-2 rounded border border-stone-200 p-1.5 dark:border-stone-700">
                <div className="grid grid-cols-[3rem_1fr_1fr_1.2rem] items-center gap-1">
                  <span className="font-mono text-xs">{m.id}</span>
                  {(["n1", "n2"] as const).map((end) => (
                    <select
                      key={end}
                      aria-label={`${m.id} ${end}`}
                      className={selectCls}
                      value={m[end]}
                      onChange={(e) => setMember(i, { [end]: e.target.value })}
                    >
                      {model.nodes.map((n) => (
                        <option key={n.id}>{n.id}</option>
                      ))}
                    </select>
                  ))}
                  <button
                    aria-label={`remove ${m.id}`}
                    onClick={() => removeMember(m.id)}
                    className="text-stone-400 hover:text-red-600"
                  >
                    ✕
                  </button>
                </div>
                <div className="mt-1 flex items-center gap-2 text-xs">
                  <span className="text-stone-500">{t("f3d.members.profile")}</span>
                  <select
                    aria-label={`${m.id} profile`}
                    className={`${selectCls} flex-1`}
                    value={m.profile ?? ""}
                    onChange={(e) => setMember(i, { profile: e.target.value || undefined })}
                  >
                    <option value="">{t("f3d.members.profile_none")}</option>
                    <optgroup label="IPN">
                      {IPN_PROFILES.map((p) => (
                        <option key={p.name}>{p.name}</option>
                      ))}
                    </optgroup>
                    <optgroup label="IPB">
                      {IPB_PROFILES.map((p) => (
                        <option key={p.name}>{p.name}</option>
                      ))}
                    </optgroup>
                  </select>
                  <label className="flex items-center gap-1" title={t("f3d.members.rotate_title")}>
                    <input
                      type="checkbox"
                      aria-label={`${m.id} rotated`}
                      checked={!!m.rotated}
                      disabled={!m.profile}
                      onChange={(e) => setMember(i, { rotated: e.target.checked })}
                    />
                    {t("f3d.members.rotate")}
                  </label>
                </div>
              </div>
            ))}
            <button
              className={btnCls}
              disabled={model.nodes.length < 2}
              onClick={() =>
                onChange({
                  ...model,
                  members: [
                    ...model.members,
                    { id: `M${uid()}`, n1: model.nodes[0].id, n2: model.nodes[1].id },
                  ],
                })
              }
            >
              {t("editor.members.add")}
            </button>
          </div>
        )}

        {tab === "loads" && (
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-xs">
              {t("editor.loads.force_unit")}
              <input
                className={`${inputBaseCls} w-16 shrink-0`}
                value={model.unit}
                onChange={(e) => onChange({ ...model, unit: e.target.value })}
              />
            </label>
            {model.loads.map((l, i) => {
              const comps: [string, number, (v: number) => void][] =
                l.type === "nodal"
                  ? (["fx", "fy", "fz", "mx", "my", "mz"] as const).map((k) => [
                      k,
                      l[k],
                      (v: number) => setLoad(i, { ...l, [k]: v }),
                    ])
                  : (["gx", "gy", "gz"] as const).map((k) => [
                      k,
                      l[k],
                      (v: number) => setLoad(i, { ...l, [k]: v }),
                    ]);
              return (
                <div
                  key={l.id}
                  className="rounded border border-stone-200 p-2 dark:border-stone-700"
                >
                  <div className="mb-1 flex items-center gap-2">
                    <span className="text-xs font-semibold">
                      {t(`editor.loads.type_${l.type}` as const)}
                    </span>
                    {l.type === "nodal" ? (
                      <select
                        aria-label={`${l.id} node`}
                        className={selectCls}
                        value={l.node}
                        onChange={(e) => setLoad(i, { ...l, node: e.target.value })}
                      >
                        {model.nodes.map((n) => (
                          <option key={n.id}>{n.id}</option>
                        ))}
                      </select>
                    ) : (
                      <select
                        aria-label={`${l.id} member`}
                        className={selectCls}
                        value={l.member}
                        onChange={(e) => setLoad(i, { ...l, member: e.target.value })}
                      >
                        {model.members.map((m) => (
                          <option key={m.id}>{m.id}</option>
                        ))}
                      </select>
                    )}
                    <button
                      className="ml-auto text-xs text-stone-400 hover:text-red-600"
                      onClick={() =>
                        onChange({ ...model, loads: model.loads.filter((x) => x.id !== l.id) })
                      }
                    >
                      {t("editor.loads.remove")}
                    </button>
                  </div>
                  {l.type === "mudl" &&
                    (() => {
                      const mem = model.members.find((x) => x.id === l.member);
                      const n1 = model.nodes.find((n) => n.id === mem?.n1);
                      const n2 = model.nodes.find((n) => n.id === mem?.n2);
                      const len = n1 && n2 ? Math.hypot(n2.x - n1.x, n2.y - n1.y, n2.z - n1.z) : 0;
                      return (
                        <div className="mb-1 grid grid-cols-2 gap-1">
                          <label className="flex items-center gap-1 text-xs">
                            {t("f3d.loads.from")}
                            <Num label={`${l.id} from`} value={l.from ?? 0} onChange={(v) => setLoad(i, { ...l, from: v })} />
                          </label>
                          <label className="flex items-center gap-1 text-xs">
                            {t("f3d.loads.to")}
                            <Num label={`${l.id} to`} value={l.to ?? Number(len.toFixed(4))} onChange={(v) => setLoad(i, { ...l, to: v })} />
                          </label>
                        </div>
                      );
                    })()}
                  {l.type === "mpoint" && (
                    <label className="mb-1 flex items-center gap-2 text-xs">
                      {t("editor.loads.dist")}
                      <Num label={`${l.id} dist`} value={l.dist} onChange={(v) => setLoad(i, { ...l, dist: v })} />
                    </label>
                  )}
                  <div className="grid grid-cols-3 gap-1">
                    {comps.map(([k, v, set]) => (
                      <label key={k} className="flex items-center gap-1 text-xs">
                        {k}
                        <Num label={`${l.id} ${k}`} value={v} onChange={set} />
                      </label>
                    ))}
                  </div>
                </div>
              );
            })}
            <div className="flex gap-2">
              <button
                className={btnCls}
                disabled={model.nodes.length === 0}
                onClick={() =>
                  onChange({
                    ...model,
                    loads: [
                      ...model.loads,
                      { id: `L${uid()}`, type: "nodal", node: model.nodes[0].id, fx: 0, fy: 0, fz: 0, mx: 0, my: 0, mz: 0 },
                    ],
                  })
                }
              >
                + {t("editor.loads.type_nodal")}
              </button>
              <button
                className={btnCls}
                disabled={model.members.length === 0}
                onClick={() =>
                  onChange({
                    ...model,
                    loads: [
                      ...model.loads,
                      { id: `L${uid()}`, type: "mudl", member: model.members[0].id, gx: 0, gy: 0, gz: 0 },
                    ],
                  })
                }
              >
                + {t("editor.loads.type_mudl")}
              </button>
              <button
                className={btnCls}
                disabled={model.members.length === 0}
                onClick={() =>
                  onChange({
                    ...model,
                    loads: [
                      ...model.loads,
                      { id: `L${uid()}`, type: "mpoint", member: model.members[0].id, dist: 0, gx: 0, gy: 0, gz: 0 },
                    ],
                  })
                }
              >
                + {t("editor.loads.type_mpoint")}
              </button>
            </div>
          </div>
        )}

        {tab === "material" && (
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-2">
              {(["E", "G", "A", "Ix", "Iy", "J"] as const).map((k) => (
                <label key={k} className="flex items-center gap-2 text-xs">
                  <span className="w-5 font-mono">{k}</span>
                  <input
                    type="number"
                    aria-label={`material ${k}`}
                    className={inputCls}
                    value={model.material[k]}
                    step="any"
                    onChange={(e) => setMaterial({ [k]: parseFloat(e.target.value) || 0 })}
                  />
                </label>
              ))}
            </div>
            <label className="flex items-center gap-2 text-xs">
              <span className="shrink-0 whitespace-nowrap">{t("f3d.material.sigma_adm")}</span>
              <input
                type="number"
                aria-label="sigma adm"
                className={`${inputBaseCls} w-20 shrink-0`}
                value={model.sigmaAdm}
                min={0}
                step={0.5}
                onChange={(e) => onChange({ ...model, sigmaAdm: parseFloat(e.target.value) || 0 })}
              />
            </label>
            <p className="text-xs text-stone-500 dark:text-stone-400">{t("f3d.material.note")}</p>
          </div>
        )}

        {tab === "results" && <Results3DPanel model={model} solved={solved} stress={stress} />}
      </div>
    </div>
  );
}
