import type {
  AttackConditions,
  DiceValue,
  SpecialRule,
  Unit,
  Weapon,
} from "../types/combat";
import {
  getAntiRule,
  getMeltaValue,
  getRapidFireValue,
  getSustainedHitsValue,
  hasRule,
} from "./rules";

export function getWoundTarget(strength: number, toughness: number): number {
  if (strength >= toughness * 2) return 2;
  if (strength > toughness) return 3;
  if (strength === toughness) return 4;
  if (strength * 2 <= toughness) return 6;
  return 5;
}

export function applyCoverToSave(
  saveTarget: number,
  weaponType: Weapon["type"],
  isTargetInCover: boolean
): number {
  if (!isTargetInCover) return saveTarget;
  if (weaponType !== "ranged") return saveTarget;

  return Math.max(2, saveTarget - 1);
}

export function getModifiedSave(
  baseSave: number,
  ap: number,
  invul: number | null
) {
  const modifiedArmorSave = baseSave - ap;

  if (invul !== null) {
    return Math.min(modifiedArmorSave, invul);
  }

  return modifiedArmorSave;
}

export function getSuccessChance(target: number | null): number {
  if (target === null) return 0;

  if (target <= 2) return 5 / 6;
  if (target === 3) return 4 / 6;
  if (target === 4) return 3 / 6;
  if (target === 5) return 2 / 6;
  if (target === 6) return 1 / 6;
  return 0;
}

export function parseDiceValue(value: DiceValue): number {
  if (typeof value === "number") {
    return value;
  }

  const normalized = value.replace(/\s+/g, "").toUpperCase();

  const diceRegex = /^(\d*)D(\d+)([+-]\d+)?$/;
  const match = normalized.match(diceRegex);

  if (!match) {
    const parsedNumber = Number(normalized);
    return Number.isNaN(parsedNumber) ? 0 : parsedNumber;
  }

  const diceCount = match[1] ? Number(match[1]) : 1;
  const diceSides = Number(match[2]);
  const modifier = match[3] ? Number(match[3]) : 0;

  const averageSingleDie = (diceSides + 1) / 2;
  return diceCount * averageSingleDie + modifier;
}

type CalculateExpectedDamageParams = {
  attacker: Unit;
  weapon: Weapon;
  defender: Unit;
  attackingModels: number;
  defendingModels: number;
  conditions: AttackConditions;
  activeModifierRules?: SpecialRule[];
};

export function calculateExpectedDamage({
  attacker,
  weapon,
  defender,
  attackingModels,
  defendingModels,
  conditions,
  activeModifierRules = [],
}: CalculateExpectedDamageParams) {
  void attacker;

  const combinedWeaponRules = [
    ...(weapon.specialRules ?? []),
    ...(activeModifierRules ?? []),
  ];

  const meltaBonus = conditions.isHalfRange
    ? getMeltaValue(combinedWeaponRules)
    : 0;

  const baseAttacksPerModel = parseDiceValue(weapon.attacks);
  const damagePerFailedSave = parseDiceValue(weapon.damage) + meltaBonus;

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
    weapon.strength,
    defender.toughness
  );

  if (hasLanceRule && conditions.isChargeTurn) {
    modifiedWoundTarget = Math.max(2, modifiedWoundTarget - 1);
  }

  const woundTarget = modifiedWoundTarget;
  const woundChance = getSuccessChance(woundTarget);
  const antiRule = getAntiRule(combinedWeaponRules);

  let criticalWoundThreshold = 6;

  if (antiRule && conditions.targetHasMatchingAntiKeyword) {
    criticalWoundThreshold = antiRule.value;
  }

  const criticalHitChance = isTorrent ? 0 : Math.min(hitChance, 1 / 6);

  const effectiveWoundChance = hasTwinLinked
    ? woundChance + (1 - woundChance) * woundChance
    : woundChance;

  const criticalWoundChanceRaw =
    woundTarget !== null
      ? Math.max(0, (7 - criticalWoundThreshold) / 6)
      : 0;

  const effectiveCriticalWoundChance = hasTwinLinked
    ? criticalWoundChanceRaw +
      (1 - woundChance) * criticalWoundChanceRaw
    : criticalWoundChanceRaw;

  const effectiveNormalWoundChance = Math.max(
    0,
    effectiveWoundChance - effectiveCriticalWoundChance
  );

  const baseSaveTarget = getModifiedSave(
    defender.save,
    weapon.ap,
    defender.invulnerableSave ?? null
  );

  const saveTarget = applyCoverToSave(
    baseSaveTarget,
    weapon.type,
    conditions.isTargetInCover && !ignoresCover
  );

  const saveChance = getSuccessChance(saveTarget);
  const failedSaveChance = 1 - saveChance;

  // HIT STEP
  const criticalHits = totalAttacks * criticalHitChance;
  const baseExpectedHits = totalAttacks * hitChance;

  const extraHitsFromSustained = isTorrent
    ? 0
    : criticalHits * sustainedHitsValue;

  const expectedHits = baseExpectedHits + extraHitsFromSustained;

  // WOUND STEP
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

  // SAVE + DAMAGE
  const expectedUnsavedNormalWounds =
    (autoWoundsFromLethalHits + normalWoundsFromRolls) * failedSaveChance;

  const mortalWoundsFromDevastating = hasDevastatingWounds
    ? criticalWoundsFromRolls * damagePerFailedSave
    : 0;

  const normalDamage = expectedUnsavedNormalWounds * damagePerFailedSave;
  const expectedUnsavedWounds =
    expectedUnsavedNormalWounds + criticalWoundsFromRolls;

  const expectedDamage = normalDamage + mortalWoundsFromDevastating;

  // Bez spillover między modelami
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
  };
}

type ResolveAttackParams = {
  weapon: Weapon;
  defender: Unit;
  defendingModels: number;
  rolledHits: number;
  rolledWounds: number;
  successfulSaves: number;
};

export function resolveAttack({
  weapon,
  defender,
  defendingModels,
  rolledHits,
  rolledWounds,
  successfulSaves,
}: ResolveAttackParams) {
  const damagePerFailedSave = parseDiceValue(weapon.damage);

  const safeHits = Math.max(0, rolledHits);
  const safeWounds = Math.max(0, Math.min(rolledWounds, safeHits));
  const safeSaves = Math.max(0, Math.min(successfulSaves, safeWounds));

  const unsavedWounds = safeWounds - safeSaves;
  const resolvedDamage = unsavedWounds * damagePerFailedSave;

  const killsPerFailedSave = Math.min(
    1,
    damagePerFailedSave / defender.woundsPerModel
  );
  const rawResolvedSlainModels = unsavedWounds * killsPerFailedSave;
  const resolvedSlainModels = Math.min(rawResolvedSlainModels, defendingModels);

  return {
    unsavedWounds,
    resolvedDamage,
    resolvedSlainModels,
    damagePerFailedSave,
  };
}