import type { AttackConditions, SpecialRule, Unit, Weapon } from "../../../types/combat";
import type { CalculateExpectedDamageParams } from "../types";
import { getModifiedSave, applyCoverToSave } from "../save";
import { getWoundTarget } from "../wound";
import {
  analyzeSimulation,
  type SimulationRunResult,
  type SimulationSummary,
} from "./analyzeSimulation";

export type SimulateAttackContextParams = Pick<
  CalculateExpectedDamageParams,
  | "attacker"
  | "weapon"
  | "defender"
  | "attackingModels"
  | "defendingModels"
  | "conditions"
  | "activeModifierRules"
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
  ];

  const attackCount = getTotalAttacks(
    params.weapon,
    params.attackingModels,
    params.defendingModels,
    params.conditions,
    combinedRules
  );

  const hitTarget = getHitTarget(params.weapon, params.conditions);
  const woundTarget = getWoundTarget(params.weapon.strength, params.defender.toughness);
  const saveTarget = getSaveTarget(
    params.weapon,
    params.defender,
    params.conditions,
    combinedRules
  );

  const hasDevastating = hasRule(combinedRules, "DEVASTATING_WOUNDS");
  const hasLethal = hasRule(combinedRules, "LETHAL_HITS");
  const sustainedHits = getRuleValue(combinedRules, "SUSTAINED_HITS") ?? 0;
  const criticalHitThreshold = getCriticalHitThreshold(combinedRules);

  let totalHits = 0;
  let totalWounds = 0;
  let totalFailedSaves = 0;
  let totalMortals = 0;
  let totalDamage = 0;
  let pendingHitRolls = attackCount;

  while (pendingHitRolls > 0) {
    pendingHitRolls -= 1;

    const hitRoll = rollD6();
    if (!passesTarget(hitTarget, hitRoll)) {
      continue;
    }

    totalHits++;

    const criticalHit = hitRoll >= criticalHitThreshold;

    if (criticalHit && sustainedHits > 0) {
      pendingHitRolls += sustainedHits;
    }

    if (criticalHit && hasLethal) {
      totalWounds++;

      if (!passesSave(saveTarget)) {
        totalFailedSaves++;
        totalDamage += rollDamage(params.weapon, combinedRules, params.conditions);
      }

      continue;
    }

    const woundRoll = rollD6();
    if (!passesTarget(woundTarget, woundRoll)) {
      continue;
    }

    totalWounds++;

    const criticalWound = woundRoll === 6;

    if (criticalWound && hasDevastating) {
      totalMortals++;
      totalDamage += rollDamage(params.weapon, combinedRules, params.conditions);
      continue;
    }

    if (!passesSave(saveTarget)) {
      totalFailedSaves++;
      totalDamage += rollDamage(params.weapon, combinedRules, params.conditions);
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
  let attacks = 0;

  for (let i = 0; i < attackingModels; i++) {
    attacks += rollValue(weapon.attacks);
  }

  if (hasRule(rules, "RAPID_FIRE") && conditions.isHalfRange) {
    attacks += attackingModels * (getRuleValue(rules, "RAPID_FIRE") ?? 0);
  }

  if (hasRule(rules, "BLAST") && defendingModels >= 5) {
    attacks += Math.floor(defendingModels / 5);
  }

  return Math.max(0, attacks);
}

function getHitTarget(weapon: Weapon, conditions: AttackConditions): number | null {
  if (hasTorrent(weapon.specialRules)) {
    return null;
  }

  let target = weapon.skill;

  if (hasRule(weapon.specialRules ?? [], "HEAVY") && conditions.remainedStationary) {
    target = Math.max(2, target - 1);
  }

  return target;
}

function getSaveTarget(
  weapon: Weapon,
  defender: Unit,
  conditions: AttackConditions,
  rules: SpecialRule[]
): number | null {
  const ignoresCover = hasRule(rules, "IGNORES_COVER");
  const invul = defender.invulnerableSave ?? null;
  const effectiveAp = weapon.ap - getApModifier(rules, weapon.type);
  const modified = getModifiedSave(defender.save, effectiveAp, invul);
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
  const melta =
    hasRule(rules, "MELTA") && conditions.isHalfRange
      ? (getRuleValue(rules, "MELTA") ?? 0)
      : 0;

  return Math.max(0, baseDamage + melta);
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

  const match = normalized.match(/^(?:(\d+)D)?(3|6)([+-]\d+)?$/);
  if (!match) {
    return 0;
  }

  const diceCount = Number(match[1] ?? 1);
  const sides = Number(match[2]);
  const modifier = Number(match[3] ?? 0);

  let total = modifier;
  for (let i = 0; i < diceCount; i++) {
    total += sides === 3 ? Math.ceil(rollD6() / 2) : rollD6();
  }

  return total;
}