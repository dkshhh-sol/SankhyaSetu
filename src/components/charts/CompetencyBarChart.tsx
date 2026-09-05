"use client";

import { Bar, BarChart, CartesianGrid, LabelList, ResponsiveContainer, XAxis, YAxis } from "recharts";
import { DomainIcon } from "@/components/dashboard/DomainIcon";
import type { DomainView } from "@/lib/hooks/useCompetency";

interface Props {
  domains: DomainView[];
}

/** Grouped bars: your level vs required level, per competency domain. */
export function CompetencyBarChart({ domains }: Props) {
  const data = domains.map((d) => ({ name: d.name, level: d.level, required: d.required }));
  return (
    <div>
      <div className="mb-3 flex items-center gap-5 text-sm text-ink-soft">
        <span className="inline-flex items-center gap-2">
          <span className="size-3 rounded-sm bg-brand-600" /> Your Level
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="size-3 rounded-sm bg-slate-200" /> Required Level (Role)
        </span>
      </div>
      <div className="h-56 w-full sm:h-60">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 18, right: 4, bottom: 0, left: -22 }} barCategoryGap="28%" barGap={4}>
            <CartesianGrid vertical={false} stroke="#e8edf5" />
            <XAxis dataKey="name" tick={false} axisLine={{ stroke: "#e3e9f2" }} tickLine={false} />
            <YAxis domain={[0, 5]} ticks={[0, 1, 2, 3, 4, 5]} tickFormatter={(v) => v.toFixed(1)} tick={{ fill: "#64748b", fontSize: 12 }} axisLine={false} tickLine={false} />
            <Bar dataKey="level" fill="#1d5fc4" radius={[4, 4, 0, 0]} isAnimationActive>
              <LabelList dataKey="level" position="top" formatter={(v) => Number(v).toFixed(1)} style={{ fill: "#0b1c33", fontSize: 12, fontWeight: 700 }} />
            </Bar>
            <Bar dataKey="required" fill="#dbe3ee" radius={[4, 4, 0, 0]} isAnimationActive>
              <LabelList dataKey="required" position="top" formatter={(v) => Number(v).toFixed(1)} style={{ fill: "#33445c", fontSize: 12, fontWeight: 600 }} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      {/* Category labels with icons, aligned under each group */}
      <div className="mt-2 grid pl-4" style={{ gridTemplateColumns: `repeat(${domains.length}, minmax(0, 1fr))` }}>
        {domains.map((d) => (
          <div key={d.id} className="flex flex-col items-center px-1 text-center">
            <DomainIcon icon={d.icon} accent={d.accent} size="sm" />
            <p className="mt-1.5 text-[11px] font-medium leading-tight text-ink-soft sm:text-xs">{d.name}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
