"use client";

import { ReactNode } from "react";

export function PageHeader({
  title,
  subtitle,
  icon,
  actions,
}: {
  title: string;
  subtitle?: string;
  icon?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-extrabold tracking-tight text-slate-900">
          {icon && <span>{icon}</span>}
          {title}
        </h1>
        {subtitle && <p className="mt-1 max-w-3xl text-sm text-slate-500">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

export function Card({ title, children, className = "" }: { title?: string; children: ReactNode; className?: string }) {
  return (
    <div className={`card ${className}`}>
      {title && <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-500">{title}</h3>}
      {children}
    </div>
  );
}

export function StatCard({
  label,
  value,
  hint,
  accent = "text-brand-700",
}: {
  label: string;
  value: ReactNode;
  hint?: string;
  accent?: string;
}) {
  return (
    <div className="card flex flex-col gap-1">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</p>
      <p className={`text-3xl font-extrabold ${accent}`}>{value}</p>
      {hint && <p className="text-xs text-slate-400">{hint}</p>}
    </div>
  );
}

export function Badge({ children, tone = "slate" }: { children: ReactNode; tone?: string }) {
  const tones: Record<string, string> = {
    slate: "bg-slate-100 text-slate-600",
    green: "bg-emerald-100 text-emerald-700",
    amber: "bg-amber-100 text-amber-700",
    rose: "bg-rose-100 text-rose-700",
    brand: "bg-brand-50 text-brand-700",
    violet: "bg-violet-100 text-violet-700",
  };
  return <span className={`badge ${tones[tone] ?? tones.slate}`}>{children}</span>;
}

export function ProgressBar({ value, tone = "brand" }: { value: number; tone?: "brand" | "green" | "amber" | "rose" }) {
  const colors = { brand: "bg-brand-500", green: "bg-emerald-500", amber: "bg-amber-500", rose: "bg-rose-500" };
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
      <div className={`h-full rounded-full ${colors[tone]}`} style={{ width: `${pct}%` }} />
    </div>
  );
}

export function EmptyState({ title, message, action }: { title: string; message: string; action?: ReactNode }) {
  return (
    <div className="card flex flex-col items-center justify-center gap-2 py-14 text-center">
      <span className="text-4xl">🗂️</span>
      <p className="text-lg font-bold text-slate-700">{title}</p>
      <p className="max-w-md text-sm text-slate-500">{message}</p>
      {action}
    </div>
  );
}

export function Spinner({ label = "Working…" }: { label?: string }) {
  return (
    <div className="flex items-center gap-2 text-sm text-slate-500">
      <svg className="h-4 w-4 animate-spin text-brand-600" viewBox="0 0 24 24" fill="none">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-90" fill="currentColor" d="M4 12a8 8 0 0 1 8-8v4a4 4 0 0 0-4 4H4z" />
      </svg>
      {label}
    </div>
  );
}

export function fmt(n: number, digits = 2): string {
  return n.toFixed(digits);
}

export function pct(n: number): string {
  return `${(n * 100).toFixed(1)}%`;
}

export function fmtDate(ts: number | null): string {
  if (!ts) return "—";
  return new Date(ts).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export function scoreTone(score: number): "green" | "amber" | "rose" {
  if (score >= 0.15) return "green";
  if (score >= 0) return "amber";
  return "rose";
}
