"use client";

import { useRef, useState } from "react";
import { Thesis } from "@/lib/types";
import { TEMPLATE_CSV, parseCSV, parseJSON } from "@/lib/upload";

export function UploadZone({ onUploaded }: { onUploaded: (theses: Thesis[]) => void }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState("");
  const [dragging, setDragging] = useState(false);

  const handleFile = async (file: File) => {
    setError("");
    try {
      const text = await file.text();
      const theses = file.name.toLowerCase().endsWith(".json") ? parseJSON(text) : parseCSV(text);
      if (theses.length === 0) throw new Error("No theses found in the file.");
      onUploaded(theses);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not read file.");
    } finally {
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const downloadTemplate = () => {
    const csv =
      'title,abstract,year,author\n"Sample: AI-powered Attendance Tracker","This thesis builds an AI attendance tracker.","2024","Jane Doe"\n';
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "thesis_upload_template.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col gap-3">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          const f = e.dataTransfer.files?.[0];
          if (f) void handleFile(f);
        }}
        className={`flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed px-6 py-10 text-center transition ${
          dragging ? "border-brand-500 bg-brand-50" : "border-slate-300 bg-slate-50"
        }`}
      >
        <span className="text-3xl">📁</span>
        <p className="text-sm font-semibold text-slate-700">Drag & drop your thesis CSV / JSON here</p>
        <p className="text-xs text-slate-400">or use the button below (processed locally, max a few MB)</p>
        <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
          <button className="btn-primary" onClick={() => fileRef.current?.click()}>
            📤 Choose file to upload
          </button>
          <button className="btn-secondary" onClick={downloadTemplate}>
            ⬇️ Download CSV template
          </button>
        </div>
        <input
          ref={fileRef}
          type="file"
          accept=".csv,.json,application/json,text/csv"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) void handleFile(f);
          }}
        />
      </div>
      {error && <p className="text-sm font-medium text-rose-600">⚠️ {error}</p>}
      <div className="rounded-xl bg-brand-50 p-4 text-xs leading-relaxed text-brand-800">
        <p className="mb-1 font-bold">✅ Expected format</p>
        <p className="font-mono">CSV: title, abstract, year (optional), author (optional)</p>
        <p className="font-mono">JSON: [{"{"} "title", "abstract", "year", "author" {"}"}] or {"{"} theses: […] {"}"}</p>
        <p className="mt-1">
          Files are parsed entirely in your browser and never leave the machine during analysis.
        </p>
      </div>
    </div>
  );
}
