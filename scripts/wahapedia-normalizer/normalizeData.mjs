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

function dedupeStrings(values) {
  return [...new Set(values.filter(Boolean))];
}

function inferModelCountFromCostDescription(description) {
  const matches = String(description || "").match(/\d+/g);

  if (!matches || matches.length === 0) {
    return undefined;
  }

  const total = matches.reduce((sum, value) => sum + Number(value), 0);
  return total > 0 ? total : undefined;
}

function normalizeWeaponType(rangeValue, typeValue) {
  const range = String(rangeValue || "").toLowerCase();
  const type = String(typeValue || "").toLowerCase();

  if (range === "melee" || type === "melee") return "melee";
  return "ranged";
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

  return !blockedFragments.some((fragment) => lowerName.includes(fragment));
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

function buildAbilityMap(abilities) {
  const abilityById = new Map();

  for (const ability of abilities) {
    if (!ability.id) continue;

    const existing = abilityById.get(ability.id);

    if (!existing) {
      abilityById.set(ability.id, ability);
      continue;
    }

    const existingDescriptionLength = String(existing.description || "").length;
    const nextDescriptionLength = String(ability.description || "").length;

    if (nextDescriptionLength > existingDescriptionLength) {
      abilityById.set(ability.id, ability);
    }
  }

  return abilityById;
}

function buildModelProfile(datasheetName, row, index) {
  const rawInvul =
    row.inv_sv && String(row.inv_sv).trim() !== ""
      ? toNumber(row.inv_sv)
      : undefined;

  return {
    id: `${sanitizeId(datasheetName)}_model_${index + 1}`,
    name: row.name || datasheetName,
    toughness: toNumber(row.T),
    save: toNumber(row.Sv),
    invulnerableSave:
      rawInvul && rawInvul > 0 ? rawInvul : undefined,
    wounds: toNumber(row.W),
  };
}

function buildWeaponProfile(datasheetName, row, index) {
  const keywordText = `${row.description || ""} ${row.abilities || ""}`;

  return {
    id: `${sanitizeId(datasheetName)}_${sanitizeId(row.name)}_${index + 1}`,
    name: row.name,
    range: row.range || "",
    type: normalizeWeaponType(row.range, row.type),
    attacks: parseDiceValue(row.A),
    skill: toNumber(row.BS_WS),
    strength: toNumber(row.S),
    ap: toNumber(row.AP),
    damage: parseDiceValue(row.D),
    keywords: dedupeStrings(
      keywordText
        .split(",")
        .map((entry) => entry.trim().toUpperCase())
        .filter(Boolean)
    ),
    description: row.description || undefined,
  };
}

function buildAbilityProfile(datasheetName, row, abilityById, index) {
  const resolvedAbility = row.ability_id ? abilityById.get(row.ability_id) : null;
  const baseName = row.name || resolvedAbility?.name || `Ability ${index + 1}`;
  const parameter = String(row.parameter || "").trim();
  const name =
    parameter && !baseName.toLowerCase().includes(parameter.toLowerCase())
      ? `${baseName} ${parameter}`
      : baseName;

  return {
    id: `${sanitizeId(datasheetName)}_ability_${index + 1}`,
    name,
    description: row.description || resolvedAbility?.description || "",
    type: row.type || undefined,
  };
}

function main() {
  const factions = readPipeCsv("Factions.csv");
  const datasheets = readPipeCsv("Datasheets.csv");
  const models = readPipeCsv("Datasheets_models.csv");
  const wargear = readPipeCsv("Datasheets_wargear.csv");
  const keywords = readPipeCsv("Datasheets_keywords.csv");
  const abilities = readPipeCsv("Datasheets_abilities.csv");
  const abilitiesIndex = readPipeCsv("Abilities.csv");
  const unitCosts = readPipeCsv("Datasheets_models_cost.csv");

  const factionById = buildFactionMap(factions);
  const abilityById = buildAbilityMap(abilitiesIndex);
  const modelsByDatasheet = groupBy(models, "datasheet_id");
  const wargearByDatasheet = groupBy(wargear, "datasheet_id");
  const keywordsByDatasheet = groupBy(keywords, "datasheet_id");
  const abilitiesByDatasheet = groupBy(abilities, "datasheet_id");
  const costsByDatasheet = groupBy(unitCosts, "datasheet_id");

  const normalizedFactions = [...factionById.values()].sort((a, b) =>
    a.name.localeCompare(b.name)
  );

  const normalizedUnits = datasheets
    .filter((sheet) => sheet.faction_id && factionById.has(sheet.faction_id))
    .map((sheet) => {
      const faction = factionById.get(sheet.faction_id);
      const modelRows = modelsByDatasheet.get(sheet.id) ?? [];
      const wargearRows = (wargearByDatasheet.get(sheet.id) ?? []).filter(
        isProbablyRealWeapon
      );
      const keywordRows = keywordsByDatasheet.get(sheet.id) ?? [];
      const abilityRows = abilitiesByDatasheet.get(sheet.id) ?? [];
      const costRows = costsByDatasheet.get(sheet.id) ?? [];
      const pointsOptions = costRows
        .map((row) => ({
          description: row.description || "",
          cost: toNumber(row.cost, 0),
          modelCount: inferModelCountFromCostDescription(row.description),
        }))
        .filter((row) => row.cost > 0);
      const primaryPointsOption = pointsOptions[0];

      return {
        id: sanitizeId(sheet.name),
        name: sheet.name,
        factionId: faction.id,
        factionName: faction.name,
        models: modelRows.map((row, index) => buildModelProfile(sheet.name, row, index)),
        weapons: wargearRows.map((row, index) => buildWeaponProfile(sheet.name, row, index)),
        keywords: dedupeStrings(
          keywordRows.map((row) => String(row.keyword || "").toUpperCase().trim())
        ),
        abilities: abilityRows.map((row, index) =>
          buildAbilityProfile(sheet.name, row, abilityById, index)
        ),
        points: primaryPointsOption?.cost,
        pointsDescription: primaryPointsOption?.description,
        pointsOptions,
      };
    })
    .filter((unit) => unit.models.length > 0)
    .sort((a, b) => {
      if (a.factionName !== b.factionName) {
        return a.factionName.localeCompare(b.factionName);
      }
      return a.name.localeCompare(b.name);
    });

  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  fs.writeFileSync(
    path.join(OUTPUT_DIR, "factions.json"),
    JSON.stringify(normalizedFactions, null, 2),
    "utf8"
  );
  fs.writeFileSync(
    path.join(OUTPUT_DIR, "units.json"),
    JSON.stringify(normalizedUnits, null, 2),
    "utf8"
  );

  console.log(`Generated ${normalizedFactions.length} factions`);
  console.log(`Generated ${normalizedUnits.length} normalized units`);
  console.log(`Output directory: ${OUTPUT_DIR}`);
}

main();
