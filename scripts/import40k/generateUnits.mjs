import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const CSV_DIR = path.join(ROOT, "CSV");
const OUTPUT_FILE = path.join(ROOT, "src/data/generated/units.generated.ts");

function readPipeCsv(fileName) {
  const fullPath = path.join(CSV_DIR, fileName);
  const raw = fs.readFileSync(fullPath, "utf8").replace(/^\uFEFF/, "");
  const lines = raw.split(/\r?\n/).filter(Boolean);

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
  return line.split("|").map((v) => v.trim());
}

function toNumber(value, fallback = 0) {
  if (!value) return fallback;
  const parsed = Number(String(value).replace("+", "").replace('"', ""));
  return Number.isNaN(parsed) ? fallback : parsed;
}

function parseDiceValue(value) {
  if (!value) return 0;
  const trimmed = String(value).trim();
  const numeric = Number(trimmed);
  return Number.isNaN(numeric) ? trimmed : numeric;
}

function normalizeWeaponType(rangeValue, typeValue) {
  const range = String(rangeValue || "").toLowerCase();
  const type = String(typeValue || "").toLowerCase();

  if (range === "melee" || type === "melee") return "melee";
  return "ranged";
}

function parseSpecialRules(description) {
  if (!description) return [];

  const text = String(description).toLowerCase();
  const rules = [];

  if (text.includes("assault")) rules.push({ type: "ASSAULT" });
  if (text.includes("pistol")) rules.push({ type: "PISTOL" });
  if (text.includes("ignores cover")) rules.push({ type: "IGNORES_COVER" });
  if (text.includes("twin-linked")) rules.push({ type: "TWIN_LINKED" });
  if (text.includes("torrent")) rules.push({ type: "TORRENT" });
  if (text.includes("lethal hits")) rules.push({ type: "LETHAL_HITS" });
  if (text.includes("lance")) rules.push({ type: "LANCE" });
  if (text.includes("indirect fire")) rules.push({ type: "INDIRECT_FIRE" });
  if (text.includes("precision")) rules.push({ type: "PRECISION" });
  if (text.includes("blast")) rules.push({ type: "BLAST" });
  if (text.includes("heavy")) rules.push({ type: "HEAVY" });
  if (text.includes("hazardous")) rules.push({ type: "HAZARDOUS" });
  if (text.includes("extra attacks")) rules.push({ type: "EXTRA_ATTACKS" });
  if (text.includes("devastating wounds")) rules.push({ type: "DEVASTATING_WOUNDS" });

  const sustainedMatch = text.match(/sustained hits (\d+)/);
  if (sustainedMatch) {
    rules.push({ type: "SUSTAINED_HITS", value: Number(sustainedMatch[1]) });
  }

  const rapidFireMatch = text.match(/rapid fire (\d+)/);
  if (rapidFireMatch) {
    rules.push({ type: "RAPID_FIRE", value: Number(rapidFireMatch[1]) });
  }

  const meltaMatch = text.match(/melta (\d+)/);
  if (meltaMatch) {
    rules.push({ type: "MELTA", value: Number(meltaMatch[1]) });
  }

  const antiMatch = text.match(/anti-([a-z ]+) (\d+)\+/);
  if (antiMatch) {
    rules.push({
      type: "ANTI",
      keyword: antiMatch[1].trim().toUpperCase(),
      value: Number(antiMatch[2]),
    });
  }

  return rules;
}

function parseUnitRules(abilitiesRows) {
  const rules = [];

  for (const row of abilitiesRows) {
    const name = row.name || "";
    const description = row.description || "";
    const combined = `${name} ${description}`.toLowerCase();

    const fnpMatch = combined.match(/feel no pain (\d+)\+/);
    if (fnpMatch) {
      rules.push({ type: "FEEL_NO_PAIN", value: Number(fnpMatch[1]) });
    }
  }

  return dedupeRules(rules);
}

function dedupeRules(rules) {
  const seen = new Set();
  return rules.filter((rule) => {
    const key = JSON.stringify(rule);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function sanitizeId(value) {
  return String(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function main() {
  const factions = readPipeCsv("Factions.csv");
  const datasheets = readPipeCsv("Datasheets.csv");
  const models = readPipeCsv("Datasheets_models.csv");
  const wargear = readPipeCsv("Datasheets_wargear.csv");
  const keywords = readPipeCsv("Datasheets_keywords.csv");
  const abilities = readPipeCsv("Datasheets_abilities.csv");

  const factionById = new Map(factions.map((f) => [f.id, f.name]));

  const custodesDatasheets = datasheets.filter((d) => d.faction_id === "AC");

  const units = custodesDatasheets.map((sheet) => {
    const modelRows = models.filter((m) => m.datasheet_id === sheet.id);
    const primaryModel = modelRows[0];

    if (!primaryModel) {
      throw new Error(`No model row for datasheet ${sheet.id} (${sheet.name})`);
    }

    const wargearRows = wargear.filter((w) => w.datasheet_id === sheet.id);
    const keywordRows = keywords.filter((k) => k.datasheet_id === sheet.id);
    const abilityRows = abilities.filter((a) => a.datasheet_id === sheet.id);

    const unitId = sanitizeId(sheet.name);

    const weapons = wargearRows.map((w, index) => ({
      id: `${unitId}_${sanitizeId(w.name)}_${index + 1}`,
      name: w.name,
      attacks: parseDiceValue(w.A),
      skill: toNumber(w.BS_WS),
      strength: toNumber(w.S),
      ap: toNumber(w.AP),
      damage: parseDiceValue(w.D),
      type: normalizeWeaponType(w.range, w.type),
      specialRules: parseSpecialRules(w.description),
    }));

    return {
      id: unitId,
      name: sheet.name,
      faction: factionById.get(sheet.faction_id) ?? sheet.faction_id,
      toughness: toNumber(primaryModel.T),
      save: toNumber(primaryModel.Sv),
      invulnerableSave: primaryModel.inv_sv ? toNumber(primaryModel.inv_sv) : undefined,
      woundsPerModel: toNumber(primaryModel.W),
      weapons,
      specialRules: parseUnitRules(abilityRows),
      keywords: keywordRows.map((k) => String(k.keyword).toUpperCase()),
    };
  });

  const fileContent = `import type { Unit } from "../../types/combat";

export const generatedUnits: Unit[] = ${JSON.stringify(units, null, 2)} as Unit[];
`;

  fs.mkdirSync(path.dirname(OUTPUT_FILE), { recursive: true });
  fs.writeFileSync(OUTPUT_FILE, fileContent, "utf8");

  console.log(`Generated ${units.length} units to ${OUTPUT_FILE}`);
}

main();