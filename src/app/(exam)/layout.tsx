"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/lib/store/AppStore";

/** Chrome-less frame for the full-screen assessment attempt. */
export default function ExamLayout({ children }: { children: ReactNode }) {
  const { hydrated, session } = useAppStore();
  const router = useRouter();

  useEffect(() => {
    if (hydrated && !session) router.replace("/");
  }, [hydrated, session, router]);

  if (!hydrated || !session) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface">
        <span className="size-8 animate-spin rounded-full border-[3px] border-brand-200 border-t-brand-600" aria-label="Loading" />
      </div>
    );
  }
  return <>{children}</>;
}
