import { CleanedThesis, Gap, ModelResult, Topic, TrendItem } from "./types";
import { runLDA } from "./lda";
import { tfidf, randomProjection, kmeans, cTFIDF } from "./bertopic";
import { computeNPMI, labelClarity } from "./coherence";
import { generateLabel } from "./labels";

// ---------------------------------------------------------------------------
// Orchestrator: runs the LDA + BERTopic pipelines and produces every artifact
// the app needs (topics, keywords, trends, gaps, comparison data).
// ---------------------------------------------------------------------------

export interface PipelineOutput {
  lda: ModelResult;
  bertopic: ModelResult;
  trends: TrendItem[];
  gaps: Gap[];
  compared: boolean;
}

function pickTopicCount(docCount: number): number {
  if (docCount < 6) return 3;
  if (docCount < 12) return 4;
  if (docCount < 25) return 6;
  return Math.max(6, Math.min(10, Math.round(docCount / 4)));
}

function buildTopics(
  method: "LDA" | "BERTopic",
  cleaned: CleanedThesis[],
  keywordsByTopic: { topic: number; words: { word: string; weight: number }[] }[],
  assignments: number[],
  docTheta: Record<string, number[]> | null,
  K: number
): { topics: Topic[]; docTopics: Record<string, number> } {
  const D = cleaned.length;
  const tokenDocs = cleaned.map((c) => c.tokens);

  const allWords = keywordsByTopic.map((k) => k.words.map((w) => w.word));
  const topics: Topic[] = [];
  const docTopics: Record<string, number> = {};

  for (let z = 0; z < K; z++) {
    const kb = keywordsByTopic.find((k) => k.topic === z);
    const words = kb ? kb.words : [];
    const docIds = cleaned
      .map((c, i) => ({ c, i }))
      .filter(({ i }) => assignments[i] === z)
      .map(({ c }) => c.id);

    const label = generateLabel(words);
    const coherence = computeNPMI(
      words.slice(0, 10).map((w) => w.word),
      tokenDocs
    );

    // intra-cluster similarity: average cosine similarity among member docs
    let intraSimilarity = 0;
    if (docIds.length > 1) {
      let total = 0;
      let pairs = 0;
      for (let i = 0; i < docIds.length; i++) {
        for (let j = i + 1; j < docIds.length; j++) {
          const di = cleaned.findIndex((c) => c.id === docIds[i]);
          const dj = cleaned.findIndex((c) => c.id === docIds[j]);
          total += tokenCosine(tokenDocs[di], tokenDocs[dj]);
          pairs++;
        }
      }
      intraSimilarity = pairs ? total / pairs : 0;
    }

    const clarity = labelClarity(
      words.slice(0, 8).map((w) => w.word),
      allWords.filter((_, i) => i !== z),
      tokenDocs
    );

    const topic: Topic = {
      id: z,
      method,
      label,
      keywords: words,
      documentIds: docIds,
      frequency: docIds.length,
      percentage: D ? (docIds.length / D) * 100 : 0,
      coherence,
      intraSimilarity,
      clarity,
    };
    topics.push(topic);
    docIds.forEach((id) => (docTopics[id] = z));
  }

  return { topics, docTopics };
}

function avg(arr: number[]): number {
  return arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;
}

// Cosine similarity between two token vectors
function tokenCosine(a: string[], b: string[]): number {
  const aCount = new Map<string, number>();
  const bCount = new Map<string, number>();
  a.forEach((w) => aCount.set(w, (aCount.get(w) ?? 0) + 1));
  b.forEach((w) => bCount.set(w, (bCount.get(w) ?? 0) + 1));
  let dot = 0;
  let naSq = 0;
  let nbSq = 0;
  bCount.forEach((c) => (nbSq += c * c));
  aCount.forEach((c, w) => {
    naSq += c * c;
    const bc = bCount.get(w) ?? 0;
    if (bc) dot += c * bc;
  });
  if (naSq === 0 || nbSq === 0) return 0;
  return dot / (Math.sqrt(naSq) * Math.sqrt(nbSq));
}

