import { HeroPanel } from "@/components/login/HeroPanel";
import { LoginPanel } from "@/components/login/LoginPanel";

/**
 * Login / landing screen.
 *
 * Two-panel split on large screens (brand hero | sign-in), matching the
 * 54/46 proportion of the design. On small screens the panels stack with the
 * sign-in form on top (flex-col-reverse) so the primary action stays
 * reachable without scrolling.
 */
export default function LoginPage() {
  return (
    <main className="flex min-h-screen flex-col-reverse lg:grid lg:h-screen lg:grid-cols-[54fr_46fr] lg:grid-rows-1 lg:overflow-hidden">
      <HeroPanel />
      <LoginPanel />
    </main>
  );
}
