import { Thesis } from "./types";

// ---------------------------------------------------------------------------
// Upload parsers (extracted from the UI so they are unit-testable).
// Supports CSV (title, abstract, year?, author?) and JSON
// (array or { theses: [...] }).
// ---------------------------------------------------------------------------

export function splitCSVRow(line: string): string[] {
  const row: string[] = [];
  let cur = "";
  let inQ = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQ && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else {
        inQ = !inQ;
      }
    } else if (ch === "," && !inQ) {
      row.push(cur);
      cur = "";
    } else {
      cur += ch;
    }
  }
  row.push(cur);
  return row;
}

export function parseCSV(text: string): Thesis[] {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);
  if (lines.length === 0) throw new Error("The file is empty.");

  const header = splitCSVRow(lines[0]).map((h) => h.replace(/^"|"$/g, "").trim().toLowerCase());
  const colIdx = (names: string[]) => header.findIndex((h) => names.includes(h));

  const titleIdx = colIdx(["title", "thesis_title", "thesis title"]);
  const abstractIdx = colIdx(["abstract", "abstract_text", "summary", "description"]);
  const yearIdx = colIdx(["year", "publication year", "yr"]);
  const authorIdx = colIdx(["author", "authors"]);

  if (titleIdx === -1) throw new Error('CSV must have a "title" column.');
  if (abstractIdx === -1) throw new Error('CSV must have an "abstract" column.');

  const theses: Thesis[] = [];
  for (let i = 1; i < lines.length; i++) {
    const row = splitCSVRow(lines[i]);
    const title = (row[titleIdx] ?? "").trim();
    const abstract = (row[abstractIdx] ?? "").trim();
    if (!title && !abstract) continue;
    theses.push({
      id: `U-${Date.now().toString(36)}-${i}`,
      title: title || "(untitled)",
      abstract: abstract || "",
      year: (row[yearIdx] ?? "").trim() || undefined,
      author: (row[authorIdx] ?? "").trim() || undefined,
      source: "upload",
    });
  }
  return theses;
}

export function parseJSON(text: string): Thesis[] {
  const data = JSON.parse(text);
  const arr = Array.isArray(data) ? data : data.theses ?? data.data;
  if (!Array.isArray(arr)) throw new Error("JSON must be an array or { theses: [...] }.");
  return arr
    .filter((t) => t && (t.title || t.abstract))
    .map((t, i) => ({
      id: `U-${Date.now().toString(36)}-${i}`,
      title: t.title || "(untitled)",
      abstract: t.abstract ?? "",
      year: t.year ? String(t.year) : undefined,
      author: t.author ? String(t.author) : undefined,
      source: "upload" as const,
    }));
}

export const TEMPLATE_CSV =
  'title,abstract,year,author\n"Sample: AI-powered Attendance Tracker","This thesis builds an AI attendance tracker.","2024","Jane Doe"\n';

export async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Clipboard API unavailable (e.g. insecure context) — try legacy fallback.
    try {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand("copy");
      document.body.removeChild(ta);
      return ok;
    } catch {
      return false;
    }
  }
}