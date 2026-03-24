import type { SpecialRule, Weapon } from "../../../types/combat";
import type { ExpectedDamageResult } from "../types";
import { analyzeSimulation, type SimulationSummary } from "./analyzeSimulation";

export type SimulateExpectedDamageParams = {
  expectedResult: ExpectedDamageResult;
  weapon: Weapon;
  targetWounds: number;
  runs: number;
};

export function simulateExpectedDamage(
  params: SimulateExpectedDamageParams
): SimulationSummary {
  const { expectedResult, weapon, targetWounds, runs } = params;
  const results: number[] = [];

  for (let i = 0; i < runs; i++) {
    results.push(simulateSingleRun(expectedResult, weapon));
  }
  console.log("SIM EXPECTED", expectedResult);
  console.log("SIM RESULTS", results);
  return analyzeSimulation(results, targetWounds);
}

function simulateSingleRun(
  expectedResult: ExpectedDamageResult,
  weapon: Weapon
): number {
  let totalDamage = 0;

  const hasDevastatingWounds = hasRule(weapon.specialRules, "DEVASTATING_WOUNDS");
  const hasLethalHits = hasRule(weapon.specialRules, "LETHAL_HITS");

  for (let i = 0; i < expectedResult.totalAttacks; i++) {
    const hitRoll = rollD6();

    if (!passesRollValue(expectedResult.hitTarget, hitRoll)) {
      continue;
    }

    const isCriticalHit = hitRoll === 6;

    // Lethal Hits: critical hit auto-wounds
    if (hasLethalHits && isCriticalHit) {
      if (expectedResult.saveTarget !== null && passesTarget(expectedResult.saveTarget)) {
        continue;
      }

      totalDamage += rollValue(weapon.damage);
      continue;
    }

    const woundRoll = rollD6();

    if (!passesRollValue(expectedResult.woundTarget, woundRoll)) {
      continue;
    }

    const isCriticalWound = woundRoll === 6;

    // Devastating Wounds: critical wound bypasses save and becomes mortal damage
    if (hasDevastatingWounds && isCriticalWound) {
      totalDamage += rollValue(weapon.damage);
      continue;
    }

    // null / 0 means no save roll left -> auto fail save
    if (expectedResult.saveTarget !== null && passesTarget(expectedResult.saveTarget)) {
      continue;
    }

    totalDamage += rollValue(weapon.damage);
  }

  return totalDamage;
}

function hasRule(
  rules: SpecialRule[] | undefined,
  type: SpecialRule["type"]
): boolean {
  return (rules ?? []).some((rule) => rule.type === type);
}

function passesTarget(target: number): boolean {
  if (target === 0) return false;
  if (target <= 1) return true;
  if (target > 6) return false;

  return rollD6() >= target;
}

function passesRollValue(target: number | null, roll: number): boolean {
  if (target === null) return true;
  if (target === 0) return false;
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

  // obsługa np. D6, 2D6, D3+3, 2D6+1 itd.
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