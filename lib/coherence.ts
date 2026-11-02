// ---------------------------------------------------------------------------
// Topic coherence scoring (NPMI-based) + label clarity heuristic.
// NPMI is the core of Gensim's CoherenceModel(..., coherence='c_npmi').
// ---------------------------------------------------------------------------

export function computeNPMI(
  topicWords: string[],
  docs: string[][] // per-document token lists
): number {
  const D = Math.max(1, docs.length);
  const docSets = docs.map((d) => new Set(d));

  const docFreq = (w: string) => docSets.filter((s) => s.has(w)).length;

  const wordPairs: [string, string][] = [];
  const top = Math.min(10, topicWords.length);
  for (let i = 0; i < top; i++) {
    for (let j = i + 1; j < top; j++) {
      wordPairs.push([topicWords[i], topicWords[j]]);
    }
  }
  if (wordPairs.length === 0) return 0;

  let total = 0;
  let pairs = 0;
  for (const [w1, w2] of wordPairs) {
    const f1 = docFreq(w1);
    const f2 = docFreq(w2);
    if (f1 === 0 || f2 === 0) continue;
    const f12 = docSets.filter((s) => s.has(w1) && s.has(w2)).length;
    if (f12 === 0) continue;
    const p1 = f1 / D;
    const p2 = f2 / D;
    const p12 = f12 / D;
    const pmi = Math.log(p12 / (p1 * p2));
    const npmi = pmi / -Math.log(Math.min(1, p12));
    total += npmi;
    pairs++;
  }
  return pairs ? total / pairs : 0;
}

// Normalized pointwise mutual information using a sliding context window
// (UCI-style, another Gensim-supported coherence variant).
export function computeUCI(
  topicWords: string[],
  docs: string[][],
  windowSize = 12
): number {
  const top = Math.min(10, topicWords.length);
  const windows: string[][] = [];
  for (const d of docs) {
    for (let i = 0; i < d.length; i += windowSize) {
      windows.push(d.slice(i, i + windowSize));
    }
  }
  const totalW = Math.max(1, windows.length);
  const wordFreq = (w: string) => windows.filter((win) => win.includes(w)).length;
  const pairFreq = (w1: string, w2: string) =>
    windows.filter((win) => win.includes(w1) && win.includes(w2)).length;

  let total = 0;
  let pairs = 0;
  for (let i = 0; i < top; i++) {
    for (let j = i + 1; j < top; j++) {
      const w1 = topicWords[i];
      const w2 = topicWords[j];
      const f1 = wordFreq(w1);
      const f2 = wordFreq(w2);
      const f12 = pairFreq(w1, w2);
      if (f1 === 0 || f2 === 0 || f12 === 0) continue;
      const pmi = Math.log((f12 * totalW) / (f1 * f2));
      total += Math.max(0, pmi);
      pairs++;
    }
  }
  return pairs ? total / pairs : 0;
}

// Label clarity heuristic (0..1):
// rewards distinct, topic-specific keywords and penalizes words shared with
// other topics or words that appear in nearly every document.
export function labelClarity(
  topicWords: string[],
  otherTopicsWords: string[][],
  docs: string[][]
): number {
  const top = Math.min(8, topicWords.length);
  if (top === 0) return 0;

  const docFreqs = new Map<string, number>();
  for (const d of docs) {
    for (const w of new Set(d)) docFreqs.set(w, (docFreqs.get(w) ?? 0) + 1);
  }
  const D = Math.max(1, docs.length);

  const sharedWords = new Set<string>();
  for (const ow of otherTopicsWords) for (const w of ow) sharedWords.add(w);

  let score = 0;
  for (const w of topicWords.slice(0, top)) {
    const specificity = 1 - (docFreqs.get(w) ?? 0) / D; // rare across corpus = good
    const distinctiveness = sharedWords.has(w) ? 0.3 : 1; // not used by other topics
    score += (specificity * 0.7 + distinctiveness * 0.3) / top;
  }
  return Math.max(0, Math.min(1, score));
}
