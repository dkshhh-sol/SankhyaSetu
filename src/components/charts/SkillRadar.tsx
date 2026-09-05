"use client";

import { PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, RadarChart, ResponsiveContainer } from "recharts";

export interface RadarPoint {
  name: string;
  before: number;
  after: number;
}

export function SkillRadar({ data }: { data: RadarPoint[] }) {
  return (
    <div className="h-56 w-full sm:h-64">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={data} outerRadius="62%" margin={{ top: 16, right: 48, bottom: 16, left: 48 }}>
          <PolarGrid stroke="#dbe3ee" />
          <PolarAngleAxis dataKey="name" tick={{ fill: "#33445c", fontSize: 11, fontWeight: 500 }} />
          <PolarRadiusAxis domain={[0, 5]} tickCount={6} tick={{ fill: "#94a3b8", fontSize: 10 }} axisLine={false} />
          <Radar name="Before" dataKey="before" stroke="#93b6ef" fill="#93b6ef" fillOpacity={0.35} strokeWidth={2} dot={{ r: 3, fill: "#93b6ef" }} isAnimationActive />
          <Radar name="After" dataKey="after" stroke="#1d5fc4" fill="#1d5fc4" fillOpacity={0.2} strokeWidth={2.5} dot={{ r: 3.5, fill: "#1d5fc4" }} isAnimationActive />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
