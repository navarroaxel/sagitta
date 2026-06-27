"use client";

import React, { useState } from "react";
import {
  FrameModel,
  FrameNode,
  Member,
  Load,
  Support,
  Material,
} from "@/lib/types";
import { SolveOutput } from "@/lib/solve";
import ResultsPanel from "@/components/ResultsPanel";
import { useLanguage } from "@/contexts/LanguageContext";

interface Props {
  model: FrameModel;
  onChange: (model: FrameModel) => void;
  solved?: SolveOutput | null;
  highlightedLoadId?: string | null;
  onHighlightLoad?: (id: string | null) => void;
}

type Tab = "nodes" | "members" | "loads" | "material" | "results";

const SUPPORTS: Support[] = ["free", "pinned", "fixed", "roller-v", "roller-h"];

function uid() {
  return Math.random().toString(36).slice(2, 8);
}

function Cell({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <td className={`px-2 py-1 ${className}`}>{children}</td>;
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th className="bg-stone-50 px-2 py-1 text-left text-xs font-semibold text-stone-500 dark:bg-stone-800 dark:text-stone-400">
      {children}
    </th>
  );
}

function NumInput({
  value,
  onChange,
  min,
  step = 0.01,
  className = "",
}: {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  step?: number;
  className?: string;
}) {
  return (
    <input
      type="number"
      value={value}
      step={step}
      min={min}
      className={`w-full rounded border border-stone-200 bg-white px-1 py-0.5 font-mono text-xs text-stone-800 dark:border-stone-600 dark:bg-stone-800 dark:text-stone-200 ${className}`}
      onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
    />
  );
}

const selectCls =
  "text-xs border border-stone-200 dark:border-stone-600 rounded px-1 py-0.5 bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-200";
const addBtnCls =
  "mt-2 px-2 py-1 text-xs bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 rounded border border-stone-200 dark:border-stone-600 text-stone-700 dark:text-stone-300";
const idInputCls =
  "font-mono border border-stone-200 dark:border-stone-600 rounded px-1 py-0.5 text-xs bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-200";

