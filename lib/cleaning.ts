import { CleanedThesis, CleaningStats, Thesis } from "./types";
import { isStopword } from "./stopwords";

// ---------------------------------------------------------------------------
// Step 1 — Thesis collection & cleaning
// Gensim-style preprocessing ported to TypeScript:
//   1. lowercase            2. remove URLs / emails / numbers
//   3. strip punctuation    4. remove stopwords (EN + FIL)
//   5. light suffix stemming 6. duplicate removal
// ---------------------------------------------------------------------------

const URL_RE = /\b(?:https?|ftp):\/\/\S+|www\.\S+/gi;
const EMAIL_RE = /[\w.+-]+@[\w-]+\.[\w.]+/gi;
const NUMBER_RE = /\b\d+(?:[.,]\d+)+\b|\b\d+\b/gi;
const PUNCT_RE = /[^\p{L}\p{N}\s]/gu;
const WHITESPACE_RE = /\s+/g;

// Light suffix stemmer (Porter-lite) — keeps compute fast in the browser.
const SUFFIX_RULES: [RegExp, string][] = [
  [/ationally$/i, "ate"], [/ization$/i, "ize"], [/ational$/i, "ate"],
  [/fulness$/i, "ful"], [/ousness$/i, "ous"], [/iveness$/i, "ive"],
  [/bilities$/i, "ble"], [/biliti$/i, "ble"], [/fulness$/i, "ful"],
  [/ments$/i, "ment"], [/ment$/i, "ment"], [/tions$/i, "tion"],
  [/tion$/i, "tion"], [/ities$/i, "ity"], [/ity$/i, "ity"],
  [/ings$/i, "ing"], [/ing$/i, ""], [/ed$/i, ""], [/es$/i, ""],
  [/s$/i, ""],
];

export function stem(word: string): string {
  let w = word;
  if (w.length <= 3) return w;
  for (const [re, suffix] of SUFFIX_RULES) {
    if (re.test(w) && w.replace(re, "").length > 2) {
      w = w.replace(re, suffix);
      break;
    }
  }
  return w;
}

export function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(URL_RE, " ")
    .replace(EMAIL_RE, " ")
    .replace(NUMBER_RE, " ")
    .replace(PUNCT_RE, " ")
    .split(WHITESPACE_RE)
    .map((t) => t.trim())
    .filter((t) => t.length > 2 && !isStopword(t))
    .map(stem);
}

export function cleanText(raw: string): {
  cleaned: string;
  tokens: string[];
  removedStopwords: number;
  removedChars: number;
} {
  const original = raw.toLowerCase();
  const cleanedUrl = original.replace(URL_RE, " ").replace(EMAIL_RE, " ");
  const cleanedNumbers = cleanedUrl.replace(NUMBER_RE, " ");
  const removedChars = cleanedNumbers.length - cleanedNumbers.replace(PUNCT_RE, "").length;

  const words = cleanedNumbers.replace(PUNCT_RE, " ").split(WHITESPACE_RE).filter(Boolean);

  let removedStopwords = 0;
  const kept: string[] = [];
  for (const w of words) {
    if (isStopword(w) || w.length <= 2) {
      removedStopwords++;
    } else {
      kept.push(w);
    }
  }

  const tokens = kept.map(stem).filter((t) => t.length > 1);
  return { cleaned: tokens.join(" "), tokens, removedStopwords, removedChars };
}

export function detectDuplicates(
  docs: { id: string; title: string; abstract: string }[]
): Set<string> {
  // Duplicate detection: exact title match OR abstract similarity > 0.9 (Jaccard on tokens)
  const dupIds = new Set<string>();
  const seenByTitle = new Map<string, string>();
  const tokenSets = new Map<string, Set<string>>();

  for (const d of docs) {
    const titleKey = d.title.trim().toLowerCase().replace(/\s+/g, " ");
    if (seenByTitle.has(titleKey)) {
      dupIds.add(d.id);
      continue;
    }
    seenByTitle.set(titleKey, d.id);

    const tokens = new Set(cleanText(d.abstract).tokens);
    for (const [otherId, otherTokens] of tokenSets) {
      const inter = new Set([...tokens].filter((t) => otherTokens.has(t)));
      const jac = inter.size / Math.max(1, new Set([...tokens, ...otherTokens]).size);
      if (jac > 0.9) {
        dupIds.add(d.id);
        break;
      }
    }
    if (!dupIds.has(d.id)) tokenSets.set(d.id, tokens);
  }
  return dupIds;
}

export function cleanCorpus(raw: Thesis[]): {
  cleaned: CleanedThesis[];
  stats: CleaningStats;
} {
  const dupIds = detectDuplicates(raw.map((t) => ({ id: t.id, title: t.title, abstract: t.abstract })));

  const cleaned: CleanedThesis[] = [];
  let removedStopwords = 0;
  let removedChars = 0;
  let totalTokens = 0;
  const uniqueTokens = new Set<string>();
  let duplicatesRemoved = 0;

  for (const t of raw) {
    const ct = cleanText(t.title);
    const ca = cleanText(t.abstract);
    const isDup = dupIds.has(t.id);

    if (isDup) duplicatesRemoved++;

    const tokens = [...ct.tokens, ...ca.tokens];
    totalTokens += tokens.length;
    tokens.forEach((tok) => uniqueTokens.add(tok));
    removedStopwords += ct.removedStopwords + ca.removedStopwords;
    removedChars += ct.removedChars + ca.removedChars;

    cleaned.push({
      ...t,
      cleanedTitle: ct.cleaned,
      cleanedAbstract: ca.cleaned,
      tokens,
      removedStopwords: ct.removedStopwords + ca.removedStopwords,
      removedChars: ct.removedChars + ca.removedChars,
      isDuplicate: isDup,
      duplicateOf: undefined,
    });
  }

  // Second pass: mark duplicateOf for deduplicated docs that share a title.
  const titleToId = new Map<string, string>();
  for (const c of cleaned) {
    if (c.isDuplicate) continue;
    const key = c.title.trim().toLowerCase().replace(/\s+/g, " ");
    if (!titleToId.has(key)) titleToId.set(key, c.id);
  }
  for (const c of cleaned) {
    if (!c.isDuplicate) continue;
    const key = c.title.trim().toLowerCase().replace(/\s+/g, " ");
    c.duplicateOf = titleToId.get(key);
  }

  const stats: CleaningStats = {
    totalDocs: raw.length,
    removedStopwords,
    removedChars,
    duplicatesRemoved,
    uniqueDocs: raw.length - duplicatesRemoved,
    totalTokens,
    uniqueTokens: uniqueTokens.size,
    avgTokensPerDoc: raw.length ? Math.round(totalTokens / raw.length) : 0,
  };

  return { cleaned, stats };
}
