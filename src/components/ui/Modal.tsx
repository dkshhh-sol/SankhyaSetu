"use client";

import { cn } from "@/lib/cn";
import { X } from "lucide-react";
import { useEffect, type ReactNode } from "react";

interface ModalProps {
  open: boolean;
  onClose?: () => void;
  title?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
  /** Hide the close affordance (used for blocking proctoring dialogs). */
  dismissible?: boolean;
  tone?: "default" | "danger";
}

export function Modal({ open, onClose, title, children, footer, className, dismissible = true, tone = "default" }: ModalProps) {
  useEffect(() => {
    if (!open || !dismissible) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose?.();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, dismissible, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <div
        className="absolute inset-0 bg-ink/50 backdrop-blur-sm"
        onClick={dismissible ? onClose : undefined}
        aria-hidden
      />
      <div
        className={cn(
          "relative w-full max-w-lg animate-fade-up rounded-3xl bg-white p-6 shadow-pop sm:p-7",
          tone === "danger" && "border-2 border-red-200",
          className,
        )}
      >
        {(title || dismissible) && (
          <div className="mb-4 flex items-start justify-between gap-4">
            {title && <h2 className="font-display text-xl font-bold text-ink">{title}</h2>}
            {dismissible && (
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg p-1.5 text-ink-muted hover:bg-slate-100"
                aria-label="Close"
              >
                <X className="size-5" />
              </button>
            )}
          </div>
        )}
        <div className="text-sm text-ink-soft">{children}</div>
        {footer && <div className="mt-6 flex flex-wrap justify-end gap-3">{footer}</div>}
      </div>
    </div>
  );
}
