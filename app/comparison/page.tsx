"use client";

import { useStore } from "@/lib/store";
import { ComparisonGroupedChart } from "@/components/charts";
import { Badge, Card, EmptyState, PageHeader, fmt } from "@/components/ui";

export default function ComparisonPage() {
  const { lda, bertopic, analyzing } = useStore();

  if (analyzing) return <PageHeader title="LDA vs BERTopic" icon="⚖️" subtitle="Comparing models…" />;

  if (!lda || !bertopic) {
    return (
      <div className="max-w-xl py-10">
        <PageHeader title="LDA vs BERTopic" icon="⚖️" />
        <EmptyState title="Nothing to compare" message="Run the pipeline first so both models produce results." />
      </div>
    );
  }

  const metrics = [
    {
      key: "avgCoherence" as const,
      label: "Topic coherence (NPMI)",
      explain: "How well the top words of each topic co-occur. Higher is tighter/more interpretable.",
      better: (a: number, b: number) => a > b,
    },
    {
      key: "avgClarity" as const,
      label: "Label clarity",
      explain: "How distinct and specific the generated topic labels are (penalizes overlapping keywords).",
      better: (a: number, b: number) => a > b,
    },
    {
      key: "avgIntraSimilarity" as const,
      label: "Member relevance",
      explain: "Average similarity between theses inside the same cluster. Higher = more coherent grouping.",
      better: (a: number, b: number) => a > b,
    },
  ];

  const score = (m: (typeof metrics)[0]) => {
    const a = lda[m.key];
    const b = bertopic[m.key];
    const winner: "LDA" | "BERTopic" | "tie" = Math.abs(a - b) < 0.01 ? "tie" : m.better(a, b) ? "LDA" : "BERTopic";
    return { a, b, winner };
  };

  const winners = metrics.map(score).map((s) => s.winner);
  const ldaWins = winners.filter((w) => w === "LDA").length;
  const btWins = winners.filter((w) => w === "BERTopic").length;
  const overall = ldaWins > btWins ? "LDA" : btWins > ldaWins ? "BERTopic" : "tie";

  return (
    <div>
      <PageHeader
        title="LDA vs BERTopic"
        icon="⚖️"
        subtitle="A side-by-side comparison using three quantitative lenses: coherence, label clarity, and member relevance."
      />

      {/* Verdict banner */}
      <div className={`mb-6 rounded-2xl border p-5 ${overall === "tie" ? "border-slate-200 bg-slate-50" : "border-brand-200 bg-brand-50"}`}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Automated verdict</p>
            <p className="text-xl font-extrabold text-slate-900">
              {overall === "tie"
                ? "It's a tie — pick by preference 😐"
                : `${overall} leads on ${overall === "LDA" ? ldaWins : btWins} of 3 metrics`}
            </p>
            <p className="mt-1 max-w-2xl text-xs text-slate-500">
              This is a heuristic comparison, not a final recommendation. Advisers should validate the groupings through the
              rating form. BERTopic here is a browser port (TF-IDF + k-means + c-TF-IDF) — the real Python library may score
              differently.
            </p>
          </div>
          <div className="flex gap-3">
            <div className="rounded-xl bg-white px-4 py-2 text-center shadow-sm">
              <p className="text-[10px] font-bold uppercase text-brand-600">LDA wins</p>
              <p className="text-2xl font-extrabold text-brand-700">{ldaWins}</p>
            </div>
            <div className="rounded-xl bg-white px-4 py-2 text-center shadow-sm">
              <p className="text-[10px] font-bold uppercase text-violet-600">BERTopic wins</p>
              <p className="text-2xl font-extrabold text-violet-700">{btWins}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Per-metric comparison */}
      {metrics.map((m) => {
        const s = score(m);
        return (
          <Card key={m.key} title={`⚖️ ${m.label}`} className="mb-4">
            <div className="grid gap-4 lg:grid-cols-2">
              <ComparisonGroupedChart lda={lda} bertopic={bertopic} metric={m.key} />
              <div className="flex flex-col justify-center gap-3">
                <p className="text-sm text-slate-500">{m.explain}</p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl border border-brand-100 bg-brand-50/60 p-4 text-center">
                    <p className="text-xs font-bold uppercase text-brand-600">🧠 LDA (Gensim)</p>
                    <p className="mt-1 text-3xl font-extrabold text-brand-700">{fmt(s.a, 3)}</p>
                    <p className="mt-1 text-xs text-brand-600">{m.better(s.a, s.b) ? "🏆 better" : ""}</p>
                  </div>
                  <div className="rounded-xl border border-violet-100 bg-violet-50/60 p-4 text-center">
                    <p className="text-xs font-bold uppercase text-violet-600">🤖 BERTopic</p>
                    <p className="mt-1 text-3xl font-extrabold text-violet-700">{fmt(s.b, 3)}</p>
                    <p className="mt-1 text-xs text-violet-600">{m.better(s.b, s.a) ? "🏆 better" : ""}</p>
                  </div>
                </div>
                <p className="text-xs text-slate-400">
                  Winner:{" "}
                  <Badge tone={s.winner === "tie" ? "slate" : s.winner === "LDA" ? "brand" : "violet"}>
                    {s.winner === "tie" ? "tie" : s.winner}
                  </Badge>
                </p>
              </div>
            </div>
          </Card>
        );
      })}

      {/* Method characteristics */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card title="🧠 LDA characteristics">
          <ul className="space-y-2 text-sm text-slate-600">
            <li>• Soft clustering — every thesis has a distribution over ALL topics (see Clusters page).</li>
            <li>• Requires fixing the number of topics (here: auto-selected from corpus size).</li>
            <li>• Pure bag-of-words: word order and meaning are not used.</li>
            <li>• Runs in <b>{fmt(lda.runningTimeMs, 0)} ms</b> on this corpus.</li>
            <li className="font-mono text-xs text-slate-400">params: {JSON.stringify(lda.params)}</li>
          </ul>
        </Card>
        <Card title="🤖 BERTopic characteristics">
          <ul className="space-y-2 text-sm text-slate-600">
            <li>• Hard clustering — each thesis belongs to exactly one cluster.</li>
            <li>• Groups semantically similar texts using density-based ideas + c-TF-IDF keywords.</li>
            <li>• Python library uses transformer embeddings + HDBSCAN; this browser port approximates it.</li>
            <li>• Runs in <b>{fmt(bertopic.runningTimeMs, 0)} ms</b> on this corpus.</li>
            <li className="font-mono text-xs text-slate-400">params: {JSON.stringify(bertopic.params)}</li>
          </ul>
        </Card>
      </div>
    </div>
  );
}
