import { describe, expect, it, vi, beforeEach } from "vitest";
import type { AttackConditions, Unit, Weapon } from "../../../types/combat";
import type { ExpectedDamageResult } from "../types";
import type { SimulationSummary } from "../simulation/analyzeSimulation";
import { runSimulationByMode } from "../simulation/runSimulationByMode";
import { simulateAttackContext } from "../simulation/simulateAttackContext";
import { simulateExpectedDamage } from "../simulation/simulateExpectedDamage";

vi.mock("../simulation/simulateExpectedDamage", () => ({
  simulateExpectedDamage: vi.fn(),
}));

vi.mock("../simulation/simulateAttackContext", () => ({
  simulateAttackContext: vi.fn(),
}));

const baseConditions: AttackConditions = {
  battleRound: 1,
  isTargetInCover: false,
  isHalfRange: false,
  remainedStationary: false,
  advancedThisTurn: false,
  targetVisible: true,
  targetDistanceInches: 24,
  targetInEngagementRange: false,
  targetModelCount: 10,
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

const attacker: Unit = {
  id: "attacker",
  name: "Attacker",
  faction: "Test",
  toughness: 4,
  save: 3,
  woundsPerModel: 2,
  weapons: [],
};

const defender: Unit = {
  id: "defender",
  name: "Defender",
  faction: "Test",
  toughness: 5,
  save: 2,
  woundsPerModel: 3,
  weapons: [],
};

const selectedWeapon: Weapon = {
  id: "weapon-1",
  name: "Weapon",
  attacks: 2,
  skill: 3,
  strength: 6,
  ap: -1,
  damage: 2,
  type: "ranged",
  specialRules: [],
};

const expectedResult: ExpectedDamageResult = {
  attacksPerModel: 2,
  blastBonus: 0,
  totalAttacks: 10,
  hitTarget: 3,
  expectedHits: 6,
  criticalHits: 1,
  extraHitsFromSustained: 0,
  woundTarget: 3,
  expectedWounds: 4,
  criticalWoundsFromRolls: 1,
  autoWoundsFromLethalHits: 0,
  saveTarget: 4,
  expectedUnsavedWounds: 2,
  expectedDamage: 4,
  expectedSlainModels: 1.33,
  damagePerFailedSave: 2,
  mortalWoundsFromDevastating: 0,
  effectiveAp: -1,
};

const summary: SimulationSummary = {
  runs: 5000,
  meanDamage: 4,
  medianDamage: 4,
  minDamage: 0,
  maxDamage: 12,
  p10Damage: 1,
  p90Damage: 8,
  meanSlainModels: 1,
  medianSlainModels: 1,
  minSlainModels: 0,
  maxSlainModels: 3,
  killOneChance: 0.7,
  wipeChance: 0.1,
};

describe("runSimulationByMode", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(simulateExpectedDamage).mockReturnValue(summary);
    vi.mocked(simulateAttackContext).mockReturnValue(summary);
  });

  it("uses fast simulation path for fast mode", () => {
    runSimulationByMode({
      mode: "fast",
      expectedResult,
      selectedWeapon,
      targetWounds: defender.woundsPerModel,
      defendingModels: 5,
      runs: 5000,
      accurateParams: {
        attacker,
        weapon: selectedWeapon,
        defender,
        attackingModels: 5,
        defendingModels: 5,
        conditions: baseConditions,
        activeModifierRules: [],
      },
    });

    expect(simulateExpectedDamage).toHaveBeenCalledWith({
      expectedResult,
      weapon: selectedWeapon,
      targetWounds: defender.woundsPerModel,
      defendingModels: 5,
      runs: 5000,
    });
    expect(simulateAttackContext).not.toHaveBeenCalled();
  });

  it("uses accurate simulation path for accurate mode", () => {
    runSimulationByMode({
      mode: "accurate",
      expectedResult,
      selectedWeapon,
      targetWounds: defender.woundsPerModel,
      defendingModels: 5,
      runs: 5000,
      accurateParams: {
        attacker,
        weapon: selectedWeapon,
        defender,
        attackingModels: 5,
        defendingModels: 5,
        conditions: baseConditions,
        activeModifierRules: [],
      },
    });

    expect(simulateAttackContext).toHaveBeenCalledWith({
      attacker,
      weapon: selectedWeapon,
      defender,
      attackingModels: 5,
      defendingModels: 5,
      conditions: baseConditions,
      activeModifierRules: [],
      runs: 5000,
    });
    expect(simulateExpectedDamage).not.toHaveBeenCalled();
  });
});
