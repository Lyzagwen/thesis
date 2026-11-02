"use client";

import { useState } from "react";
import { useStore } from "@/lib/store";
import { ModelToggle } from "@/components/ModelToggle";
import { Card, EmptyState, PageHeader, fmt } from "@/components/ui";

export default function KeywordsPage() {
  const { lda, bertopic, analyzing } = useStore();
  const [method, setMethod] = useState<"LDA" | "BERTopic">("LDA");
  const [activeTopic, setActiveTopic] = useState(0);

  const model = method === "LDA" ? lda : bertopic;

  if (analyzing) return <PageHeader title="Keywords" icon="🏷️" subtitle="Recomputing keywords…" />;

  if (!model || model.topics.length === 0) {
    return (
      <div className="max-w-xl py-10">
        <PageHeader title="Representative Keywords" icon="🏷️" />
        <EmptyState title="No topics yet" message="Run the pipeline first from the Collection page." />
      </div>
    );
  }

  const topic = model.topics[activeTopic % model.topics.length];

  return (
    <div>
      <PageHeader
        title="Representative Keywords per Cluster"
        icon="🏷️"
        subtitle="The words that best describe each cluster, with weights. LDA uses topic-word probabilities; BERTopic uses c-TF-IDF scores."
        actions={<ModelToggle method={method} onChange={setMethod} />}
      />

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Topic selector */}
        <Card title={`Topics (${model.topics.length})`}>
          <ul className="space-y-1">
            {model.topics.map((t) => (
              <li key={t.id}>
                <button
                  onClick={() => setActiveTopic(t.id)}
                  className={`w-full rounded-lg px-3 py-2 text-left text-sm transition ${
                    activeTopic === t.id ? "bg-brand-600 text-white" : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  <span className={`mr-2 font-mono text-xs ${activeTopic === t.id ? "text-brand-200" : "text-slate-400"}`}>
                    T{t.id + 1}
                  </span>
                  {t.label}
                  <span className={`ml-1 text-[10px] ${activeTopic === t.id ? "text-brand-200" : "text-slate-400"}`}>
                    · {t.frequency}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </Card>

        {/* Word cloud + table */}
        <div className="lg:col-span-2">
          <Card title={`T${topic.id + 1} — ${topic.label}`}>
            <div className="mb-4 flex min-h-[10rem] flex-wrap items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-brand-50 to-violet-50 p-4">
              {topic.keywords.map((kw, i) => {
                const maxW = topic.keywords[0]?.weight ?? 1;
                const size = Math.max(0.7, Math.min(2.4, 0.7 + (kw.weight / maxW) * 1.7));
                const alpha = 0.55 + (kw.weight / maxW) * 0.45;
                return (
                  <span
                    key={kw.word}
                    style={{ fontSize: `${size}rem`, opacity: alpha }}
                    className="font-bold text-brand-800"
                    title={`weight ${fmt(kw.weight, 4)}`}
                  >
                    {kw.word}
                  </span>
                );
              })}
            </div>

            <div className="overflow-auto">
              <table className="tbl">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Keyword</th>
                    <th>Weight</th>
                    <th>Share of total</th>
                  </tr>
                </thead>
                <tbody>
                  {topic.keywords.map((kw, i) => {
                    const total = topic.keywords.reduce((a, k) => a + k.weight, 0);
                    return (
                      <tr key={kw.word}>
                        <td className="text-xs text-slate-400">{i + 1}</td>
                        <td className="font-semibold text-slate-700">{kw.word}</td>
                        <td className="font-mono text-xs">{fmt(kw.weight, 4)}</td>
                        <td className="text-xs">
                          <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                            <div className="h-full bg-brand-500" style={{ width: `${(kw.weight / total) * 100}%` }} />
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
