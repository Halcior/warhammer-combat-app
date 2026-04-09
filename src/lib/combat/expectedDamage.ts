import {
  getAntiRule,
  getMeltaValue,
  getRapidFireValue,
  getSustainedHitsValue,
  hasRule,
} from "../rules";
import { parseDiceValue, getSuccessChance } from "./probability";
import { getModifiedSave, applyCoverToSave } from "./save";
import { getWoundTarget } from "./wound";
import type {
  CalculateExpectedDamageParams,
  ExpectedDamageResult,
} from "./types";
import type { SpecialRule } from "../../types/combat";

export function calculateExpectedDamage({
  attacker,
  weapon,
  defender,
  attackingModels,
  defendingModels,
  conditions,
  activeModifierRules = [],
}: CalculateExpectedDamageParams): ExpectedDamageResult {
  void attacker;

  const combinedWeaponRules = [
    ...(weapon.specialRules ?? []),
    ...(activeModifierRules ?? []),
  ];

  const apModifier = getApModifier(combinedWeaponRules, weapon.type);
  const strengthModifier = getStrengthModifier(combinedWeaponRules, weapon.type);
  const damageModifier = getDamageModifier(combinedWeaponRules, weapon.type);

  const effectiveAp = weapon.ap - apModifier;
  const effectiveStrength = weapon.strength + strengthModifier;

  const meltaBonus = conditions.isHalfRange
    ? getMeltaValue(combinedWeaponRules)
    : 0;

  const baseAttacksPerModel = parseDiceValue(weapon.attacks);
  const damagePerFailedSave =
    parseDiceValue(weapon.damage) + damageModifier + meltaBonus;

  const rapidFireBonus = conditions.isHalfRange
    ? getRapidFireValue(combinedWeaponRules)
    : 0;

  const hasBlast = hasRule(combinedWeaponRules, "BLAST");
  const blastBonus = hasBlast
    ? Math.floor(conditions.targetModelCount / 5)
    : 0;

  const attacksPerModel = baseAttacksPerModel + rapidFireBonus + blastBonus;
  const totalAttacks = attackingModels * attacksPerModel;

  const isTorrent = hasRule(combinedWeaponRules, "TORRENT");
  const ignoresCover = hasRule(combinedWeaponRules, "IGNORES_COVER");
  const hasLethalHits = hasRule(combinedWeaponRules, "LETHAL_HITS");
  const hasDevastatingWounds = hasRule(
    combinedWeaponRules,
    "DEVASTATING_WOUNDS"
  );
  const hasTwinLinked = hasRule(combinedWeaponRules, "TWIN_LINKED");
  const sustainedHitsValue = getSustainedHitsValue(combinedWeaponRules);

  const hasHeavyRule = hasRule(combinedWeaponRules, "HEAVY");

  let modifiedHitTarget = weapon.skill;

  if (hasHeavyRule && conditions.remainedStationary) {
    modifiedHitTarget = Math.max(2, modifiedHitTarget - 1);
  }

  const hitTarget = modifiedHitTarget;
  const hitChance = isTorrent ? 1 : getSuccessChance(hitTarget);

  const hasLanceRule = hasRule(combinedWeaponRules, "LANCE");

   let modifiedWoundTarget = getWoundTarget(
    effectiveStrength,
    defender.toughness
  );

  if (hasLanceRule && conditions.isChargeTurn) {
    modifiedWoundTarget = Math.max(2, modifiedWoundTarget - 1);
  }

  const woundModifier = getWoundModifier(
    combinedWeaponRules,
    weapon.type,
    defender.toughness
  );

  modifiedWoundTarget = Math.max(2, modifiedWoundTarget - woundModifier);

  const woundTarget = modifiedWoundTarget;
  const woundChance = getSuccessChance(woundTarget);
  const antiRule = getAntiRule(combinedWeaponRules);

  let criticalWoundThreshold = 6;

  if (antiRule && conditions.targetHasMatchingAntiKeyword) {
    criticalWoundThreshold = antiRule.value;
  }

  const criticalHitThreshold = getCriticalHitThreshold(combinedWeaponRules);
  const criticalHitChance = isTorrent
    ? 0
    : Math.min(hitChance, Math.max(0, (7 - criticalHitThreshold) / 6));

  const effectiveWoundChance = hasTwinLinked
    ? woundChance + (1 - woundChance) * woundChance
    : woundChance;

  const criticalWoundChanceRaw =
    Math.max(0, (7 - criticalWoundThreshold) / 6);

  const effectiveCriticalWoundChance = hasTwinLinked
    ? criticalWoundChanceRaw + (1 - woundChance) * criticalWoundChanceRaw
    : criticalWoundChanceRaw;

  const effectiveNormalWoundChance = Math.max(
    0,
    effectiveWoundChance - effectiveCriticalWoundChance
  );

  const baseSaveTarget = getModifiedSave(
    defender.save,
    effectiveAp,
    defender.invulnerableSave ?? null
  );

  const saveTarget = applyCoverToSave(
    baseSaveTarget,
    weapon.type,
    conditions.isTargetInCover && !ignoresCover
  );

  const saveChance = getSuccessChance(saveTarget);
  const failedSaveChance = 1 - saveChance;

  const criticalHits = totalAttacks * criticalHitChance;
  const baseExpectedHits = totalAttacks * hitChance;

  const extraHitsFromSustained = isTorrent
    ? 0
    : criticalHits * sustainedHitsValue;

  const expectedHits = baseExpectedHits + extraHitsFromSustained;

  const normalHitsBeforeSustained = Math.max(0, baseExpectedHits - criticalHits);

  const autoWoundsFromLethalHits = hasLethalHits ? criticalHits : 0;

  const hitsThatRollToWound = hasLethalHits
    ? normalHitsBeforeSustained + extraHitsFromSustained
    : expectedHits;

  const criticalWoundsFromRolls = hasDevastatingWounds
    ? hitsThatRollToWound * effectiveCriticalWoundChance
    : 0;

  const normalWoundsFromRolls = hasDevastatingWounds
    ? hitsThatRollToWound * effectiveNormalWoundChance
    : hitsThatRollToWound * effectiveWoundChance;

  const expectedWounds =
    autoWoundsFromLethalHits + criticalWoundsFromRolls + normalWoundsFromRolls;

  const expectedUnsavedNormalWounds =
    (autoWoundsFromLethalHits + normalWoundsFromRolls) * failedSaveChance;

  const mortalWoundsFromDevastating = hasDevastatingWounds
    ? criticalWoundsFromRolls * damagePerFailedSave
    : 0;

  const normalDamage = expectedUnsavedNormalWounds * damagePerFailedSave;
  const expectedUnsavedWounds =
    expectedUnsavedNormalWounds + criticalWoundsFromRolls;

  const expectedDamage = normalDamage + mortalWoundsFromDevastating;

  const normalKillsPerFailedSave = Math.min(
    1,
    damagePerFailedSave / defender.woundsPerModel
  );

  const slainModelsFromNormal =
    expectedUnsavedNormalWounds * normalKillsPerFailedSave;

  const slainModelsFromDevastating = hasDevastatingWounds
    ? Math.min(
        (criticalWoundsFromRolls * damagePerFailedSave) /
          defender.woundsPerModel,
        criticalWoundsFromRolls
      )
    : 0;

  const rawExpectedSlainModels =
    slainModelsFromNormal + slainModelsFromDevastating;

  const expectedSlainModels = Math.min(rawExpectedSlainModels, defendingModels);

  return {
    totalAttacks,
    hitTarget,
    woundTarget,
    saveTarget,
    expectedHits,
    expectedWounds,
    expectedUnsavedWounds,
    expectedDamage,
    expectedSlainModels,
    attacksPerModel,
    damagePerFailedSave,
    blastBonus,
    criticalHits,
    extraHitsFromSustained,
    autoWoundsFromLethalHits,
    criticalWoundsFromRolls,
    mortalWoundsFromDevastating,
    effectiveAp,
  };
}

