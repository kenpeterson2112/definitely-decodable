"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { useData } from "@/lib/store";
import { cx } from "@/lib/util";
import { Brand } from "@/components/ui";

interface NavItem {
  href: string;
  label: string;
  icon: ReactNode;
}

const ICON = "h-[18px] w-[18px]";

const NAV: NavItem[] = [
  {
    href: "/",
    label: "Dashboard",
    icon: (
      <svg className={ICON} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l9-9 9 9M5 10v10h5v-6h4v6h5V10" />
      </svg>
    ),
  },
  {
    href: "/students",
    label: "Students",
    icon: (
      <svg className={ICON} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-1a4 4 0 00-4-4M9 11a4 4 0 100-8 4 4 0 000 8zm0 0a6 6 0 00-6 6v1h12v-1a6 6 0 00-6-6zm7-1a3 3 0 100-6" />
      </svg>
    ),
  },
  {
    href: "/groups",
    label: "Groups",
    icon: (
      <svg className={ICON} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M7 8a3 3 0 100-6 3 3 0 000 6zm10 0a3 3 0 100-6 3 3 0 000 6zM2 20v-1a4 4 0 014-4h2a4 4 0 014 4v1M14 20v-1a4 4 0 014-4h0a4 4 0 014 4v1" />
      </svg>
    ),
  },
  {
    href: "/library",
    label: "Library",
    icon: (
      <svg className={ICON} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.5C10.5 5.5 8 5 5 5.5v13c3-.5 5.5 0 7 1 1.5-1 4-1.5 7-1v-13c-3-.5-5.5 0-7 1zm0 0v13" />
      </svg>
    ),
  },
];

function Wordmark() {
  return (
    <Link href="/" className="flex items-center">
      <Brand />
    </Link>
  );
}

function isActive(pathname: string, href: string): boolean {
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(href + "/");
}

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { resetData } = useData();

  return (
    <div className="flex min-h-screen">
      {/* Sidebar (desktop) */}
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r border-slate-200 bg-white px-3 py-4 md:flex">
        <div className="px-2">
          <Wordmark />
          <p className="mt-1 text-xs text-slate-400">Decoding intervention engine</p>
        </div>

        <nav className="mt-6 flex flex-col gap-1">
          {NAV.map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cx(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  active ? "bg-indigo-50 text-indigo-700" : "text-slate-600 hover:bg-slate-100",
                )}
              >
                <span className={active ? "text-indigo-600" : "text-slate-400"}>{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto px-2">
          <Link
            href="/library"
            className="flex items-center justify-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700"
          >
            <span className="text-base leading-none">✨</span> Generate passage
          </Link>
          <button
            onClick={resetData}
            className="mt-3 w-full text-left text-xs text-slate-400 transition-colors hover:text-slate-600"
          >
            Reset demo data
          </button>
        </div>
      </aside>

      {/* Main column */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Mobile top bar */}
        <header className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-slate-200 bg-white/90 px-4 py-3 backdrop-blur md:hidden">
          <Wordmark />
          <nav className="flex items-center gap-1 overflow-x-auto">
            {NAV.map((item) => {
              const active = isActive(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cx(
                    "rounded-md px-2 py-1 text-xs font-medium",
                    active ? "bg-indigo-50 text-indigo-700" : "text-slate-500",
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </header>

        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 md:px-8 md:py-8">{children}</main>
      </div>
    </div>
  );
}
