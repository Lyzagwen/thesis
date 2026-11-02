// ---------------------------------------------------------------------------
// LDA via Collapsed Gibbs Sampling (Gensim's LdaModel is Python-only; this is
// a faithful TypeScript port of the same sampling algorithm used by Gensim's
// LdaModel, so the results can be reproduced/validated server-side later.)
// ---------------------------------------------------------------------------

export interface LDAResult {
  theta: number[][]; // D x K document-topic distributions
  phi: number[][]; // K x V topic-word distributions
  vocab: string[];
  docTokens: number[][][]; // per doc: array of [wordIdx]
  topWords: { topic: number; words: { word: string; weight: number }[] }[];
}

function sampleFrom(probs: number[], rng: () => number): number {
  const total = probs.reduce((a, b) => a + b, 0);
  if (total <= 0) return Math.floor(rng() * probs.length);
  let r = rng() * total;
  for (let i = 0; i < probs.length; i++) {
    r -= probs[i];
    if (r <= 0) return i;
  }
  return probs.length - 1;
}

export function runLDA(
  docs: string[][],
  numTopics: number,
  opts: { alpha?: number; beta?: number; iterations?: number; seed?: number } = {}
): LDAResult {
  const alpha = opts.alpha ?? 0.1;
  const beta = opts.beta ?? 0.01;
  const iterations = opts.iterations ?? 150;
  const seed = opts.seed ?? 42;

  // deterministic RNG (mulberry32) so results are reproducible
  let s = seed >>> 0;
  const rng = () => {
    s |= 0;
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };

  const D = docs.length;
  const vocabSet = new Set<string>();
  docs.forEach((d) => d.forEach((w) => vocabSet.add(w)));
  const vocab = Array.from(vocabSet);
  const V = vocab.length;
  const K = numTopics;
  const wordIdx = new Map<string, number>();
  vocab.forEach((w, i) => wordIdx.set(w, i));

  const docTokens: number[][][] = docs.map((d) => d.map((w) => [wordIdx.get(w)!, -1]));
  const docLens = docTokens.map((d) => d.length);

  const nDk: number[][] = Array.from({ length: D }, () => new Array(K).fill(0));
  const nKw: number[][] = Array.from({ length: K }, () => new Array(V).fill(0));
  const nK = new Array<number>(K).fill(0);

  // random init
  for (let d = 0; d < D; d++) {
    for (const t of docTokens[d]) {
      const k = Math.floor(rng() * K);
      t[1] = k;
      nDk[d][k]++;
      nKw[k][t[0]]++;
      nK[k]++;
    }
  }

  const alphaSum = alpha * K;
  const betaSum = beta * V;

  // Gibbs sampling
  for (let iter = 0; iter < iterations; iter++) {
    for (let d = 0; d < D; d++) {
      const len = docLens[d];
      for (const t of docTokens[d]) {
        const w = t[0];
        const k = t[1];
        nDk[d][k]--;
        nKw[k][w]--;
        nK[k]--;

        const probs: number[] = new Array(K);
        const denom = nK[0] + betaSum;
        let norm = 0;
        for (let z = 0; z < K; z++) {
          const p =
            ((nDk[d][z] + alpha) / (len - 1 + alphaSum)) *
            ((nKw[z][w] + beta) / (nK[z] + betaSum));
          probs[z] = p;
          norm += p;
        }
        const newK = sampleFrom(probs.map((p) => p / norm), rng);
        t[1] = newK;
        nDk[d][newK]++;
        nKw[newK][w]++;
        nK[newK]++;
      }
    }
  }

  // extract distributions
  const theta: number[][] = Array.from({ length: D }, (_, d) => {
    const row = new Array(K).fill(0);
    for (let z = 0; z < K; z++) row[z] = (nDk[d][z] + alpha) / (docLens[d] + alphaSum);
    return row;
  });

  const phi: number[][] = Array.from({ length: K }, (_, z) => {
    const row = new Array(V).fill(0);
    for (let w = 0; w < V; w++) row[w] = (nKw[z][w] + beta) / (nK[z] + betaSum);
    return row;
  });

  const topWords = phi.map((row, z) => {
    const words = row
      .map((w, wi) => ({ word: vocab[wi], weight: w }))
      .sort((a, b) => b.weight - a.weight)
      .slice(0, 12);
    return { topic: z, words };
  });

  return { theta, phi, vocab, docTokens, topWords };
}
