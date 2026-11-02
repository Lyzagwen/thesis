// ---------------------------------------------------------------------------
// BERTopic-style topic modeling in the browser.
// BERTopic (Python) pipeline:  embeddings -> UMAP -> HDBSCAN -> c-TF-IDF.
// TypeScript port used here because Vercel runs Node.js, not Python:
//   TF-IDF vectors (embedding proxy) -> random projection (UMAP stand-in)
//   -> k-means (HDBSCAN stand-in) -> class-based TF-IDF (c-TF-IDF).
// Results are labeled as approximate so they can be reproduced with the real
// Python library later when a Python backend is added.
// ---------------------------------------------------------------------------

export interface TFIDFResult {
  matrix: number[][]; // D x V
  vocab: string[];
}

export function tfidf(docs: string[][]): TFIDFResult {
  const vocabSet = new Set<string>();
  docs.forEach((d) => d.forEach((w) => vocabSet.add(w)));
  const vocab = Array.from(vocabSet);
  const V = vocab.length;
  const D = docs.length;
  const df = new Array<number>(V).fill(0);
  const raw: number[][] = [];

  for (const d of docs) {
    const counts = new Map<string, number>();
    const seen = new Set<string>();
    d.forEach((w) => {
      counts.set(w, (counts.get(w) ?? 0) + 1);
      if (!seen.has(w)) {
        seen.add(w);
        df[vocab.indexOf(w)]++;
      }
    });
    const row = new Array<number>(V).fill(0);
    counts.forEach((c, w) => {
      row[vocab.indexOf(w)] = c;
    });
    raw.push(row);
  }

  const matrix = raw.map((row) => {
    const n = row.reduce((a, b) => a + b, 0);
    if (n === 0) return row;
    return row.map((c, wi) => {
      const tf = c / n;
      const idf = Math.log(1 + D / (1 + df[wi]));
      return tf * idf;
    });
  });

  return { matrix, vocab };
}

// L2-normalize rows
function normalizeRows(mat: number[][]): number[][] {
  return mat.map((row) => {
    const norm = Math.sqrt(row.reduce((a, b) => a + b * b, 0)) || 1;
    return row.map((v) => v / norm);
  });
}

// Random projection (Johnson-Lindenstrauss) as a UMAP stand-in
export function randomProjection(mat: number[][], targetDim: number, seed = 7): number[][] {
  const D = mat.length;
  const V = mat[0].length;
  let s = seed >>> 0;
  const rng = () => {
    s |= 0;
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const proj: number[][] = Array.from({ length: targetDim }, () =>
    Array.from({ length: V }, () => (rng() > 0.5 ? 1 : -1) * Math.sqrt(3))
  );
  const out: number[][] = Array.from({ length: D }, () => new Array(targetDim).fill(0));
  for (let d = 0; d < D; d++) {
    for (let t = 0; t < targetDim; t++) {
      let acc = 0;
      const p = proj[t];
      const row = mat[d];
      for (let w = 0; w < V; w++) acc += row[w] * p[w];
      out[d][t] = acc;
    }
  }
  return normalizeRows(out);
}

// k-means clustering
export function kmeans(
  points: number[][],
  k: number,
  { maxIter = 40, seed = 11 }: { maxIter?: number; seed?: number } = {}
): { clusters: number[]; centroids: number[][] } {
  const D = points.length;
  const dim = points[0].length;
  let s = seed >>> 0;
  const rng = () => {
    s |= 0;
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };

  // k-means++ initialization
  const centroids: number[][] = [];
  const firstIdx = Math.floor(rng() * D);
  centroids.push([...points[firstIdx]]);
  while (centroids.length < k) {
    const dists = points.map((p) => {
      const d = centroids.reduce((best, c) => {
        let acc = 0;
        for (let i = 0; i < dim; i++) acc += (p[i] - c[i]) ** 2;
        return Math.min(best, acc);
      }, Infinity);
      return d;
    });
    const total = dists.reduce((a, b) => a + b, 0) || 1;
    let r = rng() * total;
    let chosen = 0;
    for (let i = 0; i < D; i++) {
      r -= dists[i];
      if (r <= 0) {
        chosen = i;
        break;
      }
    }
    centroids.push([...points[chosen]]);
  }

  const clusters = new Array<number>(D).fill(0);
  for (let iter = 0; iter < maxIter; iter++) {
    let changed = false;
    for (let i = 0; i < D; i++) {
      let best = 0;
      let bestD = Infinity;
      for (let c = 0; c < k; c++) {
        let acc = 0;
        const cent = centroids[c];
        const p = points[i];
        for (let d = 0; d < dim; d++) acc += (p[d] - cent[d]) ** 2;
        if (acc < bestD) {
          bestD = acc;
          best = c;
        }
      }
      if (clusters[i] !== best) {
        clusters[i] = best;
        changed = true;
      }
    }
    if (!changed) break;
    const sums = Array.from({ length: k }, () => new Array(dim).fill(0));
    const counts = new Array<number>(k).fill(0);
    for (let i = 0; i < D; i++) {
      const c = clusters[i];
      counts[c]++;
      const row = sums[c];
      const p = points[i];
      for (let d = 0; d < dim; d++) row[d] += p[d];
    }
    for (let c = 0; c < k; c++) {
      if (counts[c] > 0) {
        for (let d = 0; d < dim; d++) centroids[c][d] = sums[c][d] / counts[c];
      }
    }
  }
  return { clusters, centroids };
}

// Cosine similarity between two row vectors
export function cosine(a: number[], b: number[]): number {
  let dot = 0;
  let na = 0;
  let nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  if (na === 0 || nb === 0) return 0;
  return dot / (Math.sqrt(na) * Math.sqrt(nb));
}

// c-TF-IDF topic representation (BERTopic's signature step)
export function cTFIDF(
  docs: string[][],
  clusters: number[],
  k: number,
  topN = 12
): { topic: number; words: { word: string; weight: number }[] }[] {
  const vocabSet = new Set<string>();
  docs.forEach((d) => d.forEach((w) => vocabSet.add(w)));
  const vocab = Array.from(vocabSet);

  const classFreq: Map<number, Map<string, number>> = new Map();
  const classTotal = new Array<number>(k).fill(0);
  const globalFreq = new Map<string, number>();

  docs.forEach((d, di) => {
    const c = clusters[di];
    if (!classFreq.has(c)) classFreq.set(c, new Map());
    const cf = classFreq.get(c)!;
    d.forEach((w) => {
      cf.set(w, (cf.get(w) ?? 0) + 1);
      classTotal[c]++;
      globalFreq.set(w, (globalFreq.get(w) ?? 0) + 1);
    });
  });

  const A = docs.length;

  const result: { topic: number; words: { word: string; weight: number }[] }[] = [];
  for (let c = 0; c < k; c++) {
    const cf = classFreq.get(c) ?? new Map<string, number>();
    const rows: { word: string; weight: number }[] = [];
    for (const word of vocab) {
      const tf = (cf.get(word) ?? 0) / (classTotal[c] || 1);
      const df = globalFreq.get(word) ?? 0;
      const ctfidf = tf * Math.log(1 + A / (1 + df));
      if (ctfidf > 0) rows.push({ word, weight: ctfidf });
    }
    rows.sort((a, b) => b.weight - a.weight);
    result.push({ topic: c, words: rows.slice(0, topN) });
  }
  return result;
}
