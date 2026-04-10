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
    expect(fastSummary.meanDamage).toBeGreaterThan(0);
    expect(fastSummary.maxDamage).toBeGreaterThan(0);
    expect(accurateSummary.meanDamage).toBeGreaterThan(0);
    expect(accurateSummary.maxDamage).toBeGreaterThan(0);
  });

  it("keeps World Eaters melee stacks stable for Exalted Eightbound into Carnifexes", () => {
    const exaltedEightbound = units.find(
      (unit) => unit.name === "Exalted Eightbound"
    );
    const carnifexes = units.find((unit) => unit.name === "Carnifexes");

    expect(exaltedEightbound).toBeDefined();
    expect(carnifexes).toBeDefined();

    const chainblades = exaltedEightbound?.weapons.find(
      (weapon) => weapon.name === "Chainblades"
    );

    expect(chainblades).toBeDefined();

    const baselineExpected = calculateExpectedDamage({
      attacker: exaltedEightbound!,
      weapon: chainblades!,
      defender: carnifexes!,
      attackingModels: 1,
      defendingModels: 1,
      conditions: {
        ...baseConditions,
        isChargeTurn: true,
      },
      activeModifierRules: [],
      activeDefenderModifierRules: [],
    });

    const buffedRules = [
      {
        type: "DAMAGE_MODIFIER" as const,
        value: 1,
        attackType: "melee" as const,
        requiredAttackerKeywords: ["EXALTED EIGHTBOUND"],
        requiredDefenderKeywords: ["MONSTER", "VEHICLE"],
      },
      {
        type: "REROLL_WOUNDS" as const,
        attackType: "melee" as const,
        requiredDefenderKeywords: ["MONSTER", "VEHICLE"],
      },
    ];

    const buffedExpected = calculateExpectedDamage({
      attacker: exaltedEightbound!,
      weapon: chainblades!,
      defender: carnifexes!,
      attackingModels: 1,
      defendingModels: 1,
      conditions: {
        ...baseConditions,
        isChargeTurn: true,
      },
      activeModifierRules: buffedRules,
      activeDefenderModifierRules: [],
    });

    expect(buffedExpected.expectedDamage).toBeGreaterThan(
      baselineExpected.expectedDamage
    );
    expect(Number.isFinite(buffedExpected.expectedDamage)).toBe(true);
    expect(Number.isFinite(buffedExpected.expectedSlainModels)).toBe(true);

    const fastSummary = runSimulationByMode({
      mode: "fast",
      expectedResult: buffedExpected,
      selectedWeapon: chainblades!,
      targetWounds: carnifexes!.woundsPerModel,
      defendingModels: 1,
      runs: 1000,
      accurateParams: {
        attacker: exaltedEightbound!,
        weapon: chainblades!,
        defender: carnifexes!,
        attackingModels: 1,
        defendingModels: 1,
        conditions: {
          ...baseConditions,
          isChargeTurn: true,
        },
        activeModifierRules: buffedRules,
        activeDefenderModifierRules: [],
      },
    });

    const accurateSummary = runSimulationByMode({
      mode: "accurate",
      expectedResult: buffedExpected,
      selectedWeapon: chainblades!,
      targetWounds: carnifexes!.woundsPerModel,
      defendingModels: 1,
      runs: 1000,
      accurateParams: {
        attacker: exaltedEightbound!,
        weapon: chainblades!,
        defender: carnifexes!,
        attackingModels: 1,
        defendingModels: 1,
        conditions: {
          ...baseConditions,
          isChargeTurn: true,
        },
        activeModifierRules: buffedRules,
        activeDefenderModifierRules: [],
      },
    });

    expectFiniteSummary(fastSummary);
    expectFiniteSummary(accurateSummary);
    expect(fastSummary.meanDamage).toBeGreaterThan(0);
    expect(accurateSummary.meanDamage).toBeGreaterThan(0);
  });

  it("keeps Tau Battlesuit defensive stacks stable for Broadside into Carnifexes", () => {
    const broadside = units.find((unit) => unit.name === "Broadside Battlesuits");
    const carnifexes = units.find((unit) => unit.name === "Carnifexes");

    expect(broadside).toBeDefined();
    expect(carnifexes).toBeDefined();

    const railRifle = broadside?.weapons.find(
      (weapon) => weapon.name === "Heavy rail rifle"
    );

    expect(railRifle).toBeDefined();

    const baselineExpected = calculateExpectedDamage({
      attacker: broadside!,
      weapon: railRifle!,
      defender: carnifexes!,
      attackingModels: 1,
      defendingModels: 1,
      conditions: baseConditions,
      activeModifierRules: [],
      activeDefenderModifierRules: [],
    });

    const defensiveRules = [
      {
        type: "WOUND_MODIFIER" as const,
        value: -1,
        requiresAttackStrengthGreaterThanTargetToughness: true,
      },
      {
        type: "FEEL_NO_PAIN" as const,
        value: 6,
      },
    ];

    const defendedExpected = calculateExpectedDamage({
      attacker: broadside!,
      weapon: railRifle!,
      defender: carnifexes!,
      attackingModels: 1,
      defendingModels: 1,
      conditions: baseConditions,
      activeModifierRules: [],
      activeDefenderModifierRules: defensiveRules,
    });

    expect(defendedExpected.expectedDamage).toBeLessThan(
      baselineExpected.expectedDamage
    );
    expect(Number.isFinite(defendedExpected.expectedDamage)).toBe(true);

    const fastSummary = runSimulationByMode({
      mode: "fast",
      expectedResult: defendedExpected,
      selectedWeapon: railRifle!,
      targetWounds: carnifexes!.woundsPerModel,
      defendingModels: 1,
      runs: 1000,
      accurateParams: {
        attacker: broadside!,
        weapon: railRifle!,
        defender: carnifexes!,
        attackingModels: 1,
        defendingModels: 1,
        conditions: baseConditions,
        activeModifierRules: [],
        activeDefenderModifierRules: defensiveRules,
      },
    });

    const accurateSummary = runSimulationByMode({
      mode: "accurate",
      expectedResult: defendedExpected,
      selectedWeapon: railRifle!,
      targetWounds: carnifexes!.woundsPerModel,
      defendingModels: 1,
      runs: 1000,
      accurateParams: {
        attacker: broadside!,
        weapon: railRifle!,
        defender: carnifexes!,
        attackingModels: 1,
        defendingModels: 1,
        conditions: baseConditions,
        activeModifierRules: [],
        activeDefenderModifierRules: defensiveRules,
      },
    });

    expectFiniteSummary(fastSummary);
    expectFiniteSummary(accurateSummary);
    expect(fastSummary.meanDamage).toBeGreaterThanOrEqual(0);
    expect(accurateSummary.meanDamage).toBeGreaterThanOrEqual(0);
  });

  it("keeps Tau targeting-range defence stable for Broadside into Carnifexes", () => {
    const broadside = units.find((unit) => unit.name === "Broadside Battlesuits");
    const carnifexes = units.find((unit) => unit.name === "Carnifexes");

    expect(broadside).toBeDefined();
    expect(carnifexes).toBeDefined();

    const railRifle = broadside?.weapons.find(
      (weapon) => weapon.name === "Heavy rail rifle"
    );

    expect(railRifle).toBeDefined();

    const blockedExpected = calculateExpectedDamage({
      attacker: broadside!,
      weapon: railRifle!,
      defender: carnifexes!,
      attackingModels: 1,
      defendingModels: 1,
      conditions: {
        ...baseConditions,
        targetDistanceInches: 24,
      },
      activeModifierRules: [],
      activeDefenderModifierRules: [
        {
          type: "TARGETING_RANGE_LIMIT",
          value: 18,
          attackType: "ranged",
        },
      ],
    });

    expect(blockedExpected.expectedDamage).toBe(0);

    const fastSummary = runSimulationByMode({
      mode: "fast",
      expectedResult: blockedExpected,
      selectedWeapon: railRifle!,
      targetWounds: carnifexes!.woundsPerModel,
      defendingModels: 1,
      runs: 1000,
      accurateParams: {
        attacker: broadside!,
        weapon: railRifle!,
        defender: carnifexes!,
        attackingModels: 1,
        defendingModels: 1,
        conditions: {
          ...baseConditions,
          targetDistanceInches: 24,
        },
        activeModifierRules: [],
        activeDefenderModifierRules: [
          {
            type: "TARGETING_RANGE_LIMIT",
            value: 18,
            attackType: "ranged",
          },
        ],
      },
    });

    const accurateSummary = runSimulationByMode({
      mode: "accurate",
      expectedResult: blockedExpected,
      selectedWeapon: railRifle!,
      targetWounds: carnifexes!.woundsPerModel,
      defendingModels: 1,
      runs: 1000,
      accurateParams: {
        attacker: broadside!,
        weapon: railRifle!,
        defender: carnifexes!,
        attackingModels: 1,
        defendingModels: 1,
        conditions: {
          ...baseConditions,
          targetDistanceInches: 24,
        },
        activeModifierRules: [],
        activeDefenderModifierRules: [
          {
            type: "TARGETING_RANGE_LIMIT",
            value: 18,
            attackType: "ranged",
          },
        ],
      },
    });

    expectFiniteSummary(fastSummary);
    expectFiniteSummary(accurateSummary);
    expect(fastSummary.meanDamage).toBe(0);
    expect(accurateSummary.meanDamage).toBe(0);
    expect(fastSummary.maxDamage).toBe(0);
    expect(accurateSummary.maxDamage).toBe(0);
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
