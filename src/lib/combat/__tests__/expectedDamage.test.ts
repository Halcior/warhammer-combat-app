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
  attackerWithinAuxiliarySupportRange: false,
  defenderWithinFriendlyVehicleSupportRange: false,
  defenderWithinAuxiliaryStealthRange: false,
  targetWithinAuxiliarySupportRange: false,
  targetModelCount: 10,
  targetHasMatchingAntiKeyword: false,
  isChargeTurn: false,
  isAttachedUnit: false,
  attackWithinObjectiveRange: false,
  attackerWithinObjectiveRange: false,
  attackerDisembarkedThisTurn: false,
  attackerIsFiringOverwatch: false,
  attackerIsAfflicted: false,
  attackerIsGuided: false,
  attackerIsVesselOfWrath: false,
  attackerWithinFriendlyCharacterRange: false,
  attackerWithinFriendlyMonsterAura: false,
  attackerWithinPowerMatrix: false,
  attackerSetUpThisTurn: false,
  attackerSetToDefend: false,
  targetIsClosestEligible: false,
  targetWithinPlagueLegionsEngagementRange: false,
  targetIsAfflicted: false,
  targetWithinContagionRange: false,
  targetInOpponentDeploymentZone: false,
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

  it("applies Monster aura-gated hit and wound bonuses when enabled", () => {
    const meleeWeapon: Weapon = {
      id: "jakhal-chainblades",
      name: "Jakhal Chainblades",
      attacks: 4,
      skill: 4,
      strength: 4,
      ap: 0,
      damage: 1,
      type: "melee",
      specialRules: [],
    };

    const auraOff = calculateExpectedDamage({
      attacker: {
        ...attacker,
        keywords: ["JAKHALS"],
      },
      weapon: meleeWeapon,
      defender: {
        ...defender,
        toughness: 5,
      },
      attackingModels: 1,
      defendingModels: 10,
      conditions: baseConditions,
      activeModifierRules: [
        {
          type: "HIT_MODIFIER",
          value: 1,
          requiredAttackerKeywords: ["JAKHALS", "GOREMONGERS"],
          requiresAttackerWithinFriendlyMonsterAura: true,
        },
        {
          type: "WOUND_MODIFIER",
          value: 1,
          requiredAttackerKeywords: ["JAKHALS", "GOREMONGERS"],
          requiresAttackerWithinFriendlyMonsterAura: true,
        },
      ],
    });

    const auraOn = calculateExpectedDamage({
      attacker: {
        ...attacker,
        keywords: ["JAKHALS"],
      },
      weapon: meleeWeapon,
      defender: {
        ...defender,
        toughness: 5,
      },
      attackingModels: 1,
      defendingModels: 10,
      conditions: {
        ...baseConditions,
        attackerWithinFriendlyMonsterAura: true,
      },
      activeModifierRules: [
        {
          type: "HIT_MODIFIER",
          value: 1,
          requiredAttackerKeywords: ["JAKHALS", "GOREMONGERS"],
          requiresAttackerWithinFriendlyMonsterAura: true,
        },
        {
          type: "WOUND_MODIFIER",
          value: 1,
          requiredAttackerKeywords: ["JAKHALS", "GOREMONGERS"],
          requiresAttackerWithinFriendlyMonsterAura: true,
        },
      ],
    });

    expect(auraOff.hitTarget).toBe(4);
    expect(auraOff.woundTarget).toBe(5);
    expect(auraOn.hitTarget).toBe(3);
    expect(auraOn.woundTarget).toBe(4);
    expect(auraOn.expectedDamage).toBeGreaterThan(auraOff.expectedDamage);
  });

  it("applies defender damage reduction from special rules", () => {
    const damageTwoWeapon: Weapon = {
      id: "crusher-weapon",
      name: "Crusher Weapon",
      attacks: 4,
      skill: 3,
      strength: 6,
      ap: -1,
      damage: 2,
      type: "melee",
      specialRules: [],
    };

    const baseline = calculateExpectedDamage({
      attacker,
      weapon: damageTwoWeapon,
      defender,
      attackingModels: 1,
      defendingModels: 10,
      conditions: baseConditions,
      activeModifierRules: [],
    });

    const reduced = calculateExpectedDamage({
      attacker,
      weapon: damageTwoWeapon,
      defender: {
        ...defender,
        specialRules: [{ type: "DAMAGE_REDUCTION", value: 1 }],
      },
      attackingModels: 1,
      defendingModels: 10,
      conditions: baseConditions,
      activeModifierRules: [],
    });

    expect(baseline.damagePerFailedSave).toBe(2);
    expect(reduced.damagePerFailedSave).toBe(1);
    expect(reduced.expectedDamage).toBeLessThan(baseline.expectedDamage);
  });

  it("applies active defender wound penalties", () => {
    const meleeWeapon: Weapon = {
      id: "daemon-blade",
      name: "Daemon Blade",
      attacks: 5,
      skill: 3,
      strength: 6,
      ap: -1,
      damage: 2,
      type: "melee",
      specialRules: [],
    };

    const noPenalty = calculateExpectedDamage({
      attacker,
      weapon: meleeWeapon,
      defender,
      attackingModels: 1,
      defendingModels: 10,
      conditions: baseConditions,
      activeModifierRules: [],
    });

    const withPenalty = calculateExpectedDamage({
      attacker,
      weapon: meleeWeapon,
      defender,
      attackingModels: 1,
      defendingModels: 10,
      conditions: baseConditions,
      activeModifierRules: [],
      activeDefenderModifierRules: [{ type: "WOUND_MODIFIER", value: -1 }],
    });

    expect(noPenalty.woundTarget).toBe(3);
    expect(withPenalty.woundTarget).toBe(4);
    expect(withPenalty.expectedDamage).toBeLessThan(noPenalty.expectedDamage);
  });

  it("applies active defender hit penalties", () => {
    const rangedWeapon: Weapon = {
      id: "suppression-cannon",
      name: "Suppression Cannon",
      attacks: 4,
      skill: 3,
      strength: 6,
      ap: -1,
      damage: 2,
      type: "ranged",
      specialRules: [],
    };

    const baseline = calculateExpectedDamage({
      attacker,
      weapon: rangedWeapon,
      defender,
      attackingModels: 1,
      defendingModels: 10,
      conditions: baseConditions,
      activeModifierRules: [],
    });

    const withSuppression = calculateExpectedDamage({
      attacker,
      weapon: rangedWeapon,
      defender,
      attackingModels: 1,
      defendingModels: 10,
      conditions: baseConditions,
      activeModifierRules: [],
      activeDefenderModifierRules: [{ type: "HIT_MODIFIER", value: -1 }],
    });

    expect(baseline.hitTarget).toBe(3);
    expect(withSuppression.hitTarget).toBe(4);
    expect(withSuppression.expectedHits).toBeLessThan(baseline.expectedHits);
    expect(withSuppression.expectedDamage).toBeLessThan(baseline.expectedDamage);
  });

  it("applies active defender hit penalties only against matching attacker keywords", () => {
    const rangedWeapon: Weapon = {
      id: "battle-cannon",
      name: "Battle Cannon",
      attacks: 4,
      skill: 4,
      strength: 10,
      ap: -1,
      damage: 3,
      type: "ranged",
      specialRules: [],
    };

    const nonVehicleAttacker = calculateExpectedDamage({
      attacker: {
        ...attacker,
        keywords: ["INFANTRY"],
      },
      weapon: rangedWeapon,
      defender,
      attackingModels: 1,
      defendingModels: 10,
      conditions: baseConditions,
      activeModifierRules: [],
      activeDefenderModifierRules: [
        {
          type: "HIT_MODIFIER",
          value: -1,
          requiredAttackerKeywords: ["VEHICLE"],
        },
      ],
    });

    const vehicleAttacker = calculateExpectedDamage({
      attacker: {
        ...attacker,
        keywords: ["VEHICLE"],
      },
      weapon: rangedWeapon,
      defender,
      attackingModels: 1,
      defendingModels: 10,
      conditions: baseConditions,
      activeModifierRules: [],
      activeDefenderModifierRules: [
        {
          type: "HIT_MODIFIER",
          value: -1,
          requiredAttackerKeywords: ["VEHICLE"],
        },
      ],
    });

    expect(nonVehicleAttacker.hitTarget).toBe(4);
    expect(vehicleAttacker.hitTarget).toBe(5);
    expect(vehicleAttacker.expectedDamage).toBeLessThan(
      nonVehicleAttacker.expectedDamage
    );
  });

  it("applies active defender feel no pain rules", () => {
    const damageTwoWeapon: Weapon = {
      id: "sawblade",
      name: "Sawblade",
      attacks: 4,
      skill: 3,
      strength: 6,
      ap: -1,
      damage: 2,
      type: "melee",
      specialRules: [],
    };

    const baseline = calculateExpectedDamage({
      attacker,
      weapon: damageTwoWeapon,
      defender,
      attackingModels: 1,
      defendingModels: 10,
      conditions: baseConditions,
      activeModifierRules: [],
    });

    const withFeelNoPain = calculateExpectedDamage({
      attacker,
      weapon: damageTwoWeapon,
      defender,
      attackingModels: 1,
      defendingModels: 10,
      conditions: baseConditions,
      activeModifierRules: [],
      activeDefenderModifierRules: [{ type: "FEEL_NO_PAIN", value: 5 }],
    });

    expect(withFeelNoPain.expectedDamage).toBeLessThan(baseline.expectedDamage);
    expect(withFeelNoPain.expectedSlainModels).toBeLessThan(
      baseline.expectedSlainModels
    );
  });

  it("blocks ranged attacks outside a defender targeting range limit", () => {
    const rangedWeapon: Weapon = {
      id: "pulse-carbine",
      name: "Pulse Carbine",
      attacks: 2,
      skill: 4,
      strength: 5,
      ap: 0,
      damage: 1,
      type: "ranged",
      specialRules: [],
    };

    const withinRange = calculateExpectedDamage({
      attacker,
      weapon: rangedWeapon,
      defender,
      attackingModels: 1,
      defendingModels: 10,
      conditions: {
        ...baseConditions,
        targetDistanceInches: 18,
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

    const outsideRange = calculateExpectedDamage({
      attacker,
      weapon: rangedWeapon,
      defender,
      attackingModels: 1,
      defendingModels: 10,
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

    expect(withinRange.expectedDamage).toBeGreaterThan(0);
    expect(outsideRange.totalAttacks).toBe(0);
    expect(outsideRange.expectedHits).toBe(0);
    expect(outsideRange.expectedDamage).toBe(0);
    expect(outsideRange.expectedSlainModels).toBe(0);
  });

  it("uses the best feel no pain value when multiple defender rules are active", () => {
    const damageTwoWeapon: Weapon = {
      id: "chain-cleaver",
      name: "Chain Cleaver",
      attacks: 4,
      skill: 3,
      strength: 6,
      ap: -1,
      damage: 2,
      type: "melee",
      specialRules: [],
    };

    const feelNoPainSix = calculateExpectedDamage({
      attacker,
      weapon: damageTwoWeapon,
      defender,
      attackingModels: 1,
      defendingModels: 10,
      conditions: baseConditions,
      activeModifierRules: [],
      activeDefenderModifierRules: [{ type: "FEEL_NO_PAIN", value: 6 }],
    });

    const feelNoPainFiveAndSix = calculateExpectedDamage({
      attacker,
      weapon: damageTwoWeapon,
      defender,
      attackingModels: 1,
      defendingModels: 10,
      conditions: baseConditions,
      activeModifierRules: [],
      activeDefenderModifierRules: [
        { type: "FEEL_NO_PAIN", value: 6 },
        { type: "FEEL_NO_PAIN", value: 5 },
      ],
    });

    expect(feelNoPainFiveAndSix.expectedDamage).toBeLessThan(
      feelNoPainSix.expectedDamage
    );
    expect(feelNoPainFiveAndSix.expectedSlainModels).toBeLessThan(
      feelNoPainSix.expectedSlainModels
    );
  });

  it("applies defender invulnerable save modifiers", () => {
    const highApWeapon: Weapon = {
      id: "annihilator",
      name: "Annihilator",
      attacks: 2,
      skill: 3,
      strength: 10,
      ap: -4,
      damage: 3,
      type: "ranged",
      specialRules: [],
    };

    const noInvul = calculateExpectedDamage({
      attacker,
      weapon: highApWeapon,
      defender: {
        ...defender,
        save: 3,
        invulnerableSave: undefined,
      },
      attackingModels: 1,
      defendingModels: 10,
      conditions: baseConditions,
      activeModifierRules: [],
    });

    const withInvul = calculateExpectedDamage({
      attacker,
      weapon: highApWeapon,
      defender: {
        ...defender,
        save: 3,
        invulnerableSave: undefined,
      },
      attackingModels: 1,
      defendingModels: 10,
      conditions: baseConditions,
      activeModifierRules: [],
      activeDefenderModifierRules: [{ type: "INVULNERABLE_SAVE", value: 5 }],
    });

    expect(noInvul.saveTarget).toBe(7);
    expect(withInvul.saveTarget).toBe(5);
    expect(withInvul.expectedDamage).toBeLessThan(noInvul.expectedDamage);
  });

  it("applies defender set save characteristic rules", () => {
    const apTwoWeapon: Weapon = {
      id: "tank-buster",
      name: "Tank Buster",
      attacks: 2,
      skill: 3,
      strength: 8,
      ap: -2,
      damage: 3,
      type: "ranged",
      specialRules: [],
    };

    const baseline = calculateExpectedDamage({
      attacker,
      weapon: apTwoWeapon,
      defender: {
        ...defender,
        save: 3,
        invulnerableSave: undefined,
      },
      attackingModels: 1,
      defendingModels: 10,
      conditions: baseConditions,
      activeModifierRules: [],
    });

    const improvedSave = calculateExpectedDamage({
      attacker,
      weapon: apTwoWeapon,
      defender: {
        ...defender,
        save: 3,
        invulnerableSave: undefined,
      },
      attackingModels: 1,
      defendingModels: 10,
      conditions: baseConditions,
      activeModifierRules: [],
      activeDefenderModifierRules: [{ type: "SET_SAVE_CHARACTERISTIC", value: 2 }],
    });

    expect(baseline.saveTarget).toBe(5);
    expect(improvedSave.saveTarget).toBe(4);
    expect(improvedSave.expectedDamage).toBeLessThan(baseline.expectedDamage);
  });

  it("applies defender toughness modifiers", () => {
    const strengthFiveWeapon: Weapon = {
      id: "blight-burst",
      name: "Blight Burst",
      attacks: 4,
      skill: 3,
      strength: 5,
      ap: -1,
      damage: 2,
      type: "ranged",
      specialRules: [],
    };

    const baseline = calculateExpectedDamage({
      attacker,
      weapon: strengthFiveWeapon,
      defender,
      attackingModels: 1,
      defendingModels: 10,
      conditions: baseConditions,
      activeModifierRules: [],
      activeDefenderModifierRules: [],
    });

    const tougherDefender = calculateExpectedDamage({
      attacker,
      weapon: strengthFiveWeapon,
      defender,
      attackingModels: 1,
      defendingModels: 10,
      conditions: baseConditions,
      activeModifierRules: [],
      activeDefenderModifierRules: [{ type: "TOUGHNESS_MODIFIER", value: 2 }],
    });

    expect(tougherDefender.woundTarget).toBeGreaterThan(baseline.woundTarget);
    expect(tougherDefender.expectedDamage).toBeLessThan(baseline.expectedDamage);
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

  it("applies Auxiliary Cadre AP bonuses when the target is near Kroot/Vespid support", () => {
    const rangedWeapon: Weapon = {
      id: "plasma-rifle",
      name: "Plasma Rifle",
      attacks: 2,
      skill: 4,
      strength: 8,
      ap: -2,
      damage: 3,
      type: "ranged",
      specialRules: [],
    };

    const outsideSupport = calculateExpectedDamage({
      attacker: {
        ...attacker,
        keywords: ["BATTLESUIT"],
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
          excludedAttackerKeywords: ["KROOT", "VESPID STINGWINGS", "TITANIC"],
          requiresTargetWithinAuxiliarySupportRange: true,
        },
      ],
    });

    const insideSupport = calculateExpectedDamage({
      attacker: {
        ...attacker,
        keywords: ["BATTLESUIT"],
      },
      weapon: rangedWeapon,
      defender,
      attackingModels: 1,
      defendingModels: 10,
      conditions: {
        ...baseConditions,
        targetWithinAuxiliarySupportRange: true,
      },
      activeModifierRules: [
        {
          type: "AP_MODIFIER",
          value: 1,
          attackType: "ranged",
          excludedAttackerKeywords: ["KROOT", "VESPID STINGWINGS", "TITANIC"],
          requiresTargetWithinAuxiliarySupportRange: true,
        },
      ],
    });

    expect(outsideSupport.effectiveAp).toBe(-2);
    expect(insideSupport.effectiveAp).toBe(-3);
    expect(insideSupport.expectedDamage).toBeGreaterThan(
      outsideSupport.expectedDamage
    );
  });

  it("applies Kroot Hunting Pack invulnerable saves by attack type", () => {
    const rangedWeapon: Weapon = {
      id: "heavy-burst-cannon",
      name: "Heavy Burst Cannon",
      attacks: 6,
      skill: 4,
      strength: 6,
      ap: -2,
      damage: 2,
      type: "ranged",
      specialRules: [],
    };

    const meleeWeapon: Weapon = {
      id: "chainfist",
      name: "Chainfist",
      attacks: 4,
      skill: 3,
      strength: 8,
      ap: -3,
      damage: 2,
      type: "melee",
      specialRules: [],
    };

    const krootDefender: Unit = {
      ...defender,
      keywords: ["KROOT"],
      save: 6,
      invulnerableSave: undefined,
    };

    const rangedResult = calculateExpectedDamage({
      attacker,
      weapon: rangedWeapon,
      defender: krootDefender,
      attackingModels: 1,
      defendingModels: 10,
      conditions: baseConditions,
      activeModifierRules: [],
      activeDefenderModifierRules: [
        {
          type: "INVULNERABLE_SAVE",
          value: 5,
          attackType: "ranged",
          requiredDefenderKeywords: ["KROOT"],
        },
      ],
    });

    const meleeResult = calculateExpectedDamage({
      attacker,
      weapon: meleeWeapon,
      defender: krootDefender,
      attackingModels: 1,
      defendingModels: 10,
      conditions: baseConditions,
      activeModifierRules: [],
      activeDefenderModifierRules: [
        {
          type: "INVULNERABLE_SAVE",
          value: 6,
          attackType: "melee",
          requiredDefenderKeywords: ["KROOT"],
        },
      ],
    });

    expect(rangedResult.saveTarget).toBe(5);
    expect(meleeResult.saveTarget).toBe(6);
  });

  it("applies Auxiliary Cadre stealth screening only when the defender is screened", () => {
    const rangedWeapon: Weapon = {
      id: "pulse-carbine",
      name: "Pulse Carbine",
      attacks: 2,
      skill: 4,
      strength: 5,
      ap: 0,
      damage: 1,
      type: "ranged",
      specialRules: [],
    };

    const krootDefender: Unit = {
      ...defender,
      keywords: ["KROOT"],
    };

    const unscreened = calculateExpectedDamage({
      attacker,
      weapon: rangedWeapon,
      defender: krootDefender,
      attackingModels: 1,
      defendingModels: 10,
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
          requiredDefenderKeywords: ["KROOT", "VESPID STINGWINGS"],
          requiresDefenderWithinAuxiliaryStealthRange: true,
        },
      ],
    });

    const screened = calculateExpectedDamage({
      attacker,
      weapon: rangedWeapon,
      defender: krootDefender,
      attackingModels: 1,
      defendingModels: 10,
      conditions: {
        ...baseConditions,
        targetDistanceInches: 24,
        defenderWithinAuxiliaryStealthRange: true,
      },
      activeModifierRules: [],
      activeDefenderModifierRules: [
        {
          type: "TARGETING_RANGE_LIMIT",
          value: 18,
          attackType: "ranged",
          requiredDefenderKeywords: ["KROOT", "VESPID STINGWINGS"],
          requiresDefenderWithinAuxiliaryStealthRange: true,
        },
      ],
    });

    expect(unscreened.expectedDamage).toBeGreaterThan(0);
    expect(screened.expectedDamage).toBe(0);
  });

  it("applies Death Guard vehicle screening only when the defender is screened by a vehicle", () => {
    const rangedWeapon: Weapon = {
      id: "lascannon",
      name: "Lascannon",
      attacks: 1,
      skill: 3,
      strength: 12,
      ap: -3,
      damage: "D6+1",
      type: "ranged",
      specialRules: [],
    };

    const unscreened = calculateExpectedDamage({
      attacker,
      weapon: rangedWeapon,
      defender,
      attackingModels: 1,
      defendingModels: 1,
      conditions: {
        ...baseConditions,
        targetDistanceInches: 18,
      },
      activeModifierRules: [],
      activeDefenderModifierRules: [
        {
          type: "TARGETING_RANGE_LIMIT",
          value: 12,
          attackType: "ranged",
          requiresDefenderWithinFriendlyVehicleSupportRange: true,
        },
      ],
    });

    const screened = calculateExpectedDamage({
      attacker,
      weapon: rangedWeapon,
      defender,
      attackingModels: 1,
      defendingModels: 1,
      conditions: {
        ...baseConditions,
        targetDistanceInches: 18,
        defenderWithinFriendlyVehicleSupportRange: true,
      },
      activeModifierRules: [],
      activeDefenderModifierRules: [
        {
          type: "TARGETING_RANGE_LIMIT",
          value: 12,
          attackType: "ranged",
          requiresDefenderWithinFriendlyVehicleSupportRange: true,
        },
      ],
    });

    expect(unscreened.expectedDamage).toBeGreaterThan(0);
    expect(screened.expectedDamage).toBe(0);
  });

  it("upgrades Guided Fire from +1 to +2 Strength when the attacker has nearby support", () => {
    const rangedWeapon: Weapon = {
      id: "pulse-blaster",
      name: "Pulse Blaster",
      attacks: 2,
      skill: 4,
      strength: 5,
      ap: -1,
      damage: 1,
      type: "ranged",
      specialRules: [],
    };

    const baseBuff = calculateExpectedDamage({
      attacker: {
        ...attacker,
        keywords: ["BATTLESUIT"],
      },
      weapon: rangedWeapon,
      defender: {
        ...defender,
        toughness: 7,
      },
      attackingModels: 1,
      defendingModels: 10,
      conditions: baseConditions,
      activeModifierRules: [
        {
          type: "STRENGTH_MODIFIER",
          value: 1,
          attackType: "ranged",
          excludedAttackerKeywords: ["KROOT", "VESPID STINGWINGS"],
        },
      ],
    });

    const supportBuff = calculateExpectedDamage({
      attacker: {
        ...attacker,
        keywords: ["BATTLESUIT"],
      },
      weapon: rangedWeapon,
      defender: {
        ...defender,
        toughness: 7,
      },
      attackingModels: 1,
      defendingModels: 10,
      conditions: {
        ...baseConditions,
        attackerWithinAuxiliarySupportRange: true,
      },
      activeModifierRules: [
        {
          type: "STRENGTH_MODIFIER",
          value: 1,
          attackType: "ranged",
          excludedAttackerKeywords: ["KROOT", "VESPID STINGWINGS"],
        },
        {
          type: "STRENGTH_MODIFIER",
          value: 1,
          attackType: "ranged",
          excludedAttackerKeywords: ["KROOT", "VESPID STINGWINGS"],
          requiresAttackerWithinAuxiliarySupportRange: true,
        },
      ],
    });

    expect(baseBuff.woundTarget).toBe(5);
    expect(supportBuff.woundTarget).toBe(4);
    expect(supportBuff.expectedDamage).toBeGreaterThan(baseBuff.expectedDamage);
  });

  it("can block Overwatch against Kroot when Guerrilla Ambushers is active", () => {
    const rangedWeapon: Weapon = {
      id: "burst-cannon",
      name: "Burst Cannon",
      attacks: 4,
      skill: 4,
      strength: 5,
      ap: 0,
      damage: 1,
      type: "ranged",
      specialRules: [],
    };

    const krootDefender: Unit = {
      ...defender,
      keywords: ["KROOT"],
    };

    const normalOverwatch = calculateExpectedDamage({
      attacker,
      weapon: rangedWeapon,
      defender: krootDefender,
      attackingModels: 1,
      defendingModels: 10,
      conditions: {
        ...baseConditions,
        attackerIsFiringOverwatch: true,
      },
      activeModifierRules: [],
      activeDefenderModifierRules: [],
    });

    const deniedOverwatch = calculateExpectedDamage({
      attacker,
      weapon: rangedWeapon,
      defender: krootDefender,
      attackingModels: 1,
      defendingModels: 10,
      conditions: {
        ...baseConditions,
        attackerIsFiringOverwatch: true,
      },
      activeModifierRules: [],
      activeDefenderModifierRules: [
        {
          type: "TARGETING_RANGE_LIMIT",
          value: 0,
          attackType: "ranged",
          requiredDefenderKeywords: ["KROOT"],
          requiresAttackerFiringOverwatch: true,
        },
      ],
    });

    expect(normalOverwatch.expectedDamage).toBeGreaterThan(0);
    expect(deniedOverwatch.expectedDamage).toBe(0);
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

  it("applies wound re-rolls only when the attacker is on an objective", () => {
    const weapon: Weapon = {
      id: "plague-bolter",
      name: "Plague Bolter",
      attacks: 4,
      skill: 3,
      strength: 4,
      ap: 0,
      damage: 1,
      type: "ranged",
      specialRules: [],
    };

    const offObjective = calculateExpectedDamage({
      attacker,
      weapon,
      defender,
      attackingModels: 1,
      defendingModels: 10,
      conditions: baseConditions,
      activeModifierRules: [
        {
          type: "REROLL_WOUNDS",
          requiresAttackerWithinObjectiveRange: true,
        },
      ],
    });

    const onObjective = calculateExpectedDamage({
      attacker,
      weapon,
      defender,
      attackingModels: 1,
      defendingModels: 10,
      conditions: {
        ...baseConditions,
        attackerWithinObjectiveRange: true,
      },
      activeModifierRules: [
        {
          type: "REROLL_WOUNDS",
          requiresAttackerWithinObjectiveRange: true,
        },
      ],
    });

    expect(onObjective.expectedDamage).toBeGreaterThan(offObjective.expectedDamage);
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

  it("ignores hit modifiers when Ignore Hit Modifiers is active", () => {
    const rangedWeapon: Weapon = {
      id: "smart-missiles",
      name: "Smart Missiles",
      attacks: 4,
      skill: 4,
      strength: 5,
      ap: 0,
      damage: 1,
      type: "ranged",
      specialRules: [],
    };

    const penalized = calculateExpectedDamage({
      attacker,
      weapon: rangedWeapon,
      defender,
      attackingModels: 1,
      defendingModels: 10,
      conditions: baseConditions,
      activeModifierRules: [{ type: "HIT_MODIFIER", value: -1, attackType: "ranged" }],
    });

    const ignoredPenalty = calculateExpectedDamage({
      attacker,
      weapon: rangedWeapon,
      defender,
      attackingModels: 1,
      defendingModels: 10,
      conditions: {
        ...baseConditions,
        battleRound: 3,
        attackerIsGuided: true,
        targetIsSpotted: true,
      },
      activeModifierRules: [
        { type: "HIT_MODIFIER", value: -1, attackType: "ranged" },
        {
          type: "IGNORE_HIT_MODIFIERS",
          attackType: "ranged",
          requiresAttackerGuided: true,
          requiresTargetSpotted: true,
          requiresBattleRoundAtLeast: 3,
        },
      ],
    });

    expect(penalized.hitTarget).toBe(5);
    expect(ignoredPenalty.hitTarget).toBe(4);
    expect(ignoredPenalty.expectedHits).toBeGreaterThan(penalized.expectedHits);
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

it("improves ranged output when attacking an afflicted target with re-roll support", () => {
  const weapon: Weapon = {
    id: "affliction-rifle",
    name: "Affliction Rifle",
    attacks: 2,
    skill: 3,
    strength: 4,
    ap: -1,
    damage: 1,
    type: "ranged",
    specialRules: [],
  };

  const baseline = calculateExpectedDamage({
    attacker,
    weapon,
    defender,
    attackingModels: 1,
    defendingModels: 10,
    conditions: baseConditions,
    activeModifierRules: [],
  });

  const afflictedTarget = calculateExpectedDamage({
    attacker,
    weapon,
    defender,
    attackingModels: 1,
    defendingModels: 10,
    conditions: {
      ...baseConditions,
      targetIsAfflicted: true,
    },
    activeModifierRules: [
      {
        type: "REROLL_HITS",
        attackType: "ranged",
        requiresTargetIsAfflicted: true,
      },
      {
        type: "REROLL_WOUNDS",
        attackType: "ranged",
        requiresTargetIsAfflicted: true,
      },
    ],
  });

  expect(afflictedTarget.expectedHits).toBeGreaterThan(baseline.expectedHits);
  expect(afflictedTarget.expectedDamage).toBeGreaterThan(baseline.expectedDamage);
});

it("improves critical hit output against targets in contagion range", () => {
  const weapon: Weapon = {
    id: "plague-bolter",
    name: "Plague Bolter",
    attacks: 4,
    skill: 3,
    strength: 4,
    ap: 0,
    damage: 1,
    type: "ranged",
    specialRules: [{ type: "SUSTAINED_HITS", value: 1, attackType: "ranged" }],
  };

  const baseline = calculateExpectedDamage({
    attacker,
    weapon,
    defender,
    attackingModels: 1,
    defendingModels: 10,
    conditions: baseConditions,
    activeModifierRules: [],
  });

  const withContagionCriticals = calculateExpectedDamage({
    attacker,
    weapon,
    defender,
    attackingModels: 1,
    defendingModels: 10,
    conditions: {
      ...baseConditions,
      targetWithinContagionRange: true,
    },
    activeModifierRules: [
      {
        type: "CRITICAL_HITS_ON",
        value: 5,
        requiresTargetWithinContagionRange: true,
      },
    ],
  });

  expect(withContagionCriticals.criticalHits).toBeGreaterThan(
    baseline.criticalHits
  );
  expect(withContagionCriticals.expectedHits).toBeGreaterThan(
    baseline.expectedHits
  );
});

it("improves ranged output for targets caught in the opponent deployment zone", () => {
  const weapon: Weapon = {
    id: "mortarion-hammer-battery",
    name: "Mortarion Hammer Battery",
    attacks: 3,
    skill: 4,
    strength: 8,
    ap: -2,
    damage: 2,
    type: "ranged",
    specialRules: [],
  };

  const baseline = calculateExpectedDamage({
    attacker,
    weapon,
    defender,
    attackingModels: 1,
    defendingModels: 10,
    conditions: baseConditions,
    activeModifierRules: [],
  });

  const withDeploymentZoneRerolls = calculateExpectedDamage({
    attacker,
    weapon,
    defender,
    attackingModels: 1,
    defendingModels: 10,
    conditions: {
      ...baseConditions,
      targetInOpponentDeploymentZone: true,
    },
    activeModifierRules: [
      {
        type: "REROLL_HITS",
        attackType: "ranged",
        requiresTargetInOpponentDeploymentZone: true,
      },
    ],
  });

  expect(withDeploymentZoneRerolls.expectedHits).toBeGreaterThan(
    baseline.expectedHits
  );
  expect(withDeploymentZoneRerolls.expectedDamage).toBeGreaterThan(
    baseline.expectedDamage
  );
});

it("applies weapon-specific damage bonuses only to the matching profile", () => {
  const plagueWind: Weapon = {
    id: "plague-wind",
    name: "Plague Wind",
    attacks: 2,
    skill: 3,
    strength: 5,
    ap: -1,
    damage: 2,
    type: "ranged",
    specialRules: [],
  };

  const rotwind: Weapon = {
    ...plagueWind,
    id: "rotwind",
    name: "Rotwind",
  };

  const modifiers = [
    {
      type: "DAMAGE_MODIFIER" as const,
      value: 1,
      attackType: "ranged" as const,
      requiresWeaponNameIncludes: ["plague wind"],
    },
  ];

  const plagueWindResult = calculateExpectedDamage({
    attacker,
    weapon: plagueWind,
    defender,
    attackingModels: 1,
    defendingModels: 10,
    conditions: baseConditions,
    activeModifierRules: modifiers,
  });

  const rotwindResult = calculateExpectedDamage({
    attacker,
    weapon: rotwind,
    defender,
    attackingModels: 1,
    defendingModels: 10,
    conditions: baseConditions,
    activeModifierRules: modifiers,
  });

  expect(plagueWindResult.damagePerFailedSave).toBe(3);
  expect(rotwindResult.damagePerFailedSave).toBe(2);
  expect(plagueWindResult.expectedDamage).toBeGreaterThan(
    rotwindResult.expectedDamage
  );
});

it("applies attacker unit special rules in the combat engine", () => {
  const meleeWeapon: Weapon = {
    id: "plague-scythe",
    name: "Plague Scythe",
    attacks: 4,
    skill: 3,
    strength: 6,
    ap: -2,
    damage: 2,
    type: "melee",
    specialRules: [],
  };

  const toughDefender: Unit = {
    ...defender,
    toughness: 8,
  };

  const baseline = calculateExpectedDamage({
    attacker,
    weapon: meleeWeapon,
    defender: toughDefender,
    attackingModels: 1,
    defendingModels: 10,
    conditions: {
      ...baseConditions,
      isChargeTurn: true,
    },
    activeModifierRules: [],
  });

  const withAttackerRule = calculateExpectedDamage({
    attacker: {
      ...attacker,
      specialRules: [{ type: "LANCE", attackType: "melee" }],
    },
    weapon: meleeWeapon,
    defender: toughDefender,
    attackingModels: 1,
    defendingModels: 10,
    conditions: {
      ...baseConditions,
      isChargeTurn: true,
    },
    activeModifierRules: [],
  });

  expect(baseline.woundTarget).toBe(5);
  expect(withAttackerRule.woundTarget).toBe(4);
  expect(withAttackerRule.expectedDamage).toBeGreaterThan(
    baseline.expectedDamage
  );
});

it("applies Tallyband Summoners hit rerolls only when the target is tied down by Plague Legions", () => {
  const meleeWeapon: Weapon = {
    id: "plague-knife",
    name: "Plague Knife",
    attacks: 4,
    skill: 4,
    strength: 5,
    ap: -1,
    damage: 1,
    type: "melee",
    specialRules: [],
  };

  const noSupport = calculateExpectedDamage({
    attacker,
    weapon: meleeWeapon,
    defender,
    attackingModels: 1,
    defendingModels: 10,
    conditions: baseConditions,
    activeModifierRules: [
      {
        type: "REROLL_HITS",
        attackType: "melee",
        requiresTargetWithinPlagueLegionsEngagementRange: true,
      },
    ],
  });

  const withSupport = calculateExpectedDamage({
    attacker,
    weapon: meleeWeapon,
    defender,
    attackingModels: 1,
    defendingModels: 10,
    conditions: {
      ...baseConditions,
      targetWithinPlagueLegionsEngagementRange: true,
    },
    activeModifierRules: [
      {
        type: "REROLL_HITS",
        attackType: "melee",
        requiresTargetWithinPlagueLegionsEngagementRange: true,
      },
    ],
  });

  expect(withSupport.expectedHits).toBeGreaterThan(noSupport.expectedHits);
  expect(withSupport.expectedDamage).toBeGreaterThan(noSupport.expectedDamage);
});
