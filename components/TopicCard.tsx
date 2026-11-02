"use client";

import { useState } from "react";
import { Topic } from "@/lib/types";
import { Badge, ProgressBar, fmt } from "./ui";

export function TopicCard({
  topic,
  thesisTitles,
  defaultOpen = false,
}: {
  topic: Topic;
  thesisTitles: Map<string, string>;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const tone = topic.coherence >= 0.15 ? "green" : topic.coherence >= 0 ? "amber" : "rose";

  return (
    <div className="card flex flex-col gap-3">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <Badge tone="brand">T{topic.id + 1}</Badge>
            <h3 className="truncate text-base font-bold text-slate-800">{topic.label}</h3>
          </div>
          <p className="mt-1 text-xs text-slate-400">
            {topic.frequency} thesis · {fmt(topic.percentage, 1)}% of corpus · NPMI coherence{" "}
            <span className="font-semibold">{fmt(topic.coherence)}</span>
          </p>
        </div>
        <Badge tone={tone}>{fmt(topic.coherence, 2)}</Badge>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {topic.keywords.slice(0, 8).map((kw) => (
          <span
            key={kw.word}
            className="badge bg-slate-100 text-slate-600"
            title={`weight ${fmt(kw.weight, 4)}`}
          >
            {kw.word}
          </span>
        ))}
      </div>

      <div>
        <div className="mb-1 flex items-center justify-between text-xs text-slate-500">
          <span>Intra-cluster similarity</span>
          <span className="font-semibold">{fmt(topic.intraSimilarity)}</span>
        </div>
        <ProgressBar value={topic.intraSimilarity * 100} tone={tone} />
      </div>

      <button
        onClick={() => setOpen((o) => !o)}
        className="text-left text-xs font-semibold text-brand-600 hover:underline"
      >
        {open ? "Hide member theses ▲" : "Show member theses ▼"}
      </button>

      {open && (
        <ul className="max-h-56 overflow-y-auto rounded-lg border border-slate-100 bg-slate-50 p-3 text-xs text-slate-600">
          {topic.documentIds.map((id) => (
            <li key={id} className="mb-1.5 last:mb-0">
              <span className="font-mono text-slate-400">{id} · </span>
              {thesisTitles.get(id) ?? id}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
