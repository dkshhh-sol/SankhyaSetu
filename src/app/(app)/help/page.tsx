"use client";

import { useState } from "react";
import { ChevronDown, ExternalLink, LifeBuoy, Mail, ShieldCheck } from "lucide-react";
import { PageHeader } from "@/components/shell/PageHeader";
import { Card, CardHeader } from "@/components/ui/Card";
import { IconTile } from "@/components/ui/IconTile";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/cn";

const FAQ = [
  {
    q: "What does SankhyaSetu actually do?",
    a: "It is a competency and evidence layer around iGOT Karmayogi, NSSTA and TPAC. It identifies skill gaps for your role, recommends programmes from those providers, verifies completion, runs proctored assessments and updates your competency profile only when learning, assessment and integrity all check out.",
  },
  {
    q: "Does SankhyaSetu host courses?",
    a: "No. Learning always happens on the provider's platform. SankhyaSetu links out and records verified completion.",
  },
  {
    q: "Why did my course completion not raise my competency?",
    a: "Completion alone never changes a competency. You must also pass the linked assessment with valid integrity. This is deliberate: the platform measures demonstrated competence, not attendance.",
  },
  {
    q: "How does verification work?",
    a: "Completion status is fetched from the provider through an authorised integration. In this prototype the integration is simulated; the data model and screens are shaped so a real API can replace the mock.",
  },
  {
    q: "What is recorded during a proctored assessment?",
    a: "Integrity events only: leaving full screen, tab or window switches, copy/paste attempts, blocked shortcuts, camera interruptions and face-absence. Camera and microphone analysis runs on-device; no video or audio is uploaded.",
  },
  {
    q: "How are assessment questions generated?",
    a: "Items come from curated, topic-tagged question banks behind a retrieval-shaped interface. The Assessment Studio pipeline (extract concepts, identify topics, assemble a pool) is simulated for the prototype.",
  },
];

export default function HelpPage() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div className="space-y-6">
      <PageHeader crumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Help & Support" }]} title="Help & Support" subtitle="Answers to common questions and ways to reach the SankhyaSetu team." />

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.6fr_1fr]">
        <Card className="p-5 sm:p-6">
          <CardHeader icon={<IconTile icon={LifeBuoy} tone="blue" rounded="full" />} title="Frequently asked questions" />
          <ul className="mt-4 divide-y divide-line" id="verification">
            {FAQ.map((f, i) => {
              const on = open === i;
              return (
                <li key={f.q}>
                  <button type="button" onClick={() => setOpen(on ? null : i)} aria-expanded={on} className="flex w-full items-center justify-between gap-4 py-4 text-left">
                    <span className="font-semibold text-ink">{f.q}</span>
                    <ChevronDown className={cn("size-5 shrink-0 text-ink-muted transition-transform", on && "rotate-180")} aria-hidden />
                  </button>
                  {on && <p className="pb-4 text-sm leading-relaxed text-ink-soft">{f.a}</p>}
                </li>
              );
            })}
          </ul>
        </Card>

        <div className="space-y-4">
          <Card className="p-5 sm:p-6">
            <CardHeader icon={<IconTile icon={Mail} tone="emerald" rounded="full" />} title="Contact support" />
            <p className="mt-3 text-sm text-ink-soft">For technical issues during an assessment or problems with evidence verification.</p>
            <a href="mailto:support@sankhyasetu.demo.gov.in" className="mt-4 inline-flex h-11 items-center gap-2 rounded-xl border border-brand-200 bg-white px-4 text-sm font-semibold text-brand-700 hover:bg-brand-50">
              support@sankhyasetu.demo.gov.in <ExternalLink className="size-4" aria-hidden />
            </a>
            <p className="mt-3 text-xs text-ink-muted">Prototype address for the SIH 2026 demo.</p>
          </Card>

          <Card className="p-5 sm:p-6" id="privacy">
            <CardHeader icon={<IconTile icon={ShieldCheck} tone="blue" rounded="full" />} title="Privacy" />
            <ul className="mt-3 space-y-2 text-sm text-ink-soft">
              <li>Identity is provided by Parichay SSO (simulated in this prototype).</li>
              <li>Proctoring analysis runs in the browser; only integrity events are stored with a result.</li>
              <li>Competency data is held per officer and shared only with authorised role owners.</li>
            </ul>
            <div className="mt-4 flex flex-wrap gap-2">
              <Badge tone="slate">Prototype Integration</Badge>
              <Badge tone="slate">Parichay simulated</Badge>
              <Badge tone="slate">iGOT / NSSTA APIs simulated</Badge>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
