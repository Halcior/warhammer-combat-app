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
  activeDefenderModifierRules = [],
}: CalculateExpectedDamageParams): ExpectedDamageResult {
  const combinedWeaponRules = [
    ...(attacker.specialRules ?? []),
    ...(weapon.specialRules ?? []),
    ...(activeModifierRules ?? []),
    ...(defender.specialRules ?? []),
    ...(activeDefenderModifierRules ?? []),
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
  const hitModifier = hasRule(activeRules, "IGNORE_HIT_MODIFIERS")
    ? 0
    : getHitModifier(activeRules, weapon.type);
  const strengthModifier = getStrengthModifier(activeRules, weapon.type);
  const damageModifier = getDamageModifier(activeRules, weapon.type);
  const damageReduction = getDamageReduction(activeRules);
  const feelNoPain = getFeelNoPain(activeRules);
  const effectiveToughness = Math.max(
    1,
    defender.toughness + getToughnessModifier(activeRules)
  );
  const effectiveSave = getSaveCharacteristic(activeRules, defender.save);
  const targetingRangeLimit = getTargetingRangeLimit(activeRules, weapon.type);

  if (
    weapon.type === "ranged" &&
    targetingRangeLimit !== null &&
    conditions.targetDistanceInches > targetingRangeLimit
  ) {
    return {
      totalAttacks: 0,
      hitTarget: weapon.skill,
      woundTarget: getWoundTarget(weapon.strength, effectiveToughness),
      saveTarget: defender.save,
      expectedHits: 0,
      expectedWounds: 0,
      expectedUnsavedWounds: 0,
      expectedDamage: 0,
      expectedSlainModels: 0,
      attacksPerModel: 0,
      damagePerFailedSave: 0,
      blastBonus: 0,
      criticalHits: 0,
      extraHitsFromSustained: 0,
      autoWoundsFromLethalHits: 0,
      criticalWoundsFromRolls: 0,
      mortalWoundsFromDevastating: 0,
      effectiveAp: weapon.ap,
    };
  }

  const effectiveAp = weapon.ap - apModifier;
  const effectiveStrength = weapon.strength + strengthModifier;

  const meltaBonus = conditions.isHalfRange
    ? getMeltaValue(activeRules)
    : 0;
  const damagePerFailedSave = applyDamageReduction(
    parseDiceValue(weapon.damage) + damageModifier + meltaBonus,
    damageReduction
  );

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
    effectiveToughness
  );

  if (hasLanceRule && conditions.isChargeTurn) {
    modifiedWoundTarget = Math.max(2, modifiedWoundTarget - 1);
  }

  const woundModifier = getWoundModifier(
    activeRules,
    weapon.type,
    effectiveToughness
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
    effectiveSave,
    effectiveAp,
    getInvulnerableSave(activeRules, defender.invulnerableSave ?? null)
  );

  const saveTarget = applyCoverToSave(
    baseSaveTarget,
    weapon.type,
    conditions.isTargetInCover && !ignoresCover
  );
  const criticalSaveTarget = applyCoverToSave(
    getModifiedSave(
      effectiveSave,
      effectiveAp - criticalWoundApModifier,
      getInvulnerableSave(activeRules, defender.invulnerableSave ?? null)
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

  const criticalWoundsFromRolls =
    hitsThatRollToWound * effectiveCriticalWoundChance;

  const normalWoundsFromRolls =
    hitsThatRollToWound * effectiveNormalWoundChance;

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

  const criticalDamage = hasDevastatingWounds
    ? 0
    : expectedUnsavedCriticalWounds * damagePerFailedSave;
  const feelNoPainMultiplier = 1 - getSuccessChance(feelNoPain);
  const normalDamage =
    (expectedUnsavedNormalWounds * damagePerFailedSave + criticalDamage) *
    feelNoPainMultiplier;
  const mortalWoundsAfterFeelNoPain =
    mortalWoundsFromDevastating * feelNoPainMultiplier;
  const expectedUnsavedWounds =
    expectedUnsavedNormalWounds + expectedUnsavedCriticalWounds;

  const expectedDamage = normalDamage + mortalWoundsAfterFeelNoPain;

  const normalKillsPerFailedSave = Math.min(
    1,
    damagePerFailedSave / defender.woundsPerModel
  );

  const slainModelsFromNormal =
    expectedUnsavedNormalWounds *
    normalKillsPerFailedSave *
    feelNoPainMultiplier;
  const slainModelsFromCritical = hasDevastatingWounds
    ? 0
    : expectedUnsavedCriticalWounds *
      normalKillsPerFailedSave *
      feelNoPainMultiplier;

  const slainModelsFromDevastating = hasDevastatingWounds
    ? Math.min(
        (criticalWoundsFromRolls * damagePerFailedSave * feelNoPainMultiplier) /
          defender.woundsPerModel,
        criticalWoundsFromRolls
      )
    : 0;

  const rawExpectedSlainModels =
    slainModelsFromNormal + slainModelsFromCritical + slainModelsFromDevastating;

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

function getToughnessModifier(rules: SpecialRule[]): number {
  return rules.reduce((sum, rule) => {
    if (rule.type !== "TOUGHNESS_MODIFIER") return sum;
    return sum + rule.value;
  }, 0);
}

function getDamageReduction(rules: SpecialRule[]): number {
  const candidates = rules
    .filter(
      (rule): rule is Extract<SpecialRule, { type: "DAMAGE_REDUCTION" }> =>
        rule.type === "DAMAGE_REDUCTION"
    )
    .map((rule) => rule.value);

  if (candidates.length === 0) return 0;

  return Math.max(...candidates);
}

function getTargetingRangeLimit(
  rules: SpecialRule[],
  weaponType: "melee" | "ranged"
): number | null {
  const candidates = rules
    .filter(
      (rule): rule is Extract<SpecialRule, { type: "TARGETING_RANGE_LIMIT" }> =>
        rule.type === "TARGETING_RANGE_LIMIT" &&
        (!rule.attackType || rule.attackType === weaponType)
    )
    .map((rule) => rule.value);

  if (candidates.length === 0) return null;

  return Math.min(...candidates);
}

function getInvulnerableSave(
  rules: SpecialRule[],
  baseInvulnerableSave: number | null
): number | null {
  const candidates = rules
    .filter(
      (rule): rule is Extract<SpecialRule, { type: "INVULNERABLE_SAVE" }> =>
        rule.type === "INVULNERABLE_SAVE"
    )
    .map((rule) => rule.value);

  if (baseInvulnerableSave !== null) {
    candidates.push(baseInvulnerableSave);
  }

  if (candidates.length === 0) return null;

  return Math.min(...candidates);
}

function getSaveCharacteristic(
  rules: SpecialRule[],
  baseSave: number
): number {
  const candidates = rules
    .filter(
      (rule): rule is Extract<SpecialRule, { type: "SET_SAVE_CHARACTERISTIC" }> =>
        rule.type === "SET_SAVE_CHARACTERISTIC"
    )
    .map((rule) => rule.value);

  if (candidates.length === 0) return baseSave;

  return Math.min(baseSave, ...candidates);
}

function getFeelNoPain(rules: SpecialRule[]): number | null {
  const candidates = rules
    .filter(
      (rule): rule is Extract<SpecialRule, { type: "FEEL_NO_PAIN" }> =>
        rule.type === "FEEL_NO_PAIN"
    )
    .map((rule) => rule.value);

  if (candidates.length === 0) return null;

  return Math.min(...candidates);
}

function applyDamageReduction(damage: number, damageReduction: number): number {
  if (damage <= 0) return 0;
  if (damageReduction <= 0) return damage;

  return Math.max(1, damage - damageReduction);
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
