"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { Bell, ChevronDown, LogOut, Menu, Search, Settings, User } from "lucide-react";
import { cn } from "@/lib/cn";
import { Logo } from "@/components/brand/Logo";
import { MinistryEmblem } from "@/components/brand/MinistryEmblem";
import { Avatar } from "@/components/ui/Avatar";
import { SEARCH_INDEX } from "@/components/shell/nav";
import { COURSES } from "@/lib/data/courses";
import { NOTIFICATIONS } from "@/lib/data/activity";
import { DEMO_ACCOUNTS } from "@/lib/demoAccounts";
import { useAppStore } from "@/lib/store/AppStore";

interface HeaderProps {
  onMenu: () => void;
}

export function Header({ onMenu }: HeaderProps) {
  const { session, state, dispatch, signOut } = useAppStore();
  const router = useRouter();
  const accent = DEMO_ACCOUNTS.find((a) => a.id === session?.accountId)?.accent ?? "blue";

  const unread = NOTIFICATIONS.filter((n) => n.unread && !state.readNotifications.includes(n.id)).length;

  function handleSignOut() {
    signOut();
    router.replace("/");
  }

  return (
    <header className="sticky top-0 z-30 h-14 border-b border-line bg-white/90 backdrop-blur">
      <div className="flex h-full items-center gap-3 px-4 sm:px-5">
        <button
          type="button"
          onClick={onMenu}
          className="rounded-lg p-2 text-ink-soft hover:bg-slate-100 lg:hidden"
          aria-label="Open menu"
        >
          <Menu className="size-5" />
        </button>

        <Link href="/dashboard" className="shrink-0 lg:w-[204px]">
          <Logo wordmarkClassName="text-lg" />
        </Link>

        <div className="hidden h-8 w-px bg-line lg:block" />
        <MinistryEmblem compact className="hidden xl:flex" />

        <SearchBox className="ml-auto hidden md:flex" />

        <div className="ml-auto flex items-center gap-1 md:ml-4">
          <NotificationsMenu
            unread={unread}
            onOpen={() => dispatch({ type: "notifications/read", ids: NOTIFICATIONS.map((n) => n.id) })}
          />
          <div className="mx-1 hidden h-6 w-px bg-line sm:block" />
          <UserMenu
            name={session?.name ?? "Guest"}
            role={session?.role ?? ""}
            initials={session?.initials ?? "?"}
            accent={accent}
            onSignOut={handleSignOut}
          />
        </div>
      </div>
    </header>
  );
}

/* ---------------------------------------------------------------- */

function useClickOutside<T extends HTMLElement>(open: boolean, onClose: () => void) {
  const ref = useRef<T>(null);
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);
  return ref;
}

