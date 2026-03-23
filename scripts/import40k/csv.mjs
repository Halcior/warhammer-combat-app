import fs from "fs";

export function readPipeCsv(filePath) {
  const raw = fs.readFileSync(filePath, "utf-8").replace(/^\uFEFF/, "");
  const lines = raw
    .split(/\r?\n/)
    .map((line) => line.trimEnd())
    .filter(Boolean);

  if (lines.length === 0) return [];

  const headers = lines[0]
    .split("|")
    .filter((header) => header.length > 0);

  return lines.slice(1).map((line) => {
    const values = line.split("|");
    const row = {};

    headers.forEach((header, index) => {
      row[header] = values[index] ?? "";
    });

    return row;
  });
}