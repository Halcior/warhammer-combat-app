import type { AttackConditions, SpecialRule, Unit, Weapon } from "../../../types/combat";
import type { CalculateExpectedDamageParams } from "../types";
import { getModifiedSave, applyCoverToSave } from "../save";
import { getWoundTarget } from "../wound";
import {
  filterActiveRules,
  getHitRerollMode,
  getWoundRerollMode,
  type RerollMode,
} from "../ruleApplicability";
import {
  analyzeSimulation,
  type SimulationRunResult,
  type SimulationSummary,
} from "./analyzeSimulation";
import { parseDiceValue } from "../probability";

export type SimulateAttackContextParams = Pick<
  CalculateExpectedDamageParams,
  | "attacker"
  | "weapon"
  | "defender"
  | "attackingModels"
  | "defendingModels"
  | "conditions"
  | "activeModifierRules"
  | "activeDefenderModifierRules"
> & {
  runs: number;
};

export function simulateAttackContext(
  params: SimulateAttackContextParams
): SimulationSummary {
  const results: SimulationRunResult[] = [];

  for (let i = 0; i < params.runs; i++) {
    results.push(simulateSingleAttackSequence(params));
  }

  return analyzeSimulation(results, params.defendingModels);
}

function simulateSingleAttackSequence(
  params: SimulateAttackContextParams
): SimulationRunResult {
  const combinedRules = [
    ...(params.weapon.specialRules ?? []),
    ...(params.activeModifierRules ?? []),
    ...(params.defender.specialRules ?? []),
    ...(params.activeDefenderModifierRules ?? []),
  ];
  const activeRules = filterActiveRules(combinedRules, {
    attacker: params.attacker,
    defender: params.defender,
    weapon: params.weapon,
    conditions: params.conditions,
  });

  const targetingRangeLimit = getTargetingRangeLimit(
    activeRules,
    params.weapon.type
  );

  if (
    params.weapon.type === "ranged" &&
    targetingRangeLimit !== null &&
    params.conditions.targetDistanceInches > targetingRangeLimit
  ) {
    return {
      damage: 0,
      slainModels: 0,
      hits: 0,
      wounds: 0,
      failedSaves: 0,
      mortals: 0,
    };
  }

  const attackCount = getTotalAttacks(
    params.weapon,
    params.attackingModels,
    params.defendingModels,
    params.conditions,
    activeRules
  );

  const hitTarget = getHitTarget(params.weapon, params.conditions, activeRules);
  const effectiveStrength =
    params.weapon.strength +
    getStrengthModifier(activeRules, params.weapon.type);

  let woundTarget = getWoundTarget(effectiveStrength, params.defender.toughness);

  if (hasRule(activeRules, "LANCE") && params.conditions.isChargeTurn) {
    woundTarget = Math.max(2, woundTarget - 1);
  }

  const woundModifier = getWoundModifier(
    activeRules,
    params.weapon.type,
    params.defender.toughness
  );

  woundTarget = Math.max(2, woundTarget - woundModifier);
  const saveTarget = getSaveTarget(
    params.weapon,
    params.defender,
    params.conditions,
    activeRules
  );
  const criticalSaveTarget = getSaveTarget(
    params.weapon,
    params.defender,
    params.conditions,
    activeRules,
    getCriticalWoundApModifier(activeRules, params.weapon.type)
  );

  const hasDevastating = hasRule(activeRules, "DEVASTATING_WOUNDS");
  const hasLethal = hasRule(activeRules, "LETHAL_HITS");
  const sustainedHits = getRuleValue(activeRules, "SUSTAINED_HITS") ?? 0;
  const criticalHitThreshold = getCriticalHitThreshold(activeRules);
  const hitRerollMode = getHitRerollMode(activeRules);
  const woundRerollMode = getWoundRerollMode(activeRules);
  const feelNoPain = getFeelNoPain(activeRules);

  let totalHits = 0;
  let totalWounds = 0;
  let totalFailedSaves = 0;
  let totalMortals = 0;
  let totalDamage = 0;
  let pendingHitRolls = attackCount;

  while (pendingHitRolls > 0) {
    pendingHitRolls -= 1;

    const hitResult = rollWithReroll(hitTarget, criticalHitThreshold, hitRerollMode);
    if (!hitResult.success) {
      continue;
    }

    totalHits++;

    const criticalHit = hitResult.critical;

    if (criticalHit && sustainedHits > 0) {
      pendingHitRolls += sustainedHits;
    }

    if (criticalHit && hasLethal) {
      totalWounds++;

      if (!passesSave(saveTarget)) {
        totalFailedSaves++;
        totalDamage += applyFeelNoPain(
          rollDamage(params.weapon, activeRules, params.conditions),
          feelNoPain
        );
      }

      continue;
    }

    const woundResult = rollWithReroll(woundTarget, 6, woundRerollMode);
    if (!woundResult.success) {
      continue;
    }

    totalWounds++;

    const criticalWound = woundResult.critical;

    if (criticalWound && hasDevastating) {
      totalMortals++;
      totalDamage += applyFeelNoPain(
        rollDamage(params.weapon, activeRules, params.conditions),
        feelNoPain
      );
      continue;
    }

    if (!passesSave(criticalWound ? criticalSaveTarget : saveTarget)) {
      totalFailedSaves++;
      totalDamage += applyFeelNoPain(
        rollDamage(params.weapon, activeRules, params.conditions),
        feelNoPain
      );
    }
  }

  const slainModels = Math.min(
    params.defendingModels,
    Math.floor(totalDamage / params.defender.woundsPerModel)
  );

  return {
    damage: totalDamage,
    slainModels,
    hits: totalHits,
    wounds: totalWounds,
    failedSaves: totalFailedSaves,
    mortals: totalMortals,
  };
}

