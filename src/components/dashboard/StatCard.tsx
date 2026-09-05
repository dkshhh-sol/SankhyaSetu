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

export function StatCard({ icon, tone, title, value, caption, link, children }: StatCardProps) {
  return (
    <Card className="flex flex-col p-5">
      <div className="flex items-center gap-3">
        <IconTile icon={icon} tone={tone} rounded="full" />
        <h3 className="font-display text-[15px] font-bold text-ink">{title}</h3>
      </div>
      {children ?? (
        <div className="mt-3">
          <p className="font-display text-[40px] font-extrabold leading-none text-ink">{value}</p>
          {caption && <p className="mt-2 text-sm text-ink-soft">{caption}</p>}
        </div>
      )}
      {link && (
        <div className="mt-auto pt-3">
          <LinkArrow href={link.href}>{link.label}</LinkArrow>
        </div>
      )}
    </Card>
  );
}
