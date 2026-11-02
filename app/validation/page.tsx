"use client";

import { FormEvent, useState } from "react";
import { useStore } from "@/lib/store";
import { Card, EmptyState, PageHeader } from "@/components/ui";

const ROLES = ["Adviser", "Faculty", "Student", "Other"] as const;

export default function ValidationPage() {
  const { lda, bertopic, validation, addValidationEntry, clearValidation, analyzing } = useStore();
  const [method, setMethod] = useState<"LDA" | "BERTopic">("LDA");
  const [topicId, setTopicId] = useState(0);
  const [name, setName] = useState("");
  const [role, setRole] = useState<(typeof ROLES)[number]>("Adviser");
  const [relevance, setRelevance] = useState(4);
  const [clarity, setClarity] = useState(4);
  const [coherenceRating, setCoherenceRating] = useState(4);
  const [comment, setComment] = useState("");
  const [saved, setSaved] = useState(false);

  const model = method === "LDA" ? lda : bertopic;
  const topics = model?.topics ?? [];
  const activeTopic = topics[topicId % Math.max(1, topics.length)];

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!activeTopic) return;
    addValidationEntry({
      name: name.trim() || "Anonymous",
      role,
      method,
      topicId: activeTopic.id,
      topicLabel: activeTopic.label,
      relevance,
      clarity,
      coherenceRating,
      comment: comment.trim(),
    });
    setSaved(true);
    setComment("");
    setTimeout(() => setSaved(false), 4000);
  };

  const exportCSV = () => {
    const head = "name,role,method,topicId,topicLabel,relevance,clarity,coherenceRating,comment,date";
    const rows = validation.map((v) =>
      [
        `"${v.name.replace(/"/g, '""')}"`,
        `"${v.role}"`,
        v.method,
        v.topicId + 1,
        `"${v.topicLabel.replace(/"/g, '""')}"`,
        v.relevance,
        v.clarity,
        v.coherenceRating,
        `"${v.comment.replace(/"/g, '""')}"`,
        v.date,
      ].join(",")
    );
    const blob = new Blob([[head, ...rows].join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `thesis_validation_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (analyzing || !topics.length) {
    return (
      <div className="max-w-xl py-10">
        <PageHeader title="Adviser Validation" icon="🗳️" />
        <EmptyState title="No groupings to rate yet" message="Run the pipeline first so advisers have clusters to review." />
      </div>
    );
  }

  const starRow = (label: string, value: number, setter: (n: number) => void) => (
    <div>
      <p className="label">{label}</p>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => setter(n)}
            className={`text-2xl transition ${n <= value ? "text-amber-400" : "text-slate-200 hover:text-amber-200"}`}
            aria-label={`${label}: ${n}/5`}
          >
            ★
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div>
      <PageHeader
        title="Adviser & Faculty Validation"
        icon="🗳️"
        subtitle="Voluntary rating form. Advisers and faculty sanity-check the machine groupings and labels — human judgement stays in the loop."
      />

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Form */}
        <Card title="✍️ Rate a cluster">
          <form onSubmit={submit} className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Your name (optional)</label>
                <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Anonymous" />
              </div>
              <div>
                <label className="label">Role</label>
                <select className="input" value={role} onChange={(e) => setRole(e.target.value as (typeof ROLES)[number])}>
                  {ROLES.map((r) => (
                    <option key={r}>{r}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Method</label>
                <div className="flex rounded-lg bg-slate-100 p-1">
                  {(["LDA", "BERTopic"] as const).map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => {
                        setMethod(m);
                        setTopicId(0);
                      }}
                      className={`flex-1 rounded-md px-2 py-1.5 text-sm font-semibold transition ${
                        method === m ? "bg-white text-brand-700 shadow-sm" : "text-slate-500"
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="label">Cluster</label>
                <select className="input" value={activeTopic?.id ?? 0} onChange={(e) => setTopicId(Number(e.target.value))}>
                  {topics.map((t) => (
                    <option key={t.id} value={t.id}>
                      T{t.id + 1} — {t.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {activeTopic && (
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <p className="mb-1 text-xs font-bold uppercase text-slate-400">Reviewing</p>
                <p className="text-sm font-bold text-slate-800">
                  {method} · T{activeTopic.id + 1} — {activeTopic.label}
                </p>
                <div className="mt-2 flex flex-wrap gap-1">
                  {activeTopic.keywords.slice(0, 6).map((k) => (
                    <span key={k.word} className="badge bg-white text-slate-600">{k.word}</span>
                  ))}
                </div>
              </div>
            )}

            {starRow("Relevance of the grouping", relevance, setRelevance)}
            {starRow("Clarity of the topic label", clarity, setClarity)}
            {starRow("Does the cluster hold together?", coherenceRating, setCoherenceRating)}

            <div>
              <label className="label">Comment (optional)</label>
              <textarea
                className="input min-h-[4.5rem]"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="e.g. This cluster mixes web systems with e-commerce; suggest renaming."
              />
            </div>

            <button type="submit" className="btn-primary">
              💾 Submit rating
            </button>
            {saved && <p className="text-sm font-semibold text-emerald-600">✅ Saved! Thank you for validating.</p>}
          </form>
        </Card>

        {/* Summary + table */}
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="card text-center">
              <p className="text-xs font-bold uppercase text-slate-400">Submissions</p>
              <p className="text-3xl font-extrabold text-brand-700">{validation.length}</p>
            </div>
            <div className="card text-center">
              <p className="text-xs font-bold uppercase text-slate-400">Avg rating</p>
              <p className="text-3xl font-extrabold text-emerald-600">
                {validation.length
                  ? (
                      validation.reduce((a, v) => a + v.relevance + v.clarity + v.coherenceRating, 0) /
                      (validation.length * 3)
                    ).toFixed(2)
                  : "—"}
              </p>
            </div>
          </div>

          <Card title="Submitted ratings">
            {validation.length === 0 ? (
              <p className="text-sm text-slate-500">No ratings yet. Share the link with your advisers and faculty.</p>
            ) : (
              <div className="max-h-[22rem] overflow-auto">
                <table className="tbl">
                  <thead className="sticky top-0">
                    <tr>
                      <th>Who</th>
                      <th>Cluster</th>
                      <th>Rel</th>
                      <th>Clr</th>
                      <th>Coh</th>
                      <th>Comment</th>
                    </tr>
                  </thead>
                  <tbody>
                    {validation.map((v) => (
                      <tr key={v.id}>
                        <td className="text-xs">
                          <p className="font-semibold text-slate-700">{v.name}</p>
                          <span className="badge bg-slate-100 text-slate-500">{v.role}</span>
                        </td>
                        <td className="text-xs">
                          <span className="badge bg-brand-50 text-brand-700">{v.method} T{v.topicId + 1}</span>
                          <p className="mt-1 text-slate-500">{v.topicLabel}</p>
                        </td>
                        <td className="text-center font-mono text-xs">{v.relevance}</td>
                        <td className="text-center font-mono text-xs">{v.clarity}</td>
                        <td className="text-center font-mono text-xs">{v.coherenceRating}</td>
                        <td className="max-w-[12rem] text-xs text-slate-500">{v.comment || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>

          <div className="flex gap-2">
            <button className="btn-secondary" onClick={exportCSV}>
              ⬇️ Export ratings (CSV)
            </button>
            {validation.length > 0 && (
              <button className="btn-danger" onClick={() => confirm("Delete all submitted ratings?") && clearValidation()}>
                🗑️ Clear ratings
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

