import { rollD6 } from "./roll";

export type SimulationInput = {
  attacks: number;
  hitTarget: number;
  woundTarget: number;
  saveTarget: number;
  damage: number;
};

export type SimulationResult = {
  totalDamage: number;
};

export function simulateSingleAttack(input: SimulationInput): SimulationResult {
  let totalDamage = 0;

  for (let i = 0; i < input.attacks; i++) {
    const hit = rollD6();
    if (hit < input.hitTarget) continue;

    const wound = rollD6();
    if (wound < input.woundTarget) continue;

    const save = rollD6();
    if (save >= input.saveTarget) continue;

    totalDamage += input.damage;
  }

  return { totalDamage };
}

export function simulateMany(input: SimulationInput, runs: number): number[] {
  const results: number[] = [];
  for (let i = 0; i < runs; i++) {
    results.push(simulateSingleAttack(input).totalDamage);
  }
  return results;
}
