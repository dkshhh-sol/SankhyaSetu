"use client";

import { useEffect, useState, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Header } from "@/components/shell/Header";
import { Sidebar } from "@/components/shell/Sidebar";
import { useAppStore } from "@/lib/store/AppStore";

/**
 * Authenticated application frame: sticky header, sidebar (drawer on small
 * screens) and the page canvas. Redirects to the login screen when there is
 * no prototype session.
 */
export function AppShell({ children }: { children: ReactNode }) {
  const { hydrated, session } = useAppStore();
  const router = useRouter();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (hydrated && !session) router.replace("/");
  }, [hydrated, session, router]);

  if (!hydrated || !session) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <span className="size-8 animate-spin rounded-full border-[3px] border-brand-200 border-t-brand-600" aria-label="Loading" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface">
      <Header onMenu={() => setMenuOpen(true)} />
      <div className="flex">
        <Sidebar open={menuOpen} onClose={() => setMenuOpen(false)} />
        <main className="min-w-0 flex-1 px-4 pb-16 pt-6 sm:px-6 lg:px-8 lg:pt-7">
          <div key={pathname} className="mx-auto max-w-[1320px] animate-fade-up">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
