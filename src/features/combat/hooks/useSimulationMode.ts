import { useMemo, useState } from "react";
import { simulateWeaponProfile } from "../../../shared/combat-engine/simulation/simulateWeaponProfile";
import type { ExpectedDamageResult } from "../../../lib/combat";
import type { Weapon, Unit } from "../../../types/combat";

export type CalculationMode = "fast" | "accurate";

export function useSimulationMode(params: {
  expectedResult: ExpectedDamageResult;
  weapon: Weapon;
  defender: Unit;
}) {
  const { expectedResult, weapon, defender } = params;

  const [mode, setMode] = useState<CalculationMode>("fast");
  const [runs, setRuns] = useState(5000);
  const [simulationSummary, setSimulationSummary] = useState<ReturnType<
    typeof simulateWeaponProfile
  > | null>(null);

  const simulationInput = useMemo(() => {
    return {
      attacks: expectedResult.attacksPerModel,
      hitTarget: expectedResult.hitTarget,
      woundTarget: expectedResult.woundTarget,
      saveTarget: expectedResult.saveTarget,
      damage: weapon.damage,
      runs,
      woundsToKillTarget: defender.woundsPerModel,
    };
  }, [
    expectedResult.attacksPerModel,
    expectedResult.hitTarget,
    expectedResult.woundTarget,
    expectedResult.saveTarget,
    weapon.damage,
    runs,
    defender.woundsPerModel,
  ]);

  const runSimulation = () => {
    const summary = simulateWeaponProfile(simulationInput);
    setSimulationSummary(summary);
  };

  return {
    mode,
    setMode,
    runs,
    setRuns,
    simulationSummary,
    runSimulation,
  };
}