function getTotalAttacks(
  weapon: Weapon,
  attackingModels: number,
  defendingModels: number,
  conditions: AttackConditions,
  rules: SpecialRule[]
): number {
  const attacksModifier = getAttacksModifier(rules, weapon.type);
  const rerollAttacks = hasRule(rules, "REROLL_ATTACKS");
  let attacks = 0;

  for (let i = 0; i < attackingModels; i++) {
    attacks += Math.max(
      0,
      rollAttackValue(weapon.attacks, rerollAttacks) + attacksModifier
    );
  }

  if (hasRule(rules, "RAPID_FIRE") && conditions.isHalfRange) {
    attacks += attackingModels * (getRuleValue(rules, "RAPID_FIRE") ?? 0);
  }

  if (hasRule(rules, "BLAST") && defendingModels >= 5) {
    attacks += Math.floor(defendingModels / 5);
  }

  return Math.max(0, attacks);
}

function getHitTarget(
  weapon: Weapon,
  conditions: AttackConditions,
  rules: SpecialRule[]
): number | null {
  if (hasTorrent(rules)) {
    return null;
  }

  const fixedHitRoll = getFixedHitRoll(rules, weapon.type);
  if (fixedHitRoll !== null) {
    return Math.max(2, fixedHitRoll);
  }

  let target = weapon.skill;

  if (hasRule(rules, "HEAVY") && conditions.remainedStationary) {
    target = Math.max(2, target - 1);
  }

  const hitModifier = hasRule(rules, "IGNORE_HIT_MODIFIERS")
    ? 0
    : getHitModifier(rules, weapon.type);

  return Math.max(2, target - hitModifier);
}

function getSaveTarget(
  weapon: Weapon,
  defender: Unit,
  conditions: AttackConditions,
  rules: SpecialRule[],
  apBonus = 0
): number | null {
  const ignoresCover = hasRule(rules, "IGNORES_COVER");
  const invul = getInvulnerableSave(rules, defender.invulnerableSave ?? null);
  const effectiveSave = getSaveCharacteristic(rules, defender.save);
  const effectiveAp = weapon.ap - getApModifier(rules, weapon.type) - apBonus;
  const modified = getModifiedSave(effectiveSave, effectiveAp, invul);
  const covered = ignoresCover
    ? modified
    : applyCoverToSave(modified, weapon.type, conditions.isTargetInCover);

  if (covered > 6) return null;
  if (covered <= 0) return 0;

  return covered;
}

