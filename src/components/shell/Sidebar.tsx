"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { X } from "lucide-react";
import { cn } from "@/lib/cn";
import { Logo } from "@/components/brand/Logo";
import { PRIMARY_NAV, SECONDARY_NAV, type NavItem } from "@/components/shell/nav";

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export function Sidebar({ open, onClose }: SidebarProps) {
  const pathname = usePathname();

  const isActive = (href: string) =>
    pathname === href || (href !== "/dashboard" && pathname.startsWith(href + "/")) || (href === "/progress" && pathname.startsWith("/progress"));

  const renderItem = (item: NavItem) => {
    const active = isActive(item.href);
    return (
      <li key={item.href}>
        <Link
          href={item.href}
          onClick={onClose}
          aria-current={active ? "page" : undefined}
          className={cn(
            "relative flex h-10 items-center gap-2.5 rounded-r-lg pl-5 pr-3 text-sm font-medium transition-colors",
            active
              ? "bg-brand-50 text-brand-700 before:absolute before:inset-y-2 before:left-0 before:w-[3px] before:rounded-r before:bg-brand-600"
              : "text-ink-soft hover:bg-slate-100/80 hover:text-ink",
          )}
        >
          <item.icon className={cn("size-[18px] shrink-0", active ? "text-brand-600" : "text-ink-muted")} strokeWidth={1.9} aria-hidden />
          <span className="leading-tight">{item.label}</span>
        </Link>
      </li>
    );
  };

  return (
    <>
      {/* Backdrop for the mobile drawer */}
      <div
        className={cn(
          "fixed inset-0 z-40 bg-ink/40 backdrop-blur-sm transition-opacity lg:hidden",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={onClose}
        aria-hidden
      />
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-[228px] flex-col border-r border-line bg-[#f7f9fc] transition-transform duration-300 lg:sticky lg:top-14 lg:z-0 lg:h-[calc(100vh-56px)] lg:translate-x-0 lg:bg-transparent",
          open ? "translate-x-0" : "-translate-x-full",
        )}
        aria-label="Primary navigation"
      >
        {/* Mobile-only brand + close */}
        <div className="flex items-center justify-between px-5 pt-4 lg:hidden">
          <Logo wordmarkClassName="text-lg" />
          <button type="button" onClick={onClose} className="rounded-lg p-2 text-ink-muted hover:bg-slate-100" aria-label="Close menu">
            <X className="size-5" />
          </button>
        </div>

        <nav className="mt-3 flex-1 overflow-y-auto pr-3 lg:mt-3">
          <ul className="space-y-0.5">{PRIMARY_NAV.map(renderItem)}</ul>
          <div className="mx-5 my-3 h-px bg-line" />
          <ul className="space-y-0.5">{SECONDARY_NAV.map(renderItem)}</ul>
        </nav>

        {/* India map + tagline pinned to the bottom, as in the design */}
        <div className="relative shrink-0 px-5 pb-5 pt-3">
          <img
            src="/images/india-map.png"
            alt=""
            aria-hidden
            draggable={false}
            className="pointer-events-none absolute -top-32 left-3 w-32 opacity-[0.16] select-none"
          />
          <p className="relative font-display text-[13px] font-semibold leading-snug text-ink-soft">
            Data
            <br />
            People
            <br />
            Progress
            <br />
            <span className="text-brand-600">for a Viksit Bharat</span>
          </p>
          <div className="relative mt-1.5 flex h-1 w-24 overflow-hidden rounded-full" aria-hidden>
            <span className="flex-1 bg-[#ff9933]" />
            <span className="flex-1 bg-white" />
            <span className="flex-1 bg-[#138808]" />
          </div>
        </div>
      </aside>
    </>
  );
}