export function runPipeline(cleaned: CleanedThesis[]): PipelineOutput {
  const D = cleaned.length;
  const tokenDocs = cleaned.map((c) => c.tokens);
  const K = pickTopicCount(D);

  // ------------------------- LDA -------------------------------------------
  const ldaStart = performance.now();
  const ldaResult = runLDA(tokenDocs, K, { alpha: 0.1, beta: 0.01, iterations: 150, seed: 42 });
  const ldaTheta = cleaned.reduce<Record<string, number[]>>((acc, c, i) => {
    acc[c.id] = ldaResult.theta[i];
    return acc;
  }, {});
  const ldaAssignments = ldaResult.theta.map((row) => row.indexOf(Math.max(...row)));
  const ldaTopicsData = buildTopics("LDA", cleaned, ldaResult.topWords, ldaAssignments, ldaTheta, K);
  const ldaTime = performance.now() - ldaStart;

  const lda: ModelResult = {
    method: "LDA",
    topics: ldaTopicsData.topics,
    docTopics: ldaTopicsData.docTopics,
    docTheta: ldaTheta,
    avgCoherence: avg(ldaTopicsData.topics.map((t) => t.coherence)),
    avgClarity: avg(ldaTopicsData.topics.map((t) => t.clarity)),
    avgIntraSimilarity: avg(ldaTopicsData.topics.map((t) => t.intraSimilarity)),
    labeledPct: 100,
    runningTimeMs: ldaTime,
    params: { algorithm: "Collapsed Gibbs (Gensim LdaModel equivalent)", topics: K, alpha: 0.1, beta: 0.01, iterations: 150 },
  };

  // ------------------------- BERTopic --------------------------------------
  const btStart = performance.now();
  const { matrix } = tfidf(tokenDocs);
  const proj = randomProjection(matrix, Math.min(40, Math.max(2, D - 1)), 7);
  const { clusters } = kmeans(proj, K, { maxIter: 40, seed: 11 });
  const ctKeywords = cTFIDF(tokenDocs, clusters, K, 12);
  const btTopicsData = buildTopics("BERTopic", cleaned, ctKeywords, clusters, null, K);
  const btTime = performance.now() - btStart;

  const bertopic: ModelResult = {
    method: "BERTopic",
    topics: btTopicsData.topics,
    docTopics: btTopicsData.docTopics,
    docTheta: {},
    avgCoherence: avg(btTopicsData.topics.map((t) => t.coherence)),
    avgClarity: avg(btTopicsData.topics.map((t) => t.clarity)),
    avgIntraSimilarity: avg(btTopicsData.topics.map((t) => t.intraSimilarity)),
    labeledPct: 100,
    runningTimeMs: btTime,
    params: { algorithm: "TF-IDF + k-means + c-TF-IDF (BERTopic pipeline, browser port)", topics: K, reduction: "random projection", clusterer: "k-means++" },
  };

  // ------------------------- Trends -----------------------------------------
  const trends: TrendItem[] = [lda, bertopic].map((model) =>
    model.topics.map((t) => {
      const years: Record<string, number> = {};
      for (const id of t.documentIds) {
        const doc = cleaned.find((c) => c.id === id);
        if (doc?.year) years[doc.year] = (years[doc.year] ?? 0) + 1;
      }
      return {
        method: model.method,
        topicId: t.id,
        label: t.label,
        count: t.frequency,
        percentage: t.percentage,
        years,
      };
    })
  ).flat();

  // ------------------------- Gaps -------------------------------------------
  const gaps = computeGaps(cleaned, lda, bertopic);

  return { lda, bertopic, trends, gaps, compared: true };
}

