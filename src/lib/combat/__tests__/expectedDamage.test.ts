import { describe, expect, it } from "vitest";
import { calculateExpectedDamage } from "../expectedDamage";
import type { AttackConditions, Unit, Weapon } from "../../../types/combat";

const baseConditions: AttackConditions = {
  isTargetInCover: false,
  isHalfRange: false,
  remainedStationary: false,
  advancedThisTurn: false,
  targetVisible: true,
  targetInEngagementRange: false,
  targetModelCount: 10,
  targetHasMatchingAntiKeyword: false,
  isChargeTurn: false,
  isAttachedUnit: false,
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
  toughness: 4,
  save: 3,
  woundsPerModel: 2,
  weapons: [],
};

describe("calculateExpectedDamage", () => {
  it("calculates a simple baseline attack", () => {
    const weapon: Weapon = {
      id: "test-gun",
      name: "Test Gun",
      attacks: 2,
      skill: 3,
      strength: 4,
      ap: -1,
      damage: 1,
      type: "ranged",
      specialRules: [],
    };

    const result = calculateExpectedDamage({
      attacker,
      weapon,
      defender,
      attackingModels: 1,
      defendingModels: 10,
      conditions: baseConditions,
      activeModifierRules: [],
    });

    expect(result.totalAttacks).toBe(2);
    expect(result.hitTarget).toBe(3);
    expect(result.woundTarget).toBe(4);
    expect(result.saveTarget).toBe(4);

    expect(result.expectedHits).toBeCloseTo(1.3333, 3);
    expect(result.expectedWounds).toBeCloseTo(0.6667, 3);
    expect(result.expectedUnsavedWounds).toBeCloseTo(0.3333, 3);
    expect(result.expectedDamage).toBeCloseTo(0.3333, 3);
  });

  it("adds rapid fire bonus at half range", () => {
    const weapon: Weapon = {
      id: "rapid-fire-gun",
      name: "Rapid Fire Gun",
      attacks: 2,
      skill: 3,
      strength: 4,
      ap: 0,
      damage: 1,
      type: "ranged",
      specialRules: [{ type: "RAPID_FIRE", value: 1 }],
    };

    const result = calculateExpectedDamage({
      attacker,
      weapon,
      defender,
      attackingModels: 1,
      defendingModels: 10,
      conditions: {
        ...baseConditions,
        isHalfRange: true,
      },
      activeModifierRules: [],
    });

    expect(result.attacksPerModel).toBe(3);
    expect(result.totalAttacks).toBe(3);
  });

  it("adds blast bonus against larger units", () => {
    const weapon: Weapon = {
      id: "blast-gun",
      name: "Blast Gun",
      attacks: 2,
      skill: 3,
      strength: 4,
      ap: 0,
      damage: 1,
      type: "ranged",
      specialRules: [{ type: "BLAST" }],
    };

    const result = calculateExpectedDamage({
      attacker,
      weapon,
      defender,
      attackingModels: 1,
      defendingModels: 10,
      conditions: {
        ...baseConditions,
        targetModelCount: 10,
      },
      activeModifierRules: [],
    });

    expect(result.blastBonus).toBe(2);
    expect(result.attacksPerModel).toBe(4);
    expect(result.totalAttacks).toBe(4);
  });

  it("applies sustained hits on critical hits", () => {
    const weapon: Weapon = {
      id: "sustained-gun",
      name: "Sustained Gun",
      attacks: 6,
      skill: 3,
      strength: 4,
      ap: 0,
      damage: 1,
      type: "ranged",
      specialRules: [{ type: "SUSTAINED_HITS", value: 1 }],
    };

    const result = calculateExpectedDamage({
      attacker,
      weapon,
      defender,
      attackingModels: 1,
      defendingModels: 10,
      conditions: baseConditions,
      activeModifierRules: [],
    });

    expect(result.criticalHits).toBeCloseTo(1, 3);
    expect(result.extraHitsFromSustained).toBeCloseTo(1, 3);
    expect(result.expectedHits).toBeGreaterThan(4);
  });

  it("converts critical wounds into mortal wounds for devastating wounds", () => {
    const weapon: Weapon = {
      id: "dev-wounds-gun",
      name: "Dev Wounds Gun",
      attacks: 6,
      skill: 3,
      strength: 4,
      ap: 0,
      damage: 2,
      type: "ranged",
      specialRules: [{ type: "DEVASTATING_WOUNDS" }],
    };

    const result = calculateExpectedDamage({
      attacker,
      weapon,
      defender,
      attackingModels: 1,
      defendingModels: 10,
      conditions: baseConditions,
      activeModifierRules: [],
    });

    expect(result.criticalWoundsFromRolls).toBeGreaterThan(0);
    expect(result.mortalWoundsFromDevastating).toBeGreaterThan(0);
  });

  it("applies cover to ranged saves", () => {
    const weapon: Weapon = {
      id: "cover-gun",
      name: "Cover Gun",
      attacks: 2,
      skill: 3,
      strength: 4,
      ap: -1,
      damage: 1,
      type: "ranged",
      specialRules: [],
    };

    const noCover = calculateExpectedDamage({
      attacker,
      weapon,
      defender,
      attackingModels: 1,
      defendingModels: 10,
      conditions: {
        ...baseConditions,
        isTargetInCover: false,
      },
      activeModifierRules: [],
    });

    const withCover = calculateExpectedDamage({
      attacker,
      weapon,
      defender,
      attackingModels: 1,
      defendingModels: 10,
      conditions: {
        ...baseConditions,
        isTargetInCover: true,
      },
      activeModifierRules: [],
    });

    expect(noCover.saveTarget).toBe(4);
    expect(withCover.saveTarget).toBe(3);
    expect(withCover.expectedDamage).toBeLessThan(noCover.expectedDamage);
  });
});

it("applies melee AP bonus from engine tag", () => {
  const weapon: Weapon = {
    id: "melee-weapon",
    name: "Melee Weapon",
    attacks: 4,
    skill: 3,
    strength: 5,
    ap: -1,
    damage: 1,
    type: "melee",
    specialRules: [],
  };

  const noBonus = calculateExpectedDamage({
    attacker,
    weapon,
    defender,
    attackingModels: 1,
    defendingModels: 10,
    conditions: baseConditions,
    activeModifierRules: [],
    activeEngineTags: [],
  });

  const withBonus = calculateExpectedDamage({
    attacker,
    weapon,
    defender,
    attackingModels: 1,
    defendingModels: 10,
    conditions: baseConditions,
    activeModifierRules: [],
    activeEngineTags: ["melee-ap-plus-1"],
  });

  expect(noBonus.effectiveAp).toBe(-1);
  expect(withBonus.effectiveAp).toBe(-2);
  expect(withBonus.saveTarget).toBeGreaterThan(noBonus.saveTarget);
  expect(withBonus.expectedDamage).toBeGreaterThan(noBonus.expectedDamage);
});