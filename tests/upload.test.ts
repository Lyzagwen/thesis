import { parseCSV, parseJSON, splitCSVRow } from "../lib/upload";

function assert(cond: boolean, msg: string) {
  if (!cond) {
    console.error("FAIL:", msg);
    process.exitCode = 1;
  } else {
    console.log("ok  :", msg);
  }
}

// ---- splitCSVRow ----
assert(
  splitCSVRow('"a, b","c""d",e').join("|") === "a, b|c\"d|e",
  "splitCSVRow handles quotes, escaped quotes and commas"
);

// ---- CSV parsing (matches sample_upload.csv) ----
const csv = [
  "title,abstract,year,author",
  '"Predicting Customer Churn for a Telecom Company Using Random Forest","This study builds a random forest model that predicts customer churn from call and billing records.","2024","Sample Author"',
  '"Mobile-Based Flood Early Warning System","This thesis develops a mobile application that monitors river water levels.","2024","Sample Author"',
  '"NoAbstractRow",,,',
  "",
].join("\n");

const theses = parseCSV(csv);
assert(theses.length === 3, "CSV parses 3 data rows (blank trailing line ignored)");
assert(theses[0].title.startsWith("Predicting Customer Churn"), "CSV title read");
assert(theses[0].abstract.includes("billing records"), "CSV abstract with commas read fully");
assert(theses[0].year === "2024", "CSV year read");
assert(theses[0].author === "Sample Author", "CSV author read");
assert(theses[0].source === "upload", "CSV source = upload");
assert(theses[2].abstract === "", "row with only a title keeps empty abstract");
assert(theses[2].year === undefined, "empty optional fields are undefined");

// ---- error handling ----
let threw = false;
try {
  parseCSV('title\n"x"'); // no abstract column
} catch (e) {
  threw = true;
  assert((e as Error).message === 'CSV must have an "abstract" column.', "CSV missing abstract column throws helpful error");
}
assert(threw, "CSV missing column throws");

threw = false;
try {
  parseCSV("   \n  ");
} catch (e) {
  threw = true;
  assert((e as Error).message === "The file is empty.", "empty file throws");
}
assert(threw, "empty CSV file throws");

// ---- JSON parsing ----
const arr = parseJSON(
  JSON.stringify([
    { title: "T1", abstract: "A1", year: 2023 },
    { title: "T2" },
    { title: "", abstract: "" },
  ])
);
assert(arr.length === 2, "JSON array skips records with no title/abstract");
assert(arr[0].year === "2023" && arr[0].source === "upload", "JSON year coerced to string, source=upload");
assert(arr[1].abstract === "" && arr[1].title === "T2", "JSON missing abstract tolerated");

const obj = parseJSON('{"theses":[{"title":"A","abstract":"B"}]}');
assert(obj.length === 1 && obj[0].title === "A", "JSON object wrapper { theses: [...] } supported");

threw = false;
try {
  parseJSON("[]");
} catch {
  // empty array is valid JSON but yields no records — parser returns []
}
assert(!threw && parseJSON("[]").length === 0, "empty JSON array yields no records");

threw = false;
try {
  parseJSON("not json");
} catch (e) {
  threw = true;
}
assert(threw, "invalid JSON throws (surfaced as friendly error in the UI)");

console.log("\nUpload parser test complete.");