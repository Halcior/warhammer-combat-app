import type { Weapon } from "../../../types/combat";
import type { ExpectedDamageResult } from "../types";
import {
  analyzeSimulation,
  type SimulationRunResult,
  type SimulationSummary,
} from "./analyzeSimulation";

export type SimulateExpectedDamageParams = {
  expectedResult: ExpectedDamageResult;
  weapon: Weapon;
  targetWounds: number;
  defendingModels?: number;
  runs: number;
};

export function simulateExpectedDamage(
  params: SimulateExpectedDamageParams
): SimulationSummary {
  const {
    expectedResult,
    weapon,
    targetWounds,
    defendingModels = 1,
    runs,
  } = params;

  const results: SimulationRunResult[] = [];

  for (let i = 0; i < runs; i++) {
    const damage = simulateSingleRun(expectedResult, weapon);
    const slainModels = Math.min(
      defendingModels,
      Math.floor(damage / targetWounds)
    );

    results.push({
      damage,
      slainModels,
      hits: 0,
      wounds: 0,
      failedSaves: 0,
      mortals: 0
    });
  }

  return analyzeSimulation(results, defendingModels);
}

function simulateSingleRun(
  expectedResult: ExpectedDamageResult,
  weapon: Weapon
): number {
  let totalDamage = 0;

  for (let i = 0; i < expectedResult.totalAttacks; i++) {
    if (!passesRoll(expectedResult.hitTarget)) continue;
    if (!passesRoll(expectedResult.woundTarget)) continue;

    // null = no save available, 0 = effectively no save left
    if (
      expectedResult.saveTarget !== null &&
      expectedResult.saveTarget !== 0 &&
      passesRoll(expectedResult.saveTarget)
    ) {
      continue;
    }

    totalDamage += rollValue(weapon.damage);
  }

  return totalDamage;
}

function passesRoll(target: number | null): boolean {
  if (target === null) return true;
  if (target === 0) return false;
  if (target <= 1) return true;
  if (target > 6) return false;

  return rollD6() >= target;
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
