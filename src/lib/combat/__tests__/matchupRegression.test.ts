import { describe, expect, it } from "vitest";
import { units } from "../../../data/units";
import type { AttackConditions } from "../../../types/combat";
import { calculateExpectedDamage } from "../index";
import { runSimulationByMode } from "../simulation/runSimulationByMode";

const baseConditions: AttackConditions = {
  battleRound: 1,
  isTargetInCover: false,
  isHalfRange: false,
  remainedStationary: true,
  advancedThisTurn: false,
  targetVisible: true,
  targetDistanceInches: 24,
  targetInEngagementRange: false,
  targetModelCount: 1,
  targetHasMatchingAntiKeyword: false,
  isChargeTurn: false,
  isAttachedUnit: false,
  attackWithinObjectiveRange: false,
  attackerDisembarkedThisTurn: false,
  attackerIsFiringOverwatch: false,
  attackerIsGuided: false,
  attackerIsVesselOfWrath: false,
  attackerWithinFriendlyCharacterRange: false,
  attackerWithinFriendlyMonsterAura: false,
  attackerWithinPowerMatrix: false,
  attackerSetUpThisTurn: false,
  attackerSetToDefend: false,
  targetIsClosestEligible: false,
  targetIsSpotted: false,
  targetOppositeHatchway: false,
  targetIsUnravelling: false,
  targetWithinObjectiveRange: false,
  targetIsBattleShocked: false,
  targetBelowStartingStrength: false,
  targetBelowHalfStrength: false,
  attackerBelowStartingStrength: false,
  attackerBelowHalfStrength: false,
  attackerIsIsolated: false,
};

describe("matchup regressions", () => {
  it("keeps simulation stable for Broadside rail rifle into Skorpekh Lord", () => {
    const broadside = units.find((unit) => unit.name === "Broadside Battlesuits");
    const skorpekhLord = units.find((unit) => unit.name === "Skorpekh Lord");

    expect(broadside).toBeDefined();
    expect(skorpekhLord).toBeDefined();

    const railRifle = broadside?.weapons.find(
      (weapon) => weapon.name === "Heavy rail rifle"
    );

    expect(railRifle).toBeDefined();

    const expectedResult = calculateExpectedDamage({
      attacker: broadside!,
      weapon: railRifle!,
      defender: skorpekhLord!,
      attackingModels: 1,
      defendingModels: 1,
      conditions: baseConditions,
      activeModifierRules: [],
      activeDefenderModifierRules: [],
    });

    expect(expectedResult.expectedDamage).toBeGreaterThan(0);
    expect(Number.isFinite(expectedResult.expectedDamage)).toBe(true);
    expect(Number.isFinite(expectedResult.expectedSlainModels)).toBe(true);

    const fastSummary = runSimulationByMode({
      mode: "fast",
      expectedResult,
      selectedWeapon: railRifle!,
      targetWounds: skorpekhLord!.woundsPerModel,
      defendingModels: 1,
      runs: 1000,
      accurateParams: {
        attacker: broadside!,
        weapon: railRifle!,
        defender: skorpekhLord!,
        attackingModels: 1,
        defendingModels: 1,
        conditions: baseConditions,
        activeModifierRules: [],
        activeDefenderModifierRules: [],
      },
    });

    const accurateSummary = runSimulationByMode({
      mode: "accurate",
      expectedResult,
      selectedWeapon: railRifle!,
      targetWounds: skorpekhLord!.woundsPerModel,
      defendingModels: 1,
      runs: 1000,
      accurateParams: {
        attacker: broadside!,
        weapon: railRifle!,
        defender: skorpekhLord!,
        attackingModels: 1,
        defendingModels: 1,
        conditions: baseConditions,
        activeModifierRules: [],
        activeDefenderModifierRules: [],
      },
    });

    expectFiniteSummary(fastSummary);
    expectFiniteSummary(accurateSummary);
  });
});

function expectFiniteSummary(
  summary: ReturnType<typeof runSimulationByMode>
) {
  expect(summary.runs).toBe(1000);

  for (const value of Object.values(summary)) {
    if (typeof value === "number") {
      expect(Number.isFinite(value)).toBe(true);
    }
  }
}
