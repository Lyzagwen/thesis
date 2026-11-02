# 🎓 Thesis Topic Recommender (BSCS)

A full **topic-modeling dashboard** for past BSCS theses: it cleans a thesis
collection, clusters it with **LDA (Gensim-style)** and **BERTopic**, scores
coherence, detects research **gaps & trends**, lets advisers **validate**
groupings, summarizes topics with **AI**, and presents everything as charts and
tables so students can choose a thesis topic with evidence.

> ⚠️ **Data status:** real BSCS thesis data has **not been collected yet**.
> The app ships with **30 clearly-labeled sample theses** and a **CSV/JSON
> upload** so it is fully functional today. Swap in the real archive later by
> uploading a file (format below).

## ✅ Feature checklist

| # | Feature | Where |
|---|---------|-------|
| 1 | Thesis collection & cleaning (stopwords EN+Filipino, duplicates, special chars, stemming) | `/collection`, `/cleaning` |
| 2 | Automatic grouping by theme (LDA via Gibbs sampling = Gensim LdaModel equivalent; BERTopic pipeline port) | `/clusters` |
| 3 | Representative keywords + thesis→topic assignment | `/keywords`, `/clusters` |
| 4 | Trends & topic frequencies | `/trends` |
| 5 | Gaps (rare/missing topics, clearly labeled as "verify manually") | `/gaps` |
| 6 | LDA vs BERTopic comparison (coherence, label clarity, member relevance) | `/comparison` |
| 7 | Coherence scoring (NPMI per cluster + clarity + intra-cluster similarity) | `/coherence` |
| 8 | Adviser/faculty voluntary rating form (+ CSV export) | `/validation` |
| 9 | Visual/table summaries (Recharts bar/line charts, tables) | Dashboard + `/trends`, `/comparison` |
| 10 | AI summarization (GPT via `OPENAI_API_KEY`, local extractive fallback) | `/summaries` |

Plus: **upload**, **search** (sidebar + `/search`), **AI Summarize** and copy buttons.

## 🚀 Run locally

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # production build
npm start
```

## ☁️ Deploy on Vercel

1. Push this folder to a GitHub/GitLab repo.
2. In Vercel → **Add New Project** → import the repo.
3. Framework preset: **Next.js** (auto-detected). Build command stays
   `npm run build`. No special settings needed.
4. Optional — real AI summaries: add an environment variable
   `OPENAI_API_KEY=sk-...` in Project → Settings → Environment Variables.
   Without it the app automatically uses the built-in extractive summarizer.
5. Deploy. The analysis runs **in the browser** (localStorage), so Vercel's
   free tier is plenty — no Python server required.

## 📥 Upload format

CSV (columns: `title, abstract, year, author`) or JSON
(`[{ "title": "...", "abstract": "...", "year": "2024", "author": "..." }]` or
`{ "theses": [...] }`). A template is downloadable on the Collection page;
see also [`sample_upload.csv`](sample_upload.csv).

## 🧠 How the models work here

- **LDA** — Collapsed Gibbs sampler, the same algorithm behind Gensim's
  `LdaModel` (`lib/lda.ts`). Soft clustering; every thesis gets a topic
  distribution.
- **BERTopic** — Python's BERTopic can't run on Vercel, so this is a faithful
  browser port of its pipeline (`lib/bertopic.ts`):
  **TF-IDF → random projection (UMAP stand-in) → k-means++ (HDBSCAN stand-in)
  → c-TF-IDF topic representations**. When a Python backend is added later,
  swap the outputs in `lib/analysis.ts`.

## 📝 Notes

- Everything (upload + analysis + ratings) is stored in **localStorage** — no
  student data leaves the browser during analysis. Clearing browser data resets
  the app.
- Gap detection explicitly states absence ≠ proof no research exists; advisers
  should verify against the official thesis repository.
- All sample theses are synthetic and only for demonstration.

## 📁 Project structure

```
app/                  pages (dashboard, collection, cleaning, clusters, keywords,
                       trends, gaps, comparison, coherence, validation, summaries, search)
app/api/ai-summarize  optional OpenAI endpoint + local fallback
components/           sidebar/nav, charts (Recharts), topic cards, upload zone, UI kit
lib/                  types, stopwords, cleaning, LDA, BERTopic-port, coherence,
                       labels, analysis orchestrator, AI summary helpers, context store
tests/smoke.ts        pipeline smoke test (npx tsc + node)
```
