'use client';

import React, { useState } from 'react';
import { FrameModel, FrameNode, Member, Load, Support, Material } from '@/lib/types';

interface Props {
  model: FrameModel;
  onChange: (model: FrameModel) => void;
}

type Tab = 'nodes' | 'members' | 'loads' | 'material';

const SUPPORTS: Support[] = ['free', 'pinned', 'fixed', 'roller-v', 'roller-h'];

function uid() {
  return Math.random().toString(36).slice(2, 8);
}

function Cell({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <td className={`px-2 py-1 ${className}`}>{children}</td>;
}

function Th({ children }: { children: React.ReactNode }) {
  return <th className="px-2 py-1 text-left text-xs font-semibold text-stone-500 bg-stone-50">{children}</th>;
}

function NumInput({ value, onChange, min, step = 0.01, className = '' }: {
  value: number; onChange: (v: number) => void; min?: number; step?: number; className?: string;
}) {
  return (
    <input type="number" value={value} step={step} min={min}
      className={`w-full text-xs font-mono border border-stone-200 rounded px-1 py-0.5 ${className}`}
      onChange={(e) => onChange(parseFloat(e.target.value) || 0)} />
  );
}

export default function ModelEditor({ model, onChange }: Props) {
  const [tab, setTab] = useState<Tab>('nodes');

  const setNodes = (nodes: FrameNode[]) => onChange({ ...model, nodes });
  const setMembers = (members: Member[]) => onChange({ ...model, members });
  const setLoads = (loads: Load[]) => onChange({ ...model, loads });
  const setMaterial = (material: Material) => onChange({ ...model, material });

  return (
    <div className="flex flex-col h-full text-sm text-stone-800">
      {/* Tab bar */}
      <div className="flex border-b border-stone-200">
        {(['nodes', 'members', 'loads', 'material'] as Tab[]).map((t) => (
          <button key={t}
            onClick={() => setTab(t)}
            className={`px-3 py-2 text-xs font-medium capitalize transition-colors ${
              tab === t
                ? 'border-b-2 border-stone-700 text-stone-900'
                : 'text-stone-500 hover:text-stone-700'
            }`}>
            {t}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-auto p-2">
        {tab === 'nodes' && (
          <NodesPanel nodes={model.nodes} onChange={setNodes} />
        )}
        {tab === 'members' && (
          <MembersPanel members={model.members} nodes={model.nodes} onChange={setMembers} />
        )}
        {tab === 'loads' && (
          <LoadsPanel loads={model.loads} nodes={model.nodes} members={model.members} onChange={setLoads} unit={model.unit}
            onUnitChange={(u) => onChange({ ...model, unit: u })} />
        )}
        {tab === 'material' && (
          <MaterialPanel material={model.material} onChange={setMaterial} />
        )}
      </div>
    </div>
  );
}

// ─── Nodes panel ─────────────────────────────────────────────────────────────
function NodesPanel({ nodes, onChange }: { nodes: FrameNode[]; onChange: (n: FrameNode[]) => void }) {
  const update = (i: number, patch: Partial<FrameNode>) =>
    onChange(nodes.map((n, idx) => idx === i ? { ...n, ...patch } : n));
  const remove = (i: number) => onChange(nodes.filter((_, idx) => idx !== i));
  const add = () => onChange([...nodes, { id: uid(), x: 0, y: 0, support: 'free' }]);

  return (
    <div>
      <table className="w-full border-collapse text-xs">
        <thead>
          <tr>
            <Th>ID</Th><Th>x</Th><Th>y</Th><Th>Support</Th><th />
          </tr>
        </thead>
        <tbody>
          {nodes.map((n, i) => (
            <tr key={n.id} className="border-t border-stone-100">
              <Cell>
                <input value={n.id} className="w-12 font-mono border border-stone-200 rounded px-1 py-0.5 text-xs"
                  onChange={(e) => update(i, { id: e.target.value })} />
              </Cell>
              <Cell>
                <NumInput value={n.x} onChange={(v) => update(i, { x: v })} step={0.25} />
              </Cell>
              <Cell>
                <NumInput value={n.y} onChange={(v) => update(i, { y: v })} step={0.25} />
              </Cell>
              <Cell>
                <select value={n.support}
                  className="text-xs border border-stone-200 rounded px-1 py-0.5"
                  onChange={(e) => update(i, { support: e.target.value as Support })}>
                  {SUPPORTS.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </Cell>
              <Cell>
                <button onClick={() => remove(i)}
                  className="text-red-400 hover:text-red-600 font-mono">✕</button>
              </Cell>
            </tr>
          ))}
        </tbody>
      </table>
      <button onClick={add}
        className="mt-2 px-2 py-1 text-xs bg-stone-100 hover:bg-stone-200 rounded border border-stone-200">
        + Add node
      </button>
    </div>
  );
}

// ─── Members panel ───────────────────────────────────────────────────────────
function MembersPanel({ members, nodes, onChange }: {
  members: Member[]; nodes: FrameNode[]; onChange: (m: Member[]) => void;
}) {
  const nodeIds = nodes.map((n) => n.id);
  const update = (i: number, patch: Partial<Member>) =>
    onChange(members.map((m, idx) => idx === i ? { ...m, ...patch } : m));
  const remove = (i: number) => onChange(members.filter((_, idx) => idx !== i));
  const add = () => {
    const [n1 = '', n2 = ''] = nodeIds;
    onChange([...members, { id: uid(), n1, n2 }]);
  };

  return (
    <div>
      <table className="w-full border-collapse text-xs">
        <thead>
          <tr>
            <Th>ID</Th><Th>From</Th><Th>To</Th><Th>Hinge i</Th><Th>Hinge j</Th><th />
          </tr>
        </thead>
        <tbody>
          {members.map((m, i) => (
            <tr key={m.id} className="border-t border-stone-100">
              <Cell>
                <input value={m.id} className="w-14 font-mono border border-stone-200 rounded px-1 py-0.5 text-xs"
                  onChange={(e) => update(i, { id: e.target.value })} />
              </Cell>
              <Cell>
                <select value={m.n1}
                  className="text-xs border border-stone-200 rounded px-1 py-0.5"
                  onChange={(e) => update(i, { n1: e.target.value })}>
                  {nodeIds.map((id) => <option key={id} value={id}>{id}</option>)}
                </select>
              </Cell>
              <Cell>
                <select value={m.n2}
                  className="text-xs border border-stone-200 rounded px-1 py-0.5"
                  onChange={(e) => update(i, { n2: e.target.value })}>
                  {nodeIds.map((id) => <option key={id} value={id}>{id}</option>)}
                </select>
              </Cell>
              <Cell className="text-center">
                <input type="checkbox" checked={!!m.relI}
                  onChange={(e) => update(i, { relI: e.target.checked })} />
              </Cell>
              <Cell className="text-center">
                <input type="checkbox" checked={!!m.relJ}
                  onChange={(e) => update(i, { relJ: e.target.checked })} />
              </Cell>
              <Cell>
                <button onClick={() => remove(i)}
                  className="text-red-400 hover:text-red-600 font-mono">✕</button>
              </Cell>
            </tr>
          ))}
        </tbody>
      </table>
      <button onClick={add}
        className="mt-2 px-2 py-1 text-xs bg-stone-100 hover:bg-stone-200 rounded border border-stone-200">
        + Add member
      </button>
    </div>
  );
}

// ─── Loads panel ─────────────────────────────────────────────────────────────
function LoadsPanel({ loads, nodes, members, onChange, unit, onUnitChange }: {
  loads: Load[]; nodes: FrameNode[]; members: Member[];
  onChange: (l: Load[]) => void;
  unit: string; onUnitChange: (u: string) => void;
}) {
  const nodeIds = nodes.map((n) => n.id);
  const memberIds = members.map((m) => m.id);

  const update = (i: number, patch: Partial<Load>) =>
    onChange(loads.map((l, idx) => idx === i ? { ...l, ...patch } as Load : l));
  const remove = (i: number) => onChange(loads.filter((_, idx) => idx !== i));
  const add = () => {
    const node = nodeIds[0] ?? '';
    onChange([...loads, { id: uid(), type: 'nodal', node, fx: 0, fy: -10, m: 0 }]);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <span className="text-xs text-stone-500">Force unit:</span>
        <input value={unit} onChange={(e) => onUnitChange(e.target.value)}
          className="w-16 border border-stone-200 rounded px-1 py-0.5 text-xs font-mono" />
      </div>

      {loads.map((load, i) => (
        <div key={load.id} className="bg-stone-50 border border-stone-200 rounded p-2 space-y-1">
          <div className="flex items-center justify-between">
            <select value={load.type}
              className="text-xs border border-stone-200 rounded px-1 py-0.5"
              onChange={(e) => {
                const t = e.target.value as Load['type'];
                if (t === 'nodal') update(i, { type: 'nodal', node: nodeIds[0] ?? '', fx: 0, fy: -10, m: 0 } as Partial<Load>);
                else if (t === 'mpoint') update(i, { type: 'mpoint', member: memberIds[0] ?? '', dist: 0, gx: 0, gy: -10 } as Partial<Load>);
                else update(i, { type: 'mudl', member: memberIds[0] ?? '', gx: 0, gy: -10 } as Partial<Load>);
              }}>
              <option value="nodal">Nodal</option>
              <option value="mpoint">Member point</option>
              <option value="mudl">Member UDL</option>
            </select>
            <button onClick={() => remove(i)}
              className="text-red-400 hover:text-red-600 text-xs">✕ remove</button>
          </div>

          {load.type === 'nodal' && (
            <div className="grid grid-cols-2 gap-1">
              <div>
                <span className="text-xs text-stone-400">Node</span>
                <select value={load.node}
                  className="w-full text-xs border border-stone-200 rounded px-1 py-0.5"
                  onChange={(e) => update(i, { node: e.target.value } as Partial<Load>)}>
                  {nodeIds.map((id) => <option key={id} value={id}>{id}</option>)}
                </select>
              </div>
              <div>
                <span className="text-xs text-stone-400">fx</span>
                <NumInput value={load.fx} onChange={(v) => update(i, { fx: v } as Partial<Load>)} />
              </div>
              <div>
                <span className="text-xs text-stone-400">fy</span>
                <NumInput value={load.fy} onChange={(v) => update(i, { fy: v } as Partial<Load>)} />
              </div>
              <div>
                <span className="text-xs text-stone-400">m (moment)</span>
                <NumInput value={load.m} onChange={(v) => update(i, { m: v } as Partial<Load>)} />
              </div>
            </div>
          )}

          {load.type === 'mpoint' && (
            <div className="grid grid-cols-2 gap-1">
              <div>
                <span className="text-xs text-stone-400">Member</span>
                <select value={load.member}
                  className="w-full text-xs border border-stone-200 rounded px-1 py-0.5"
                  onChange={(e) => update(i, { member: e.target.value } as Partial<Load>)}>
                  {memberIds.map((id) => <option key={id} value={id}>{id}</option>)}
                </select>
              </div>
              <div>
                <span className="text-xs text-stone-400">dist (from n1)</span>
                <NumInput value={load.dist} onChange={(v) => update(i, { dist: v } as Partial<Load>)} min={0} />
              </div>
              <div>
                <span className="text-xs text-stone-400">gx (global)</span>
                <NumInput value={load.gx} onChange={(v) => update(i, { gx: v } as Partial<Load>)} />
              </div>
              <div>
                <span className="text-xs text-stone-400">gy (global)</span>
                <NumInput value={load.gy} onChange={(v) => update(i, { gy: v } as Partial<Load>)} />
              </div>
            </div>
          )}

          {load.type === 'mudl' && (
            <div className="grid grid-cols-2 gap-1">
              <div>
                <span className="text-xs text-stone-400">Member</span>
                <select value={load.member}
                  className="w-full text-xs border border-stone-200 rounded px-1 py-0.5"
                  onChange={(e) => update(i, { member: e.target.value } as Partial<Load>)}>
                  {memberIds.map((id) => <option key={id} value={id}>{id}</option>)}
                </select>
              </div>
              <div>
                <span className="text-xs text-stone-400">gx (global)</span>
                <NumInput value={load.gx} onChange={(v) => update(i, { gx: v } as Partial<Load>)} />
              </div>
              <div>
                <span className="text-xs text-stone-400">gy (global)</span>
                <NumInput value={load.gy} onChange={(v) => update(i, { gy: v } as Partial<Load>)} />
              </div>
            </div>
          )}
        </div>
      ))}

      <button onClick={add}
        className="px-2 py-1 text-xs bg-stone-100 hover:bg-stone-200 rounded border border-stone-200">
        + Add load
      </button>
    </div>
  );
}

// ─── Material panel ──────────────────────────────────────────────────────────
function MaterialPanel({ material, onChange }: { material: Material; onChange: (m: Material) => void }) {
  return (
    <div className="space-y-3">
      <p className="text-xs text-stone-400 italic">
        Material properties only affect <strong>indeterminate</strong> frames.
        For determinate structures the results are independent of E, A, I.
      </p>
      {(['E', 'A', 'I'] as const).map((k) => (
        <div key={k}>
          <label className="text-xs text-stone-500 font-mono">{k}</label>
          <NumInput value={material[k]} step={k === 'E' ? 1e6 : 0.001}
            min={1e-12}
            onChange={(v) => onChange({ ...material, [k]: Math.max(v, 1e-12) })} />
        </div>
      ))}
    </div>
  );
}
