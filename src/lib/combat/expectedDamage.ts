import {
  getAntiRule,
  getMeltaValue,
  getRapidFireValue,
  getSustainedHitsValue,
  hasRule,
} from "../rules";
import {
  getExpectedDiceValueWithOptionalReroll,
  getSuccessChance,
  parseDiceValue,
} from "./probability";
import { getModifiedSave, applyCoverToSave } from "./save";
import { getWoundTarget } from "./wound";
import {
  filterActiveRules,
  getHitRerollMode,
  getWoundRerollMode,
  type RerollMode,
} from "./ruleApplicability";
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
  const activeRules = filterActiveRules(combinedWeaponRules, {
    attacker,
    defender,
    weapon,
    conditions,
  });

  const apModifier = getApModifier(activeRules, weapon.type);
  const criticalWoundApModifier = getCriticalWoundApModifier(
    activeRules,
    weapon.type
  );
  const attacksModifier = getAttacksModifier(activeRules, weapon.type);
  const fixedHitRoll = getFixedHitRoll(activeRules, weapon.type);
  const hitModifier = getHitModifier(activeRules, weapon.type);
  const strengthModifier = getStrengthModifier(activeRules, weapon.type);
  const damageModifier = getDamageModifier(activeRules, weapon.type);

  const effectiveAp = weapon.ap - apModifier;
  const effectiveStrength = weapon.strength + strengthModifier;

  const meltaBonus = conditions.isHalfRange
    ? getMeltaValue(activeRules)
    : 0;
  const damagePerFailedSave =
    parseDiceValue(weapon.damage) + damageModifier + meltaBonus;

  const rapidFireBonus = conditions.isHalfRange
    ? getRapidFireValue(activeRules)
    : 0;

  const hasBlast = hasRule(activeRules, "BLAST");
  const blastBonus = hasBlast
    ? Math.floor(conditions.targetModelCount / 5)
    : 0;
  const hasAttackRerolls = hasRule(activeRules, "REROLL_ATTACKS");
  const baseAttacksPerModel = hasAttackRerolls
    ? getExpectedDiceValueWithOptionalReroll(weapon.attacks)
    : parseDiceValue(weapon.attacks);

  const attacksPerModel = Math.max(
    0,
    baseAttacksPerModel + rapidFireBonus + blastBonus + attacksModifier
  );
  const totalAttacks = attackingModels * attacksPerModel;

  const isTorrent = hasRule(activeRules, "TORRENT");
  const ignoresCover = hasRule(activeRules, "IGNORES_COVER");
  const hasLethalHits = hasRule(activeRules, "LETHAL_HITS");
  const hasDevastatingWounds = hasRule(activeRules, "DEVASTATING_WOUNDS");
  const sustainedHitsValue = getSustainedHitsValue(activeRules);
  const hitRerollMode = getHitRerollMode(activeRules);
  const woundRerollMode = getWoundRerollMode(activeRules);

  const hasHeavyRule = hasRule(activeRules, "HEAVY");

  let modifiedHitTarget = weapon.skill;

  if (fixedHitRoll !== null) {
    modifiedHitTarget = fixedHitRoll;
  } else if (hasHeavyRule && conditions.remainedStationary) {
    modifiedHitTarget = Math.max(2, modifiedHitTarget - 1);
  }

  const hitTarget =
    fixedHitRoll !== null
      ? Math.max(2, modifiedHitTarget)
      : Math.max(2, modifiedHitTarget - hitModifier);
  const hitProbabilities = isTorrent
    ? { successChance: 1, criticalChance: 0 }
    : getRollProbabilities(hitTarget, getCriticalHitThreshold(activeRules), hitRerollMode);
  const hitChance = hitProbabilities.successChance;

  const hasLanceRule = hasRule(activeRules, "LANCE");

   let modifiedWoundTarget = getWoundTarget(
    effectiveStrength,
    defender.toughness
  );

  if (hasLanceRule && conditions.isChargeTurn) {
    modifiedWoundTarget = Math.max(2, modifiedWoundTarget - 1);
  }

  const woundModifier = getWoundModifier(
    activeRules,
    weapon.type,
    defender.toughness
  );

  modifiedWoundTarget = Math.max(2, modifiedWoundTarget - woundModifier);

  const woundTarget = modifiedWoundTarget;
  const antiRule = getAntiRule(activeRules);

  let criticalWoundThreshold = 6;

  if (antiRule && conditions.targetHasMatchingAntiKeyword) {
    criticalWoundThreshold = antiRule.value;
  }

  const criticalHitChance = hitProbabilities.criticalChance;

  const woundProbabilities = getRollProbabilities(
    woundTarget,
    criticalWoundThreshold,
    woundRerollMode
  );

  const effectiveWoundChance = woundProbabilities.successChance;
  const effectiveCriticalWoundChance = woundProbabilities.criticalChance;

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
  const criticalSaveTarget = applyCoverToSave(
    getModifiedSave(
      defender.save,
      effectiveAp - criticalWoundApModifier,
      defender.invulnerableSave ?? null
    ),
    weapon.type,
    conditions.isTargetInCover && !ignoresCover
  );

  const saveChance = getSuccessChance(saveTarget);
  const failedSaveChance = 1 - saveChance;
  const criticalSaveChance = getSuccessChance(criticalSaveTarget);
  const criticalFailedSaveChance = 1 - criticalSaveChance;

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

  const expectedUnsavedCriticalWounds = hasDevastatingWounds
    ? criticalWoundsFromRolls
    : criticalWoundsFromRolls * criticalFailedSaveChance;

  const normalDamage = expectedUnsavedNormalWounds * damagePerFailedSave;
  const expectedUnsavedWounds =
    expectedUnsavedNormalWounds + expectedUnsavedCriticalWounds;

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

