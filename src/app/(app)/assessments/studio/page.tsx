"use client";

import { useEffect, useMemo, useRef, useState, type DragEvent } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, BarChart2, CheckCircle2, Clock, CloudUpload, FileText, Info, Loader2, MessageSquareText, Sparkles, X } from "lucide-react";
import { PageHeader } from "@/components/shell/PageHeader";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Stepper } from "@/components/ui/Stepper";
import { Checkbox, Label, Select, TextInput, Toggle } from "@/components/ui/Fields";
import { BANKS, type Question } from "@/lib/data/questionBank";
import type { Assessment } from "@/lib/data/assessments";
import { seededShuffle } from "@/lib/assessment/scoring";
import { useAppStore } from "@/lib/store/AppStore";
import { cn } from "@/lib/cn";

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  kind: "pdf" | "ppt" | "doc";
}

const STEPS = [
  { title: "Upload Material", subtitle: "Add learning resources" },
  { title: "Configure Assessment", subtitle: "Set preferences" },
  { title: "Review & Generate", subtitle: "Preview questions" },
  { title: "Publish", subtitle: "Make it available" },
];

const PIPELINE = [
  "Files uploaded successfully",
  "Extracting text and key concepts",
  "Identifying important topics and learning outcomes",
  "Generating relevant question pool...",
];

const SAMPLE_FILES: UploadedFile[] = [
  { id: "f1", name: "Data_Visualization_Notes.pdf", size: 2.4 * 1024 * 1024, kind: "pdf" },
  { id: "f2", name: "Module_2_Charts_and_Graphs.pptx", size: 5.1 * 1024 * 1024, kind: "ppt" },
];

/** Picks a bank from file names: the "retrieval" step of the simulated pipeline. */
function detectBank(files: UploadedFile[]): { key: string; label: string; skillId: string; skillName: string } {
  const text = files.map((f) => f.name.toLowerCase()).join(" ");
  if (/visual|chart|graph|python|plot/.test(text)) return { key: "data-viz", label: "Data Visualization", skillId: "data-viz", skillName: "Data Visualization" };
  if (/govern|privacy|confiden|quality/.test(text)) return { key: "data-governance", label: "Data Governance & Privacy", skillId: "gov-privacy", skillName: "Data Governance & Privacy" };
  if (/machine|ml|learning|model/.test(text)) return { key: "ml-basics", label: "Machine Learning Basics", skillId: "ml-basics", skillName: "Machine Learning Basics" };
  return { key: "official-stats", label: "Official Statistics", skillId: "stats-framework", skillName: "Official Statistics Framework" };
}

function kindOf(name: string): UploadedFile["kind"] {
  if (/\.pptx?$/i.test(name)) return "ppt";
  if (/\.docx?$/i.test(name)) return "doc";
  return "pdf";
}

