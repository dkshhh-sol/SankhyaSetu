import { BarChart3, BookOpen, BadgeCheck, Users } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { FeatureBadge } from "@/components/login/FeatureBadge";

const FEATURES = [
  { icon: BarChart3, label: "Build Competencies", accent: "blue" as const },
  { icon: BookOpen, label: "Enable Continuous Learning", accent: "emerald" as const },
  { icon: BadgeCheck, label: "Verify with Evidence", accent: "violet" as const },
  { icon: Users, label: "Stronger Statistical Workforce", accent: "amber" as const },
];

/**
 * Brand panel on the left of the login screen (stacked below the form on
 * small screens). The North Block photograph from the design sits at the
 * bottom edge; the quote card is a live element positioned over it using
 * container-query units so it tracks the photo at every width.
 */
export function HeroPanel() {
  return (
    <section className="relative isolate overflow-hidden bg-gradient-to-b from-[#f3f7fd] via-[#eaf1fb] to-[#e6edf6] [container-type:inline-size] lg:h-full lg:min-h-0">
      {/* Sky glow */}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-2/3 bg-[radial-gradient(60%_50%_at_30%_0%,rgba(255,255,255,0.9),transparent)]" />

      {/* Dotted connector arc (upper part; the photo carries the rest) */}
      <svg
        aria-hidden
        className="pointer-events-none absolute right-[6%] top-[42%] hidden w-[22%] text-brand-400/60 lg:block"
        viewBox="0 0 200 160"
        fill="none"
      >
        <path d="M60 4 Q 150 30 120 110 T 40 150" stroke="currentColor" strokeWidth="1.5" strokeDasharray="2 7" strokeLinecap="round" />
        <circle cx="60" cy="4" r="4" fill="currentColor" />
        <circle cx="126" cy="70" r="3" fill="currentColor" />
      </svg>

      <div className="relative z-10 flex min-h-full flex-col px-6 pt-8 sm:px-10 sm:pt-10 lg:h-full lg:min-h-0 lg:px-12 lg:pt-7">
        {/* Brand + strapline */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <Logo wordmarkClassName="text-2xl sm:text-[28px]" />
          <div className="hidden h-10 w-px bg-ink/15 sm:block" />
          <p className="text-sm font-medium leading-snug text-ink-soft sm:text-[15px]">
            Strengthening
            <br className="hidden sm:block" /> Statistical Workforce
            <br className="hidden sm:block" /> for a Data-Driven India
          </p>
        </div>

        {/* Headline */}
        <div className="mt-10 max-w-xl lg:mt-6">
          <h1 className="font-display text-[44px] font-extrabold leading-[1.02] tracking-tight text-ink sm:text-6xl lg:text-[clamp(40px,6.4vh,64px)]">
            Empowering
            <br />
            People Behind
            <br />
            <span className="text-brand-600">India&rsquo;s Data</span>
          </h1>
          <p className="mt-4 max-w-lg text-base leading-relaxed text-ink-soft sm:text-lg lg:text-base">
            An AI-enabled platform for competency development, learning, and
            evidence-based workforce intelligence for the Official Statistical
            System.
          </p>
        </div>

        {/* Feature badges */}
        <div className="mt-8 flex flex-wrap gap-x-4 gap-y-6 sm:gap-x-8 lg:mt-6">
          {FEATURES.map((f) => (
            <FeatureBadge key={f.label} {...f} />
          ))}
        </div>

        {/* Photo strip pinned to the bottom */}
        <div className="relative mt-8 -mx-6 sm:-mx-10 lg:-mx-12 lg:mt-auto lg:shrink-0">
          <img
            src="/images/login-hero.jpg"
            alt="North Block, New Delhi"
            className="block w-full select-none lg:h-[min(36vh,320px)] lg:object-cover lg:object-[center_30%]"
            draggable={false}
          />
          {/* Blend the photo's top edge into the sky gradient */}
          <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-[18%] bg-gradient-to-b from-[#eaf1fb] to-transparent" />

          {/* Live quote card, positioned in container-width units so it tracks the photo */}
          <figure className="absolute left-[4.5cqw] bottom-[6.5cqw] w-[28cqw] min-w-[150px] max-w-[280px] rounded-[1.4cqw] border border-white/40 bg-ink/45 px-[2.2cqw] py-[1.8cqw] text-white shadow-lg backdrop-blur-md">
            <blockquote className="font-medium leading-relaxed [font-size:clamp(11px,1.65cqw,16px)]">
              <span aria-hidden className="mr-1 text-white/70">&ldquo;</span>
              Better data.
              <br />
              Brighter decisions.
              <br />
              <span className="text-white/85">
                <span className="mr-1 inline-block w-4 border-t border-white/60 align-middle" />
                A stronger India.
              </span>
            </blockquote>
          </figure>
        </div>
      </div>
    </section>
  );
}