function getRollProbabilities(
  target: number,
  criticalThreshold: number,
  rerollMode: RerollMode
): {
  successChance: number;
  criticalChance: number;
} {
  const baseSuccessChance = getSuccessChance(target);
  const criticalTarget = Math.max(target, criticalThreshold);
  const baseCriticalChance = getSuccessChance(criticalTarget);

  if (rerollMode === "full") {
    const failureChance = 1 - baseSuccessChance;

    return {
      successChance: baseSuccessChance + failureChance * baseSuccessChance,
      criticalChance: baseCriticalChance + failureChance * baseCriticalChance,
    };
  }

  if (rerollMode === "ones") {
    return {
      successChance: baseSuccessChance + (1 / 6) * baseSuccessChance,
      criticalChance: baseCriticalChance + (1 / 6) * baseCriticalChance,
    };
  }

  return {
    successChance: baseSuccessChance,
    criticalChance: baseCriticalChance,
  };
}

function getAttacksModifier(
  rules: SpecialRule[],
  weaponType: "melee" | "ranged"
): number {
  return rules.reduce((sum, rule) => {
    if (rule.type !== "ATTACKS_MODIFIER") return sum;
    if (rule.attackType && rule.attackType !== weaponType) return sum;
    return sum + rule.value;
  }, 0);
}

function getCriticalWoundApModifier(
  rules: SpecialRule[],
  weaponType: "melee" | "ranged"
): number {
  return rules.reduce((sum, rule) => {
    if (rule.type !== "CRITICAL_WOUND_AP_MODIFIER") return sum;
    if (rule.attackType && rule.attackType !== weaponType) return sum;
    return sum + rule.value;
  }, 0);
}

function getFixedHitRoll(
  rules: SpecialRule[],
  weaponType: "melee" | "ranged"
): number | null {
  const candidates = rules
    .filter(
      (rule): rule is Extract<SpecialRule, { type: "FIXED_HIT_ROLL" }> =>
        rule.type === "FIXED_HIT_ROLL" &&
        (!rule.attackType || rule.attackType === weaponType)
    )
    .map((rule) => rule.value);

  if (candidates.length === 0) return null;

  return Math.min(...candidates);
}

function getHitModifier(
  rules: SpecialRule[],
  weaponType: "melee" | "ranged"
): number {
  return rules.reduce((sum, rule) => {
    if (rule.type !== "HIT_MODIFIER") return sum;
    if (rule.attackType && rule.attackType !== weaponType) return sum;
    return sum + rule.value;
  }, 0);
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
