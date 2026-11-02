// ---------------------------------------------------------------------------
// Shared types for the Thesis Topic Recommender pipeline
// ---------------------------------------------------------------------------

export type SourceType = "sample" | "upload";

export interface Thesis {
  id: string;
  title: string;
  abstract: string;
  year?: string;
  author?: string;
  source: SourceType;
}

export interface CleanedThesis extends Thesis {
  cleanedTitle: string;
  cleanedAbstract: string;
  tokens: string[];
  removedStopwords: number;
  removedChars: number;
  isDuplicate: boolean;
  duplicateOf?: string;
}

export interface KeywordWeight {
  word: string;
  weight: number; // probability / c-TF-IDF score
}

export interface Topic {
  id: number;
  method: "LDA" | "BERTopic";
  label: string; // human readable label generated from keywords
  keywords: KeywordWeight[];
  documentIds: string[];
  frequency: number;
  percentage: number;
  coherence: number; // NPMI coherence
  intraSimilarity: number; // avg cosine similarity between members
  clarity: number; // 0..1 label clarity heuristic
}

export interface ModelResult {
  method: "LDA" | "BERTopic";
  topics: Topic[];
  docTopics: Record<string, number>; // docId -> topicId
  docTheta: Record<string, number[]>; // docId -> topic distribution (LDA only)
  avgCoherence: number;
  avgClarity: number;
  avgIntraSimilarity: number;
  labeledPct: number; // share of docs assigned to a non-outlier topic
  runningTimeMs: number;
  params: Record<string, string | number>;
}

export interface TrendItem {
  method: "LDA" | "BERTopic";
  topicId: number;
  label: string;
  count: number;
  percentage: number;
  years: Record<string, number>; // year -> count
}

export interface Gap {
  id: string;
  area: string; // trending research area name
  keywords: string[];
  matchedDocs: number;
  status: "absent" | "under-researched" | "present";
  suggestedReason: string;
  method: "LDA" | "BERTopic" | "corpus";
}

export interface ValidationEntry {
  id: string;
  name: string;
  role: "Adviser" | "Faculty" | "Student" | "Other";
  method: "LDA" | "BERTopic";
  topicId: number;
  topicLabel: string;
  relevance: number; // 1..5
  clarity: number; // 1..5
  coherenceRating: number; // 1..5
  comment: string;
  date: string;
}

export interface CleaningStats {
  totalDocs: number;
  removedStopwords: number;
  removedChars: number;
  duplicatesRemoved: number;
  uniqueDocs: number;
  totalTokens: number;
  uniqueTokens: number;
  avgTokensPerDoc: number;
}

export interface AnalysisState {
  rawTheses: Thesis[];
  cleaned: CleanedThesis[];
  lda: ModelResult | null;
  bertopic: ModelResult | null;
  cleaningStats: CleaningStats | null;
  trends: TrendItem[] | null;
  gaps: Gap[] | null;
  validation: ValidationEntry[];
  analyzedAt: number | null;
}
