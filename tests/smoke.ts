import { SAMPLE_THESES } from "../lib/sampleData";
import { cleanCorpus } from "../lib/cleaning";
import { runPipeline } from "../lib/analysis";

function assert(cond: boolean, msg: string) {
  if (!cond) {
    console.error("FAIL:", msg);
    process.exitCode = 1;
  } else {
    console.log("ok  :", msg);
  }
}

const { cleaned, stats } = cleanCorpus(SAMPLE_THESES);
console.log(`\nCleaning: ${stats.totalDocs} docs -> ${stats.uniqueDocs} unique, ${stats.duplicatesRemoved} dups, ${stats.removedStopwords} stopwords removed, ${stats.uniqueTokens} unique tokens`);

assert(stats.totalDocs === 30, "sample has 30 records");
assert(stats.uniqueDocs >= 25, "most records unique");
assert(stats.removedStopwords > 0, "stopwords removed");

const out = runPipeline(cleaned);
const { lda, bertopic } = out;

console.log(`\nLDA: ${lda.topics.length} topics, avgCoherence=${lda.avgCoherence.toFixed(3)}, avgClarity=${lda.avgClarity.toFixed(3)}, avgIntra=${lda.avgIntraSimilarity.toFixed(3)}, ${lda.runningTimeMs.toFixed(0)}ms`);
for (const t of lda.topics) {
  console.log(`  LDA T${t.id + 1} [${t.frequency} docs] "${t.label}" coherence=${t.coherence.toFixed(3)} keywords=${t.keywords.slice(0, 5).map((k) => k.word).join(", ")}`);
}

console.log(`\nBERTopic: ${bertopic.topics.length} topics, avgCoherence=${bertopic.avgCoherence.toFixed(3)}, avgClarity=${bertopic.avgClarity.toFixed(3)}, avgIntra=${bertopic.avgIntraSimilarity.toFixed(3)}, ${bertopic.runningTimeMs.toFixed(0)}ms`);
for (const t of bertopic.topics) {
  console.log(`  BT T${t.id + 1} [${t.frequency} docs] "${t.label}" coherence=${t.coherence.toFixed(3)} keywords=${t.keywords.slice(0, 5).map((k) => k.word).join(", ")}`);
}

// every doc should have an assignment in both models
assert(cleaned.filter((c) => lda.docTopics[c.id] !== undefined).length === cleaned.length, "LDA assigns every doc");
assert(cleaned.filter((c) => bertopic.docTopics[c.id] !== undefined).length === cleaned.length, "BERTopic assigns every doc");

// trends + gaps
assert(out.trends.length === lda.topics.length + bertopic.topics.length, "trends computed for both models");
const totalTrendCount = out.trends.reduce((a, t) => a + t.count, 0);
assert(totalTrendCount === cleaned.length * 2, "trend counts sum to 2x corpus");
console.log(`\nGaps: ${out.gaps.length} flagged (${out.gaps.filter((g) => g.status === "absent").length} absent areas, ${out.gaps.filter((g) => g.status === "under-researched").length} rare topics)`);

// coherence should be a finite number in a sane range
for (const model of [lda, bertopic]) {
  for (const t of model.topics) {
    assert(Number.isFinite(t.coherence), `coherence finite for ${model.method} T${t.id + 1}`);
    assert(t.coherence >= -1 && t.coherence <= 1, `coherence in range for ${model.method} T${t.id + 1}`);
  }
}

// label sanity
for (const t of lda.topics) {
  assert(t.label.length > 0, `LDA label non-empty: ${t.label}`);
  assert(t.keywords.length > 0, `LDA keywords non-empty for T${t.id + 1}`);
}

console.log("\nPipeline smoke test complete.");