function getCriticalHitThreshold(rules: SpecialRule[]): number {
  const match = rules.find((rule) => rule.type === "CRITICAL_HITS_ON");

  if (!match) return 6;
  if ("value" in match) return match.value;

  return 6;
}

function getApModifier(
  rules: SpecialRule[],
  weaponType: "melee" | "ranged"
): number {
  return rules.reduce((sum, rule) => {
    if (rule.type !== "AP_MODIFIER") return sum;
    if (rule.attackType && rule.attackType !== weaponType) return sum;
    return sum + rule.value;
  }, 0);
}

function getStrengthModifier(
  rules: SpecialRule[],
  weaponType: "melee" | "ranged"
): number {
  return rules.reduce((sum, rule) => {
    if (rule.type !== "STRENGTH_MODIFIER") return sum;
    if (rule.attackType && rule.attackType !== weaponType) return sum;
    return sum + rule.value;
  }, 0);
}

function getDamageModifier(
  rules: SpecialRule[],
  weaponType: "melee" | "ranged"
): number {
  return rules.reduce((sum, rule) => {
    if (rule.type !== "DAMAGE_MODIFIER") return sum;
    if (rule.attackType && rule.attackType !== weaponType) return sum;
    return sum + rule.value;
  }, 0);
}

function getWoundModifier(
  rules: SpecialRule[],
  weaponType: "melee" | "ranged",
  defenderToughness: number
): number {
  return rules.reduce((sum, rule) => {
    if (rule.type !== "WOUND_MODIFIER") return sum;
    if (rule.attackType && rule.attackType !== weaponType) return sum;
    if (
      rule.targetToughnessAtLeast !== undefined &&
      defenderToughness < rule.targetToughnessAtLeast
    ) {
      return sum;
    }

    return sum + rule.value;
  }, 0);
}