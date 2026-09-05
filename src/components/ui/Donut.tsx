import { cn } from "@/lib/cn";
import type { ReactNode } from "react";

interface DonutProps {
  /** 0..1 */
  value: number;
  size?: number;
  stroke?: number;
  color?: string;
  track?: string;
  className?: string;
  children?: ReactNode;
}

/** Single-value ring gauge with centred content. */
export function Donut({ value, size = 96, stroke = 10, color = "#16a34a", track = "#e5e7eb", className, children }: DonutProps) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const v = Math.max(0, Math.min(1, value));
  return (
    <div className={cn("relative shrink-0", className)} style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={track} strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - v)}
          className="transition-[stroke-dashoffset] duration-1000 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">{children}</div>
    </div>
  );
}

interface Segment {
  value: number;
  color: string;
}

interface MultiDonutProps {
  segments: Segment[];
  size?: number;
  stroke?: number;
  className?: string;
  children?: ReactNode;
}

/** Multi-segment ring (e.g. skill gaps by priority). */
export function MultiDonut({ segments, size = 128, stroke = 18, className, children }: MultiDonutProps) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const total = segments.reduce((a, s) => a + s.value, 0) || 1;
  // Precompute each arc's start offset so rendering stays pure.
  const arcs = segments.reduce<Array<{ len: number; offset: number; color: string }>>((acc, s) => {
    const prev = acc[acc.length - 1];
    const offset = prev ? prev.offset + prev.len : 0;
    acc.push({ len: (s.value / total) * c, offset, color: s.color });
    return acc;
  }, []);
  return (
    <div className={cn("relative shrink-0", className)} style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        {arcs.map((a, i) => (
          <circle
            key={i}
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke={a.color}
            strokeWidth={stroke}
            strokeDasharray={`${a.len} ${c - a.len}`}
            strokeDashoffset={-a.offset}
          />
        ))}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">{children}</div>
    </div>
  );
}
