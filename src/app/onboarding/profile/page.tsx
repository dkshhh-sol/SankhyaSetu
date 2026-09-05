"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, UserRound } from "lucide-react";
import { OnboardingFrame } from "@/components/onboarding/OnboardingFrame";
import { Button } from "@/components/ui/Button";
import { Label, Select, TextInput } from "@/components/ui/Fields";
import { DEPARTMENTS, EXPERIENCE_BANDS, QUALIFICATIONS } from "@/lib/data/onboarding";
import { useAppStore, type OnboardingProfile } from "@/lib/store/AppStore";

/** Step 1 — who the official is. Kept short; this is not a full HR record. */
export default function OnboardingProfilePage() {
  const { state, hydrated } = useAppStore();

  // Mount the form only once state is hydrated, so a reload mid-flow
  // pre-fills from what was already entered instead of blank fields.
  if (!hydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <span
          className="size-8 animate-spin rounded-full border-[3px] border-brand-200 border-t-brand-600"
          aria-label="Loading"
        />
      </div>
    );
  }
  return <ProfileForm saved={state.onboarding.profile} />;
}

function ProfileForm({ saved }: { saved?: OnboardingProfile }) {
  const router = useRouter();
  const { dispatch } = useAppStore();

  const [form, setForm] = useState<OnboardingProfile>({
    fullName: saved?.fullName ?? "",
    designation: saved?.designation ?? "",
    department: saved?.department ?? DEPARTMENTS[0],
    experience: saved?.experience ?? EXPERIENCE_BANDS[1],
    qualification: saved?.qualification ?? QUALIFICATIONS[1],
  });
  const [touched, setTouched] = useState(false);

  const set = <K extends keyof OnboardingProfile>(key: K, value: OnboardingProfile[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const nameOk = form.fullName.trim().length > 1;
  const designationOk = form.designation.trim().length > 1;
  const valid = nameOk && designationOk;

  function handleContinue() {
    setTouched(true);
    if (!valid) return;
    dispatch({ type: "onboarding/profile", profile: { ...form, fullName: form.fullName.trim() } });
    router.push("/onboarding/role");
  }

  return (
    <OnboardingFrame
      step={1}
      title="Create your competency profile"
      subtitle="A few details about you, then a short baseline assessment. Takes about three minutes."
      footer={
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs text-ink-muted">Step 1 of 7 &middot; Basic Profile</p>
          <Button onClick={handleContinue} rightIcon={<ArrowRight className="size-4" />}>
            Continue
          </Button>
        </div>
      }
    >
      <div className="mb-4 flex items-start gap-3 rounded-xl bg-surface p-3">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
          <UserRound className="size-[18px]" aria-hidden />
        </span>
        <div>
          <p className="text-[13px] font-semibold text-ink">Basic Profile</p>
          <p className="text-xs text-ink-muted">
            Used to personalise your dashboard. Nothing here affects your competency score.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-x-5 gap-y-3.5 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Label htmlFor="ob-name">Full Name</Label>
          <TextInput
            id="ob-name"
            value={form.fullName}
            placeholder="e.g. Ananya Iyer"
            autoComplete="name"
            onChange={(e) => set("fullName", e.target.value)}
            aria-invalid={touched && !nameOk ? true : undefined}
          />
          {touched && !nameOk && (
            <p className="mt-1 text-[11px] font-medium text-red-600">Please enter your full name.</p>
          )}
        </div>

        <div>
          <Label htmlFor="ob-designation">Designation</Label>
          <TextInput
            id="ob-designation"
            value={form.designation}
            placeholder="e.g. Junior Statistical Officer"
            onChange={(e) => set("designation", e.target.value)}
            aria-invalid={touched && !designationOk ? true : undefined}
          />
          {touched && !designationOk && (
            <p className="mt-1 text-[11px] font-medium text-red-600">Please enter your designation.</p>
          )}
        </div>

        <div>
          <Label htmlFor="ob-dept">Department / Organisation</Label>
          <Select
            id="ob-dept"
            value={form.department}
            onChange={(e) => set("department", e.target.value)}
          >
            {DEPARTMENTS.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </Select>
        </div>

        <div>
          <Label htmlFor="ob-exp">Years of Experience</Label>
          <Select id="ob-exp" value={form.experience} onChange={(e) => set("experience", e.target.value)}>
            {EXPERIENCE_BANDS.map((x) => (
              <option key={x} value={x}>
                {x}
              </option>
            ))}
          </Select>
        </div>

        <div>
          <Label htmlFor="ob-qual">Educational Qualification</Label>
          <Select
            id="ob-qual"
            value={form.qualification}
            onChange={(e) => set("qualification", e.target.value)}
          >
            {QUALIFICATIONS.map((q) => (
              <option key={q} value={q}>
                {q}
              </option>
            ))}
          </Select>
        </div>
      </div>

      <p className="mt-4 text-[11px] leading-relaxed text-ink-muted">
        Prototype notice: this onboarding flow is simulated. No Parichay account is created and no
        data leaves your browser.
      </p>
    </OnboardingFrame>
  );
}
