"use client";

import { AlertTriangle, Eye, Maximize2, Mic, ScanFace, ShieldCheck, Smartphone, SquareStack, Sun } from "lucide-react";
import { type RefObject } from "react";
import { cn } from "@/lib/cn";
import type { ProctorState } from "@/components/assessment/useProctoring";
import type { Violation } from "@/lib/assessment/scoring";
import { hardCount, MAX_VIOLATIONS } from "@/lib/assessment/scoring";

interface Props {
  videoRef: RefObject<HTMLVideoElement | null>;
  proctor: ProctorState;
  violations: Violation[];
  isFullscreen: boolean;
  onExpand?: () => void;
  compact?: boolean;
}

export function ProctorPanel({ videoRef, proctor, violations, isFullscreen, onExpand, compact }: Props) {
  const tabSwitches = violations.filter((v) => v.type === "tab-switch" || v.type === "window-blur").length;
  const hard = hardCount(violations);
  const faceOk = proctor.facePresent !== false && proctor.status === "active";

  const indicators = [
    { icon: ScanFace, label: faceOk ? "Face Detected" : proctor.status === "active" ? "Face Not Visible" : "Camera Unavailable", ok: faceOk },
    { icon: Eye, label: faceOk && isFullscreen ? "Eyes on Screen" : "Attention Check", ok: faceOk && isFullscreen },
    { icon: Smartphone, label: "No Phone Detected", ok: true },
    { icon: SquareStack, label: tabSwitches === 0 ? "No Tab Switch" : `${tabSwitches} Tab Switch${tabSwitches > 1 ? "es" : ""}`, ok: tabSwitches === 0 },
    { icon: Mic, label: proctor.noisy ? "Noise Detected" : "Audio Normal", ok: !proctor.noisy },
    { icon: Sun, label: "Environment Clear", ok: true },
  ];

  const integrity = hard === 0 && violations.length === 0 ? "Good" : hard >= MAX_VIOLATIONS ? "Invalid" : hard > 0 ? "At Risk" : "Under Review";
  const integrityTone = integrity === "Good" ? "emerald" : integrity === "Under Review" ? "amber" : "red";

  return (
    <div className="rounded-2xl border border-line bg-white p-4 shadow-card">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <h2 className="font-display text-base font-bold text-ink">Live Proctoring</h2>
          <span className={cn("inline-flex items-center gap-1.5 text-xs font-semibold", proctor.status === "active" ? "text-emerald-600" : "text-amber-600")}>
            <span className={cn("size-2 rounded-full", proctor.status === "active" ? "animate-pulse-dot bg-emerald-500" : "bg-amber-500")} aria-hidden />
            {proctor.status === "active" ? "Monitoring Active" : proctor.status === "starting" ? "Starting" : proctor.status === "denied" ? "Camera Denied" : "Camera Lost"}
          </span>
        </div>
        {onExpand && (
          <button type="button" onClick={onExpand} className="rounded-md p-1 text-ink-muted hover:bg-slate-100" aria-label="Expand">
            <Maximize2 className="size-4" />
          </button>
        )}
      </div>

      <div className={cn("mt-3 grid gap-3", compact ? "grid-cols-1" : "grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]")}>
        <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-ink">
          <video ref={videoRef} autoPlay muted playsInline className="size-full object-cover" />
          {proctor.status !== "active" && (
            <img src="/images/proctor-fallback.jpg" alt="" aria-hidden className="absolute inset-0 size-full object-cover opacity-40" draggable={false} />
          )}
          {proctor.status !== "active" && (
            <div className="absolute inset-0 flex items-center justify-center bg-ink/50 p-3 text-center text-xs font-medium text-white">
              {proctor.status === "starting" ? "Starting camera..." : proctor.status === "denied" ? "Camera access was denied. Presence cannot be verified." : "Camera feed lost."}
            </div>
          )}
          {/* Audio level meter */}
          <div className="absolute bottom-2 left-2 flex h-2 w-16 items-end gap-0.5" aria-hidden>
            {[0.05, 0.1, 0.18, 0.28, 0.4].map((t) => (
              <span key={t} className={cn("flex-1 rounded-sm", proctor.audioLevel > t ? (t >= 0.28 ? "bg-red-400" : "bg-emerald-400") : "bg-white/25")} style={{ height: `${40 + t * 150}%` }} />
            ))}
          </div>
          <span className="absolute right-2 top-2 flex items-center gap-1 rounded-md bg-ink/60 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
            <span className="size-1.5 rounded-full bg-red-500" aria-hidden /> Rec
          </span>
        </div>

        <ul className="space-y-1.5">
          {indicators.map((i) => (
            <li key={i.label} className="flex items-center gap-2 text-[13px] text-ink-soft">
              <span className={cn("flex size-6 shrink-0 items-center justify-center rounded-md", i.ok ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600")}>
                <i.icon className="size-3.5" aria-hidden />
              </span>
              <span className="truncate">{i.label}</span>
            </li>
          ))}
        </ul>
      </div>

      <div
        className={cn(
          "mt-3 flex items-start gap-3 rounded-xl p-3",
          integrityTone === "emerald" ? "bg-emerald-50" : integrityTone === "amber" ? "bg-amber-50" : "bg-red-50",
        )}
      >
        {integrityTone === "emerald" ? <ShieldCheck className="mt-0.5 size-5 shrink-0 text-emerald-600" aria-hidden /> : <AlertTriangle className="mt-0.5 size-5 shrink-0 text-amber-600" aria-hidden />}
        <div className="text-xs">
          <p className={cn("font-bold", integrityTone === "emerald" ? "text-emerald-700" : integrityTone === "amber" ? "text-amber-700" : "text-red-700")}>
            Assessment Integrity: {integrity}
          </p>
          <p className="mt-0.5 text-ink-soft">
            {hard === 0 && violations.length === 0
              ? "Keep looking at the screen and avoid distractions."
              : `${hard} of ${MAX_VIOLATIONS} critical events used${violations.length > hard ? `, ${violations.length - hard} minor` : ""}.`}
          </p>
        </div>
      </div>

      <p className="mt-2 text-[10px] leading-snug text-ink-muted">
        Analysis runs on-device. {proctor.faceDetectorAvailable ? "Face presence via browser detector." : "Face and object detection simulated for the prototype."}
      </p>
    </div>
  );
}