function rollDamage(
  weapon: Weapon,
  rules: SpecialRule[],
  conditions: AttackConditions
): number {
  const baseDamage = rollValue(weapon.damage);
  const damageModifier = getDamageModifier(rules, weapon.type);
  const damageReduction = getDamageReduction(rules);
  const melta =
    hasRule(rules, "MELTA") && conditions.isHalfRange
      ? (getRuleValue(rules, "MELTA") ?? 0)
      : 0;

  return applyDamageReduction(baseDamage + damageModifier + melta, damageReduction);
}

function rollAttackValue(value: number | string, canReroll: boolean): number {
  let result = rollValue(value);

  if (canReroll && result < parseDiceValue(value)) {
    result = rollValue(value);
  }

  return result;
}

function rollWithReroll(
  target: number | null,
  criticalThreshold: number,
  rerollMode: RerollMode
): {
  success: boolean;
  critical: boolean;
} {
  if (target === null) {
    return { success: true, critical: false };
  }

  let roll = rollD6();

  if (
    (rerollMode === "ones" && roll === 1) ||
    (rerollMode === "full" && !passesTarget(target, roll))
  ) {
    roll = rollD6();
  }

  const success = passesTarget(target, roll);
  return {
    success,
    critical: success && roll >= criticalThreshold,
  };
}

function hasTorrent(rules?: SpecialRule[]): boolean {
  return (rules ?? []).some((rule) => rule.type === "TORRENT");
}

function hasRule(rules: SpecialRule[] | undefined, type: SpecialRule["type"]): boolean {
  return (rules ?? []).some((rule) => rule.type === type);
}

function getRuleValue(
  rules: SpecialRule[] | undefined,
  type: "RAPID_FIRE" | "SUSTAINED_HITS" | "MELTA"
): number | null {
  const match = (rules ?? []).find((rule) => rule.type === type);

  if (!match) return null;
  if ("value" in match) return match.value;

  return null;
}

function getCriticalHitThreshold(rules: SpecialRule[] | undefined): number {
  const match = (rules ?? []).find((rule) => rule.type === "CRITICAL_HITS_ON");

  if (!match) return 6;
  if ("value" in match) return match.value;

  return 6;
}

function getAttacksModifier(
  rules: SpecialRule[] | undefined,
  weaponType: "melee" | "ranged"
): number {
  return (rules ?? []).reduce((sum, rule) => {
    if (rule.type !== "ATTACKS_MODIFIER") return sum;
    if (rule.attackType && rule.attackType !== weaponType) return sum;
    return sum + rule.value;
  }, 0);
}

function getCriticalWoundApModifier(
  rules: SpecialRule[] | undefined,
  weaponType: "melee" | "ranged"
): number {
  return (rules ?? []).reduce((sum, rule) => {
    if (rule.type !== "CRITICAL_WOUND_AP_MODIFIER") return sum;
    if (rule.attackType && rule.attackType !== weaponType) return sum;
    return sum + rule.value;
  }, 0);
}

function getFixedHitRoll(
  rules: SpecialRule[] | undefined,
  weaponType: "melee" | "ranged"
): number | null {
  const candidates = (rules ?? [])
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
  rules: SpecialRule[] | undefined,
  weaponType: "melee" | "ranged"
): number {
  return (rules ?? []).reduce((sum, rule) => {
    if (rule.type !== "HIT_MODIFIER") return sum;
    if (rule.attackType && rule.attackType !== weaponType) return sum;
    return sum + rule.value;
  }, 0);
}

function getApModifier(
  rules: SpecialRule[] | undefined,
  weaponType: "melee" | "ranged"
): number {
  return (rules ?? []).reduce((sum, rule) => {
    if (rule.type !== "AP_MODIFIER") return sum;
    if (rule.attackType && rule.attackType !== weaponType) return sum;
    return sum + rule.value;
  }, 0);
}