function fmtSize(bytes: number) {
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export default function StudioPage() {
  const router = useRouter();
  const { dispatch } = useAppStore();
  const inputRef = useRef<HTMLInputElement>(null);

  const [files, setFiles] = useState<UploadedFile[]>(SAMPLE_FILES);
  const [dragging, setDragging] = useState(false);
  const [pipelineStep, setPipelineStep] = useState(3); // 0..4; 4 = complete
  /** null until the user edits the title; otherwise it follows the detected topic. */
  const [customTitle, setCustomTitle] = useState<string | null>(null);
  const [count, setCount] = useState(20);
  const [types, setTypes] = useState({ mcq: true, multi: true, tf: false, short: false });
  const [difficulty, setDifficulty] = useState("Intermediate");
  const [timeLimit, setTimeLimit] = useState(30);
  const [passing, setPassing] = useState(70);
  const [shuffle, setShuffle] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState<Question[] | null>(null);
  const [published, setPublished] = useState(false);

  const bank = useMemo(() => detectBank(files), [files]);
  const preview = BANKS[bank.key][0];
  const title = customTitle ?? `${bank.label} - Competency Assessment`;

  // Re-run the (simulated) pipeline whenever the file set changes.
  useEffect(() => {
    const steps = files.length === 0 ? [0] : [1, 2, 3];
    const timers = steps.map((s, i) => window.setTimeout(() => setPipelineStep(s), 700 * i));
    return () => timers.forEach(clearTimeout);
  }, [files]);

  const currentStep = published ? 4 : generated ? 3 : files.length ? 2 : 1;

  function addFiles(list: FileList | File[]) {
    const next = Array.from(list)
      .filter((f) => /\.(pdf|pptx?|docx?)$/i.test(f.name))
      .map<UploadedFile>((f) => ({ id: `${f.name}-${f.size}-${Date.now()}`, name: f.name, size: f.size, kind: kindOf(f.name) }));
    if (next.length) {
      setFiles((prev) => [...prev, ...next]);
      setGenerated(null);
    }
  }

  function onDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragging(false);
    addFiles(e.dataTransfer.files);
  }

  function removeFile(id: string) {
    setFiles((prev) => prev.filter((f) => f.id !== id));
    setGenerated(null);
  }

  function generate() {
    setGenerating(true);
    window.setTimeout(() => {
      const pool = BANKS[bank.key];
      const picked = (shuffle ? seededShuffle(pool, Date.now() & 0xffff) : pool).slice(0, Math.min(count, pool.length));
      setGenerated(picked);
      setPipelineStep(4);
      setGenerating(false);
    }, 1600);
  }

  function publish() {
    if (!generated) return;
    const id = `studio-${Date.now().toString(36)}`;
    const assessment: Assessment = {
      id,
      title,
      description: `Generated from ${files.length} uploaded ${files.length === 1 ? "file" : "files"} in the Assessment Studio.`,
      courseId: "adv-data-viz-python",
      linkedCourseTitle: files.map((f) => f.name.replace(/\.[^.]+$/, "").replace(/_/g, " ")).join(", "),
      provider: "iGOT",
      primarySkillId: bank.skillId,
      primarySkillName: bank.skillName,
      secondary: [],
      questions: generated,
      timeLimitMin: timeLimit,
      passingPct: passing,
      status: "available",
      createdAt: new Date().toISOString(),
      sourceFiles: files.map((f) => f.name),
    };
    dispatch({ type: "assessment/create", assessment });
    setPublished(true);
    window.setTimeout(() => router.push("/assessments"), 900);
  }

  return (
    <div className="space-y-4">
      <PageHeader
        crumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Assessments", href: "/assessments" }, { label: "Create Assessment" }]}
        title="Assessment Studio"
        subtitle="Create high-quality assessments from learning materials to verify competency gains."
      />

      <Card className="p-4 sm:p-5">
        <div className="overflow-x-auto scrollbar-thin">
          <Stepper className="min-w-[560px]" steps={STEPS} current={currentStep} />
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.75fr_1fr]">
        <div className="space-y-4">
          {/* Step 1 */}
          <Card className="p-4 sm:p-5">
            <StepTitle n={1} title="Upload Learning Material" subtitle="Upload course material (PDF, PPT, DOC) or use curriculum details to generate questions." />
            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
              <div
                role="button"
                tabIndex={0}
                onClick={() => inputRef.current?.click()}
                onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && inputRef.current?.click()}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragging(true);
                }}
                onDragLeave={() => setDragging(false)}
                onDrop={onDrop}
                className={cn(
                  "flex min-h-[150px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-4 text-center transition-colors",
                  dragging ? "border-brand-500 bg-brand-50" : "border-brand-200 bg-brand-50/40 hover:bg-brand-50",
                )}
              >
                <CloudUpload className="size-9 text-brand-500" strokeWidth={1.6} aria-hidden />
                <p className="mt-3 text-sm font-medium text-ink">
                  Drag and drop files here, or <span className="font-semibold text-brand-600">click to upload</span>
                </p>
                <p className="mt-1 text-xs text-ink-muted">Supports PDF, PPT, DOC, DOCX (Max 50 MB each)</p>
                <input
                  ref={inputRef}
                  type="file"
                  accept=".pdf,.ppt,.pptx,.doc,.docx"
                  multiple
                  className="sr-only"
                  onChange={(e) => e.target.files && addFiles(e.target.files)}
                />
              </div>
              <div className="rounded-xl border border-line p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-bold text-ink">Uploaded Files ({files.length})</p>
                  {files.length > 0 && (
                    <button type="button" onClick={() => { setFiles([]); setGenerated(null); }} className="text-sm font-semibold text-brand-600 hover:text-brand-700">
                      Clear All
                    </button>
                  )}
                </div>
                <ul className="mt-3 space-y-2.5">
                  {files.length === 0 && <li className="rounded-xl bg-surface p-4 text-center text-xs text-ink-muted">No files yet.</li>}
                  {files.map((f) => (
                    <li key={f.id} className="flex items-center gap-3 rounded-xl border border-line bg-surface/60 px-3 py-2.5">
                      <FileIcon kind={f.kind} />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-ink">{f.name}</p>
                        <p className="text-xs text-ink-muted">{fmtSize(f.size)}</p>
                      </div>
                      <CheckCircle2 className="size-5 text-emerald-500" aria-label="Uploaded" />
                      <button type="button" onClick={() => removeFile(f.id)} className="rounded-md p-1 text-ink-muted hover:bg-slate-100 hover:text-red-600" aria-label={`Remove ${f.name}`}>
                        <X className="size-4" />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Card>

          {/* Step 2 */}
          <Card className="p-4 sm:p-5">
            <StepTitle n={2} title="Configure Assessment" subtitle="Set the parameters for your assessment." />
            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-[2fr_1fr]">
              <div>
                <Label htmlFor="title">Assessment Title</Label>
                <TextInput id="title" value={title} onChange={(e) => setCustomTitle(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="count">Number of Questions</Label>
                <Select id="count" value={count} onChange={(e) => setCount(Number(e.target.value))}>
                  {[10, 15, 20].map((n) => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </Select>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-[2fr_1fr]">
              <div>
                <Label>Question Type</Label>
                <div className="flex flex-wrap gap-x-6 gap-y-2 pt-1">
                  <Checkbox checked={types.mcq} onChange={(v) => setTypes({ ...types, mcq: v })} label="Multiple Choice (MCQ)" />
                  <Checkbox checked={types.multi} onChange={(v) => setTypes({ ...types, multi: v })} label="Multiple Select" />
                  <Checkbox checked={types.tf} onChange={(v) => setTypes({ ...types, tf: v })} label="True / False" />
                  <Checkbox checked={types.short} onChange={(v) => setTypes({ ...types, short: v })} label="Short Answer" />
                </div>
              </div>
              <div>
                <Label htmlFor="difficulty">Difficulty Level</Label>
                <Select id="difficulty" value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
                  {["Beginner", "Intermediate", "Advanced", "Mixed"].map((d) => (
                    <option key={d}>{d}</option>
                  ))}
                </Select>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <Label htmlFor="time">Time Limit</Label>
                <Select id="time" value={timeLimit} onChange={(e) => setTimeLimit(Number(e.target.value))}>
                  {[15, 20, 30, 45, 60].map((n) => (
                    <option key={n} value={n}>{n} minutes</option>
                  ))}
                </Select>
              </div>
              <div>
                <Label htmlFor="pass">Passing Marks</Label>
                <div className="relative">
                  <TextInput id="pass" type="number" min={40} max={100} value={passing} onChange={(e) => setPassing(Number(e.target.value))} className="pr-10" />
                  <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-sm text-ink-muted">%</span>
                </div>
              </div>
              <div>
                <Label>Randomize Questions</Label>
                <div className="pt-2">
                  <Toggle checked={shuffle} onChange={setShuffle} label="Shuffle questions for each attempt" />
                </div>
              </div>
            </div>
          </Card>

          {/* Step 3 */}
          <Card className="p-4 sm:p-5">
            <StepTitle n={3} title="Review & Generate" subtitle="Review your settings and generate the assessment." />
            <div className="mt-4 flex flex-col gap-4 2xl:flex-row 2xl:items-center 2xl:justify-between">
              <dl className="grid grid-cols-2 gap-3 md:grid-cols-4">
                {[
                  { icon: FileText, v: count, k: "Questions" },
                  { icon: Clock, v: `${timeLimit} Minutes`, k: "Time Limit" },
                  { icon: BarChart2, v: difficulty, k: "Difficulty" },
                  { icon: FileText, v: `${files.length} Files`, k: "Processing with RAG" },
                ].map((m) => (
                  <div key={m.k} className="flex min-w-0 items-center gap-2.5 rounded-xl border border-line px-3 py-2.5">
                    <m.icon className="size-4.5 shrink-0 text-brand-600" aria-hidden />
                    <div className="min-w-0">
                      <dd className="truncate text-sm font-bold text-ink">{m.v}</dd>
                      <dt className="text-[11px] text-ink-muted">{m.k}</dt>
                    </div>
                  </div>
                ))}
              </dl>
              {generated ? (
                <Button onClick={publish} disabled={published} loading={published} variant="primary" size="lg" className="self-end 2xl:self-auto" rightIcon={<ArrowRight className="size-4" />}>
                  {published ? "Published" : "Publish Assessment"}
                </Button>
              ) : (
                <Button onClick={generate} loading={generating} disabled={files.length === 0 || pipelineStep < 3} size="lg" className="self-end 2xl:self-auto" leftIcon={<Sparkles className="size-4" />} rightIcon={<ArrowRight className="size-4" />}>
                  Generate Assessment
                </Button>
              )}
            </div>

            {generated && (
              <div className="mt-4 rounded-xl border border-emerald-100 bg-emerald-50/60 p-4">
                <p className="flex items-center gap-2 text-sm font-bold text-ink">
                  <CheckCircle2 className="size-5 text-emerald-500" aria-hidden /> {generated.length} questions assembled from the {bank.label} bank
                </p>
                <ol className="mt-3 max-h-64 space-y-2 overflow-y-auto pr-1 scrollbar-thin">
                  {generated.map((q, i) => (
                    <li key={q.id} className="flex items-start gap-3 rounded-xl bg-white p-3 text-sm">
                      <span className="shrink-0 font-bold text-ink-muted">Q{i + 1}.</span>
                      <span className="flex-1 text-ink-soft">{q.prompt}</span>
                      <Badge tone="slate">{q.topic}</Badge>
                    </li>
                  ))}
                </ol>
              </div>
            )}
          </Card>
        </div>

        {/* Right column */}
        <div className="space-y-4">
          <Card className="p-4 sm:p-5">
            <h2 className="font-display text-[15px] font-semibold text-ink">Material Processing (RAG Pipeline)</h2>
            <ul className="mt-4 space-y-3">
              {PIPELINE.map((label, i) => {
                const done = pipelineStep > i + (i === 3 ? 0 : 0) && (i < 3 ? pipelineStep >= i + 1 : pipelineStep >= 4);
                const active = !done && (i < 3 ? pipelineStep === i : pipelineStep === 3);
                return (
                  <li key={label} className="flex items-center gap-3 text-sm">
                    {done ? (
                      <CheckCircle2 className="size-5 shrink-0 text-emerald-500" aria-hidden />
                    ) : active && files.length > 0 ? (
                      <Loader2 className="size-5 shrink-0 animate-spin text-brand-500" aria-hidden />
                    ) : (
                      <span className="size-5 shrink-0 rounded-full border-2 border-slate-200" aria-hidden />
                    )}
                    <span className={cn(done ? "text-ink" : active ? "font-medium text-ink" : "text-ink-muted")}>{label}</span>
                  </li>
                );
              })}
            </ul>
            <Badge tone="slate" className="mt-4">Prototype: retrieval simulated with curated banks</Badge>
          </Card>

          <Card className="p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="flex size-9 items-center justify-center rounded-full bg-brand-50 text-brand-600">
                  <MessageSquareText className="size-4.5" aria-hidden />
                </span>
                <h2 className="font-display text-[15px] font-semibold text-ink">Question Preview</h2>
              </div>
              <span className="text-sm font-semibold text-brand-600">{bank.label}</span>
            </div>
            <div className="mt-4 rounded-xl bg-brand-50/60 p-4">
              <p className="text-sm font-semibold text-ink">
                <span className="mr-2 text-ink-muted">Q 1.</span>
                {preview.prompt}
              </p>
              <ul className="mt-3 space-y-2">
                {preview.options.map((o, i) => (
                  <li key={o} className="flex items-center gap-3 text-sm text-ink-soft">
                    <span className={cn("flex size-5 items-center justify-center rounded-full border-2", i === preview.answer ? "border-brand-600" : "border-slate-300")}>
                      {i === preview.answer && <span className="size-2.5 rounded-full bg-brand-600" />}
                    </span>
                    {o}
                  </li>
                ))}
              </ul>
              <div className="mt-3 flex items-center justify-between text-xs">
                <Badge tone="emerald">MCQ</Badge>
                <span className="text-ink-muted">Difficulty: {preview.difficulty}</span>
              </div>
            </div>
          </Card>

          <Card className="p-4 sm:p-5">
            <div className="flex items-center gap-3">
              <span className="flex size-9 items-center justify-center rounded-full bg-brand-50 text-brand-600">
                <Info className="size-4.5" aria-hidden />
              </span>
              <h2 className="font-display text-[15px] font-semibold text-ink">Guidelines</h2>
            </div>
            <ul className="mt-3 space-y-2 text-sm text-ink-soft">
              {[
                "Ensure the uploaded material is from authorized sources (e.g., iGOT/NSSTA).",
                "Review and validate questions before publishing.",
                "Assessments will be used to verify competency improvement.",
                "Avoid including copyrighted content without permission.",
              ].map((g) => (
                <li key={g} className="flex items-start gap-2.5">
                  <span className="mt-2 size-1.5 shrink-0 rounded-full bg-brand-500" aria-hidden /> {g}
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
}

function StepTitle({ n, title, subtitle }: { n: number; title: string; subtitle: string }) {
  return (
    <div className="flex items-start gap-4">
      <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-brand-600 font-display text-sm font-semibold text-white">{n}</span>
      <div>
        <h2 className="font-display text-[15px] font-semibold text-ink">{title}</h2>
        <p className="text-sm text-ink-soft">{subtitle}</p>
      </div>
    </div>
  );
}

function FileIcon({ kind }: { kind: UploadedFile["kind"] }) {
  const cls = kind === "pdf" ? "bg-red-100 text-red-600" : kind === "ppt" ? "bg-orange-100 text-orange-600" : "bg-blue-100 text-blue-600";
  return (
    <span className={cn("flex size-9 shrink-0 items-center justify-center rounded-lg text-[10px] font-bold uppercase", cls)} aria-hidden>
      {kind}
    </span>
  );
}
