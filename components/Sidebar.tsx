"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { useStore } from "@/lib/store";

const NAV_GROUPS: { heading: string; items: { href: string; label: string; icon: string }[] }[] = [
  {
    heading: "Overview",
    items: [
      { href: "/", label: "Dashboard", icon: "📊" },
      { href: "/collection", label: "Collection", icon: "📚" },
    ],
  },
  {
    heading: "Pipeline",
    items: [
      { href: "/cleaning", label: "Cleaning", icon: "🧹" },
      { href: "/clusters", label: "Clusters", icon: "🗂️" },
      { href: "/keywords", label: "Keywords", icon: "🏷️" },
    ],
  },
  {
    heading: "Insights",
    items: [
      { href: "/trends", label: "Trends", icon: "📈" },
      { href: "/gaps", label: "Gaps", icon: "🕳️" },
      { href: "/comparison", label: "LDA vs BERTopic", icon: "⚖️" },
      { href: "/coherence", label: "Coherence", icon: "🎯" },
    ],
  },
  {
    heading: "People & AI",
    items: [
      { href: "/validation", label: "Adviser Validation", icon: "🗳️" },
      { href: "/summaries", label: "AI Summaries", icon: "✨" },
    ],
  },
];

const ALL_NAV = NAV_GROUPS.flatMap((g) => g.items);

function SearchBox({ onNavigate }: { onNavigate?: () => void }) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (q.trim()) {
      router.push(`/search?q=${encodeURIComponent(q.trim())}`);
      onNavigate?.();
    }
  };
  return (
    <form onSubmit={submit} className="relative">
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search theses, topics, keywords…"
        className="input pr-9"
        aria-label="Search"
      />
      <button
        type="submit"
        className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-brand-600"
        aria-label="Search"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" />
        </svg>
      </button>
    </form>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const { analyzing } = useStore();

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-slate-200 bg-white md:flex">
        <div className="flex items-center gap-2 border-b border-slate-100 px-5 py-4">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 text-lg font-bold text-white">
            T
          </span>
          <div className="leading-tight">
            <p className="text-sm font-bold text-slate-900">Thesis Recommender</p>
            <p className="text-[11px] text-slate-400">BSCS Topic Finder</p>
          </div>
        </div>

        {analyzing && (
          <div className="flex items-center gap-2 border-b border-amber-100 bg-amber-50 px-4 py-2 text-xs font-medium text-amber-700">
            <span className="h-2 w-2 animate-pulse rounded-full bg-amber-500" />
            Re-analyzing corpus…
          </div>
        )}

        <nav className="flex-1 overflow-y-auto px-3 py-4">
          {NAV_GROUPS.map((group) => (
            <div key={group.heading} className="mb-4">
              <p className="mb-1 px-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                {group.heading}
              </p>
              <ul className="space-y-0.5">
                {group.items.map((item) => {
                  const active = pathname === item.href;
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className={`flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium transition ${
                          active ? "bg-brand-50 text-brand-700" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                        }`}
                      >
                        <span className="text-base">{item.icon}</span>
                        {item.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        <div className="border-t border-slate-100 p-3">
          <SearchBox />
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="sticky top-0 z-20 border-b border-slate-200 bg-white md:hidden">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-sm font-bold text-white">
              T
            </span>
            <p className="text-sm font-bold text-slate-900">Thesis Recommender</p>
          </div>
          {analyzing && (
            <span className="flex items-center gap-1 text-[10px] font-semibold text-amber-600">
              <span className="h-2 w-2 animate-pulse rounded-full bg-amber-500" />
              analyzing…
            </span>
          )}
        </div>
        <div className="flex gap-1 overflow-x-auto px-3 pb-2">
          {ALL_NAV.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                  active ? "bg-brand-600 text-white" : "bg-slate-100 text-slate-600"
                }`}
              >
                {item.icon} {item.label}
              </Link>
            );
          })}
        </div>
        <div className="px-3 pb-3">
          <SearchBox />
        </div>
      </div>
    </>
  );
}
