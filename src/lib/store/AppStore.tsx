"use client";

/**
 * Client-side application state for the prototype.
 *
 * Everything that would normally live behind an API (attempt state, results,
 * competency updates, studio-created assessments) is kept in React state and
 * mirrored to sessionStorage so a page reload mid-demo does not lose the
 * journey. The shape mirrors what a real backend would return so the UI
 * would not need to change when one is wired in.
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  type ReactNode,
} from "react";
import { getSession, signOut as clearSession, type Session } from "@/lib/auth";
import { ASSESSMENTS, type Assessment } from "@/lib/data/assessments";
import { SKILLS } from "@/lib/data/competencies";
import type { AssessmentResult, Violation } from "@/lib/assessment/scoring";

const STATE_KEY = "ss.state";

export interface AttemptState {
  assessmentId: string;
  /** Question ids in the order shown to this candidate. */
  order: string[];
  /** Per-question option order (indices into the original options). */
  optionOrder: Record<string, number[]>;
  /** Selected ORIGINAL option index per question id. */
  answers: Record<string, number>;
  flagged: string[];
  current: number;
  startedAt: number;
  deadline: number;
  violations: Violation[];
  /** Times the attempt page was (re)loaded. */
  loads: number;
}

export interface AppState {
  attempts: Record<string, AttemptState>;
  results: Record<string, AssessmentResult>;
  /** Skill levels changed by validated assessments. */
  skillLevels: Record<string, number>;
  customAssessments: Assessment[];
  readNotifications: string[];
  /** Id of the most recently completed assessment, for the Progress pages. */
  lastResultId?: string;
}

const initialState: AppState = {
  attempts: {},
  results: {},
  skillLevels: {},
  customAssessments: [],
  readNotifications: [],
};

type Action =
  | { type: "hydrate"; state: AppState }
  | { type: "attempt/start"; attempt: AttemptState }
  | { type: "attempt/update"; id: string; patch: Partial<AttemptState> }
  | { type: "attempt/violation"; id: string; violation: Violation }
  | { type: "attempt/finish"; result: AssessmentResult }
  | { type: "attempt/discard"; id: string }
  | { type: "assessment/create"; assessment: Assessment }
  | { type: "notifications/read"; ids: string[] }
  | { type: "reset" };

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case "hydrate":
      return { ...initialState, ...action.state };
    case "attempt/start":
      return { ...state, attempts: { ...state.attempts, [action.attempt.assessmentId]: action.attempt } };
    case "attempt/update": {
      const a = state.attempts[action.id];
      if (!a) return state;
      return { ...state, attempts: { ...state.attempts, [action.id]: { ...a, ...action.patch } } };
    }
    case "attempt/violation": {
      const a = state.attempts[action.id];
      if (!a) return state;
      return {
        ...state,
        attempts: { ...state.attempts, [action.id]: { ...a, violations: [...a.violations, action.violation] } },
      };
    }
    case "attempt/finish": {
      const { [action.result.assessmentId]: _done, ...attempts } = state.attempts;
      void _done;
      const skillLevels = { ...state.skillLevels };
      // Only a valid, passed attempt moves a competency (deltas are zero otherwise).
      for (const i of action.result.impact) {
        if (i.delta !== 0) skillLevels[i.skillId] = i.after;
      }
      return {
        ...state,
        attempts,
        results: { ...state.results, [action.result.assessmentId]: action.result },
        skillLevels,
        lastResultId: action.result.assessmentId,
      };
    }
    case "attempt/discard": {
      const { [action.id]: _gone, ...attempts } = state.attempts;
      void _gone;
      return { ...state, attempts };
    }
    case "assessment/create":
      return { ...state, customAssessments: [action.assessment, ...state.customAssessments] };
    case "notifications/read":
      return { ...state, readNotifications: Array.from(new Set([...state.readNotifications, ...action.ids])) };
    case "reset":
      return initialState;
    default:
      return state;
  }
}

interface StoreValue {
  state: AppState;
  hydrated: boolean;
  session: Session | null;
  /** Every assessment visible to the user (built-in + studio-created). */
  assessments: Assessment[];
  /** Current level of a skill including any validated updates. */
  skillLevel: (skillId: string) => number;
  currentLevels: Record<string, number>;
  dispatch: (action: Action) => void;
  signOut: () => void;
}

const StoreContext = createContext<StoreValue | null>(null);

export function AppStoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [hydrated, setHydrated] = useReducer(() => true, false);
  const [session, refreshSession] = useReducer(() => getSession(), null);

  // Hydrate from sessionStorage once on the client.
  useEffect(() => {
    try {
      const raw = window.sessionStorage.getItem(STATE_KEY);
      if (raw) dispatch({ type: "hydrate", state: JSON.parse(raw) as AppState });
    } catch {
      /* ignore corrupt state */
    }
    refreshSession();
    setHydrated();
  }, []);

  // Persist on every change after hydration.
  useEffect(() => {
    if (!hydrated) return;
    try {
      window.sessionStorage.setItem(STATE_KEY, JSON.stringify(state));
    } catch {
      /* storage may be unavailable */
    }
  }, [state, hydrated]);

  // Keep the session in sync when auth changes in this tab.
  useEffect(() => {
    const onChange = () => refreshSession();
    window.addEventListener("ss:session", onChange);
    window.addEventListener("storage", onChange);
    return () => {
      window.removeEventListener("ss:session", onChange);
      window.removeEventListener("storage", onChange);
    };
  }, []);

  const assessments = useMemo(
    () => [...state.customAssessments, ...ASSESSMENTS],
    [state.customAssessments],
  );

  const currentLevels = useMemo(() => {
    const levels: Record<string, number> = {};
    for (const s of SKILLS) levels[s.id] = state.skillLevels[s.id] ?? s.level;
    return levels;
  }, [state.skillLevels]);

  const skillLevel = useCallback((id: string) => currentLevels[id] ?? 0, [currentLevels]);

  const signOut = useCallback(() => {
    clearSession();
    dispatch({ type: "reset" });
    try {
      window.sessionStorage.removeItem(STATE_KEY);
    } catch {
      /* ignore */
    }
    window.dispatchEvent(new Event("ss:session"));
  }, []);

  const value = useMemo<StoreValue>(
    () => ({ state, hydrated, session, assessments, skillLevel, currentLevels, dispatch, signOut }),
    [state, hydrated, session, assessments, skillLevel, currentLevels, signOut],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useAppStore(): StoreValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useAppStore must be used within AppStoreProvider");
  return ctx;
}

/** Notify the store that the session changed (called after sign-in). */
export function announceSessionChange() {
  if (typeof window !== "undefined") window.dispatchEvent(new Event("ss:session"));
}
