"use client";

import { useEffect, useRef } from "react";
import type { ViolationType } from "@/lib/assessment/scoring";

interface Options {
  /** Only monitor while true (i.e. while the attempt is running). */
  active: boolean;
  onViolation: (type: ViolationType, message?: string) => void;
  /** Called when fullscreen is lost so the page can show the blocking overlay. */
  onFullscreenChange: (isFullscreen: boolean) => void;
}

const BLOCKED_COMBOS = new Set(["c", "v", "x", "a", "p", "s", "u", "f", "i", "j", "k", "n", "t", "w", "h", "o", "r"]);

/**
 * Browser-side integrity monitoring for the assessment attempt.
 *
 * Detects: leaving full screen, tab switches / minimising, focus moving to
 * another application, copy/cut/paste, context menu, blocked shortcuts,
 * PrintScreen (clipboard is cleared), docked developer tools and browser
 * back navigation. Everything here is best-effort: a determined user with
 * another device is outside what a browser can see, which is why the camera
 * runs alongside.
 */
export function useAntiCheat({ active, onViolation, onFullscreenChange }: Options) {
  // Latest-callback ref so the listener effect only re-subscribes on `active`.
  const cb = useRef({ onViolation, onFullscreenChange });
  useEffect(() => {
    cb.current = { onViolation, onFullscreenChange };
  });

  useEffect(() => {
    if (!active) return;

    let focusLost = false;
    let blurTimer: number | undefined;

    const onFs = () => {
      const fs = !!document.fullscreenElement;
      cb.current.onFullscreenChange(fs);
      if (!fs) cb.current.onViolation("fullscreen-exit");
    };

    const onVisibility = () => {
      if (document.visibilityState === "hidden") {
        window.clearTimeout(blurTimer);
        if (!focusLost) {
          focusLost = true;
          cb.current.onViolation("tab-switch");
        }
      } else {
        focusLost = false;
      }
    };

    const onBlur = () => {
      // Give visibilitychange a moment to claim the event as a tab switch.
      blurTimer = window.setTimeout(() => {
        if (document.visibilityState === "visible" && !document.hasFocus() && !focusLost) {
          focusLost = true;
          cb.current.onViolation("window-blur");
        }
      }, 350);
    };
    const onFocus = () => {
      window.clearTimeout(blurTimer);
      focusLost = false;
    };

    const onClipboard = (e: ClipboardEvent) => {
      e.preventDefault();
      cb.current.onViolation("copy-paste", `${e.type[0].toUpperCase()}${e.type.slice(1)} is disabled during the assessment.`);
    };
    const onContext = (e: MouseEvent) => e.preventDefault();
    const onDrag = (e: DragEvent) => e.preventDefault();

    const onKeyDown = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      const mod = e.ctrlKey || e.metaKey;
      if (k === "f12" || k === "f11" || (mod && e.shiftKey && ["i", "j", "c"].includes(k)) || (mod && BLOCKED_COMBOS.has(k)) || (e.altKey && k === "d")) {
        e.preventDefault();
        e.stopPropagation();
        const combo = [mod ? (e.metaKey ? "Cmd" : "Ctrl") : "", e.shiftKey ? "Shift" : "", e.altKey ? "Alt" : "", e.key.length === 1 ? e.key.toUpperCase() : e.key]
          .filter(Boolean)
          .join("+");
        cb.current.onViolation("shortcut", `${combo} is disabled during the assessment.`);
      }
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.key === "PrintScreen") {
        navigator.clipboard?.writeText("").catch(() => undefined);
        cb.current.onViolation("shortcut", "Screen capture is not permitted during the assessment.");
      }
    };

    // Docked devtools shrink the viewport relative to the window while in full screen.
    let devtoolsFlagged = false;
    const devtoolsTimer = window.setInterval(() => {
      if (!document.fullscreenElement) return;
      const dw = window.outerWidth - window.innerWidth;
      const dh = window.outerHeight - window.innerHeight;
      if ((dw > 160 || dh > 160) && !devtoolsFlagged) {
        devtoolsFlagged = true;
        cb.current.onViolation("devtools");
      } else if (dw <= 160 && dh <= 160) {
        devtoolsFlagged = false;
      }
    }, 1000);

    // Trap browser back so a stray gesture cannot leave the attempt.
    const onPop = () => history.pushState(null, "", location.href);
    history.pushState(null, "", location.href);

    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };

    document.addEventListener("fullscreenchange", onFs);
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("blur", onBlur);
    window.addEventListener("focus", onFocus);
    document.addEventListener("copy", onClipboard);
    document.addEventListener("cut", onClipboard);
    document.addEventListener("paste", onClipboard);
    document.addEventListener("contextmenu", onContext);
    document.addEventListener("dragstart", onDrag);
    window.addEventListener("keydown", onKeyDown, true);
    window.addEventListener("keyup", onKeyUp, true);
    window.addEventListener("popstate", onPop);
    window.addEventListener("beforeunload", onBeforeUnload);

    return () => {
      window.clearTimeout(blurTimer);
      window.clearInterval(devtoolsTimer);
      document.removeEventListener("fullscreenchange", onFs);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("blur", onBlur);
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("copy", onClipboard);
      document.removeEventListener("cut", onClipboard);
      document.removeEventListener("paste", onClipboard);
      document.removeEventListener("contextmenu", onContext);
      document.removeEventListener("dragstart", onDrag);
      window.removeEventListener("keydown", onKeyDown, true);
      window.removeEventListener("keyup", onKeyUp, true);
      window.removeEventListener("popstate", onPop);
      window.removeEventListener("beforeunload", onBeforeUnload);
    };
  }, [active]);
}

export async function enterFullscreen(): Promise<boolean> {
  try {
    if (!document.fullscreenElement) await document.documentElement.requestFullscreen({ navigationUI: "hide" });
    return true;
  } catch {
    return false;
  }
}

export async function exitFullscreen(): Promise<void> {
  try {
    if (document.fullscreenElement) await document.exitFullscreen();
  } catch {
    /* ignore */
  }
}
