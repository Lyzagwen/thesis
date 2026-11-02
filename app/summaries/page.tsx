"use client";

import { useState } from "react";
import { useStore } from "@/lib/store";
import { ModelToggle } from "@/components/ModelToggle";
import { Card, EmptyState, PageHeader, Spinner } from "@/components/ui";
import { localTopicSummary, requestAISummary } from "@/lib/aiSummary";
import { copyText } from "@/lib/upload";
import { Topic } from "@/lib/types";

export default function SummariesPage() {
  const { lda, bertopic, rawTheses, analyzing } = useStore();
  const [method, setMethod] = useState<"LDA" | "BERTopic">("LDA");
  const [topicId, setTopicId] = useState(0);
  const [summary, setSummary] = useState<{ text: string; source: "openai" | "local"; note?: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const model = method === "LDA" ? lda : bertopic;
  const topic: Topic | undefined = model?.topics[topicId % Math.max(1, model?.topics.length ?? 1)];

  if (analyzing) return <PageHeader title="AI Summaries" icon="✨" subtitle="Waiting for analysis…" />;

  if (!model || !topic) {
    return (
      <div className="max-w-xl py-10">
        <PageHeader title="AI Summaries" icon="✨" />
        <EmptyState title="Nothing to summarize yet" message="Run the pipeline first, then generate summaries per topic." />
      </div>
    );
  }

  const memberDocs = topic.documentIds
    .map((id) => rawTheses.find((t) => t.id === id))
    .filter((t): t is (typeof rawTheses)[number] => Boolean(t));

  const summarize = async () => {
    setLoading(true);
    setSummary(null);
    try {
      const res = await requestAISummary({
        label: topic.label,
        keywords: topic.keywords.slice(0, 10).map((k) => k.word),
        docs: memberDocs.slice(0, 15).map((d) => ({ title: d.title, abstract: d.abstract })),
      });
      if (res.ok && res.summary) {
        setSummary({ text: res.summary, source: "openai" });
      } else {
        const local = localTopicSummary(topic, rawTheses);
        setSummary({ text: local, source: "local", note: res.error });
      }
    } finally {
      setLoading(false);
    }
  };

  const copy = async () => {
    if (summary) await copyText(summary.text);
  };

  return (
    <div>
      <PageHeader
        title="AI Summaries"
        icon="✨"
        subtitle="One-click AI overview of each topic cluster. Uses GPT (via the OPENAI_API_KEY env var) when configured — otherwise a built-in extractive summarizer keeps the button fully functional."
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <Card title="1. Pick a topic">
          <div className="mb-3">
            <ModelToggle method={method} onChange={setMethod} />
          </div>
          <select
            className="input"
            value={topic.id}
            onChange={(e) => {
              setTopicId(Number(e.target.value));
              setSummary(null);
            }}
          >
            {model.topics.map((t) => (
              <option key={t.id} value={t.id}>
                T{t.id + 1} — {t.label}
              </option>
            ))}
          </select>

          <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-500">
            <p className="mb-1 font-bold uppercase text-slate-400">Cluster contents</p>
            <p>
              {topic.frequency} member theses · top words:{" "}
              <span className="text-slate-700">{topic.keywords.slice(0, 6).map((k) => k.word).join(", ")}</span>
            </p>
            <ul className="mt-2 max-h-24 space-y-0.5 overflow-y-auto">
              {memberDocs.slice(0, 8).map((d) => (
                <li key={d.id}>• {d.title}</li>
              ))}
              {memberDocs.length > 8 && <li className="text-slate-400">… +{memberDocs.length - 8} more</li>}
            </ul>
          </div>

          <button className="btn-primary mt-4 w-full" onClick={summarize} disabled={loading}>
            {loading ? <Spinner label="Generating summary…" /> : "✨ AI Summarize"}
          </button>
        </Card>

        <div className="lg:col-span-2">
          <Card title={`2. Summary — T${topic.id + 1}: ${topic.label}`}>
            {loading ? (
              <div className="flex flex-col items-center gap-3 py-16 text-slate-400">
                <Spinner label="Calling AI summarizer…" />
                <p className="text-xs">If no API key is set, the local extractive summarizer takes over automatically.</p>
              </div>
            ) : summary ? (
              <div className="flex flex-col gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`badge ${
                      summary.source === "openai" ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {summary.source === "openai" ? "🤖 GPT summary" : "📄 Local extractive summary"}
                  </span>
                  {summary.note && <span className="badge bg-amber-100 text-amber-700">{summary.note}</span>}
                  <button className="btn-secondary ml-auto px-3 py-1 text-xs" onClick={copy}>
                    📋 Copy
                  </button>
                </div>
                <p className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm leading-relaxed text-slate-700">
                  {summary.text}
                </p>
                <div className="flex flex-wrap gap-2">
                  <a
                    href={`https://www.google.com/search?q=${encodeURIComponent(topic.label + " BSCS thesis Philippines")}`}
                    target="_blank"
                    rel="noreferrer"
                    className="btn-secondary px-3 py-1 text-xs"
                  >
                    🔎 Search related literature
                  </a>
                  <a
                    href={`https://www.google.com/search?q=${encodeURIComponent(
                      topic.keywords.slice(0, 3).map((k) => k.word).join(" ")
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                    className="btn-secondary px-3 py-1 text-xs"
                  >
                    🔎 Search by keywords
                  </a>
                </div>
              </div>
            ) : (
              <div className="py-14 text-center text-sm text-slate-400">
                <span className="mb-2 block text-4xl">💡</span>
                Press <b>✨ AI Summarize</b> to generate a summary of this topic cluster.
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
