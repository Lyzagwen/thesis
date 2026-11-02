"use client";

import { useMemo, useState } from "react";
import { useStore } from "@/lib/store";
import { TopicCard } from "@/components/TopicCard";
import { ModelToggle } from "@/components/ModelToggle";
import { Card, EmptyState, PageHeader, fmt } from "@/components/ui";

export default function ClustersPage() {
  const { lda, bertopic, cleaned, analyzing } = useStore();
  const [method, setMethod] = useState<"LDA" | "BERTopic">("LDA");
  const model = method === "LDA" ? lda : bertopic;

  const thesisTitles = useMemo(() => {
    const m = new Map<string, string>();
    cleaned.forEach((c) => m.set(c.id, c.title));
    return m;
  }, [cleaned]);

  if (analyzing) return <PageHeader title="Clusters" icon="🗂️" subtitle="Re-clustering…" />;

  if (!model || model.topics.length === 0) {
    return (
      <div className="max-w-xl py-10">
        <PageHeader title="Clusters" icon="🗂️" />
        <EmptyState title="No clusters yet" message="Load sample data or upload theses to start the LDA and BERTopic clustering." />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Automatic Grouping by Theme"
        icon="🗂️"
        subtitle="Each thesis is assigned to the topic it fits best. Both models use the same cleaned corpus."
        actions={<ModelToggle method={method} onChange={setMethod} />}
      />

      <div className="mb-4 flex flex-wrap items-center gap-2 text-xs text-slate-500">
        <span className="badge bg-brand-50 text-brand-700">
          {model.topics.length} topics · avg coherence {fmt(model.avgCoherence)} · ran in {fmt(model.runningTimeMs, 0)} ms
        </span>
        <span className="badge bg-slate-100 text-slate-500">{model.params.algorithm}</span>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {model.topics.map((t) => (
          <TopicCard key={t.id} topic={t} thesisTitles={thesisTitles} />
        ))}
      </div>

      {/* Thesis-to-topic assignment */}
      <Card title={`Thesis → Topic assignment (${method})`} className="mt-6">
        <div className="max-h-[24rem] overflow-auto">
          <table className="tbl">
            <thead className="sticky top-0">
              <tr>
                <th>Thesis</th>
                <th>Assigned topic</th>
                <th>Topic label</th>
                <th>Confidence</th>
              </tr>
            </thead>
            <tbody>
              {cleaned.map((c) => {
                const topicId = model.docTopics[c.id];
                const topic = model.topics.find((t) => t.id === topicId);
                const theta = model.docTheta?.[c.id];
                const confidence = theta ? theta[topicId ?? 0] : 1;
                return (
                  <tr key={c.id}>
                    <td className="max-w-sm">
                      <span className="font-mono text-xs text-slate-400">{c.id}</span>{" "}
                      <span className="text-xs font-semibold text-slate-700">{c.title}</span>
                    </td>
                    <td><span className="badge bg-brand-50 text-brand-700">T{topicId !== undefined ? topicId + 1 : "?"}</span></td>
                    <td className="text-xs text-slate-500">{topic?.label ?? "—"}</td>
                    <td className="text-xs">{theta ? fmt(confidence * 100, 1) + "%" : "100%"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
