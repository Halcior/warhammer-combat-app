import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const CSV_DIR = path.join(ROOT, "CSV");
const OUTPUT_DIR = path.join(ROOT, "src/data/normalized");

function readPipeCsv(fileName) {
  const fullPath = path.join(CSV_DIR, fileName);

  if (!fs.existsSync(fullPath)) {
    throw new Error(`Missing CSV file: ${fullPath}`);
  }

  const raw = fs.readFileSync(fullPath, "utf8").replace(/^\uFEFF/, "");
  const lines = raw.split(/\r?\n/).filter((line) => line.trim().length > 0);
  if (lines.length === 0) return [];

  const headers = splitPipeLine(lines[0]);

  return lines.slice(1).map((line) => {
    const values = splitPipeLine(line);
    const row = {};

    headers.forEach((header, index) => {
      row[header] = values[index] ?? "";
    });

    return row;
  });
}

function splitPipeLine(line) {
  return line.split("|").map((value) => value.trim());
}

function groupBy(rows, key) {
  const map = new Map();

  for (const row of rows) {
    const groupKey = row[key];
    if (!map.has(groupKey)) map.set(groupKey, []);
    map.get(groupKey).push(row);
  }

  return map;
}

function sanitizeId(value) {
  return String(value)
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function dedupeById(items) {
  const seen = new Set();
  return items.filter((item) => {
    if (seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });
}

function toNumber(value, fallback = undefined) {
  if (value === undefined || value === null || value === "") return fallback;

  const normalized = String(value)
    .trim()
    .replace(/"/g, "")
    .replace(/\+/g, "");

  const parsed = Number(normalized);
  return Number.isNaN(parsed) ? fallback : parsed;
}

function buildFactionMap(factions) {
  const factionById = new Map();

  for (const faction of factions) {
    factionById.set(faction.id, {
      id: faction.id,
      name: faction.name,
    });
  }

  return factionById;
}

function main() {
  const factions = readPipeCsv("Factions.csv");
  const detachments = readPipeCsv("Detachments.csv");
  const detachmentAbilities = readPipeCsv("Detachment_abilities.csv");
  const datasheetDetachmentAbilities = readPipeCsv("Datasheets_detachment_abilities.csv");
  const enhancements = readPipeCsv("Enhancements.csv");
  const datasheetEnhancements = readPipeCsv("Datasheets_enhancements.csv");
  const stratagems = readPipeCsv("Stratagems.csv");
  const datasheetStratagems = readPipeCsv("Datasheets_stratagems.csv");

  const factionById = buildFactionMap(factions);

  const detachmentAbilitiesByDetachment = groupBy(detachmentAbilities, "detachment_id");
  const datasheetDetachmentAbilitiesByDetachment = groupBy(
    datasheetDetachmentAbilities,
    "detachment_id"
  );

  const enhancementsByDetachment = groupBy(enhancements, "detachment_id");
  const datasheetEnhancementsByDetachment = groupBy(datasheetEnhancements, "detachment_id");

  const stratagemsByDetachment = groupBy(stratagems, "detachment_id");
  const datasheetStratagemsByDetachment = groupBy(datasheetStratagems, "detachment_id");

  const normalizedDetachments = detachments
    .filter((detachment) => detachment.faction_id && factionById.has(detachment.faction_id))
    .map((detachment) => {
      const faction = factionById.get(detachment.faction_id);

      const directAbilities = (detachmentAbilitiesByDetachment.get(detachment.id) ?? []).map(
        (row, index) => ({
          id: `${sanitizeId(detachment.name)}_ability_${index + 1}`,
          name: row.name || `Ability ${index + 1}`,
          description: row.description || "",
          type: row.type || undefined,
        })
      );

      const linkedAbilities = (
        datasheetDetachmentAbilitiesByDetachment.get(detachment.id) ?? []
      ).map((row, index) => ({
        id: `${sanitizeId(detachment.name)}_linked_ability_${index + 1}`,
        name: row.name || `Linked Ability ${index + 1}`,
        description: row.description || "",
        type: row.type || undefined,
      }));

      const directEnhancements = (enhancementsByDetachment.get(detachment.id) ?? []).map(
        (row, index) => ({
          id: `${sanitizeId(detachment.name)}_enhancement_${index + 1}`,
          name: row.name || `Enhancement ${index + 1}`,
          description: row.description || "",
          points: toNumber(row.cost),
        })
      );

      const linkedEnhancements = (
        datasheetEnhancementsByDetachment.get(detachment.id) ?? []
      ).map((row, index) => ({
        id: `${sanitizeId(detachment.name)}_linked_enhancement_${index + 1}`,
        name: row.name || `Linked Enhancement ${index + 1}`,
        description: row.description || "",
        points: toNumber(row.cost),
      }));

      const directStratagems = (stratagemsByDetachment.get(detachment.id) ?? []).map(
        (row, index) => ({
          id: `${sanitizeId(detachment.name)}_stratagem_${index + 1}`,
          name: row.name || `Stratagem ${index + 1}`,
          description: row.description || "",
          cpCost: toNumber(row.cp_cost),
          type: row.type || undefined,
          turn: row.turn || undefined,
          phase: row.phase || undefined,
        })
      );

      const linkedStratagems = (
        datasheetStratagemsByDetachment.get(detachment.id) ?? []
      ).map((row, index) => ({
        id: `${sanitizeId(detachment.name)}_linked_stratagem_${index + 1}`,
        name: row.name || `Linked Stratagem ${index + 1}`,
        description: row.description || "",
        cpCost: toNumber(row.cp_cost),
        type: row.type || undefined,
        turn: row.turn || undefined,
        phase: row.phase || undefined,
      }));

      return {
        id: sanitizeId(detachment.name),
        name: detachment.name,
        factionId: faction.id,
        factionName: faction.name,
        description: detachment.description || undefined,
        abilities: dedupeById([...directAbilities, ...linkedAbilities]),
        enhancements: dedupeById([...directEnhancements, ...linkedEnhancements]),
        stratagems: dedupeById([...directStratagems, ...linkedStratagems]),
      };
    })
    .sort((a, b) => {
      if (a.factionName !== b.factionName) {
        return a.factionName.localeCompare(b.factionName);
      }
      return a.name.localeCompare(b.name);
    });

  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  fs.writeFileSync(
    path.join(OUTPUT_DIR, "detachments.json"),
    JSON.stringify(normalizedDetachments, null, 2),
    "utf8"
  );

  console.log(`Generated ${normalizedDetachments.length} detachments`);
  console.log(`Output directory: ${OUTPUT_DIR}`);
}

main();