import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const CSV_DIR = path.join(ROOT, "CSV");
const OUTPUT_FILE = path.join(ROOT, "src/data/generated/units.generated.ts");

/**
 * Ustaw null, żeby brać wszystkie frakcje.
 * Albo wpisz konkretne faction_id, jeśli chcesz filtrować.
 *
 * Przykłady:
 * null
 * new Set(["AC", "NE", "DG", "WE"])
 */
const SUPPORTED_FACTIONS = null;

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
  return line.split("|").map((v) => v.trim());
}

function toNumber(value, fallback = 0) {
  if (value === undefined || value === null || value === "") return fallback;

  const normalized = String(value)
    .trim()
    .replace(/"/g, "")
    .replace(/\+/g, "");

  const parsed = Number(normalized);
  return Number.isNaN(parsed) ? fallback : parsed;
}

function parseDiceValue(value) {
  if (value === undefined || value === null || value === "") return 0;

  const trimmed = String(value).trim().replace(/"/g, "");
  const numeric = Number(trimmed);

  return Number.isNaN(numeric) ? trimmed : numeric;
}

function normalizeWeaponType(rangeValue, typeValue) {
  const range = String(rangeValue || "").toLowerCase();
  const type = String(typeValue || "").toLowerCase();

  if (range === "melee" || type === "melee") return "melee";
  return "ranged";
}

function sanitizeId(value) {
  return String(value)
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
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

function dedupeStrings(values) {
  return [...new Set(values.filter(Boolean))];
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
  if (text.includes("devastating wounds")) {
    rules.push({ type: "DEVASTATING_WOUNDS" });
  }

  const sustainedMatch = text.match(/sustained hits\s+(\d+)/);
  if (sustainedMatch) {
    rules.push({
      type: "SUSTAINED_HITS",
      value: Number(sustainedMatch[1]),
    });
  }

  const rapidFireMatch = text.match(/rapid fire\s+(\d+)/);
  if (rapidFireMatch) {
    rules.push({
      type: "RAPID_FIRE",
      value: Number(rapidFireMatch[1]),
    });
  }

  const meltaMatch = text.match(/melta\s+(\d+)/);
  if (meltaMatch) {
    rules.push({
      type: "MELTA",
      value: Number(meltaMatch[1]),
    });
  }

  const feelNoPainMatch = text.match(/feel no pain\s+(\d)\+/);
  if (feelNoPainMatch) {
    rules.push({
      type: "FEEL_NO_PAIN",
      value: Number(feelNoPainMatch[1]),
    });
  }

  const damageReductionMatch = text.match(/damage reduction\s+(\d+)/);
  if (damageReductionMatch) {
    rules.push({
      type: "DAMAGE_REDUCTION",
      value: Number(damageReductionMatch[1]),
    });
  }

  const antiMatch = text.match(/anti-([a-z -]+)\s+(\d)\+/);
  if (antiMatch) {
    rules.push({
      type: "ANTI",
      keyword: antiMatch[1].trim().toUpperCase().replace(/-/g, " "),
      value: Number(antiMatch[2]),
    });
  }

  return dedupeRules(rules);
}

function parseUnitRules(abilityRows) {
  const rules = [];

  for (const row of abilityRows) {
    const name = row.name || "";
    const description = row.description || "";
    const combined = `${name} ${description}`;

    rules.push(...parseSpecialRules(combined));
  }

  return dedupeRules(rules);
}

function isProbablyRealWeapon(row) {
  const name = String(row.name || "").trim();
  const attacks = String(row.A || "").trim();
  const skill = String(row.BS_WS || "").trim();
  const strength = String(row.S || "").trim();
  const ap = String(row.AP || "").trim();
  const damage = String(row.D || "").trim();
  const range = String(row.range || "").trim();
  const type = String(row.type || "").trim();

  if (!name) return false;

  const hasStatBlock =
    attacks !== "" ||
    skill !== "" ||
    strength !== "" ||
    ap !== "" ||
    damage !== "" ||
    range !== "" ||
    type !== "";

  if (!hasStatBlock) return false;

  const lowerName = name.toLowerCase();

  const blockedFragments = [
    "invulnerable save",
    "feel no pain",
    "leader",
    "deep strike",
    "scout",
    "deadly demise",
    "core",
    "faction",
  ];

  if (blockedFragments.some((fragment) => lowerName.includes(fragment))) {
    return false;
  }

  return true;
}

function buildFactionMap(factions) {
  const factionById = new Map();

  for (const row of factions) {
    factionById.set(row.id, row.name);
  }

  return factionById;
}

function groupBy(rows, key) {
  const map = new Map();

  for (const row of rows) {
    const groupKey = row[key];
    if (!map.has(groupKey)) {
      map.set(groupKey, []);
    }
    map.get(groupKey).push(row);
  }

  return map;
}

function pickPrimaryModel(modelRows) {
  if (!modelRows || modelRows.length === 0) return null;

  const sorted = [...modelRows].sort((a, b) => {
    const aName = String(a.name || "");
    const bName = String(b.name || "");
    return aName.localeCompare(bName);
  });

  return sorted[0];
}

function buildWeapon(unitId, row, index) {
  return {
    id: `${unitId}_${sanitizeId(row.name)}_${index + 1}`,
    name: row.name,
    attacks: parseDiceValue(row.A),
    skill: toNumber(row.BS_WS),
    strength: toNumber(row.S),
    ap: toNumber(row.AP),
    damage: parseDiceValue(row.D),
    type: normalizeWeaponType(row.range, row.type),
    specialRules: parseSpecialRules(row.description),
  };
}

function main() {
  const factions = readPipeCsv("Factions.csv");
  const datasheets = readPipeCsv("Datasheets.csv");
  const models = readPipeCsv("Datasheets_models.csv");
  const wargear = readPipeCsv("Datasheets_wargear.csv");
  const keywords = readPipeCsv("Datasheets_keywords.csv");
  const abilities = readPipeCsv("Datasheets_abilities.csv");

  const factionById = buildFactionMap(factions);

  const allFactionIds = [...new Set(datasheets.map((d) => d.faction_id))].sort();
  console.log("Faction IDs in datasheets:", allFactionIds.join(", "));

  const selectedDatasheets = datasheets.filter((sheet) => {
    if (!sheet.faction_id) return false;
    if (SUPPORTED_FACTIONS === null) return true;
    return SUPPORTED_FACTIONS.has(sheet.faction_id);
  });

  const modelsByDatasheet = groupBy(models, "datasheet_id");
  const wargearByDatasheet = groupBy(wargear, "datasheet_id");
  const keywordsByDatasheet = groupBy(keywords, "datasheet_id");
  const abilitiesByDatasheet = groupBy(abilities, "datasheet_id");

  const units = selectedDatasheets
    .map((sheet) => {
      const modelRows = modelsByDatasheet.get(sheet.id) ?? [];
      const primaryModel = pickPrimaryModel(modelRows);

      if (!primaryModel) {
        console.warn(`Skipping datasheet without model row: ${sheet.id} (${sheet.name})`);
        return null;
      }

      const wargearRows = (wargearByDatasheet.get(sheet.id) ?? []).filter(
        isProbablyRealWeapon
      );
      const keywordRows = keywordsByDatasheet.get(sheet.id) ?? [];
      const abilityRows = abilitiesByDatasheet.get(sheet.id) ?? [];

      const unitId = sanitizeId(sheet.name);

      const weapons = wargearRows.map((row, index) => buildWeapon(unitId, row, index));

      const keywordsList = dedupeStrings(
        keywordRows.map((row) => String(row.keyword || "").toUpperCase().trim())
      );

      const unitRules = parseUnitRules(abilityRows);

      return {
        id: unitId,
        name: sheet.name,
        faction: factionById.get(sheet.faction_id) ?? sheet.faction_id,
        toughness: toNumber(primaryModel.T),
        save: toNumber(primaryModel.Sv),
        invulnerableSave:
          primaryModel.inv_sv && String(primaryModel.inv_sv).trim() !== ""
            ? toNumber(primaryModel.inv_sv)
            : undefined,
        woundsPerModel: toNumber(primaryModel.W),
        weapons,
        specialRules: unitRules,
        keywords: keywordsList,
      };
    })
    .filter(Boolean);

  units.sort((a, b) => {
    if (a.faction !== b.faction) {
      return a.faction.localeCompare(b.faction);
    }
    return a.name.localeCompare(b.name);
  });

  const fileContent = `import type { Unit } from "../../types/combat";

export const generatedUnits: Unit[] = ${JSON.stringify(units, null, 2)} as Unit[];
`;

  fs.mkdirSync(path.dirname(OUTPUT_FILE), { recursive: true });
  fs.writeFileSync(OUTPUT_FILE, fileContent, "utf8");

  const byFaction = new Map();

  for (const unit of units) {
    byFaction.set(unit.faction, (byFaction.get(unit.faction) ?? 0) + 1);
  }

  console.log(`Generated ${units.length} units to ${OUTPUT_FILE}`);
  for (const [faction, count] of [...byFaction.entries()].sort((a, b) =>
    a[0].localeCompare(b[0])
  )) {
    console.log(`- ${faction}: ${count}`);
  }
}

main();