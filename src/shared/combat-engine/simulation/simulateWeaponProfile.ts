import { analyzeSimulation } from "./analyzeSimulation";
import { rollD6 } from "./roll";

export type SimulateWeaponProfileInput = {
  attacks: number | string;
  hitTarget: number | null;
  woundTarget: number;
  saveTarget: number;
  damage: number | string;
  runs: number;
  woundsToKillTarget?: number;
};

export function simulateWeaponProfile(input: SimulateWeaponProfileInput) {
  const results: number[] = [];

  for (let i = 0; i < input.runs; i++) {
    results.push(simulateSingleRun(input));
  }

  return analyzeSimulation(results, input.woundsToKillTarget);
}

function simulateSingleRun(input: SimulateWeaponProfileInput): number {
  let totalDamage = 0;
  const attackCount = Math.max(0, rollValue(input.attacks));

  for (let i = 0; i < attackCount; i++) {
    if (!passesHitRoll(input.hitTarget)) continue;
    if (!passesTargetRoll(input.woundTarget)) continue;
    if (passesSaveRoll(input.saveTarget)) continue;

    totalDamage += Math.max(0, rollValue(input.damage));
  }

  return totalDamage;
}

function passesHitRoll(hitTarget: number | null): boolean {
  if (hitTarget === null) return true;
  return rollD6() >= hitTarget;
}

function passesTargetRoll(target: number): boolean {
  if (target <= 1) return true;
  if (target > 6) return false;
  return rollD6() >= target;
}

function passesSaveRoll(saveTarget: number): boolean {
  if (saveTarget <= 1) return true;
  if (saveTarget > 6) return false;
  return rollD6() >= saveTarget;
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
