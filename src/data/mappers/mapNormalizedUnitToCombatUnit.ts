import type { SpecialRule, Unit, Weapon } from "../../types/combat";
import type { NormalizedAbility, NormalizedUnit } from "../../types/wahapedia";

export function mapNormalizedUnitToCombatUnit(unit: NormalizedUnit): Unit {
  const primaryModel = pickPrimaryModel(unit);

  return {
    id: unit.id,
    name: unit.name,
    faction: unit.factionName,
    toughness: primaryModel.toughness,
    save: primaryModel.save,
    invulnerableSave: primaryModel.invulnerableSave,
    woundsPerModel: primaryModel.wounds,
    weapons: unit.weapons.map(mapWeapon),
    specialRules: parseUnitRules(unit.abilities),
    keywords: unit.keywords,
  };
}

function pickPrimaryModel(unit: NormalizedUnit) {
  const sorted = [...unit.models].sort((a, b) => a.name.localeCompare(b.name));
  return sorted[0];
}

function mapWeapon(weapon: NormalizedUnit["weapons"][number]): Weapon {
  const combinedText = [weapon.description ?? "", ...weapon.keywords].join(" ");

  return {
    id: weapon.id,
    name: weapon.name,
    attacks: weapon.attacks,
    skill: weapon.skill,
    strength: weapon.strength,
    ap: weapon.ap,
    damage: weapon.damage,
    type: weapon.type,
    specialRules: parseSpecialRules(combinedText),
  };
}

function parseUnitRules(abilities: NormalizedAbility[]): SpecialRule[] {
  const rules = abilities.flatMap((ability) =>
    parseSpecialRules(`${ability.name} ${ability.description}`)
  );

  return dedupeRules(rules);
}

function parseSpecialRules(description: string): SpecialRule[] {
  if (!description) return [];

  const text = description.toLowerCase();
  const rules: SpecialRule[] = [];

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

  const sustainedMatch = text.match(/sustained hits\s+(\d+)/);
  if (sustainedMatch) {
    rules.push({ type: "SUSTAINED_HITS", value: Number(sustainedMatch[1]) });
  }

  const rapidFireMatch = text.match(/rapid fire\s+(\d+)/);
  if (rapidFireMatch) {
    rules.push({ type: "RAPID_FIRE", value: Number(rapidFireMatch[1]) });
  }

  const meltaMatch = text.match(/melta\s+(\d+)/);
  if (meltaMatch) {
    rules.push({ type: "MELTA", value: Number(meltaMatch[1]) });
  }

  const feelNoPainMatch = text.match(/feel no pain\s+(\d)\+/);
  if (feelNoPainMatch) {
    rules.push({ type: "FEEL_NO_PAIN", value: Number(feelNoPainMatch[1]) });
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

function dedupeRules(rules: SpecialRule[]): SpecialRule[] {
  const seen = new Set<string>();

  return rules.filter((rule) => {
    const key = JSON.stringify(rule);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
