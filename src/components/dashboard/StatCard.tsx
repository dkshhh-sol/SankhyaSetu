import { Card } from "@/components/ui/Card";
import { IconTile, type TileTone } from "@/components/ui/IconTile";
import { LinkArrow } from "@/components/ui/LinkArrow";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

interface StatCardProps {
  icon: LucideIcon;
  tone: TileTone;
  title: string;
  value?: ReactNode;
  caption?: ReactNode;
  link?: { href: string; label: string };
  /** Custom body replacing the value/caption stack (e.g. a donut). */
  children?: ReactNode;
}

/** Compact KPI tile: ~110px tall with icon, label, prominent value and a caption/link. */
export function StatCard({ icon, tone, title, value, caption, link, children }: StatCardProps) {
  return (
    <Card className="flex flex-col px-4 py-3">
      <div className="flex items-center gap-2.5">
        <IconTile icon={icon} tone={tone} size="sm" rounded="full" />
        <h3 className="font-display text-sm font-semibold text-ink">{title}</h3>
      </div>
      {children ?? (
        <div className="mt-1.5">
          <p className="font-display text-[26px] font-bold leading-none text-ink">{value}</p>
          {caption && <p className="mt-1.5 text-xs text-ink-soft">{caption}</p>}
        </div>
      )}
      {link && (
        <div className="mt-auto pt-1.5">
          <LinkArrow href={link.href}>{link.label}</LinkArrow>
        </div>
      )}
    </Card>
  );
}
