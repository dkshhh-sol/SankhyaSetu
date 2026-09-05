"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, LogOut, RotateCcw, Shield, UserCircle } from "lucide-react";
import { PageHeader } from "@/components/shell/PageHeader";
import { Card, CardHeader } from "@/components/ui/Card";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { IconTile } from "@/components/ui/IconTile";
import { Toggle } from "@/components/ui/Fields";
import { DEMO_ACCOUNTS } from "@/lib/demoAccounts";
import { useAppStore } from "@/lib/store/AppStore";
import { formatDate } from "@/lib/utils";

export default function SettingsPage() {
  const { session, state, dispatch, signOut } = useAppStore();
  const router = useRouter();
  const accent = DEMO_ACCOUNTS.find((a) => a.id === session?.accountId)?.accent ?? "blue";
  const [prefs, setPrefs] = useState({ verification: true, assessments: true, recommendations: false, digest: true });

  return (
    <div className="space-y-6">
      <PageHeader crumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Settings" }]} title="Settings" subtitle="Your profile, notification preferences and prototype controls." />

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.4fr_1fr]">
        <div className="space-y-4">
          <Card className="p-5 sm:p-6">
            <CardHeader icon={<IconTile icon={UserCircle} tone="blue" rounded="full" />} title="Profile" subtitle="Provided by Parichay at sign-in." />
            <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-center">
              <Avatar initials={session?.initials ?? "?"} tone={accent} size="lg" />
              <dl className="grid flex-1 grid-cols-1 gap-x-8 gap-y-2 text-sm sm:grid-cols-2">
                {[
                  ["Name", session?.name],
                  ["Email", session?.email],
                  ["Designation", session?.role],
                  ["Division", session?.division],
                  ["Sign-in method", session?.method === "parichay-sso" ? "Parichay SSO (simulated)" : "Demo account"],
                  ["Signed in", session ? formatDate(session.signedInAt, true) : ""],
                ].map(([k, v]) => (
                  <div key={k}>
                    <dt className="text-xs font-semibold uppercase tracking-wide text-ink-muted">{k}</dt>
                    <dd className="mt-0.5 font-medium text-ink">{v}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </Card>

          <Card className="p-5 sm:p-6">
            <CardHeader icon={<IconTile icon={Bell} tone="amber" rounded="full" />} title="Notifications" />
            <ul className="mt-4 divide-y divide-line">
              {[
                { k: "verification", t: "Evidence verification", d: "When a course completion is verified or needs attention." },
                { k: "assessments", t: "Assessment reminders", d: "When a new assessment is unlocked or a result is ready." },
                { k: "recommendations", t: "New recommendations", d: "When a programme matching a skill gap is added." },
                { k: "digest", t: "Weekly digest", d: "A summary of learning and competency changes." },
              ].map((n) => (
                <li key={n.k} className="flex items-center justify-between gap-4 py-3.5">
                  <div>
                    <p className="text-sm font-semibold text-ink">{n.t}</p>
                    <p className="text-xs text-ink-muted">{n.d}</p>
                  </div>
                  <Toggle checked={prefs[n.k as keyof typeof prefs]} onChange={(v) => setPrefs({ ...prefs, [n.k]: v })} />
                </li>
              ))}
            </ul>
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="p-5 sm:p-6">
            <CardHeader icon={<IconTile icon={Shield} tone="violet" rounded="full" />} title="Prototype controls" />
            <p className="mt-3 text-sm text-ink-soft">This build stores your journey (attempts, results, competency updates, studio assessments) in this browser tab only.</p>
            <dl className="mt-4 grid grid-cols-3 gap-3 text-center">
              {[
                ["Results", Object.keys(state.results).length],
                ["In progress", Object.keys(state.attempts).length],
                ["Studio", state.customAssessments.length],
              ].map(([k, v]) => (
                <div key={k} className="rounded-xl bg-surface p-3">
                  <dd className="font-display text-xl font-extrabold text-ink">{v}</dd>
                  <dt className="text-xs text-ink-muted">{k}</dt>
                </div>
              ))}
            </dl>
            <div className="mt-4 flex flex-col gap-2">
              <Button variant="outline" leftIcon={<RotateCcw className="size-4" />} onClick={() => dispatch({ type: "reset" })}>
                Reset demo journey
              </Button>
              <Button
                variant="ghost"
                leftIcon={<LogOut className="size-4" />}
                onClick={() => {
                  signOut();
                  router.replace("/");
                }}
              >
                Sign out
              </Button>
            </div>
          </Card>

          <Card className="p-5 sm:p-6">
            <CardHeader title="Integrations" />
            <ul className="mt-3 space-y-2 text-sm">
              {[
                ["Parichay SSO", "Simulated"],
                ["iGOT Karmayogi completion API", "Simulated"],
                ["NSSTA / TPAC programme records", "Simulated"],
                ["Competency framework (FRAC)", "Static snapshot"],
                ["Proctoring analysis", "On-device"],
              ].map(([k, v]) => (
                <li key={k} className="flex items-center justify-between gap-3">
                  <span className="text-ink-soft">{k}</span>
                  <Badge tone="slate">{v}</Badge>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
}
