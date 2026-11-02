"use client";

import { Suspense, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { Card, EmptyState, PageHeader } from "@/components/ui";

function SearchCore() {
  const router = useRouter();
  const params = useSearchParams();
  const query = params.get("q") ?? "";
  const [input, setInput] = useState(query);
  const { rawTheses, lda, bertopic, analyzing } = useStore();

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(`/search?q=${encodeURIComponent(input.trim())}`);
  };

  const results = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return { theses: [], ldTopics: [], btTopics: [] };

    const theses = rawTheses.filter((t) =>
      (t.title + " " + t.abstract + " " + (t.year ?? "")).toLowerCase().includes(needle)
    );

    const matchTopic = (topics: { id: number; label: string; keywords: { word: string }[] }[]) =>
      topics
        .filter(
          (t) =>
            t.label.toLowerCase().includes(needle) ||
            t.keywords.some((k) => k.word.includes(needle))
        )
        .map((t) => t);

    return {
      theses,
      ldTopics: lda ? matchTopic(lda.topics) : [],
      btTopics: bertopic ? matchTopic(bertopic.topics) : [],
    };
  }, [query, rawTheses, lda, bertopic]);

  return (
    <div>
      <PageHeader
        title="Search"
        icon="🔎"
        subtitle="Search theses, topic labels, and representative keywords across both models."
      />

      <form onSubmit={submit} className="mb-6 flex max-w-2xl gap-2">
        <input
          className="input"
          placeholder="e.g. machine learning, IoT, blockchain, e-commerce…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button type="submit" className="btn-primary shrink-0">
          Search
        </button>
      </form>

      {analyzing && <p className="mb-3 text-xs text-slate-400">Corpus is being re-analyzed… results may be stale.</p>}

      {!query.trim() ? (
        <EmptyState title="Type a keyword to search" message="Try: health, blockchain, farming, chatbot, AR, e-learning…" />
      ) : (
        <div className="space-y-4">
          <Card title={`📚 Matching theses (${results.theses.length})`}>
            {results.theses.length === 0 ? (
              <p className="text-sm text-slate-500">No theses match “{query}”.</p>
            ) : (
              <div className="divide-y divide-slate-100">
                {results.theses.map((t) => (
                  <div key={t.id} className="py-2">
                    <p className="text-sm font-semibold text-slate-800">
                      <span className="mr-2 font-mono text-xs text-slate-400">{t.id}</span>
                      {t.title}
                      {t.year && <span className="ml-2 text-xs text-slate-400">({t.year})</span>}
                    </p>
                    <p className="text-xs text-slate-500">{t.abstract.slice(0, 180)}{t.abstract.length > 180 ? "…" : ""}</p>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <div className="grid gap-4 lg:grid-cols-2">
            <Card title={`🧠 LDA topics matching (${results.ldTopics.length})`}>
              {results.ldTopics.length === 0 ? (
                <p className="text-sm text-slate-500">No LDA topics match.</p>
              ) : (
                <ul className="space-y-2">
                  {results.ldTopics.map((t) => (
                    <li key={t.id}>
                      <button
                        onClick={() => router.push("/keywords")}
                        className="text-sm font-semibold text-brand-700 hover:underline"
                      >
                        T{t.id + 1} — {t.label}
                      </button>
                      <p className="text-xs text-slate-400">{t.keywords.slice(0, 6).map((k) => k.word).join(", ")}</p>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
            <Card title={`🤖 BERTopic topics matching (${results.btTopics.length})`}>
              {results.btTopics.length === 0 ? (
                <p className="text-sm text-slate-500">No BERTopic topics match.</p>
              ) : (
                <ul className="space-y-2">
                  {results.btTopics.map((t) => (
                    <li key={t.id}>
                      <button
                        onClick={() => router.push("/keywords")}
                        className="text-sm font-semibold text-violet-700 hover:underline"
                      >
                        T{t.id + 1} — {t.label}
                      </button>
                      <p className="text-xs text-slate-400">{t.keywords.slice(0, 6).map((k) => k.word).join(", ")}</p>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<PageHeader title="Search" icon="🔎" />}>
      <SearchCore />
    </Suspense>
  );
}
