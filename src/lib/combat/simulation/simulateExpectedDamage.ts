import type { Weapon } from "../../../types/combat";
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

  return analyzeSimulation(results, targetWounds);
}

function simulateSingleRun(
  expectedResult: ExpectedDamageResult,
  weapon: Weapon
): number {
  let totalDamage = 0;

  for (let i = 0; i < expectedResult.totalAttacks; i++) {
    if (!passesRoll(expectedResult.hitTarget)) continue;
    if (!passesRoll(expectedResult.woundTarget)) continue;
    if (passesRoll(expectedResult.saveTarget)) continue;

    totalDamage += rollValue(weapon.damage);
  }

  return totalDamage;
}

function passesRoll(target: number | null): boolean {
  if (target === null) return true;

  // 0+ w tym flow oznacza, że realnie nie ma już save'a do rzucenia
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
