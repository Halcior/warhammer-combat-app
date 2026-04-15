import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const sourcePath = path.join(root, "src", "data", "normalized", "detachments.json");
const outputDir = path.join(
  root,
  "src",
  "data",
  "normalized",
  "detachments-by-faction"
);

function sanitizeFactionName(name) {
  return String(name)
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();
}

const raw = fs.readFileSync(sourcePath, "utf8");
const detachments = JSON.parse(raw);

const byFaction = new Map();

for (const detachment of detachments) {
  const factionName = detachment.factionName ?? "unknown";
  const current = byFaction.get(factionName) ?? [];
  current.push(detachment);
  byFaction.set(factionName, current);
}

fs.rmSync(outputDir, { recursive: true, force: true });
fs.mkdirSync(outputDir, { recursive: true });

const manifest = [];

for (const [factionName, factionDetachments] of [...byFaction.entries()].sort((a, b) =>
  a[0].localeCompare(b[0])
)) {
  const slug = sanitizeFactionName(factionName);
  const fileName = `${slug}.json`;
  const filePath = path.join(outputDir, fileName);

  fs.writeFileSync(filePath, JSON.stringify(factionDetachments, null, 2));

  manifest.push({
    factionName,
    slug,
    fileName,
    detachmentCount: factionDetachments.length,
  });
}

fs.writeFileSync(
  path.join(outputDir, "manifest.json"),
  JSON.stringify(manifest, null, 2)
);

console.log(
  `Split ${detachments.length} detachments into ${manifest.length} faction files in ${outputDir}`
);
