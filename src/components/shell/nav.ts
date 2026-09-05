import {
  BarChart3,
  BookOpen,
  CircleUser,
  ClipboardCheck,
  HelpCircle,
  Home,
  Settings,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

export const PRIMARY_NAV: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/competency", label: "My Competency", icon: CircleUser },
  { href: "/learning", label: "Learning Recommendations", icon: BookOpen },
  { href: "/evidence", label: "Learning Evidence", icon: ShieldCheck },
  { href: "/assessments", label: "Assessments", icon: ClipboardCheck },
  { href: "/progress", label: "Progress", icon: BarChart3 },
];

export const SECONDARY_NAV: NavItem[] = [
  { href: "/help", label: "Help & Support", icon: HelpCircle },
  { href: "/settings", label: "Settings", icon: Settings },
];

/** Searchable index used by the header search box. */
export const SEARCH_INDEX: Array<{ label: string; href: string; group: string }> = [
  ...PRIMARY_NAV.map((n) => ({ label: n.label, href: n.href, group: "Pages" })),
  ...SECONDARY_NAV.map((n) => ({ label: n.label, href: n.href, group: "Pages" })),
  { label: "Assessment Studio", href: "/assessments/studio", group: "Pages" },
  { label: "Competency Update", href: "/progress/update", group: "Pages" },
];
