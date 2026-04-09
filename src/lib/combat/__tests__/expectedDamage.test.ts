import { describe, expect, it } from "vitest";
import { calculateExpectedDamage } from "../expectedDamage";
import type { AttackConditions, Unit, Weapon } from "../../../types/combat";

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

  it("applies hit modifier to improve hit target", () => {
    const noBonus = calculateExpectedDamage({
      attacker,
      weapon: custodesMeleeWeapon,
      defender,
      attackingModels: 1,
      defendingModels: 10,
      conditions: baseConditions,
      activeModifierRules: [],
    });

    const withHitBonus = calculateExpectedDamage({
      attacker,
      weapon: custodesMeleeWeapon,
      defender,
      attackingModels: 1,
      defendingModels: 10,
      conditions: baseConditions,
      activeModifierRules: [{ type: "HIT_MODIFIER", value: 1, attackType: "melee" }],
    });

    expect(noBonus.hitTarget).toBe(2);
    expect(withHitBonus.hitTarget).toBe(2);
    expect(withHitBonus.expectedHits).toBeCloseTo(noBonus.expectedHits, 5);
  });

  it("applies hit modifier when a weapon has room to improve", () => {
    const rangedWeapon: Weapon = {
      id: "boltgun",
      name: "Boltgun",
      attacks: 2,
      skill: 3,
      strength: 4,
      ap: 0,
      damage: 1,
      type: "ranged",
      specialRules: [],
    };

    const noBonus = calculateExpectedDamage({
      attacker,
      weapon: rangedWeapon,
      defender,
      attackingModels: 1,
      defendingModels: 10,
      conditions: baseConditions,
      activeModifierRules: [],
    });

    const withHitBonus = calculateExpectedDamage({
      attacker,
      weapon: rangedWeapon,
      defender,
      attackingModels: 1,
      defendingModels: 10,
      conditions: baseConditions,
      activeModifierRules: [{ type: "HIT_MODIFIER", value: 1, attackType: "ranged" }],
    });

    expect(noBonus.hitTarget).toBe(3);
    expect(withHitBonus.hitTarget).toBe(2);
    expect(withHitBonus.expectedHits).toBeGreaterThan(noBonus.expectedHits);
  });

  it("applies attacks modifier to attacks per model", () => {
    const noBonus = calculateExpectedDamage({
      attacker,
      weapon: custodesMeleeWeapon,
      defender,
      attackingModels: 1,
      defendingModels: 10,
      conditions: baseConditions,
      activeModifierRules: [],
    });

    const withAttackBonus = calculateExpectedDamage({
      attacker,
      weapon: custodesMeleeWeapon,
      defender,
      attackingModels: 1,
      defendingModels: 10,
      conditions: baseConditions,
      activeModifierRules: [
        { type: "ATTACKS_MODIFIER", value: 2, attackType: "melee" },
      ],
    });

    expect(noBonus.attacksPerModel).toBe(5);
    expect(withAttackBonus.attacksPerModel).toBe(7);
    expect(withAttackBonus.totalAttacks).toBe(7);
    expect(withAttackBonus.expectedDamage).toBeGreaterThan(noBonus.expectedDamage);
  });

  it("re-rolls variable attacks when REROLL_ATTACKS is active", () => {
    const swingyWeapon: Weapon = {
      id: "burst-cannon-volley",
      name: "Burst Cannon Volley",
      attacks: "D6",
      skill: 4,
      strength: 5,
      ap: 0,
      damage: 1,
      type: "ranged",
      specialRules: [],
    };

    const noBonus = calculateExpectedDamage({
      attacker,
      weapon: swingyWeapon,
      defender,
      attackingModels: 1,
      defendingModels: 10,
      conditions: baseConditions,
      activeModifierRules: [],
    });

    const withAttackReroll = calculateExpectedDamage({
      attacker,
      weapon: swingyWeapon,
      defender,
      attackingModels: 1,
      defendingModels: 10,
      conditions: baseConditions,
      activeModifierRules: [{ type: "REROLL_ATTACKS", attackType: "ranged" }],
    });

    expect(noBonus.attacksPerModel).toBeCloseTo(3.5, 5);
    expect(withAttackReroll.attacksPerModel).toBeCloseTo(4.25, 5);
    expect(withAttackReroll.expectedDamage).toBeGreaterThan(noBonus.expectedDamage);
  });

  it("applies full hit rerolls when attacker keyword condition matches", () => {
    const rangedWeapon: Weapon = {
      id: "gauss-blaster",
      name: "Gauss Blaster",
      attacks: 4,
      skill: 4,
      strength: 5,
      ap: -1,
      damage: 1,
      type: "ranged",
      specialRules: [],
    };

    const result = calculateExpectedDamage({
      attacker: {
        ...attacker,
        keywords: ["CHARACTER"],
      },
      weapon: rangedWeapon,
      defender,
      attackingModels: 1,
      defendingModels: 10,
      conditions: baseConditions,
      activeModifierRules: [
        {
          type: "REROLL_HITS",
          attackType: "ranged",
          requiredAttackerKeywords: ["CHARACTER"],
        },
      ],
    });

    expect(result.hitTarget).toBe(4);
    expect(result.expectedHits).toBeCloseTo(3, 5);
  });

  it("does not apply conditional rerolls when requirements are not met", () => {
    const rangedWeapon: Weapon = {
      id: "gauss-blaster",
      name: "Gauss Blaster",
      attacks: 4,
      skill: 4,
      strength: 5,
      ap: -1,
      damage: 1,
      type: "ranged",
      specialRules: [],
    };

    const result = calculateExpectedDamage({
      attacker,
      weapon: rangedWeapon,
      defender,
      attackingModels: 1,
      defendingModels: 10,
      conditions: baseConditions,
      activeModifierRules: [
        {
          type: "REROLL_HITS",
          attackType: "ranged",
          requiredAttackerKeywords: ["CHARACTER"],
        },
      ],
    });

    expect(result.hitTarget).toBe(4);
    expect(result.expectedHits).toBeCloseTo(2, 5);
  });

  it("applies battle-shock gated wound bonuses only when the target qualifies", () => {
    const rangedWeapon: Weapon = {
      id: "psycannon",
      name: "Psycannon",
      attacks: 4,
      skill: 3,
      strength: 5,
      ap: -1,
      damage: 1,
      type: "ranged",
      specialRules: [],
    };

    const battleShockedTarget: Unit = {
      ...defender,
      keywords: ["PSYKER"],
      toughness: 8,
    };

    const withoutCondition = calculateExpectedDamage({
      attacker,
      weapon: rangedWeapon,
      defender: battleShockedTarget,
      attackingModels: 1,
      defendingModels: 10,
      conditions: baseConditions,
      activeModifierRules: [
        {
          type: "WOUND_MODIFIER",
          value: 1,
          attackType: "ranged",
          requiredDefenderKeywords: ["PSYKER"],
          requiresTargetBattleShocked: true,
        },
      ],
    });

    const withCondition = calculateExpectedDamage({
      attacker,
      weapon: rangedWeapon,
      defender: battleShockedTarget,
      attackingModels: 1,
      defendingModels: 10,
      conditions: {
        ...baseConditions,
        targetIsBattleShocked: true,
      },
      activeModifierRules: [
        {
          type: "WOUND_MODIFIER",
          value: 1,
          attackType: "ranged",
          requiredDefenderKeywords: ["PSYKER"],
          requiresTargetBattleShocked: true,
        },
      ],
    });

    expect(withoutCondition.woundTarget).toBe(5);
    expect(withCondition.woundTarget).toBe(4);
    expect(withCondition.expectedDamage).toBeGreaterThan(
      withoutCondition.expectedDamage
    );
  });

  it("applies closest-target AP bonuses when the condition is enabled", () => {
    const rangedWeapon: Weapon = {
      id: "heavy-gauss",
      name: "Heavy Gauss",
      attacks: 2,
      skill: 3,
      strength: 8,
      ap: -1,
      damage: 2,
      type: "ranged",
      specialRules: [],
    };

    const noClosestTarget = calculateExpectedDamage({
      attacker: {
        ...attacker,
        keywords: ["DESTROYER CULT"],
      },
      weapon: rangedWeapon,
      defender,
      attackingModels: 1,
      defendingModels: 10,
      conditions: baseConditions,
      activeModifierRules: [
        {
          type: "AP_MODIFIER",
          value: 1,
          attackType: "ranged",
          requiredAttackerKeywords: ["DESTROYER CULT"],
          requiresTargetIsClosestEligible: true,
        },
      ],
    });

    const closestTarget = calculateExpectedDamage({
      attacker: {
        ...attacker,
        keywords: ["DESTROYER CULT"],
      },
      weapon: rangedWeapon,
      defender,
      attackingModels: 1,
      defendingModels: 10,
      conditions: {
        ...baseConditions,
        targetIsClosestEligible: true,
      },
      activeModifierRules: [
        {
          type: "AP_MODIFIER",
          value: 1,
          attackType: "ranged",
          requiredAttackerKeywords: ["DESTROYER CULT"],
          requiresTargetIsClosestEligible: true,
        },
      ],
    });

    expect(noClosestTarget.effectiveAp).toBe(-1);
    expect(closestTarget.effectiveAp).toBe(-2);
    expect(closestTarget.expectedDamage).toBeGreaterThan(
      noClosestTarget.expectedDamage
    );
  });

  it("applies Power Matrix full hit rerolls when the attacker qualifies", () => {
    const rangedWeapon: Weapon = {
      id: "particle-beamer",
      name: "Particle Beamer",
      attacks: 4,
      skill: 4,
      strength: 5,
      ap: 0,
      damage: 1,
      type: "ranged",
      specialRules: [],
    };

    const outsideMatrix = calculateExpectedDamage({
      attacker: {
        ...attacker,
        keywords: ["CANOPTEK"],
      },
      weapon: rangedWeapon,
      defender,
      attackingModels: 1,
      defendingModels: 10,
      conditions: baseConditions,
      activeModifierRules: [
        {
          type: "REROLL_HITS",
          requiredAttackerKeywords: ["CANOPTEK"],
          requiresAttackerWithinPowerMatrix: true,
        },
      ],
    });

    const insideMatrix = calculateExpectedDamage({
      attacker: {
        ...attacker,
        keywords: ["CANOPTEK"],
      },
      weapon: rangedWeapon,
      defender,
      attackingModels: 1,
      defendingModels: 10,
      conditions: {
        ...baseConditions,
        attackerWithinPowerMatrix: true,
      },
      activeModifierRules: [
        {
          type: "REROLL_HITS",
          requiredAttackerKeywords: ["CANOPTEK"],
          requiresAttackerWithinPowerMatrix: true,
        },
      ],
    });

    expect(outsideMatrix.expectedHits).toBeCloseTo(2, 5);
    expect(insideMatrix.expectedHits).toBeCloseTo(3, 5);
  });

  it("improves unsaved critical wounds with critical wound AP modifiers", () => {
    const weapon: Weapon = {
      id: "voidblade",
      name: "Voidblade",
      attacks: 6,
      skill: 2,
      strength: 6,
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
    });

    const withBonus = calculateExpectedDamage({
      attacker,
      weapon,
      defender,
      attackingModels: 1,
      defendingModels: 10,
      conditions: {
        ...baseConditions,
        attackWithinObjectiveRange: true,
      },
      activeModifierRules: [
        {
          type: "CRITICAL_WOUND_AP_MODIFIER",
          value: 1,
          requiresAttackWithinObjectiveRange: true,
        },
      ],
    });

    expect(withBonus.expectedDamage).toBeGreaterThan(noBonus.expectedDamage);
    expect(withBonus.expectedUnsavedWounds).toBeGreaterThan(
      noBonus.expectedUnsavedWounds
    );
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

  it("uses fixed hit rolls for overwatch-style attacks", () => {
    const rangedWeapon: Weapon = {
      id: "pulse-rifle",
      name: "Pulse Rifle",
      attacks: 4,
      skill: 3,
      strength: 5,
      ap: 0,
      damage: 1,
      type: "ranged",
      specialRules: [],
    };

    const normalAttack = calculateExpectedDamage({
      attacker,
      weapon: rangedWeapon,
      defender,
      attackingModels: 1,
      defendingModels: 10,
      conditions: baseConditions,
      activeModifierRules: [],
    });

    const snapshotAttack = calculateExpectedDamage({
      attacker,
      weapon: rangedWeapon,
      defender,
      attackingModels: 1,
      defendingModels: 10,
      conditions: {
        ...baseConditions,
        attackerIsFiringOverwatch: true,
      },
      activeModifierRules: [
        {
          type: "FIXED_HIT_ROLL",
          value: 5,
          attackType: "ranged",
          requiresAttackerFiringOverwatch: true,
        },
      ],
    });

    expect(normalAttack.hitTarget).toBe(3);
    expect(snapshotAttack.hitTarget).toBe(5);
    expect(snapshotAttack.expectedHits).toBeLessThan(normalAttack.expectedHits);
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
