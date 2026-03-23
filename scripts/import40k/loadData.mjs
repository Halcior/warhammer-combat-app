import path from "path";
import { readPipeCsv } from "./csv.mjs";

const ROOT = process.cwd();
const CSV_DIR = path.join(ROOT, "CSV");

export function loadDatasheets() {
  return readPipeCsv(path.join(CSV_DIR, "Datasheets.csv"));
}

export function loadWargear() {
  return readPipeCsv(path.join(CSV_DIR, "Datasheets_wargear.csv"));
}

export function loadKeywords() {
  return readPipeCsv(path.join(CSV_DIR, "Datasheets_keywords.csv"));
}