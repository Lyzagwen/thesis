"use client";

import { useStore } from "@/lib/store";
import { TrendLineChart, TopicDistributionChart } from "@/components/charts";
import { Card, EmptyState, PageHeader, fmt } from "@/components/ui";

export default function TrendsPage() {
  const { lda, bertopic, trends, analyzing } = useStore();

  if (analyzing) return <PageHeader title="Trends" icon="📈" subtitle="Computing topic frequencies…" />;

  if (!trends || trends.length === 0 || !lda || !bertopic) {
    return (
      <div className="max-w-xl py-10">
        <PageHeader title="Trends" icon="📈" />
        <EmptyState title="No trends yet" message="Run the pipeline from the Collection page to see topic frequencies." />
      </div>
    );
  }

  const sorted = [...trends].sort((a, b) => b.count - a.count);

  return (
    <div>
      <PageHeader
        title="Topic Trends & Frequencies"
        icon="📈"
        subtitle="How often each theme appears across the collection. Frequent topics are 'saturated'; rare ones hint at openings."
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <Card title="🧠 LDA topic frequencies">
          <TopicDistributionChart model={lda} />
        </Card>
        <Card title="🤖 BERTopic topic frequencies">
          <TopicDistributionChart model={bertopic} />
        </Card>
      </div>

      <Card title="📅 Frequency per year (both models)" className="mt-4">
        <TrendLineChart trends={trends} />
        <p className="mt-2 text-xs text-slate-400">
          Combined count of theses published per year, split by method. Themes appearing mostly in early years may be fading;
          themes growing in recent years are current trends.
        </p>
      </Card>

      <Card title="Top recurring topics" className="mt-4">
        <div className="overflow-auto">
          <table className="tbl">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Method</th>
                <th>Topic</th>
                <th>Theses</th>
                <th>Share</th>
                <th>Years</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((t, i) => (
                <tr key={`${t.method}-${t.topicId}`}>
                  <td className="text-xs text-slate-400">{i + 1}</td>
                  <td>
                    <span className={`badge ${t.method === "LDA" ? "bg-brand-50 text-brand-700" : "bg-violet-100 text-violet-700"}`}>
                      {t.method}
                    </span>
                  </td>
                  <td className="font-semibold text-slate-700">{t.label}</td>
                  <td className="text-xs font-mono">{t.count}</td>
                  <td className="text-xs">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-24 overflow-hidden rounded-full bg-slate-100">
                        <div className="h-full bg-brand-500" style={{ width: `${t.percentage}%` }} />
                      </div>
                      <span>{fmt(t.percentage, 1)}%</span>
                    </div>
                  </td>
                  <td className="text-xs text-slate-500">
                    {Object.keys(t.years).length
                      ? Object.entries(t.years)
                          .map(([y, c]) => `${y} (${c})`)
                          .join(", ")
                      : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
