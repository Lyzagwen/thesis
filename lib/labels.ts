// ---------------------------------------------------------------------------
// Human-readable topic labels derived from top keywords.
// ---------------------------------------------------------------------------

const CATEGORY_KEYWORDS: { cat: string; words: string[] }[] = [
  { cat: "Machine Learning / AI", words: ["learn", "neural", "deep", "predict", "classif", "model", "algorithm", "intellig", "supervis", "unsupervis", "cnn", "lstm", "transfer", "train", "accuracy"] },
  { cat: "Cybersecurity", words: ["secur", "securi", "phish", "intrus", "malware", "encrypt", "attack", "threat", "vulnerab", "authent", "cyber", "detect", "breach"] },
  { cat: "Internet of Things", words: ["iot", "sensor", "device", "embed", "smart", "arduino", "raspberri", "node", "telemetry", "autom", "monitor"] },
  { cat: "Web / E-Commerce", words: ["web", "onlin", "e-commerce", "ecommerce", "portal", "platform", "website", "shop", "order", "payment", "checkout", "menu"] },
  { cat: "Mobile Application", words: ["mobil", "android", "ios", "app", "offlin", "tracker", "handheld", "smartphone"] },
  { cat: "Education / E-Learning", words: ["learn", "student", "educ", "course", "curriculum", "grade", "examin", "teacher", "tutori", "classroom", "academ", "quiz", "lesson", "enrol", "admission", "school"] },
  { cat: "Blockchain", words: ["blockchain", "block", "ledger", "smart contract", "immutab", "cryptograph", "hash", "consensus", "token", "distributed"] },
  { cat: "AR / VR", words: ["augment", "virtual", "reality", "ar", "vr", "3d", "three-dimension", "immers", "simul", "reconstruct"] },
  { cat: "Health Informatics", words: ["health", "medic", "hospital", "clinic", "disease", "patient", "doctor", "lesion", "diagnos", "telemedicin", "prescript"] },
  { cat: "Data Analytics / GIS", words: ["analyt", "dashboard", "visual", "gis", "geospati", "cluster", "hotspot", "map", "risk", "warn", "statistic", "insight"] },
  { cat: "Natural Language Processing", words: ["sentiment", "nlp", "chatbot", "text", "natural language", "token", "classif", "corpus", "review", "comment"] },
  { cat: "Library / Records Systems", words: ["librari", "rfid", "record", "inventori", "track", "catalog", "borrow"] },
  { cat: "E-Government / Civic Tech", words: ["government", "civic", "public", "municipal", "disaster", "volunteer", "relief", "community", "citi"] },
  { cat: "Energy / Environment", words: ["energi", "consumpt", "solar", "renewab", "efficienc", "meter", "sustainab", "waste", "recycl", "irrig", "water", "soil", "crop", "agricultur", "farm"] },
];

export function generateLabel(keywords: { word: string; weight: number }[]): string {
  const words = keywords.slice(0, 8).map((k) => k.word.toLowerCase());

  const scores = CATEGORY_KEYWORDS.map((c) => {
    const match = c.words.filter((w) => words.some((kw) => kw.startsWith(w) || w.startsWith(kw)));
    return { cat: c.cat, score: match.length };
  }).sort((a, b) => b.score - a.score);

  if (scores[0].score >= 2) return scores[0].cat;

  // heuristic: join top distinctive words into a readable label
  const cleaned = words
    .filter((w) => !["system", "applic", "model", "base", "use"].includes(w))
    .slice(0, 3)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1));
  return cleaned.length ? cleaned.join(" / ") : "General topic";
}