function SearchBox({ className }: { className?: string }) {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const ref = useClickOutside<HTMLDivElement>(open, () => setOpen(false));

  const results = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return [];
    const pages = SEARCH_INDEX.filter((i) => i.label.toLowerCase().includes(s)).slice(0, 4);
    const courses = COURSES.filter((c) => c.title.toLowerCase().includes(s) || c.category.toLowerCase().includes(s))
      .slice(0, 5)
      .map((c) => ({ label: c.title, href: `/learning/${c.id}`, group: `${c.provider} course` }));
    return [...pages, ...courses];
  }, [q]);

  function go(href: string) {
    setOpen(false);
    setQ("");
    router.push(href);
  }

  return (
    <div ref={ref} className={cn("relative w-full max-w-sm 2xl:max-w-lg", className)}>
      <div className="flex h-9 items-center gap-2 rounded-lg border border-line bg-surface px-3">
        <Search className="size-4 shrink-0 text-ink-muted" aria-hidden />
        <input
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && results[0]) go(results[0].href);
          }}
          placeholder="Search competencies, courses or programmes..."
          className="w-full bg-transparent text-sm text-ink placeholder:text-ink-muted/80 focus:outline-none"
          aria-label="Search"
        />
      </div>
      {open && q.trim() && (
        <div className="absolute left-0 right-0 top-full z-40 mt-2 overflow-hidden rounded-2xl border border-line bg-white p-1.5 shadow-pop">
          {results.length === 0 ? (
            <p className="px-3 py-3 text-sm text-ink-muted">No matches for &ldquo;{q}&rdquo;.</p>
          ) : (
            results.map((r) => (
              <button
                key={r.href + r.label}
                type="button"
                onClick={() => go(r.href)}
                className="flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-left text-sm hover:bg-brand-50"
              >
                <span className="font-medium text-ink">{r.label}</span>
                <span className="shrink-0 text-xs text-ink-muted">{r.group}</span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}

function NotificationsMenu({ unread, onOpen }: { unread: number; onOpen: () => void }) {
  const [open, setOpen] = useState(false);
  const ref = useClickOutside<HTMLDivElement>(open, () => setOpen(false));
  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => {
          setOpen((o) => !o);
          if (!open) onOpen();
        }}
        className="relative rounded-lg p-1.5 text-ink-soft hover:bg-slate-100"
        aria-label={`Notifications${unread ? `, ${unread} unread` : ""}`}
        aria-expanded={open}
      >
        <Bell className="size-[18px]" strokeWidth={1.9} />
        {unread > 0 && (
          <span className="absolute right-1 top-1 size-2 rounded-full bg-red-500 ring-2 ring-white" aria-hidden />
        )}
      </button>
      {open && (
        <div className="absolute right-0 top-full z-40 mt-2 w-[min(92vw,380px)] overflow-hidden rounded-2xl border border-line bg-white shadow-pop">
          <div className="flex items-center justify-between border-b border-line px-4 py-3">
            <p className="font-display text-sm font-bold text-ink">Notifications</p>
            <span className="text-xs text-ink-muted">{NOTIFICATIONS.length} recent</span>
          </div>
          <ul className="max-h-96 overflow-y-auto scrollbar-thin">
            {NOTIFICATIONS.map((n) => (
              <li key={n.id} className="border-b border-line last:border-0">
                <Link href={n.href} onClick={() => setOpen(false)} className="block px-4 py-3 hover:bg-brand-50/60">
                  <p className="text-sm font-semibold text-ink">{n.title}</p>
                  <p className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-ink-soft">{n.body}</p>
                  <p className="mt-1 text-[11px] text-ink-muted">{n.when}</p>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

interface UserMenuProps {
  name: string;
  role: string;
  initials: string;
  accent: "blue" | "emerald" | "violet";
  onSignOut: () => void;
}

function UserMenu({ name, role, initials, accent, onSignOut }: UserMenuProps) {
  const [open, setOpen] = useState(false);
  const ref = useClickOutside<HTMLDivElement>(open, () => setOpen(false));
  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 rounded-lg px-1.5 py-1 hover:bg-slate-100"
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <Avatar initials={initials} tone={accent} />
        <span className="hidden text-left sm:block">
          <span className="block whitespace-nowrap text-[13px] font-semibold leading-tight text-ink">{name}</span>
          <span className="block text-[11px] text-ink-muted">{role}</span>
        </span>
        <ChevronDown className="hidden size-4 text-ink-muted sm:block" aria-hidden />
      </button>
      {open && (
        <div role="menu" className="absolute right-0 top-full z-40 mt-2 w-56 overflow-hidden rounded-2xl border border-line bg-white p-1.5 shadow-pop">
          <div className="px-3 py-2 sm:hidden">
            <p className="text-sm font-bold text-ink">{name}</p>
            <p className="text-xs text-ink-muted">{role}</p>
          </div>
          <Link href="/competency" role="menuitem" onClick={() => setOpen(false)} className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-ink-soft hover:bg-brand-50">
            <User className="size-4" /> My profile
          </Link>
          <Link href="/settings" role="menuitem" onClick={() => setOpen(false)} className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-ink-soft hover:bg-brand-50">
            <Settings className="size-4" /> Settings
          </Link>
          <button type="button" role="menuitem" onClick={onSignOut} className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-red-600 hover:bg-red-50">
            <LogOut className="size-4" /> Sign out
          </button>
        </div>
      )}
    </div>
  );
}
