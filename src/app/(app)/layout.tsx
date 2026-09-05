import { AppShell } from "@/components/shell/AppShell";
import type { ReactNode } from "react";

export default function AuthenticatedLayout({ children }: { children: ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
