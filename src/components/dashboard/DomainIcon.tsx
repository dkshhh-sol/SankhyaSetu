import { BarChart3, Cpu, FileCheck2, Landmark, Presentation, Sigma, type LucideIcon } from "lucide-react";
import { IconTile } from "@/components/ui/IconTile";
import type { Accent, DomainIcon as DomainIconKey } from "@/lib/data/competencies";

const ICONS: Record<DomainIconKey, LucideIcon> = {
  sigma: Sigma,
  "bar-chart": BarChart3,
  "file-check": FileCheck2,
  cpu: Cpu,
  presentation: Presentation,
  landmark: Landmark,
};

interface Props {
  icon: DomainIconKey;
  accent: Accent;
  size?: "sm" | "md";
}

export function DomainIcon({ icon, accent, size = "md" }: Props) {
  return <IconTile icon={ICONS[icon]} tone={accent} size={size} rounded="full" />;
}
