"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ModelResult, TrendItem } from "@/lib/types";

const COLORS = ["#3b63f6", "#7c3aed", "#0ea5e9", "#f59e0b", "#10b981", "#ef4444", "#ec4899", "#14b8a6", "#8b5cf6", "#f97316"];

export function TopicDistributionChart({ model }: { model: ModelResult }) {
  const data = model.topics.map((t) => ({
    name: `T${t.id + 1}`,
    short: `T${t.id + 1} · ${t.label.length > 18 ? t.label.slice(0, 18) + "…" : t.label}`,
    theses: t.frequency,
  }));
  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        <XAxis dataKey="name" tick={{ fontSize: 12 }} />
        <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
        <Tooltip
          formatter={(v: number | string, _n: string, item: { payload?: { short?: string } }) => [
            `${v} thesis`,
            item.payload?.short ?? "",
          ]}
          contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0" }}
        />
        <Bar dataKey="theses" radius={[6, 6, 0, 0]}>
          {data.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

export function CoherenceChart({ model }: { model: ModelResult }) {
  const data = model.topics.map((t) => ({
    name: `T${t.id + 1}`,
    npmi: Number(t.coherence.toFixed(3)),
    clarity: Number(t.clarity.toFixed(3)),
    intra: Number(t.intraSimilarity.toFixed(3)),
  }));
  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        <XAxis dataKey="name" tick={{ fontSize: 12 }} />
        <YAxis tick={{ fontSize: 12 }} domain={[-0.4, 1]} />
        <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0" }} />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Bar dataKey="npmi" name="NPMI coherence" fill="#3b63f6" radius={[4, 4, 0, 0]} />
        <Bar dataKey="clarity" name="Label clarity" fill="#10b981" radius={[4, 4, 0, 0]} />
        <Bar dataKey="intra" name="Intra-cluster sim" fill="#f59e0b" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function TrendLineChart({ trends }: { trends: TrendItem[] }) {
  const allYears = Array.from(new Set(trends.flatMap((t) => Object.keys(t.years)))).sort();
  const series = ["LDA", "BERTopic"].map((method) => ({
    method,
    label: trends.find((t) => t.method === method)?.label ?? method,
    data: allYears.map((y) => ({
      year: y,
      count: trends
        .filter((t) => t.method === method)
        .reduce((a, t) => a + (t.years[y] ?? 0), 0),
    })),
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        <XAxis dataKey="year" type="category" allowDuplicatedCategory={false} tick={{ fontSize: 12 }} />
        <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
        <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0" }} />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        {series.map((s, i) => (
          <Line
            key={s.method}
            type="monotone"
            data={s.data}
            dataKey="count"
            name={s.method}
            stroke={i === 0 ? "#3b63f6" : "#7c3aed"}
            strokeWidth={2.5}
            dot={{ r: 4 }}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}

export function ComparisonGroupedChart({
  lda,
  bertopic,
  metric,
}: {
  lda: ModelResult;
  bertopic: ModelResult;
  metric: "avgCoherence" | "avgClarity" | "avgIntraSimilarity";
}) {
  const maxTopics = Math.max(lda.topics.length, bertopic.topics.length);
  const topicKey = { avgCoherence: "coherence", avgClarity: "clarity", avgIntraSimilarity: "intraSimilarity" }[
    metric
  ] as "coherence" | "clarity" | "intraSimilarity";
  const metricOf = (m: ModelResult, i: number) => (m.topics[i] ? Number(m.topics[i][topicKey].toFixed(3)) : 0);
  const data = Array.from({ length: maxTopics }, (_, i) => ({
    name: `T${i + 1}`,
    LDA: metricOf(lda, i),
    BERTopic: metricOf(bertopic, i),
  }));
  const metricLabel =
    metric === "avgCoherence" ? "NPMI coherence" : metric === "avgClarity" ? "Label clarity" : "Intra-cluster similarity";
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        <XAxis dataKey="name" tick={{ fontSize: 12 }} />
        <YAxis tick={{ fontSize: 12 }} domain={[-0.4, 1]} />
        <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0" }} />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Bar dataKey="LDA" name={`LDA · ${metricLabel}`} fill="#3b63f6" radius={[4, 4, 0, 0]} />
        <Bar dataKey="BERTopic" name={`BERTopic · ${metricLabel}`} fill="#7c3aed" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
