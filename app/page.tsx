"use client";

import Link from "next/link";
import { useStore } from "@/lib/store";
import { Card, EmptyState, PageHeader, Spinner, StatCard, fmt, fmtDate } from "@/components/ui";
import { TopicDistributionChart } from "@/components/charts";

export default function DashboardPage() {
  const { rawTheses, cleaned, cleaningStats, lda, bertopic, gaps, analyzedAt, analyzing, dataSource } = useStore();

  if (analyzing) {
    return (
      <div className="flex h-[70vh] flex-col items-center justify-center gap-3">
        <Spinner label="Cleaning corpus and running LDA + BERTopic…" />
        <p className="text-xs text-slate-400">This runs locally in your browser. Large uploads take a few seconds.</p>
      </div>
    );
  }

  if (!lda || !bertopic || !cleaningStats) {
    return (
      <div className="max-w-xl py-10">
        <PageHeader title="Dashboard" icon="📊" />
        <EmptyState
          title="No data to analyze"
          message='The thesis collection is empty. Load the built-in sample data or upload your own CSV/JSON file from the Collection page.'
          action={
            <Link href="/collection" className="btn-primary">
              📤 Go to Collection & Upload
            </Link>
          }
        />
      </div>
    );
  }

  const sourceBadge =
    dataSource === "sample"
      ? "Demo sample data"
      : dataSource === "mixed"
        ? "Sample + uploaded data"
        : "Uploaded data";

  const quickActions = [
    { href: "/collection", label: "Upload theses", icon: "📤", desc: "CSV / JSON import" },
    { href: "/clusters", label: "View clusters", icon: "🗂️", desc: `${lda.topics.length} LDA · ${bertopic.topics.length} BERTopic` },
    { href: "/gaps", label: "Explore gaps", icon: "🕳️", desc: `${gaps?.length ?? 0} potential gaps found` },
    { href: "/summaries", label: "AI summaries", icon: "✨", desc: "Per-topic AI overviews" },
  ];

  return (
    <div>
      <PageHeader
        title="Dashboard"
        icon="📊"
        subtitle={`Thesis Topic Recommender — ${cleaningStats.uniqueDocs} unique BSCS theses analyzed · last run ${fmtDate(analyzedAt)}`}
        actions={<span className="badge bg-amber-100 text-amber-700">⚠️ {sourceBadge}</span>}
      />

      {/* Quick stats */}
      <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        <StatCard label="Theses" value={rawTheses.length} hint="collected records" />
        <StatCard label="Unique after cleaning" value={cleaningStats.uniqueDocs} hint={`${cleaningStats.duplicatesRemoved} duplicates removed`} accent="text-emerald-600" />
        <StatCard label="LDA topics" value={lda.topics.length} hint={`avg coherence ${fmt(lda.avgCoherence)}`} accent="text-brand-700" />
        <StatCard label="BERTopic topics" value={bertopic.topics.length} hint={`avg coherence ${fmt(bertopic.avgCoherence)}`} accent="text-violet-600" />
        <StatCard label="Tokens" value={cleaningStats.uniqueTokens.toLocaleString()} hint="unique after stemming" />
        <StatCard label="Potential gaps" value={gaps?.length ?? 0} hint="rare / missing topics" accent="text-rose-600" />
      </div>

      {/* Quick actions */}
      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {quickActions.map((a) => (
          <Link key={a.href} href={a.href} className="card group flex flex-col gap-1 transition hover:border-brand-300 hover:shadow">
            <span className="text-2xl">{a.icon}</span>
            <span className="text-sm font-bold text-slate-800 group-hover:text-brand-700">{a.label}</span>
            <span className="text-xs text-slate-400">{a.desc}</span>
          </Link>
        ))}
      </div>

      {/* Topic distributions */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card title="🧠 LDA topic distribution (Gensim)">
          <TopicDistributionChart model={lda} />
        </Card>
        <Card title="🤖 BERTopic topic distribution">
          <TopicDistributionChart model={bertopic} />
        </Card>
      </div>

      {/* Pipeline stage overview */}
      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <Card title="Pipeline" className="lg:col-span-2">
          <ol className="space-y-2 text-sm text-slate-600">
            {[
              ["1. Collect", `${rawTheses.length} records (titles + abstracts) imported.`],
              ["2. Clean", `Removed ${cleaningStats.removedStopwords.toLocaleString()} stopwords and ${cleaningStats.removedChars.toLocaleString()} special characters; ${cleaningStats.duplicatesRemoved} duplicates dropped.`],
              ["3. Cluster", `LDA (Gensim) and BERTopic each produced ${lda.topics.length} topic clusters.`],
              ["4. Score", `NPMI coherence, label clarity and intra-cluster similarity computed per topic.`],
              ["5. Summarize", "AI/LLM or local extractive summary available per topic on the AI Summaries page."],
            ].map(([step, desc]) => (
              <li key={step} className="flex gap-3">
                <span className="mt-0.5 flex h-6 w-16 shrink-0 items-center justify-center rounded-full bg-brand-50 text-xs font-bold text-brand-700">
                  {step.split(".")[0]}
                </span>
                <span>
                  <b>{step.split(". ")[1]}</b> {desc}
                </span>
              </li>
            ))}
          </ol>
        </Card>
        <Card title="⚠️ Methodology note">
          <p className="text-xs leading-relaxed text-slate-500">
            LDA is a collapsed Gibbs sampler (same algorithm as Gensim's LdaModel). BERTopic's Python pipeline cannot run on Vercel, so its browser port uses
            <b> TF-IDF → random projection → k-means++ → c-TF-IDF</b>. Results are meant to guide topic selection, not replace an adviser's judgement. The
            faculty validation form collects structured feedback on the groupings.
          </p>
        </Card>
      </div>
    </div>
  );
}
