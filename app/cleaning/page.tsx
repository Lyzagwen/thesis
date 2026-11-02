"use client";

import { useMemo, useState } from "react";
import { useStore } from "@/lib/store";
import { Card, PageHeader, StatCard, fmt } from "@/components/ui";

export default function CleaningPage() {
  const { cleaned, cleaningStats, analyzing } = useStore();
  const [onlyDuplicates, setOnlyDuplicates] = useState(false);
  const [sampleIdx, setSampleIdx] = useState(0);

  const stats = cleaningStats;
  const sample = useMemo(() => cleaned[sampleIdx % Math.max(1, cleaned.length)], [cleaned, sampleIdx]);
  const visible = useMemo(
    () => (onlyDuplicates ? cleaned.filter((c) => c.isDuplicate) : cleaned),
    [cleaned, onlyDuplicates]
  );

  if (analyzing) return <PageHeader title="Cleaning" icon="🧹" subtitle="Re-processing the corpus…" />;

  return (
    <div>
      <PageHeader
        title="Cleaning Pipeline"
        icon="🧹"
        subtitle="Gensim-style preprocessing: lowercase → strip URLs/numbers → remove punctuation → stopword removal (EN + Filipino) → light stemming → duplicate detection."
      />

      {!stats ? (
        <Card><p className="text-sm text-slate-500">No records yet. Load sample data or upload a file first.</p></Card>
      ) : (
        <>
          <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
            <StatCard label="Total records" value={stats.totalDocs} />
            <StatCard label="Unique after cleaning" value={stats.uniqueDocs} accent="text-emerald-600" />
            <StatCard label="Duplicates removed" value={stats.duplicatesRemoved} accent="text-rose-600" />
            <StatCard label="Stopwords removed" value={stats.removedStopwords.toLocaleString()} />
            <StatCard label="Special chars removed" value={stats.removedChars.toLocaleString()} />
            <StatCard label="Unique tokens" value={stats.uniqueTokens.toLocaleString()} hint={`${fmt(stats.avgTokensPerDoc, 0)} tokens/doc avg`} />
          </div>

          {sample && (
            <Card title="Before → After (rotating example)" className="mb-6">
              <div className="grid gap-4 lg:grid-cols-2">
                <div>
                  <p className="label">Before</p>
                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm">
                    <p className="font-semibold text-slate-700">{sample.title}</p>
                    <p className="mt-1 text-xs leading-relaxed text-slate-500">{sample.abstract}</p>
                  </div>
                  <p className="mt-2 text-xs text-slate-400">
                    Removed {sample.removedStopwords} stopwords, {sample.removedChars} non-alphanumeric characters.
                    {sample.isDuplicate ? " ⚠️ Flagged as duplicate." : ""}
                  </p>
                </div>
                <div>
                  <p className="label">After (cleaned tokens)</p>
                  <div className="rounded-lg border border-brand-200 bg-brand-50 p-4">
                    <p className="text-sm font-semibold text-brand-800">{sample.cleanedTitle}</p>
                    <p className="mt-1 text-xs leading-relaxed text-brand-700">{sample.cleanedAbstract}</p>
                    <div className="mt-3 flex flex-wrap gap-1">
                      {sample.tokens.slice(0, 40).map((tok) => (
                        <span key={tok} className="badge bg-white text-brand-700">
                          {tok}
                        </span>
                      ))}
                      {sample.tokens.length > 40 && <span className="badge bg-white text-slate-400">+{sample.tokens.length - 40} more</span>}
                    </div>
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <button className="btn-secondary text-xs" onClick={() => setSampleIdx((i) => (i + 1) % cleaned.length)}>
                      ↻ Next example
                    </button>
                    <span className="text-xs text-slate-400">doc {sampleIdx + 1}/{cleaned.length}</span>
                  </div>
                </div>
              </div>
            </Card>
          )}

          <Card title={`Cleaned records (${visible.length})`}>
            <div className="mb-3 text-right">
              <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-slate-600">
                <input
                  type="checkbox"
                  checked={onlyDuplicates}
                  onChange={(e) => setOnlyDuplicates(e.target.checked)}
                  className="h-4 w-4 accent-brand-600"
                />
                Only show duplicates
              </label>
            </div>
            <div className="max-h-[26rem] overflow-auto">
              <table className="tbl">
                <thead className="sticky top-0">
                  <tr>
                    <th>ID</th>
                    <th>Title (cleaned)</th>
                    <th>Abstract (cleaned)</th>
                    <th>Tokens</th>
                    <th>Stopwords</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {visible.map((c) => (
                    <tr key={c.id}>
                      <td className="font-mono text-xs">{c.id}</td>
                      <td className="max-w-xs text-xs">{c.cleanedTitle || <span className="text-slate-300">(empty)</span>}</td>
                      <td className="max-w-md text-xs text-slate-500">
                        {c.cleanedAbstract.slice(0, 120) || <span className="text-slate-300">(empty)</span>}
                      </td>
                      <td className="text-xs">{c.tokens.length}</td>
                      <td className="text-xs">{c.removedStopwords}</td>
                      <td>
                        {c.isDuplicate ? (
                          <span className="badge bg-amber-100 text-amber-700">⚠️ duplicate</span>
                        ) : (
                          <span className="badge bg-emerald-100 text-emerald-700">✓ clean</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      )}
    </div>
  );
}
