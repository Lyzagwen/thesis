"use client";

import { useState } from "react";
import { useStore } from "@/lib/store";
import { ModelToggle } from "@/components/ModelToggle";
import { CoherenceChart } from "@/components/charts";
import { Card, EmptyState, PageHeader, ProgressBar, fmt, scoreTone } from "@/components/ui";

export default function CoherencePage() {
  const { lda, bertopic, analyzing } = useStore();
  const [method, setMethod] = useState<"LDA" | "BERTopic">("LDA");
  const model = method === "LDA" ? lda : bertopic;

  if (analyzing) return <PageHeader title="Coherence" icon="🎯" subtitle="Scoring clusters…" />;

  if (!model) {
    return (
      <div className="max-w-xl py-10">
        <PageHeader title="Coherence Scoring" icon="🎯" />
        <EmptyState title="Nothing to score" message="Run the pipeline first to compute coherence per cluster." />
      </div>
    );
  }

  const sorted = [...model.topics].sort((a, b) => b.coherence - a.coherence);

  return (
    <div>
      <PageHeader
        title="Coherence Scoring"
        icon="🎯"
        subtitle="How well each cluster holds together. NPMI coherence measures whether a topic's top words actually co-occur in the corpus."
        actions={<ModelToggle method={method} onChange={setMethod} />}
      />

      <div className="mb-4 flex flex-wrap gap-2 text-xs">
        <span className="badge bg-brand-50 text-brand-700">average NPMI coherence: {fmt(model.avgCoherence)}</span>
        <span className="badge bg-emerald-100 text-emerald-700">average label clarity: {fmt(model.avgClarity)}</span>
        <span className="badge bg-amber-100 text-amber-700">average intra-cluster similarity: {fmt(model.avgIntraSimilarity)}</span>
      </div>

      <Card title="Per-topic scores">
        <CoherenceChart model={model} />
      </Card>

      <Card title="Ranked clusters" className="mt-4">
        <div className="overflow-auto">
          <table className="tbl">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Topic</th>
                <th>Label</th>
                <th>NPMI</th>
                <th>Clarity</th>
                <th>Intra-sim</th>
                <th>Verdict</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((t, i) => {
                const tone = scoreTone(t.coherence);
                const verdict =
                  t.coherence >= 0.15 ? "Coherent — words travel together" : t.coherence >= 0 ? "Acceptable" : "Weak — words rarely co-occur";
                return (
                  <tr key={t.id}>
                    <td className="text-xs text-slate-400">{i + 1}</td>
                    <td><span className="badge bg-brand-50 text-brand-700">T{t.id + 1}</span></td>
                    <td className="font-semibold text-slate-700">{t.label}</td>
                    <td>
                      <div className="flex items-center gap-2">
                        <div className="w-20"><ProgressBar value={(t.coherence + 0.4) * 80} tone={tone} /></div>
                        <span className="font-mono text-xs">{fmt(t.coherence)}</span>
                      </div>
                    </td>
                    <td className="font-mono text-xs">{fmt(t.clarity)}</td>
                    <td className="font-mono text-xs">{fmt(t.intraSimilarity)}</td>
                    <td className="text-xs">{verdict}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs leading-relaxed text-slate-400">
          NPMI ranges roughly from −1 to +1. Values above 0.15 usually indicate interpretable topics; near 0 topics mix themes;
          negative values suggest the top words rarely appear together. Clarity (0–1) and intra-cluster similarity (0–1) are
          supporting metrics, not replacements for an adviser's qualitative review.
        </p>
      </Card>
    </div>
  );
}
