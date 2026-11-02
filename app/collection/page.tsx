"use client";

import { useMemo, useState } from "react";
import { useStore } from "@/lib/store";
import { UploadZone } from "@/components/UploadZone";
import { Card, EmptyState, PageHeader, Spinner } from "@/components/ui";

export default function CollectionPage() {
  const { rawTheses, cleaned, cleaningStats, addTheses, removeThesis, clearTheses, loadSampleData, analyzing, dataSource } = useStore();
  const [q, setQ] = useState("");
  const [notice, setNotice] = useState("");

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return rawTheses;
    return rawTheses.filter((t) =>
      (t.title + " " + t.abstract + " " + (t.id ?? "")).toLowerCase().includes(needle)
    );
  }, [rawTheses, q]);

  const handleUpload = (theses: import("@/lib/types").Thesis[]) => {
    const added = addTheses(theses);
    setNotice(`✅ Uploaded ${added} new ${added === 1 ? "thesis" : "theses"}. The corpus is being re-analyzed automatically.`);
    setTimeout(() => setNotice(""), 6000);
  };

  return (
    <div>
      <PageHeader
        title="Thesis Collection"
        icon="📚"
        subtitle="Import titles and abstracts of past BSCS theses. Analysis runs locally and persists in this browser."
        actions={
          <>
            <button className="btn-secondary" onClick={loadSampleData}>
              ↻ Reload sample data
            </button>
            {rawTheses.length > 0 && (
              <button
                className="btn-danger"
                onClick={() => {
                  if (confirm("Clear the whole collection? This deletes uploads too.")) clearTheses();
                }}
              >
                🗑️ Clear all
              </button>
            )}
          </>
        }
      />

      {notice && <p className="mb-3 text-sm font-semibold text-emerald-600">{notice}</p>}

      <div className="mb-6">
        <UploadZone onUploaded={handleUpload} />
      </div>

      <Card title={`Records (${filtered.length} shown of ${rawTheses.length})`}>
        <div className="mb-3 flex flex-col gap-2">
          <input
            className="input"
            placeholder="🔎 Search by title, abstract, or ID…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          {analyzing && <Spinner label="Re-analyzing the updated corpus…" />}
          {cleaningStats && !analyzing && (
            <p className="text-xs text-slate-400">
              {cleaningStats.uniqueDocs} unique theses after cleaning · {cleaningStats.duplicatesRemoved} duplicates removed ·
              data source: <b>{dataSource}</b>
            </p>
          )}
        </div>

        {filtered.length === 0 ? (
          <EmptyState
            title="No matching records"
            message="Try a different keyword, or upload a CSV/JSON file containing the title and abstract columns."
          />
        ) : (
          <div className="max-h-[28rem] overflow-auto">
            <table className="tbl">
              <thead className="sticky top-0">
                <tr>
                  <th>ID</th>
                  <th>Title</th>
                  <th>Abstract (truncated)</th>
                  <th>Year</th>
                  <th>Source</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((t) => {
                  const cls = cleaned.find((c) => c.id === t.id);
                  return (
                    <tr key={t.id}>
                      <td className="font-mono text-xs">{t.id}</td>
                      <td className="max-w-xs">
                        <p className="font-semibold text-slate-800">{t.title}</p>
                        {cls?.isDuplicate ? (
                          <p className="mt-0.5 text-xs font-semibold text-amber-600">⚠️ duplicate detected</p>
                        ) : cls?.isDuplicate === false && (
                          <p className="mt-0.5 text-xs text-slate-400">
                            {cls.tokens.length} tokens · {cls.removedStopwords} stopwords removed
                          </p>
                        )}
                      </td>
                      <td className="max-w-sm text-xs text-slate-500">{t.abstract.slice(0, 140)}{t.abstract.length > 140 ? "…" : ""}</td>
                      <td className="text-xs">{t.year ?? "—"}</td>
                      <td>
                        <span className={`badge ${t.source === "sample" ? "bg-slate-100 text-slate-500" : "bg-emerald-100 text-emerald-700"}`}>
                          {t.source}
                        </span>
                      </td>
                      <td>
                        <button
                          className="text-xs font-semibold text-rose-500 hover:underline"
                          onClick={() => removeThesis(t.id)}
                          title="Remove this record"
                        >
                          ✕
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