// ---------------------------------------------------------------------------
// Research-gap detection:
//   1) rare topics (low share of documents) within each model
//   2) trending BSCS areas with no / almost no coverage in the corpus
// Gaps are *suggestions* — absence of a topic does not prove no research exists.
// ---------------------------------------------------------------------------

export const TRENDING_AREAS: { area: string; keywords: string[] }[] = [
  { area: "Explainable AI (XAI)", keywords: ["explain", "interpret", "shap", "xai", "black box"] },
  { area: "Generative AI / LLM applications", keywords: ["generat", "llm", "large language", "gpt", "prompt", "transformer", "diffus"] },
  { area: "Computer Vision for Agriculture", keywords: ["crop", "leaf", "plant", "agri", "farm", "rice", "pest"] },
  { area: "Edge / On-device AI", keywords: ["edge", "on-device", "lightweight", "tinyml", "quantiz", "tflite"] },
  { area: "Quantum Computing concepts", keywords: ["quantum", "qubit", "superposit"] },
  { area: "Robotics & Autonomous Systems", keywords: ["robot", "autonom", "drone", "uav", "guidance", "pathfind", "obstacle"] },
  { area: "Digital Twin / Simulation", keywords: ["digital twin", "twin", "simul", "digital replic"] },
  { area: "Wearable & Assistive Technology", keywords: ["wearab", "assist", "braille", "hearing", "prosthetic", "access"] },
  { area: "E-Health / Telemedicine", keywords: ["telemed", "health", "medic", "clinic", "patient", "remote"] },
  { area: "Green IT / Sustainability Analytics", keywords: ["sustainab", "carbon", "energi", "renewab", "green", "waste", "recycl"] },
  { area: "FinTech & Digital Wallets", keywords: ["fintech", "wallet", "payment", "bank", "cryptocurrency", "loan"] },
  { area: "Smart City Systems", keywords: ["smart citi", "urban", "traffic", "parking", "municipal", "public transport"] },
  { area: "Gamification in Education", keywords: ["gamif", "badge", "leaderboard", "point", "motivat", "engagement"] },
  { area: "Metaverse / Social VR", keywords: ["metavers", "social vr", "avatar", "immers"] },
  { area: "Speech & Audio Processing", keywords: ["speech", "audio", "voice", "synthes"] },
];

export function computeGaps(
  cleaned: CleanedThesis[],
  lda: ModelResult,
  bertopic: ModelResult
): Gap[] {
  const gaps: Gap[] = [];
  const D = cleaned.length;
  const threshold = Math.max(1, Math.round(D * 0.08));

  // 1) rare topics per model
  for (const model of [lda, bertopic]) {
    for (const t of model.topics) {
      if (t.percentage < 8 && t.frequency <= threshold) {
        gaps.push({
          id: `${model.method}-topic-${t.id}`,
          area: `${model.method} topic #${t.id + 1} ("${t.label}")`,
          keywords: t.keywords.slice(0, 5).map((k) => k.word),
          matchedDocs: t.frequency,
          status: "under-researched",
          suggestedReason:
            "This cluster is very small — few past theses fall here. It may be a niche worth exploring, but verify manually before committing.",
          method: model.method,
        });
      }
    }
  }

  // 2) trending-area coverage across the whole corpus
  const corpusText = cleaned
    .map((c) => (c.cleanedTitle + " " + c.cleanedAbstract).toLowerCase())
    .join(" ");

  for (const area of TRENDING_AREAS) {
    const matched = area.keywords.filter((kw) => corpusText.includes(kw.toLowerCase()));
    if (matched.length === 0) {
      gaps.push({
        id: `area-${area.area.replace(/\s+/g, "-")}`,
        area: area.area,
        keywords: area.keywords,
        matchedDocs: 0,
        status: "absent",
        suggestedReason:
          "No past BSCS thesis in the current collection covers this trending area. Absence here does not prove no research exists — verify with the official repository before proposing it.",
        method: "corpus",
      });
    }
  }

  return gaps;
}
