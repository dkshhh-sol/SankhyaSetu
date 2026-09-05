import { redirect } from "next/navigation";

/** /onboarding is an alias for the first step of the flow. */
export default function OnboardingIndexPage() {
  redirect("/onboarding/profile");
}
