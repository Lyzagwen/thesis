import { KeywordWeight, Topic, Thesis } from "./types";

// ---------------------------------------------------------------------------
// AI summarization.
// 1. If OPENAI_API_KEY is configured, the /api/ai-summarize route calls GPT
//    and returns a fluent paragraph.
// 2. Otherwise (or on API failure) a local extractive summarizer produces a
//    ready-to-use summary so the button always works.
// ---------------------------------------------------------------------------

export function extractiveSummary(text: string, numSentences = 4): string {
  const sentences = text
    .split(/(?<=[.!?])\s+|\n+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 20);

  if (sentences.length <= numSentences) return sentences.join(" ") || text;

  const words = text.toLowerCase().split(/[^a-z]+/).filter((w) => w.length > 3 && !["this", "that", "with", "from", "have", "were", "will", "system"].includes(w));
  const freq = new Map<string, number>();
  words.forEach((w) => freq.set(w, (freq.get(w) ?? 0) + 1));

  const scored = sentences.map((sentence, i) => {
    const tokens = sentence.toLowerCase().split(/[^a-z]+/).filter((w) => w.length > 3);
    const score = tokens.reduce((a, w) => a + (freq.get(w) ?? 0), 0) / Math.max(1, tokens.length);
    return { sentence, score, i };
  });

  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, numSentences)
    .sort((a, b) => a.i - b.i)
    .map((s) => s.sentence)
    .join(" ");
}

export function buildTopicContext(
  topic: Topic
): { label: string; keywords: string[]; docs: { title: string; abstract: string }[] } {
  return {
    label: topic.label,
    keywords: topic.keywords.slice(0, 10).map((k: KeywordWeight) => k.word),
    docs: topic.documentIds.slice(0, 12).map((id) => {
      return { title: id, abstract: "" };
    }),
  };
}

// Local extractive summary over an entire topic cluster
export function localTopicSummary(topic: Topic, theses: Thesis[]): string {
  const members = topic.documentIds
    .map((id) => theses.find((t) => t.id === id))
    .filter((t): t is Thesis => Boolean(t));

  const labelIntro = `Topic "${topic.label}" covers ${members.length} past BSCS thesis/projects. `;
  const keywords = `Representative keywords: ${topic.keywords
    .slice(0, 8)
    .map((k) => k.word)
    .join(", ")}. `;

  const combined = members
    .map((m) => `${m.title}. ${m.abstract}`)
    .join(" ");
  const body = extractiveSummary(combined, 4);

  return labelIntro + keywords + (body ? body : "No member records available for summarization.");
}

export interface AISummaryResponse {
  ok: boolean;
  summary?: string;
  used: "openai" | "local";
  error?: string;
}

export async function requestAISummary(opts: {
  label: string;
  keywords: string[];
  docs: { title: string; abstract: string }[];
}): Promise<AISummaryResponse> {
  try {
    const res = await fetch("/api/ai-summarize", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(opts),
    });
    const data = (await res.json()) as AISummaryResponse;
    if (data.ok && data.summary) return data;
    return { ok: false, used: "local", error: data.error ?? "No summary returned" };
  } catch (e) {
    return { ok: false, used: "local", error: e instanceof Error ? e.message : "Request failed" };
  }
}
