import fs from "fs";
import path from "path";
import { loadDatasheets, loadKeywords, loadWargear } from "./loadData.mjs";
import { parseWeaponRules } from "./mapRules.mjs";

function toWeaponType(rawType) {
  return String(rawType).toLowerCase() === "melee" ? "melee" : "ranged";
}

function toDiceValue(value) {
  const trimmed = String(value || "").trim();
  const asNumber = Number(trimmed);
  return Number.isNaN(asNumber) ? trimmed : asNumber;
}

function toNumber(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isNaN(parsed) ? fallback : parsed;
}

function slugify(value) {
  return String(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

const TARGET_FACTION = "AC";
const OUTPUT_PATH = path.join(
  process.cwd(),
  "src/generated/adeptus-custodes.units.generated.ts"
);

const datasheets = loadDatasheets().filter((ds) => ds.faction_id === TARGET_FACTION);
const wargear = loadWargear();
const keywords = loadKeywords();

const units = datasheets.map((datasheet) => {
  const unitWeapons = wargear
    .filter((item) => item.datasheet_id === datasheet.id)
    .map((item, index) => ({
      id: `${slugify(datasheet.name)}_${slugify(item.name)}_${index + 1}`,
      name: item.name,
      attacks: toDiceValue(item.A),
      skill: toNumber(item.BS_WS, 0),
      strength: toNumber(item.S, 0),
      ap: toNumber(item.AP, 0),
      damage: toDiceValue(item.D),
      type: toWeaponType(item.type),
      specialRules: parseWeaponRules(item.description),
    }));

  const unitKeywords = keywords
    .filter((item) => item.datasheet_id === datasheet.id)
    .map((item) => item.keyword);

  return {
    id: slugify(datasheet.name),
    name: datasheet.name,
    faction: "Adeptus Custodes",
    toughness: 0,
    save: 0,
    woundsPerModel: 1,
    weapons: unitWeapons,
    keywords: unitKeywords,
    specialRules: [],
  };
});

const fileContent = `import type { Unit } from "../types/combat";

export const adeptusCustodesGeneratedUnits: Unit[] = ${JSON.stringify(
  units,
  null,
  2
)};\n`;

fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });
fs.writeFileSync(OUTPUT_PATH, fileContent, "utf-8");

console.log(
  `Generated ${units.length} units to ${path.relative(process.cwd(), OUTPUT_PATH)}`
);