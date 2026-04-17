import type {
  ConditionalRuleFields,
  SpecialRule,
  Unit,
  UnitAbility,
  Weapon,
} from "../../types/combat";
import type { NormalizedAbility, NormalizedUnit } from "../../types/wahapedia";
import { normalizeFactionName } from "../../lib/normalizeFactionName";

export function mapNormalizedUnitToCombatUnit(unit: NormalizedUnit): Unit {
  const primaryModel = pickPrimaryModel(unit);

  return {
    id: unit.id,
    name: unit.name,
    faction: normalizeFactionName(unit.factionName),
    toughness: primaryModel.toughness,
    save: primaryModel.save,
    invulnerableSave:
      primaryModel.invulnerableSave && primaryModel.invulnerableSave > 0
        ? primaryModel.invulnerableSave
        : undefined,
    woundsPerModel: primaryModel.wounds,
    weapons: unit.weapons.map(mapWeapon),
    specialRules: [],
    abilities: unit.abilities.flatMap((ability) => mapAbility(unit, ability)),
    keywords: unit.keywords,
    points: unit.points,
    pointsDescription: unit.pointsDescription,
    pointsOptions: unit.pointsOptions,
  };
}

function pickPrimaryModel(unit: NormalizedUnit) {
  // Business heuristic:
  // 1) Prefer a "rank-and-file" model profile over leader/variant profiles
  //    (Sergeant/Exarch/Superior/Champion/etc.).
  // 2) Keep source order from the normalized data as a stable fallback
  //    (do not sort alphabetically).
  //
  // This approximates "most common model" for multi-profile units when we do not
  // yet have explicit composition counts in the normalized shape.
  const leaderVariantMarkers = [
    "sergeant",
    "superior",
    "exarch",
    "champion",
    "leader",
    "captain",
    "underseer",
    "nob",
    "boss",
    "prime",
    "alpha",
  ];

  return (
    unit.models.find((model) => {
      const name = model.name.toLowerCase();
      return !leaderVariantMarkers.some((marker) => name.includes(marker));
    }) ?? unit.models[0]
  );
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

function mapAbility(unit: NormalizedUnit, ability: NormalizedAbility): UnitAbility[] {
  const listItemVariants = extractListItemVariants(unit, ability);

  if (listItemVariants.length > 0) {
    return listItemVariants;
  }

  const modifiers = parseAbilityModifiers(unit, ability.description, ability.name);

  return [
    {
      id: ability.id,
      name: ability.name,
      description: ability.description,
      modifiers,
      supportLevel: modifiers.length > 0 ? "implemented" : "info-only",
    },
  ];
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
  if (text.includes("stealth ability") || text === "stealth") {
    rules.push({ type: "HIT_MODIFIER", value: -1, attackType: "ranged" });
  }
  if (text.includes("lone operative")) {
    rules.push({ type: "TARGETING_RANGE_LIMIT", value: 12, attackType: "ranged" });
  }
  if (
    text.includes("ignore any or all modifiers") &&
    (text.includes("hit roll") ||
      text.includes("ballistic skill") ||
      text.includes("weapon skill"))
  ) {
    rules.push({ type: "IGNORE_HIT_MODIFIERS" });
  }

  if (text.includes("re-roll a hit roll of 1") || text.includes("re-roll hit rolls of 1")) {
    rules.push({ type: "REROLL_HITS_ONES" });
  }

  if (
    text.includes("re-roll the hit roll") ||
    text.includes("re-roll hit rolls")
  ) {
    rules.push({ type: "REROLL_HITS" });
  }

  if (
    text.includes("re-roll a wound roll of 1") ||
    text.includes("re-roll wound rolls of 1")
  ) {
    rules.push({ type: "REROLL_WOUNDS_ONES" });
  }

  if (
    text.includes("re-roll the wound roll") ||
    text.includes("re-roll wound rolls")
  ) {
    rules.push({ type: "REROLL_WOUNDS" });
  }

  const criticalHitsOnMatch = text.match(
    /(unmodified hit roll|hit rolls?) of (\d)\+\s+scores? a critical hit/
  );
  if (criticalHitsOnMatch) {
    rules.push({ type: "CRITICAL_HITS_ON", value: Number(criticalHitsOnMatch[2]) });
  }

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

  const invulnerableSaveMatch = text.match(/(\d)\+\s+invulnerable save/);
  if (invulnerableSaveMatch) {
    rules.push({
      type: "INVULNERABLE_SAVE",
      value: Number(invulnerableSaveMatch[1]),
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

function parseAbilityModifiers(
  unit: NormalizedUnit,
  description: string,
  abilityName = ""
): SpecialRule[] {
  const baseRules = parseSpecialRules(`${abilityName} ${description}`);
  const contextualRules = parseContextualAbilityRules(unit, description);
  const contextualizedBaseRules = baseRules.map((rule) =>
    applyDescriptionContext(rule, description)
  );

  return dedupeRules([...contextualizedBaseRules, ...contextualRules]);
}

function parseContextualAbilityRules(
  unit: NormalizedUnit,
  description: string
): SpecialRule[] {
  const rules: SpecialRule[] = [];
  const normalizedDescription = normalizeSearchText(description);

  const attackType = inferAttackType(normalizedDescription);

  if (normalizedDescription.includes("add 1 to the hit roll")) {
    rules.push(applyDescriptionContext({ type: "HIT_MODIFIER", value: 1, attackType }, description));
  }

  if (normalizedDescription.includes("subtract 1 from the hit roll")) {
    rules.push(applyDescriptionContext({ type: "HIT_MODIFIER", value: -1, attackType }, description));
  }

  if (normalizedDescription.includes("add 1 to the wound roll")) {
    rules.push(applyDescriptionContext({ type: "WOUND_MODIFIER", value: 1, attackType }, description));
  }

  if (normalizedDescription.includes("subtract 1 from the wound roll")) {
    rules.push(applyDescriptionContext({ type: "WOUND_MODIFIER", value: -1, attackType }, description));
  }

  if (normalizedDescription.includes("improve the armour penetration characteristic")) {
    rules.push(applyDescriptionContext({ type: "AP_MODIFIER", value: 1, attackType }, description));
  }

  if (
    normalizedDescription.includes("add 1 to the attacks characteristic") ||
    normalizedDescription.includes("add 1 to the attack characteristic")
  ) {
    rules.push(
      applyDescriptionContext(
        { type: "ATTACKS_MODIFIER", value: 1, attackType },
        description
      )
    );
  }

  if (normalizedDescription.includes("add 1 to the strength characteristic")) {
    rules.push(
      applyDescriptionContext(
        { type: "STRENGTH_MODIFIER", value: 1, attackType },
        description
      )
    );
  }

  if (normalizedDescription.includes("add 1 to the damage characteristic")) {
    rules.push(applyDescriptionContext({ type: "DAMAGE_MODIFIER", value: 1, attackType }, description));
  }

  const targetingLimitMatch = normalizedDescription.match(
    /cannot be targeted by ranged attacks unless.*within (\d+)/
  );

  if (targetingLimitMatch) {
    rules.push(
      applyDescriptionContext(
        {
          type: "TARGETING_RANGE_LIMIT",
          value: Number(targetingLimitMatch[1]),
          attackType: "ranged",
        },
        description
      )
    );
  }

  const attacksCharacteristicMatch = normalizedDescription.match(
    /attacks characteristic of (\d+)/
  );

  if (attacksCharacteristicMatch) {
    const targetAttacks = Number(attacksCharacteristicMatch[1]);
    const referencedWeapon = findReferencedWeapon(unit, normalizedDescription);

    if (referencedWeapon) {
      const baseAttacks =
        typeof referencedWeapon.attacks === "number"
          ? referencedWeapon.attacks
          : null;

      if (baseAttacks !== null && targetAttacks > baseAttacks) {
        rules.push({
          type: "ATTACKS_MODIFIER",
          value: targetAttacks - baseAttacks,
          attackType: referencedWeapon.type,
          requiresWeaponNameIncludes: getWeaponNameSnippets(referencedWeapon.name),
        });
      }
    }
  }

  const strengthCharacteristicMatch = normalizedDescription.match(
    /strength characteristic of (\d+)/
  );

  if (strengthCharacteristicMatch) {
    const targetStrength = Number(strengthCharacteristicMatch[1]);
    const referencedWeapon = findReferencedWeapon(unit, normalizedDescription);

    if (referencedWeapon) {
      const delta = targetStrength - referencedWeapon.strength;

      if (delta !== 0) {
        rules.push({
          type: "STRENGTH_MODIFIER",
          value: delta,
          attackType: referencedWeapon.type,
          requiresWeaponNameIncludes: getWeaponNameSnippets(referencedWeapon.name),
        });
      }
    }
  }

  const damageCharacteristicMatch = normalizedDescription.match(
    /damage characteristic of (\d+)/
  );

  if (damageCharacteristicMatch) {
    const targetDamage = Number(damageCharacteristicMatch[1]);
    const referencedWeapon = findReferencedWeapon(unit, normalizedDescription);

    if (referencedWeapon && typeof referencedWeapon.damage === "number") {
      const delta = targetDamage - referencedWeapon.damage;

      if (delta !== 0) {
        rules.push({
          type: "DAMAGE_MODIFIER",
          value: delta,
          attackType: referencedWeapon.type,
          requiresWeaponNameIncludes: getWeaponNameSnippets(referencedWeapon.name),
        });
      }
    }
  }

  return rules;
}

function applyDescriptionContext(
  rule: SpecialRule,
  description: string
): SpecialRule {
  const normalizedDescription = normalizeSearchText(description);
  const attackType = inferAttackType(normalizedDescription);
  const contexts: Partial<ConditionalRuleFields> = {};

  if ("attackType" in rule && !rule.attackType && attackType) {
    contexts.attackType = attackType;
  }

  if (normalizedDescription.includes("closest eligible target")) {
    contexts.requiresTargetIsClosestEligible = true;
  }

  if (
    normalizedDescription.includes("while this model is leading a unit") ||
    normalizedDescription.includes("while the bearer is leading a unit") ||
    normalizedDescription.includes("attached unit")
  ) {
    contexts.requiresAttachedUnit = true;
  }

  if (normalizedDescription.includes("afflicted unit")) {
    contexts.requiresTargetIsAfflicted = true;
  }

  if (normalizedDescription.includes("within contagion range")) {
    contexts.requiresTargetWithinContagionRange = true;
  }

  if (normalizedDescription.includes("within your opponents deployment zone")) {
    contexts.requiresTargetInOpponentDeploymentZone = true;
  }

  if (normalizedDescription.includes("below its starting strength")) {
    contexts.requiresTargetBelowStartingStrength = true;
  }

  if (normalizedDescription.includes("below half strength")) {
    contexts.requiresTargetBelowHalfStrength = true;
  }

  if (normalizedDescription.includes("targets a character") || normalizedDescription.includes("targets an character")) {
    contexts.requiredDefenderKeywords = ["CHARACTER"];
  } else if (normalizedDescription.includes("targets a psyker")) {
    contexts.requiredDefenderKeywords = ["PSYKER"];
  } else if (
    normalizedDescription.includes("targets a monster or vehicle") ||
    normalizedDescription.includes("targets a monster unit") ||
    normalizedDescription.includes("targets a vehicle unit")
  ) {
    contexts.requiredDefenderKeywords = ["MONSTER", "VEHICLE"];
  }

  if (normalizedDescription.includes("that can fly")) {
    contexts.requiredDefenderKeywords = [
      ...(contexts.requiredDefenderKeywords ?? []),
      "FLY",
    ];
  }

  if (
    normalizedDescription.includes("cannot fly") ||
    normalizedDescription.includes("excluding units that can fly")
  ) {
    contexts.excludedDefenderKeywords = ["FLY"];
  }

  return Object.keys(contexts).length > 0
    ? ({ ...rule, ...contexts } as SpecialRule)
    : rule;
}

function extractListItemVariants(
  unit: NormalizedUnit,
  ability: NormalizedAbility
): UnitAbility[] {
  const items = Array.from(
    ability.description.matchAll(/<li>(.*?)<\/li>/gis),
    (match) => match[1]
  );

  if (items.length === 0) {
    return [];
  }

  return items
    .map((item, index) => {
      const cleanedItem = cleanHtmlText(item);
      const modifiers = parseAbilityModifiers(unit, cleanedItem, ability.name);

      return {
        id: `${ability.id}-option-${index + 1}`,
        name: `${ability.name}: ${cleanedItem}`,
        description: cleanedItem,
        modifiers,
        supportLevel: modifiers.length > 0 ? "implemented" : "info-only",
        selectionGroup: ability.id,
      } satisfies UnitAbility;
    })
    .filter((variant) => variant.modifiers.length > 0);
}

function findReferencedWeapon(
  unit: NormalizedUnit,
  normalizedDescription: string
): NormalizedUnit["weapons"][number] | null {
  const normalizedWeapons = unit.weapons.map((weapon) => ({
    weapon,
    normalizedName: normalizeSearchText(weapon.name),
  }));

  const match = normalizedWeapons.find(({ normalizedName }) =>
    normalizedDescription.includes(normalizedName)
  );

  if (match) {
    return match.weapon;
  }

  return (
    normalizedWeapons.find(({ normalizedName }) => {
      const compactName = normalizedName.replace(/\b(melee|ranged|strike|sweep)\b/g, "").trim();
      return compactName.length > 0 && normalizedDescription.includes(compactName);
    })?.weapon ?? null
  );
}

function getWeaponNameSnippets(weaponName: string): string[] {
  const normalized = normalizeSearchText(weaponName)
    .replace(/\b(melee|ranged|strike|sweep)\b/g, "")
    .trim();

  if (!normalized) {
    return [weaponName.toLowerCase()];
  }

  return [normalized];
}

function normalizeSearchText(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[’'"]/g, "")
    .replace(/[^a-z0-9\s]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function inferAttackType(
  normalizedDescription: string
): "melee" | "ranged" | undefined {
  const mentionsRanged =
    normalizedDescription.includes("ranged attack") ||
    normalizedDescription.includes("ranged weapon") ||
    normalizedDescription.includes("shoot");
  const mentionsMelee =
    normalizedDescription.includes("melee attack") ||
    normalizedDescription.includes("melee weapon") ||
    normalizedDescription.includes("fight phase");

  if (mentionsRanged && !mentionsMelee) return "ranged";
  if (mentionsMelee && !mentionsRanged) return "melee";

  return undefined;
}

function cleanHtmlText(value: string): string {
  return value
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, " ")
    .trim();
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