function getStrengthModifier(
  rules: SpecialRule[] | undefined,
  weaponType: "melee" | "ranged"
): number {
  return (rules ?? []).reduce((sum, rule) => {
    if (rule.type !== "STRENGTH_MODIFIER") return sum;
    if (rule.attackType && rule.attackType !== weaponType) return sum;
    return sum + rule.value;
  }, 0);
}

function getDamageModifier(
  rules: SpecialRule[] | undefined,
  weaponType: "melee" | "ranged"
): number {
  return (rules ?? []).reduce((sum, rule) => {
    if (rule.type !== "DAMAGE_MODIFIER") return sum;
    if (rule.attackType && rule.attackType !== weaponType) return sum;
    return sum + rule.value;
  }, 0);
}

function getDamageReduction(rules: SpecialRule[] | undefined): number {
  const candidates = (rules ?? [])
    .filter(
      (rule): rule is Extract<SpecialRule, { type: "DAMAGE_REDUCTION" }> =>
        rule.type === "DAMAGE_REDUCTION"
    )
    .map((rule) => rule.value);

  if (candidates.length === 0) return 0;

  return Math.max(...candidates);
}

function getTargetingRangeLimit(
  rules: SpecialRule[] | undefined,
  weaponType: "melee" | "ranged"
): number | null {
  const candidates = (rules ?? [])
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
  rules: SpecialRule[] | undefined,
  baseInvulnerableSave: number | null
): number | null {
  const candidates = (rules ?? [])
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
  rules: SpecialRule[] | undefined,
  baseSave: number
): number {
  const candidates = (rules ?? [])
    .filter(
      (rule): rule is Extract<SpecialRule, { type: "SET_SAVE_CHARACTERISTIC" }> =>
        rule.type === "SET_SAVE_CHARACTERISTIC"
    )
    .map((rule) => rule.value);

  if (candidates.length === 0) return baseSave;

  return Math.min(baseSave, ...candidates);
}

function getFeelNoPain(rules: SpecialRule[] | undefined): number | null {
  const candidates = (rules ?? [])
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

function applyFeelNoPain(damage: number, feelNoPain: number | null): number {
  if (damage <= 0 || feelNoPain === null) {
    return damage;
  }

  let preventedDamage = 0;

  for (let i = 0; i < damage; i++) {
    if (rollD6() >= feelNoPain) {
      preventedDamage += 1;
    }
  }

  return Math.max(0, damage - preventedDamage);
}

function passesSave(target: number | null): boolean {
  if (target === null) return false;
  if (target === 0) return false;
  if (target <= 1) return true;
  if (target > 6) return false;

  return rollD6() >= target;
}

function passesTarget(target: number | null, roll: number): boolean {
  if (target === null) return true;
  if (target <= 1) return true;
  if (target > 6) return false;

  return roll >= target;
}

function rollD6(): number {
  return Math.floor(Math.random() * 6) + 1;
}

function rollValue(value: number | string): number {
  if (typeof value === "number") return value;

  const normalized = value.trim().toUpperCase().replace(/\s+/g, "");
  const plainNumber = Number(normalized);

  if (!Number.isNaN(plainNumber)) {
    return plainNumber;
  }

  const match = normalized.match(/^(\d*)D(\d+)([+-]\d+)?$/);
  if (!match) {
    return 0;
  }

  const diceCount = Number(match[1] ?? 1);
  const sides = Number(match[2]);
  const modifier = Number(match[3] ?? 0);

  let total = modifier;
  for (let i = 0; i < diceCount; i++) {
    total += sides === 3 ? Math.ceil(rollD6() / 2) : rollDie(sides);
  }

  return total;
}

function rollDie(sides: number): number {
  if (sides <= 0) return 0;
  return Math.floor(Math.random() * sides) + 1;
}

function getWoundModifier(
  rules: SpecialRule[] | undefined,
  weaponType: "melee" | "ranged",
  defenderToughness: number
): number {
  return (rules ?? []).reduce((sum, rule) => {
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
