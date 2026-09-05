"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { AlertTriangle, ArrowRight, Camera, CheckCircle2, Clock, FileQuestion, Maximize2, Mic, Monitor, ShieldCheck, XCircle } from "lucide-react";
import { PageHeader } from "@/components/shell/PageHeader";
import { Card, CardHeader } from "@/components/ui/Card";
import { Badge, ProviderBadge } from "@/components/ui/Badge";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/Fields";
import { IconTile } from "@/components/ui/IconTile";
import { ASSESSMENT_RULES, getAssessment } from "@/lib/data/assessments";
import { useAppStore } from "@/lib/store/AppStore";
import { cn } from "@/lib/cn";

type CheckState = "idle" | "checking" | "ok" | "fail";

export default function AssessmentStartPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { state, assessments } = useAppStore();
  const assessment = getAssessment(id, state.customAssessments);

  const [camera, setCamera] = useState<CheckState>("idle");
  const [mic, setMic] = useState<CheckState>("idle");
  // These pages mount only after hydration (AppShell gates on the session), so
  // reading browser capabilities in the initialiser is safe.
  const [fullscreen] = useState<CheckState>(() => (typeof document !== "undefined" && document.fullscreenEnabled ? "ok" : "fail"));
  const [displays] = useState<CheckState>(() => {
    if (typeof window === "undefined") return "idle";
    // Multi-monitor detection (Chromium only); a second display is a soft warning.
    const scr = window.screen as Screen & { isExtended?: boolean };
    return scr.isExtended ? "fail" : "ok";
  });
  const [agree, setAgree] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const existing = state.attempts[id];
  const result = state.results[id];

  // Release the preview camera when leaving the page.
  useEffect(() => {
    const ref = streamRef;
    return () => ref.current?.getTracks().forEach((t) => t.stop());
  }, []);

  async function testDevices() {
    setCamera("checking");
    setMic("checking");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 }, audio: true });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
      setCamera(stream.getVideoTracks().length ? "ok" : "fail");
      setMic(stream.getAudioTracks().length ? "ok" : "fail");
    } catch {
      setCamera("fail");
      setMic("fail");
    }
  }

  if (!assessment) {
    return (
      <div className="rounded-xl bg-white p-10 text-center">
        <p className="text-lg font-semibold text-ink">Assessment not found.</p>
        <Link href="/assessments" className="mt-3 inline-block text-brand-600 hover:underline">Back to assessments</Link>
      </div>
    );
  }

  if (result) {
    return (
      <div className="space-y-4">
        <PageHeader crumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Assessments", href: "/assessments" }, { label: assessment.title }]} title={assessment.title} />
        <Card className="p-8 text-center">
          <IconTile icon={CheckCircle2} tone="emerald" size="lg" rounded="full" className="mx-auto" />
          <p className="mt-4 font-display text-base font-semibold text-ink">You have already completed this assessment.</p>
          <p className="mt-1 text-sm text-ink-soft">Score {result.scorePct}% - integrity {result.integrity}.</p>
          <ButtonLink href={`/assessments/${id}/result`} className="mt-5" rightIcon={<ArrowRight className="size-4" />}>View Result</ButtonLink>
        </Card>
      </div>
    );
  }

  const ready = camera === "ok" && fullscreen === "ok" && agree;
  const locked = assessment.status === "locked";
  void assessments;

  return (
    <div className="space-y-4">
      <PageHeader
        crumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Assessments", href: "/assessments" }, { label: "Take Assessment" }]}
        title={assessment.title}
        subtitle={assessment.description}
        building={false}
        aside={
          <div className="flex items-center gap-4 rounded-xl border border-line bg-white p-3 pr-5 shadow-card">
            <span className="flex h-10 w-14 items-center justify-center rounded-lg bg-brand-50 font-display text-base font-bold text-brand-700">{assessment.provider}</span>
            <div>
              <p className="font-display text-sm font-semibold text-ink">{assessment.linkedCourseTitle}</p>
              <p className="text-xs text-ink-muted">Linked Course Assessment</p>
            </div>
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.6fr_1fr]">
        <div className="space-y-4">
          <Card className="p-4 sm:p-5">
            <CardHeader icon={<IconTile icon={ShieldCheck} tone="emerald" rounded="full" />} title="Before you begin" subtitle="This is a proctored assessment. Please read the rules carefully." />
            <ul className="mt-4 space-y-2.5">
              {ASSESSMENT_RULES.map((r) => (
                <li key={r} className="flex items-start gap-2.5 text-sm text-ink-soft">
                  <CheckCircle2 className="mt-0.5 size-4.5 shrink-0 text-emerald-500" aria-hidden /> {r}
                </li>
              ))}
            </ul>
            <dl className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                { icon: FileQuestion, v: assessment.questions.length, k: "Questions" },
                { icon: Clock, v: `${assessment.timeLimitMin} min`, k: "Time limit" },
                { icon: CheckCircle2, v: `${assessment.passingPct}%`, k: "Passing score" },
                { icon: AlertTriangle, v: "3 events", k: "Auto-submit at" },
              ].map((m) => (
                <div key={m.k} className="flex items-center gap-2.5 rounded-xl bg-surface px-3 py-2.5">
                  <m.icon className="size-4.5 shrink-0 text-brand-600" aria-hidden />
                  <div>
                    <dd className="text-sm font-bold text-ink">{m.v}</dd>
                    <dt className="text-[11px] text-ink-muted">{m.k}</dt>
                  </div>
                </div>
              ))}
            </dl>
          </Card>

          <Card className="p-4 sm:p-5">
            <CardHeader icon={<IconTile icon={Monitor} tone="blue" rounded="full" />} title="System check" subtitle="Grant camera and microphone access to enable live proctoring." />
            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-[220px_1fr]">
              <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-ink">
                <video ref={videoRef} autoPlay muted playsInline className="size-full object-cover" />
                {camera !== "ok" && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-white/80">
                    <Camera className="size-6" aria-hidden />
                    <span className="text-xs">Camera preview</span>
                  </div>
                )}
              </div>
              <ul className="space-y-2.5">
                <CheckRow icon={Camera} label="Camera access" state={camera} hint="Required for face monitoring" />
                <CheckRow icon={Mic} label="Microphone access" state={mic} hint="Required for audio monitoring" />
                <CheckRow icon={Maximize2} label="Full-screen support" state={fullscreen} hint="Assessment runs in full screen" />
                <CheckRow icon={Monitor} label="Single display" state={displays} hint={displays === "fail" ? "Second display detected - it will be noted in the integrity report" : "No additional displays detected"} soft />
                <li className="pt-1">
                  <Button variant="outline" size="sm" onClick={testDevices} loading={camera === "checking"}>
                    {camera === "ok" ? "Re-test devices" : "Test camera & microphone"}
                  </Button>
                </li>
              </ul>
            </div>
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="p-4 sm:p-5">
            <div className="flex flex-wrap items-center gap-2">
              <ProviderBadge provider={assessment.provider} />
              {assessment.createdAt && <Badge tone="violet">Studio</Badge>}
              {existing && <Badge tone="amber" dot>Attempt in progress</Badge>}
            </div>
            <p className="mt-3 text-sm leading-relaxed text-ink-soft">
              Your camera feed is analysed on-device for presence and attention. Nothing is uploaded; only integrity events are recorded with the result.
            </p>
            <Checkbox className="mt-4 items-start" checked={agree} onChange={setAgree} label="I confirm I will attempt this assessment on my own, without external help, and I understand integrity events are recorded." />
            <Button
              className="mt-4 w-full"
              size="lg"
              disabled={!ready || locked}
              rightIcon={<ArrowRight className="size-4" />}
              onClick={() => {
                streamRef.current?.getTracks().forEach((t) => t.stop());
                router.push(`/assessments/${id}/attempt`);
              }}
            >
              {existing ? "Resume Assessment" : "Start Assessment"}
            </Button>
            {!ready && !locked && (
              <p className="mt-2 text-center text-xs text-ink-muted">
                {camera !== "ok" ? "Complete the camera check to continue." : !agree ? "Please confirm the declaration." : "Full screen is not supported in this browser."}
              </p>
            )}
            {locked && <p className="mt-2 text-center text-xs text-red-600">{assessment.lockedReason}</p>}
          </Card>
        </div>
      </div>
    </div>
  );
}

function CheckRow({ icon: Icon, label, state, hint, soft }: { icon: typeof Camera; label: string; state: CheckState; hint: string; soft?: boolean }) {
  return (
    <li className="flex items-center gap-3 rounded-xl border border-line px-3 py-2.5">
      <Icon className="size-5 shrink-0 text-ink-muted" aria-hidden />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-ink">{label}</p>
        <p className="truncate text-xs text-ink-muted">{hint}</p>
      </div>
      <span
        className={cn(
          "inline-flex items-center gap-1 text-xs font-semibold",
          state === "ok" ? "text-emerald-600" : state === "fail" ? (soft ? "text-amber-600" : "text-red-600") : "text-ink-muted",
        )}
      >
        {state === "ok" ? <CheckCircle2 className="size-4" /> : state === "fail" ? (soft ? <AlertTriangle className="size-4" /> : <XCircle className="size-4" />) : state === "checking" ? <span className="size-3.5 animate-spin rounded-full border-2 border-brand-300 border-t-brand-600" /> : null}
        {state === "ok" ? "Ready" : state === "fail" ? (soft ? "Noted" : "Not available") : state === "checking" ? "Checking" : "Not tested"}
      </span>
    </li>
  );
}
