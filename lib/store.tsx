"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { CleaningStats, CleanedThesis, Gap, ModelResult, Thesis, TrendItem, ValidationEntry } from "./types";
import { SAMPLE_THESES } from "./sampleData";
import { cleanCorpus } from "./cleaning";
import { runPipeline } from "./analysis";

// ---------------------------------------------------------------------------
// Global state (client-side). Persisted to localStorage so analysis survives
// navigation and page reloads. Real data lives in the browser only — uploads
// are never sent to a server, which keeps student data private.
// ---------------------------------------------------------------------------

const STORAGE_KEY = "thesis-topic-recommender-v1";

interface StoreShape {
  rawTheses: Thesis[];
  validation: ValidationEntry[];
}

export interface StoreValue {
  rawTheses: Thesis[];
  cleaned: CleanedThesis[];
  cleaningStats: CleaningStats | null;
  lda: ModelResult | null;
  bertopic: ModelResult | null;
  trends: TrendItem[] | null;
  gaps: Gap[] | null;
  validation: ValidationEntry[];
  analyzedAt: number | null;
  analyzing: boolean;
  dataSource: "sample" | "upload" | "mixed";
  loadSampleData: () => void;
  addTheses: (theses: Thesis[]) => number;
  clearTheses: () => void;
  addValidationEntry: (entry: Omit<ValidationEntry, "id" | "date">) => void;
  clearValidation: () => void;
  removeThesis: (id: string) => void;
  reanalyze: () => void;
}

const StoreContext = createContext<StoreValue | null>(null);

function defaultStore(): StoreShape {
  return { rawTheses: SAMPLE_THESES, validation: [] };
}

function loadPersisted(): StoreShape {
  if (typeof window === "undefined") return defaultStore();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as StoreShape;
      if (Array.isArray(parsed.rawTheses) && parsed.rawTheses.length > 0) {
        return { rawTheses: parsed.rawTheses, validation: parsed.validation ?? [] };
      }
    }
  } catch {
    /* ignore corrupted storage */
  }
  return defaultStore();
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [{ rawTheses, validation }, setShape] = useState<StoreShape>(() => defaultStore());
  const [hydrated, setHydrated] = useState(false);
  const [analyzed, setAnalyzed] = useState<{
    cleaned: CleanedThesis[];
    cleaningStats: CleaningStats;
    lda: ModelResult;
    bertopic: ModelResult;
    trends: TrendItem[];
    gaps: Gap[];
    analyzedAt: number;
  } | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const runId = useRef(0);

  // hydrate from localStorage once
  useEffect(() => {
    const persisted = loadPersisted();
    setShape(persisted);
    setHydrated(true);
  }, []);

  // persist raw data changes
  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ rawTheses, validation }));
    } catch {
      /* storage full — ignore */
    }
  }, [rawTheses, validation, hydrated]);

  // run the full pipeline whenever the corpus changes
  useEffect(() => {
    if (!hydrated || rawTheses.length === 0) {
      setAnalyzed(null);
      return;
    }
    const id = ++runId.current;
    setAnalyzing(true);
    // yield to the event loop so the UI can paint the "analyzing" state
    const timer = window.setTimeout(() => {
      try {
        const { cleaned, stats } = cleanCorpus(rawTheses);
        const pipeline = runPipeline(cleaned.filter((c) => !c.isDuplicate));
        if (runId.current !== id) return;
        setAnalyzed({
          cleaned: cleaned.filter((c) => !c.isDuplicate),
          cleaningStats: stats,
          lda: pipeline.lda,
          bertopic: pipeline.bertopic,
          trends: pipeline.trends,
          gaps: pipeline.gaps,
          analyzedAt: Date.now(),
        });
      } catch (e) {
        console.error("Pipeline failed", e);
      } finally {
        if (runId.current === id) setAnalyzing(false);
      }
    }, 60);
    return () => window.clearTimeout(timer);
  }, [rawTheses, hydrated]);

  const loadSampleData = useCallback(() => {
    setShape({ rawTheses: SAMPLE_THESES, validation: [] });
  }, []);

  const addTheses = useCallback((theses: Thesis[]): number => {
    let added = 0;
    setShape((prev) => {
      const existing = new Set(prev.rawTheses.map((t) => t.id));
      const fresh = theses.filter((t) => !existing.has(t.id));
      added = fresh.length;
      return { ...prev, rawTheses: [...prev.rawTheses, ...fresh] };
    });
    return added;
  }, []);

  const removeThesis = useCallback((id: string) => {
    setShape((prev) => ({ ...prev, rawTheses: prev.rawTheses.filter((t) => t.id !== id) }));
  }, []);

  const clearTheses = useCallback(() => {
    setShape({ rawTheses: [], validation: [] });
  }, []);

  const addValidationEntry = useCallback((entry: Omit<ValidationEntry, "id" | "date">) => {
    setShape((prev) => ({
      ...prev,
      validation: [
        ...prev.validation,
        { ...entry, id: `V-${Date.now()}-${Math.floor(Math.random() * 1000)}`, date: new Date().toISOString() },
      ],
    }));
  }, []);

  const clearValidation = useCallback(() => {
    setShape((prev) => ({ ...prev, validation: [] }));
  }, []);

  const reanalyze = useCallback(() => {
    setShape((prev) => ({ ...prev, rawTheses: [...prev.rawTheses] }));
  }, []);

  const source: "sample" | "upload" | "mixed" = rawTheses.every((t) => t.source === "sample")
    ? "sample"
    : rawTheses.some((t) => t.source === "upload") && rawTheses.some((t) => t.source === "sample")
      ? "mixed"
      : "upload";

  const value: StoreValue = {
    rawTheses,
    cleaned: analyzed?.cleaned ?? [],
    cleaningStats: analyzed?.cleaningStats ?? null,
    lda: analyzed?.lda ?? null,
    bertopic: analyzed?.bertopic ?? null,
    trends: analyzed?.trends ?? null,
    gaps: analyzed?.gaps ?? null,
    validation,
    analyzedAt: analyzed?.analyzedAt ?? null,
    analyzing,
    dataSource: source,
    loadSampleData,
    addTheses,
    clearTheses,
    addValidationEntry,
    clearValidation,
    removeThesis,
    reanalyze,
  };

  if (!hydrated) return <div className="min-h-screen bg-slate-50" />;

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}
