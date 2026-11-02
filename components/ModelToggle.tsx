"use client";

export function ModelToggle({
  method,
  onChange,
}: {
  method: "LDA" | "BERTopic";
  onChange: (m: "LDA" | "BERTopic") => void;
}) {
  const base = "flex-1 rounded-lg px-3 py-2 text-sm font-semibold transition";
  return (
    <div className="inline-flex w-64 rounded-xl border border-slate-200 bg-slate-100 p-1">
      {(["LDA", "BERTopic"] as const).map((m) => (
        <button
          key={m}
          onClick={() => onChange(m)}
          className={`${base} ${method === m ? "bg-white text-brand-700 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
        >
          {m === "LDA" ? "🧠 LDA (Gensim)" : "🤖 BERTopic"}
        </button>
      ))}
    </div>
  );
}
