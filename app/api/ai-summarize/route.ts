import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

interface SummarizeBody {
  label: string;
  keywords: string[];
  docs: { title: string; abstract: string }[];
}

// Optional OpenAI-backed summarization. When OPENAI_API_KEY is not configured,
// the client automatically falls back to the local extractive summarizer so the
// feature always works (important when experimenting on Vercel's free tier).
export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as SummarizeBody;
    const label = body.label ?? "this topic";
    const keywords = body.keywords ?? [];
    const docs = body.docs ?? [];

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({
        ok: false,
        used: "local",
        error: "OPENAI_API_KEY not configured — local extractive summary used instead.",
      });
    }

    const corpus = docs
      .slice(0, 15)
      .map((d) => `- ${d.title}${d.abstract ? ": " + d.abstract : ""}`)
      .join("\n");

    const messages = [
      {
        role: "system" as const,
        content:
          "You summarize academic topic clusters for a BSCS thesis recommender. Be concise, factual, and mention what has been done and what remains underexplored.",
      },
      {
        role: "user" as const,
        content: `Topic label: ${label}\nKeywords: ${keywords.join(", ")}\nPast thesis examples:\n${corpus || "None available"}\n\nWrite a 3-4 sentence summary of this topic cluster as an AI research assistant.`,
      },
    ];

    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages,
        max_tokens: 300,
        temperature: 0.4,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      return NextResponse.json({
        ok: false,
        used: "local",
        error: `OpenAI API error (${res.status}): ${errText.slice(0, 200)}`,
      });
    }

    const data = await res.json();
    const summary = data?.choices?.[0]?.message?.content?.trim();
    if (!summary) {
      return NextResponse.json({ ok: false, used: "local", error: "Empty response from OpenAI" });
    }
    return NextResponse.json({ ok: true, used: "openai", summary });
  } catch (e) {
    return NextResponse.json({
      ok: false,
      used: "local",
      error: e instanceof Error ? e.message : "Server error",
    });
  }
}