export default function ModelEditor({
  model,
  onChange,
  solved,
  highlightedLoadId,
  onHighlightLoad,
}: Props) {
  const { t } = useLanguage();
  const [tab, setTab] = useState<Tab>("nodes");

  const setNodes = (nodes: FrameNode[]) => onChange({ ...model, nodes });
  const setMembers = (members: Member[]) => onChange({ ...model, members });
  const setLoads = (loads: Load[]) => onChange({ ...model, loads });
  const setMaterial = (material: Material) => onChange({ ...model, material });

  const TAB_KEYS: Record<
    Tab,
    | "editor.tab.nodes"
    | "editor.tab.members"
    | "editor.tab.loads"
    | "editor.tab.material"
    | "editor.tab.results"
  > = {
    nodes: "editor.tab.nodes",
    members: "editor.tab.members",
    loads: "editor.tab.loads",
    material: "editor.tab.material",
    results: "editor.tab.results",
  };

  return (
    <div className="flex h-full flex-col text-sm text-stone-800 dark:text-stone-200">
      {/* Tab bar */}
      <div className="flex border-b border-stone-200 dark:border-stone-700">
        {(["nodes", "members", "loads", "material", "results"] as Tab[]).map(
          (tabKey) => (
          <button
            key={tabKey}
            onClick={() => setTab(tabKey)}
            className={`px-3 py-2 text-xs font-medium capitalize transition-colors ${
              tab === tabKey
                ? "border-b-2 border-stone-700 text-stone-900 dark:border-stone-300 dark:text-stone-100"
                : "text-stone-500 hover:text-stone-700 dark:text-stone-400 dark:hover:text-stone-200"
            }`}
          >
            {t(TAB_KEYS[tabKey])}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-auto p-2">
        {tab === "nodes" && (
          <NodesPanel nodes={model.nodes} onChange={setNodes} />
        )}
        {tab === "members" && (
          <MembersPanel
            members={model.members}
            nodes={model.nodes}
            onChange={setMembers}
          />
        )}
        {tab === "loads" && (
          <LoadsPanel
            loads={model.loads}
            nodes={model.nodes}
            members={model.members}
            onChange={setLoads}
            unit={model.unit}
            onUnitChange={(u) => onChange({ ...model, unit: u })}
            highlightedLoadId={highlightedLoadId}
            onHighlightLoad={onHighlightLoad}
          />
        )}
        {tab === "material" && (
          <MaterialPanel material={model.material} onChange={setMaterial} />
        )}
        {tab === "results" && (
          <ResultsPanel model={model} solved={solved ?? null} />
        )}
      </div>
    </div>
  );
}

// ─── Nodes panel ─────────────────────────────────────────────────────────────
function NodesPanel({
  nodes,
  onChange,
}: {
  nodes: FrameNode[];
  onChange: (n: FrameNode[]) => void;
}) {
  const { t } = useLanguage();
  const update = (i: number, patch: Partial<FrameNode>) =>
    onChange(nodes.map((n, idx) => (idx === i ? { ...n, ...patch } : n)));
  const remove = (i: number) => onChange(nodes.filter((_, idx) => idx !== i));
  const add = () =>
    onChange([...nodes, { id: uid(), x: 0, y: 0, support: "free" }]);

  return (
    <div>
      <table className="w-full border-collapse text-xs">
        <thead>
          <tr>
            <Th>{t("editor.nodes.id")}</Th>
            <Th>{t("editor.nodes.x")}</Th>
            <Th>{t("editor.nodes.y")}</Th>
            <Th>{t("editor.nodes.support")}</Th>
            <th />
          </tr>
        </thead>
        <tbody>
          {nodes.map((n, i) => (
            <tr
              key={n.id}
              className="border-t border-stone-100 dark:border-stone-700"
            >
              <Cell>
                <input
                  value={n.id}
                  className={`w-12 ${idInputCls}`}
                  onChange={(e) => update(i, { id: e.target.value })}
                />
              </Cell>
              <Cell>
                <NumInput
                  value={n.x}
                  onChange={(v) => update(i, { x: v })}
                  step={0.25}
                />
              </Cell>
              <Cell>
                <NumInput
                  value={n.y}
                  onChange={(v) => update(i, { y: v })}
                  step={0.25}
                />
              </Cell>
              <Cell>
                <select
                  value={n.support}
                  className={selectCls}
                  onChange={(e) =>
                    update(i, { support: e.target.value as Support })
                  }
                >
                  {SUPPORTS.map((s) => (
                    <option key={s} value={s}>
                      {t(
                        `editor.nodes.support_${s.replace("-", "_")}` as Parameters<
                          typeof t
                        >[0],
                      )}
                    </option>
                  ))}
                </select>
              </Cell>
              <Cell>
                <button
                  onClick={() => remove(i)}
                  className="font-mono text-red-400 hover:text-red-600"
                >
                  ✕
                </button>
              </Cell>
            </tr>
          ))}
        </tbody>
      </table>
      <button onClick={add} className={addBtnCls}>
        {t("editor.nodes.add")}
      </button>
    </div>
  );
}

// ─── Members panel ───────────────────────────────────────────────────────────
function MembersPanel({
  members,
  nodes,
  onChange,
}: {
  members: Member[];
  nodes: FrameNode[];
  onChange: (m: Member[]) => void;
}) {
  const { t } = useLanguage();
  const nodeIds = nodes.map((n) => n.id);
  const update = (i: number, patch: Partial<Member>) =>
    onChange(members.map((m, idx) => (idx === i ? { ...m, ...patch } : m)));
  const remove = (i: number) => onChange(members.filter((_, idx) => idx !== i));
  const add = () => {
    const [n1 = "", n2 = ""] = nodeIds;
    onChange([...members, { id: uid(), n1, n2 }]);
  };

  return (
    <div>
      <table className="w-full border-collapse text-xs">
        <thead>
          <tr>
            <Th>{t("editor.members.id")}</Th>
            <Th>{t("editor.members.from")}</Th>
            <Th>{t("editor.members.to")}</Th>
            <Th>{t("editor.members.hinge_i")}</Th>
            <Th>{t("editor.members.hinge_j")}</Th>
            <th />
          </tr>
        </thead>
        <tbody>
          {members.map((m, i) => (
            <tr
              key={m.id}
              className="border-t border-stone-100 dark:border-stone-700"
            >
              <Cell>
                <input
                  value={m.id}
                  className={`w-14 ${idInputCls}`}
                  onChange={(e) => update(i, { id: e.target.value })}
                />
              </Cell>
              <Cell>
                <select
                  value={m.n1}
                  className={selectCls}
                  onChange={(e) => update(i, { n1: e.target.value })}
                >
                  {nodeIds.map((id) => (
                    <option key={id} value={id}>
                      {id}
                    </option>
                  ))}
                </select>
              </Cell>
              <Cell>
                <select
                  value={m.n2}
                  className={selectCls}
                  onChange={(e) => update(i, { n2: e.target.value })}
                >
                  {nodeIds.map((id) => (
                    <option key={id} value={id}>
                      {id}
                    </option>
                  ))}
                </select>
              </Cell>
              <Cell className="text-center">
                <input
                  type="checkbox"
                  checked={!!m.relI}
                  onChange={(e) => update(i, { relI: e.target.checked })}
                />
              </Cell>
              <Cell className="text-center">
                <input
                  type="checkbox"
                  checked={!!m.relJ}
                  onChange={(e) => update(i, { relJ: e.target.checked })}
                />
              </Cell>
              <Cell>
                <button
                  onClick={() => remove(i)}
                  className="font-mono text-red-400 hover:text-red-600"
                >
                  ✕
                </button>
              </Cell>
            </tr>
          ))}
        </tbody>
      </table>
      <button onClick={add} className={addBtnCls}>
        {t("editor.members.add")}
      </button>
    </div>
  );
}

// ─── Loads panel ─────────────────────────────────────────────────────────────
function LoadsPanel({
  loads,
  nodes,
  members,
  onChange,
  unit,
  onUnitChange,
  highlightedLoadId,
  onHighlightLoad,
}: {
  loads: Load[];
  nodes: FrameNode[];
  members: Member[];
  onChange: (l: Load[]) => void;
  unit: string;
  onUnitChange: (u: string) => void;
  highlightedLoadId?: string | null;
  onHighlightLoad?: (id: string | null) => void;
}) {
  const { t } = useLanguage();
  const nodeIds = nodes.map((n) => n.id);
  const memberIds = members.map((m) => m.id);

  const update = (i: number, patch: Partial<Load>) =>
    onChange(
      loads.map((l, idx) => (idx === i ? ({ ...l, ...patch } as Load) : l)),
    );
  const remove = (i: number) => {
    if (loads[i]?.id === highlightedLoadId) onHighlightLoad?.(null);
    onChange(loads.filter((_, idx) => idx !== i));
  };
  const add = () => {
    const node = nodeIds[0] ?? "";
    onChange([
      ...loads,
      { id: uid(), type: "nodal", node, fx: 0, fy: -10, m: 0 },
    ]);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <span className="text-xs text-stone-500 dark:text-stone-400">
          {t("editor.loads.force_unit")}
        </span>
        <input
          value={unit}
          onChange={(e) => onUnitChange(e.target.value)}
          className={`w-16 ${idInputCls}`}
        />
      </div>

      {loads.map((load, i) => {
        const isHL = load.id === highlightedLoadId;
        return (
          <div
            key={load.id}
            onClick={() => onHighlightLoad?.(isHL ? null : load.id)}
            className={`cursor-pointer space-y-1 rounded p-2 transition-colors ${
              isHL
                ? "border-2 border-orange-500 bg-orange-50 dark:border-orange-400 dark:bg-orange-950"
                : "border border-stone-200 bg-stone-50 hover:border-stone-400 dark:border-stone-700 dark:bg-stone-800 dark:hover:border-stone-500"
            }`}
          >
            <div className="flex items-center justify-between">
              <select
                value={load.type}
                className={selectCls}
                onChange={(e) => {
                  const tp = e.target.value as Load["type"];
                  if (tp === "nodal")
                    update(i, {
                      type: "nodal",
                      node: nodeIds[0] ?? "",
                      fx: 0,
                      fy: -10,
                      m: 0,
                    } as Partial<Load>);
                  else if (tp === "mpoint")
                    update(i, {
                      type: "mpoint",
                      member: memberIds[0] ?? "",
                      dist: 0,
                      gx: 0,
                      gy: -10,
                    } as Partial<Load>);
                  else
                    update(i, {
                      type: "mudl",
                      member: memberIds[0] ?? "",
                      gx: 0,
                      gy: -10,
                    } as Partial<Load>);
                }}
              >
                <option value="nodal">{t("editor.loads.type_nodal")}</option>
                <option value="mpoint">{t("editor.loads.type_mpoint")}</option>
                <option value="mudl">{t("editor.loads.type_mudl")}</option>
              </select>
              <button
                onClick={() => remove(i)}
                className="text-xs text-red-400 hover:text-red-600 dark:text-red-500 dark:hover:text-red-400"
              >
                {t("editor.loads.remove")}
              </button>
            </div>

            {load.type === "nodal" && (
              <div className="grid grid-cols-2 gap-1">
                <div>
                  <span className="text-xs text-stone-400 dark:text-stone-500">
                    {t("editor.loads.node")}
                  </span>
                  <select
                    value={load.node}
                    className={`w-full ${selectCls}`}
                    onChange={(e) =>
                      update(i, { node: e.target.value } as Partial<Load>)
                    }
                  >
                    {nodeIds.map((id) => (
                      <option key={id} value={id}>
                        {id}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <span className="text-xs text-stone-400 dark:text-stone-500">
                    {t("editor.loads.fx")}
                  </span>
                  <NumInput
                    value={load.fx}
                    onChange={(v) => update(i, { fx: v } as Partial<Load>)}
                  />
                </div>
                <div>
                  <span className="text-xs text-stone-400 dark:text-stone-500">
                    {t("editor.loads.fy")}
                  </span>
                  <NumInput
                    value={load.fy}
                    onChange={(v) => update(i, { fy: v } as Partial<Load>)}
                  />
                </div>
                <div>
                  <span className="text-xs text-stone-400 dark:text-stone-500">
                    {t("editor.loads.moment")}
                  </span>
                  <NumInput
                    value={load.m}
                    onChange={(v) => update(i, { m: v } as Partial<Load>)}
                  />
                </div>
              </div>
            )}

            {load.type === "mpoint" && (
              <div className="grid grid-cols-2 gap-1">
                <div>
                  <span className="text-xs text-stone-400 dark:text-stone-500">
                    {t("editor.loads.member")}
                  </span>
                  <select
                    value={load.member}
                    className={`w-full ${selectCls}`}
                    onChange={(e) =>
                      update(i, { member: e.target.value } as Partial<Load>)
                    }
                  >
                    {memberIds.map((id) => (
                      <option key={id} value={id}>
                        {id}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <span className="text-xs text-stone-400 dark:text-stone-500">
                    {t("editor.loads.dist")}
                  </span>
                  <NumInput
                    value={load.dist}
                    onChange={(v) => update(i, { dist: v } as Partial<Load>)}
                    min={0}
                  />
                </div>
                <div>
                  <span className="text-xs text-stone-400 dark:text-stone-500">
                    {t("editor.loads.gx")}
                  </span>
                  <NumInput
                    value={load.gx}
                    onChange={(v) => update(i, { gx: v } as Partial<Load>)}
                  />
                </div>
                <div>
                  <span className="text-xs text-stone-400 dark:text-stone-500">
                    {t("editor.loads.gy")}
                  </span>
                  <NumInput
                    value={load.gy}
                    onChange={(v) => update(i, { gy: v } as Partial<Load>)}
                  />
                </div>
              </div>
            )}

            {load.type === "mudl" && (
              <div className="grid grid-cols-2 gap-1">
                <div>
                  <span className="text-xs text-stone-400 dark:text-stone-500">
                    {t("editor.loads.member")}
                  </span>
                  <select
                    value={load.member}
                    className={`w-full ${selectCls}`}
                    onChange={(e) =>
                      update(i, { member: e.target.value } as Partial<Load>)
                    }
                  >
                    {memberIds.map((id) => (
                      <option key={id} value={id}>
                        {id}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <span className="text-xs text-stone-400 dark:text-stone-500">
                    {t("editor.loads.gx")}
                  </span>
                  <NumInput
                    value={load.gx}
                    onChange={(v) => update(i, { gx: v } as Partial<Load>)}
                  />
                </div>
                <div>
                  <span className="text-xs text-stone-400 dark:text-stone-500">
                    {t("editor.loads.gy")}
                  </span>
                  <NumInput
                    value={load.gy}
                    onChange={(v) => update(i, { gy: v } as Partial<Load>)}
                  />
                </div>
              </div>
            )}
          </div>
        );
      })}

      <button
        onClick={add}
        className="rounded border border-stone-200 bg-stone-100 px-2 py-1 text-xs text-stone-700 hover:bg-stone-200 dark:border-stone-600 dark:bg-stone-800 dark:text-stone-300 dark:hover:bg-stone-700"
      >
        {t("editor.loads.add")}
      </button>
    </div>
  );
}

// ─── Material panel ──────────────────────────────────────────────────────────
function MaterialPanel({
  material,
  onChange,
}: {
  material: Material;
  onChange: (m: Material) => void;
}) {
  const { t } = useLanguage();
  return (
    <div className="space-y-3">
      <p className="text-xs text-stone-400 italic dark:text-stone-500">
        {t("editor.material.note")}
      </p>
      {(["E", "A", "I"] as const).map((k) => (
        <div key={k}>
          <label className="font-mono text-xs text-stone-500 dark:text-stone-400">
            {k}
          </label>
          <NumInput
            value={material[k]}
            step={k === "E" ? 1e6 : 0.001}
            min={1e-12}
            onChange={(v) => onChange({ ...material, [k]: Math.max(v, 1e-12) })}
          />
        </div>
      ))}
    </div>
  );
}
