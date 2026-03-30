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

const custodesMeleeWeapon: Weapon = {
  id: "guardian-spear-melee",
  name: "Guardian Spear (Melee)",
  attacks: 5,
  skill: 2,
  strength: 7,
  ap: -2,
  damage: 2,
  type: "melee",
  specialRules: [],
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

  it("applies Critical Hits on 5+ modifier", () => {
    const noBonus = calculateExpectedDamage({
      attacker,
      weapon: custodesMeleeWeapon,
      defender,
      attackingModels: 1,
      defendingModels: 10,
      conditions: baseConditions,
      activeModifierRules: [],
    });

    const withCrit5 = calculateExpectedDamage({
      attacker,
      weapon: custodesMeleeWeapon,
      defender,
      attackingModels: 1,
      defendingModels: 10,
      conditions: baseConditions,
      activeModifierRules: [{ type: "CRITICAL_HITS_ON", value: 5 }],
    });

    expect(noBonus.criticalHits).toBeCloseTo(5 / 6, 3);
    expect(withCrit5.criticalHits).toBeCloseTo(10 / 6, 3);
    expect(withCrit5.criticalHits).toBeGreaterThan(noBonus.criticalHits);
  });

  it("applies melee AP modifier from active modifier rules", () => {
    const noBonus = calculateExpectedDamage({
      attacker,
      weapon: custodesMeleeWeapon,
      defender,
      attackingModels: 1,
      defendingModels: 10,
      conditions: baseConditions,
      activeModifierRules: [],
    });

    const withApBonus = calculateExpectedDamage({
      attacker,
      weapon: custodesMeleeWeapon,
      defender,
      attackingModels: 1,
      defendingModels: 10,
      conditions: baseConditions,
      activeModifierRules: [
        { type: "AP_MODIFIER", value: 1, attackType: "melee" },
      ],
    });

    expect(noBonus.effectiveAp).toBe(-2);
    expect(withApBonus.effectiveAp).toBe(-3);
    expect(withApBonus.saveTarget).toBeGreaterThan(noBonus.saveTarget);
    expect(withApBonus.expectedDamage).toBeGreaterThan(noBonus.expectedDamage);
  });

  it("applies melee Strength modifier to wound target", () => {
    const toughDefender: Unit = {
      ...defender,
      toughness: 8,
    };

    const noBonus = calculateExpectedDamage({
      attacker,
      weapon: custodesMeleeWeapon,
      defender: toughDefender,
      attackingModels: 1,
      defendingModels: 10,
      conditions: baseConditions,
      activeModifierRules: [],
    });

    const withStrengthBonus = calculateExpectedDamage({
      attacker,
      weapon: custodesMeleeWeapon,
      defender: toughDefender,
      attackingModels: 1,
      defendingModels: 10,
      conditions: baseConditions,
      activeModifierRules: [
        { type: "STRENGTH_MODIFIER", value: 1, attackType: "melee" },
      ],
    });

    expect(noBonus.woundTarget).toBe(5);
    expect(withStrengthBonus.woundTarget).toBe(4);
    expect(withStrengthBonus.expectedDamage).toBeGreaterThan(noBonus.expectedDamage);
  });

  it("applies melee Damage modifier to damage per failed save", () => {
    const noBonus = calculateExpectedDamage({
      attacker,
      weapon: custodesMeleeWeapon,
      defender,
      attackingModels: 1,
      defendingModels: 10,
      conditions: baseConditions,
      activeModifierRules: [],
    });

    const withDamageBonus = calculateExpectedDamage({
      attacker,
      weapon: custodesMeleeWeapon,
      defender,
      attackingModels: 1,
      defendingModels: 10,
      conditions: baseConditions,
      activeModifierRules: [
        { type: "DAMAGE_MODIFIER", value: 1, attackType: "melee" },
      ],
    });

    expect(noBonus.damagePerFailedSave).toBe(2);
    expect(withDamageBonus.damagePerFailedSave).toBe(3);
    expect(withDamageBonus.expectedDamage).toBeGreaterThan(noBonus.expectedDamage);
  });

  it("applies Lance on charge", () => {
    const toughDefender: Unit = {
      ...defender,
      toughness: 8,
    };

    const noCharge = calculateExpectedDamage({
      attacker,
      weapon: custodesMeleeWeapon,
      defender: toughDefender,
      attackingModels: 1,
      defendingModels: 10,
      conditions: {
        ...baseConditions,
        isChargeTurn: false,
      },
      activeModifierRules: [{ type: "LANCE" }],
    });

    const onCharge = calculateExpectedDamage({
      attacker,
      weapon: custodesMeleeWeapon,
      defender: toughDefender,
      attackingModels: 1,
      defendingModels: 10,
      conditions: {
        ...baseConditions,
        isChargeTurn: true,
      },
      activeModifierRules: [{ type: "LANCE" }],
    });

    expect(noCharge.woundTarget).toBe(5);
    expect(onCharge.woundTarget).toBe(4);
    expect(onCharge.expectedDamage).toBeGreaterThan(noCharge.expectedDamage);
  });
});

it("applies wound modifier against high toughness targets", () => {
  const toughDefender: Unit = {
    ...defender,
    toughness: 8,
  };

  const noBonus = calculateExpectedDamage({
    attacker,
    weapon: custodesMeleeWeapon,
    defender: toughDefender,
    attackingModels: 1,
    defendingModels: 10,
    conditions: baseConditions,
    activeModifierRules: [],
  });

  const withWoundBonus = calculateExpectedDamage({
    attacker,
    weapon: custodesMeleeWeapon,
    defender: toughDefender,
    attackingModels: 1,
    defendingModels: 10,
    conditions: baseConditions,
    activeModifierRules: [
      {
        type: "WOUND_MODIFIER",
        value: 1,
        attackType: "melee",
        targetToughnessAtLeast: 7,
      },
    ],
  });

  expect(noBonus.woundTarget).toBe(5);
  expect(withWoundBonus.woundTarget).toBe(4);
  expect(withWoundBonus.expectedDamage).toBeGreaterThan(noBonus.expectedDamage);
});

it("does not apply wound modifier below toughness threshold", () => {
  const noBonus = calculateExpectedDamage({
    attacker,
    weapon: custodesMeleeWeapon,
    defender,
    attackingModels: 1,
    defendingModels: 10,
    conditions: baseConditions,
    activeModifierRules: [],
  });

  const withConditionalBonus = calculateExpectedDamage({
    attacker,
    weapon: custodesMeleeWeapon,
    defender,
    attackingModels: 1,
    defendingModels: 10,
    conditions: baseConditions,
    activeModifierRules: [
      {
        type: "WOUND_MODIFIER",
        value: 1,
        attackType: "melee",
        targetToughnessAtLeast: 7,
      },
    ],
  });

  expect(withConditionalBonus.woundTarget).toBe(noBonus.woundTarget);
  expect(withConditionalBonus.expectedDamage).toBeCloseTo(
    noBonus.expectedDamage,
    5
  );
});