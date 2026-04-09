import type { Weapon } from "../../../types/combat";
import type { ExpectedDamageResult } from "../types";
import type { SimulationSummary } from "./analyzeSimulation";
import {
  simulateAttackContext,
  type SimulateAttackContextParams,
} from "./simulateAttackContext";
import { simulateExpectedDamage } from "./simulateExpectedDamage";

export type CalculationMode = "fast" | "accurate";

export type RunSimulationByModeParams = {
  mode: CalculationMode;
  expectedResult: ExpectedDamageResult;
  selectedWeapon: Weapon;
  targetWounds: number;
  defendingModels: number;
  runs: number;
  accurateParams: Omit<SimulateAttackContextParams, "runs">;
};

export function runSimulationByMode(
  params: RunSimulationByModeParams
): SimulationSummary {
  const {
    mode,
    expectedResult,
    selectedWeapon,
    targetWounds,
    defendingModels,
    runs,
    accurateParams,
  } = params;

  if (mode === "fast") {
    return simulateExpectedDamage({
      expectedResult,
      weapon: selectedWeapon,
      targetWounds,
      defendingModels,
      runs,
    });
  }

  return simulateAttackContext({
    ...accurateParams,
    runs,
  });
}
