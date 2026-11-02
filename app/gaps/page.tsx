"use client";

import { useStore } from "@/lib/store";
import { Card, EmptyState, PageHeader } from "@/components/ui";

export default function GapsPage() {
  const { gaps, analyzing } = useStore();

  if (analyzing) return <PageHeader title="Research Gaps" icon="🕳️" subtitle="Detecting gaps…" />;

  if (!gaps || gaps.length === 0) {
    return (
      <div className="max-w-xl py-10">
        <PageHeader title="Research Gaps" icon="🕳️" />
        <EmptyState title="Nothing to evaluate" message="Run the pipeline first; gap detection needs a cleaned corpus." />
      </div>
    );
  }

  const absent = gaps.filter((g) => g.status === "absent");
  const rare = gaps.filter((g) => g.status === "under-researched");

  return (
    <div>
      <PageHeader
        title="Research Gaps"
        icon="🕳️"
        subtitle="Rare or missing topics, read as *possible* research openings. Absence from this collection does not prove no research exists — always verify with the official repository."
      />

      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        <div className="card bg-rose-50/60">
          <p className="text-xs font-bold uppercase text-rose-500">Missing trending areas</p>
          <p className="text-3xl font-extrabold text-rose-600">{absent.length}</p>
        </div>
        <div className="card bg-amber-50/60">
          <p className="text-xs font-bold uppercase text-amber-600">Under-researched topics</p>
          <p className="text-3xl font-extrabold text-amber-600">{rare.length}</p>
        </div>
        <div className="card">
          <p className="text-xs font-bold uppercase text-slate-400">Total candidates</p>
          <p className="text-3xl font-extrabold text-slate-700">{gaps.length}</p>
        </div>
      </div>

      <div className="space-y-4">
        <Card title="🕳️ Missing trending research areas (0 matching theses)">
          <div className="grid gap-3 md:grid-cols-2">
            {absent.map((g) => (
              <div key={g.id} className="rounded-xl border border-rose-100 bg-rose-50/40 p-4">
                <div className="mb-1 flex items-center justify-between gap-2">
                  <p className="text-sm font-bold text-slate-800">{g.area}</p>
                  <span className="badge bg-rose-100 text-rose-700">absent</span>
                </div>
                <p className="mb-2 text-xs leading-relaxed text-slate-600">{g.suggestedReason}</p>
                <div className="flex flex-wrap gap-1">
                  {g.keywords.map((k) => (
                    <span key={k} className="badge bg-white text-rose-600">{k}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card title="⚠️ Rare topics flagged by the models (possible niches)">
          <div className="grid gap-3 md:grid-cols-2">
            {rare.map((g) => (
              <div key={g.id} className="rounded-xl border border-amber-100 bg-amber-50/40 p-4">
                <div className="mb-1 flex items-center justify-between gap-2">
                  <p className="text-sm font-bold text-slate-800">{g.area}</p>
                  <span className="badge bg-amber-100 text-amber-700">only {g.matchedDocs}</span>
                </div>
                <p className="mb-2 text-xs leading-relaxed text-slate-600">{g.suggestedReason}</p>
                <div className="flex flex-wrap gap-1">
                  {g.keywords.map((k) => (
                    <span key={k} className="badge bg-white text-amber-700">{k}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs leading-relaxed text-slate-500">
        <b>How to read this page:</b> "Missing" means the keyword scan of the current corpus found no thesis mentioning the area's
        terms. Because the collection is incomplete (sample data or a partial archive), treat these as candidates for advisers to
        verify — not as proof that no thesis ever covered the topic. "Under-researched" topics come from clusters that hold fewer
        than ~8% of the corpus.
      </div>
    </div>
  );
}
