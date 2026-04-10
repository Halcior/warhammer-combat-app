import { describe, expect, it } from "vitest";
import type { AttackConditions, SpecialRule, Unit, Weapon } from "../../../types/combat";
import {
  filterActiveRules,
  getHitRerollMode,
  getWoundRerollMode,
} from "../ruleApplicability";

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
  defenderWithinAuxiliaryStealthRange: false,
  targetWithinAuxiliarySupportRange: false,
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
  keywords: ["CHARACTER", "ANATHEMA PSYKANA", "CANOPTEK", "DESTROYER CULT"],
};

const defender: Unit = {
  id: "defender",
  name: "Defender",
  faction: "Test",
  toughness: 4,
  save: 3,
  woundsPerModel: 2,
  weapons: [],
  keywords: ["PSYKER"],
};

const weapon: Weapon = {
  id: "blade",
  name: "Blade",
  attacks: 5,
  skill: 2,
  strength: 6,
  ap: -2,
  damage: 2,
  type: "melee",
  specialRules: [],
};

describe("ruleApplicability", () => {
  it("filters rules using attack type, keywords and condition flags", () => {
    const rules: SpecialRule[] = [
      {
        type: "REROLL_HITS",
        attackType: "melee",
        requiredAttackerKeywords: ["CHARACTER"],
      },
      {
        type: "REROLL_WOUNDS",
        attackType: "melee",
        requiredDefenderKeywords: ["PSYKER"],
        requiresTargetBattleShocked: true,
      },
      {
        type: "HIT_MODIFIER",
        value: 1,
        attackType: "ranged",
      },
      {
        type: "REROLL_HITS_ONES",
        excludedAttackerKeywords: ["VEHICLE"],
      },
      {
        type: "STRENGTH_MODIFIER",
        value: 1,
        attackType: "melee",
        requiresAttackerWithinAuxiliarySupportRange: true,
      },
      {
        type: "IGNORES_COVER",
        requiresTargetWithinObjectiveRange: true,
      },
      {
        type: "AP_MODIFIER",
        value: 1,
        attackType: "ranged",
        requiresTargetWithinAuxiliarySupportRange: true,
      },
      {
        type: "REROLL_WOUNDS_ONES",
        requiresHalfRange: true,
        requiresAttachedUnit: true,
      },
      {
        type: "AP_MODIFIER",
        value: 1,
        attackType: "melee",
        requiresChargeTurn: true,
      },
      {
        type: "REROLL_HITS",
        requiredAttackerKeywords: ["CANOPTEK"],
        requiresAttackerWithinPowerMatrix: true,
      },
      {
        type: "AP_MODIFIER",
        value: 1,
        attackType: "ranged",
        requiredAttackerKeywords: ["DESTROYER CULT"],
        requiresTargetIsClosestEligible: true,
      },
      {
        type: "REROLL_HITS",
        requiresAttackerSetUpThisTurn: true,
      },
      {
        type: "FIXED_HIT_ROLL",
        value: 5,
        requiresAttackerFiringOverwatch: true,
        requiresTargetOppositeHatchway: true,
      },
      {
        type: "IGNORE_HIT_MODIFIERS",
        attackType: "melee",
        requiresAttackerGuided: true,
        requiresTargetSpotted: true,
        requiresBattleRoundAtLeast: 3,
      },
      {
        type: "LETHAL_HITS",
        attackType: "ranged",
        requiresAttackerGuided: true,
        requiresBattleRoundAtMost: 3,
      },
      {
        type: "SUSTAINED_HITS",
        value: 2,
        requiresAttackerSetToDefend: true,
      },
      {
        type: "AP_MODIFIER",
        value: 1,
        requiresTargetUnravelling: true,
      },
      {
        type: "CRITICAL_WOUND_AP_MODIFIER",
        value: 1,
        requiresAttackWithinObjectiveRange: true,
      },
      {
        type: "DAMAGE_MODIFIER",
        value: 1,
        attackType: "melee",
        requiresAttackerIsVesselOfWrath: true,
      },
      {
        type: "STRENGTH_MODIFIER",
        value: 1,
        attackType: "melee",
        requiresAttackerWithinFriendlyCharacterRange: true,
      },
      {
        type: "HIT_MODIFIER",
        value: 1,
        requiredAttackerKeywords: ["JAKHALS", "GOREMONGERS"],
        requiresAttackerWithinFriendlyMonsterAura: true,
      },
      {
        type: "AP_MODIFIER",
        value: 1,
        attackType: "melee",
        requiresTargetModelCountAtLeast: 10,
        requiresTargetWithinRange: 12,
        requiresTargetSpotted: true,
      },
      {
        type: "WOUND_MODIFIER",
        value: -1,
        requiresAttackStrengthGreaterThanTargetToughness: true,
      },
    ];

    const activeRules = filterActiveRules(rules, {
      attacker,
      defender,
      weapon,
      conditions: {
        ...baseConditions,
        attackWithinObjectiveRange: true,
        attackerDisembarkedThisTurn: true,
        attackerIsFiringOverwatch: true,
        attackerIsGuided: true,
        attackerIsVesselOfWrath: true,
        attackerWithinAuxiliarySupportRange: true,
        attackerWithinFriendlyCharacterRange: true,
        attackerWithinFriendlyMonsterAura: true,
        isHalfRange: true,
        isChargeTurn: true,
        isAttachedUnit: true,
        battleRound: 3,
        targetDistanceInches: 9,
        targetWithinAuxiliarySupportRange: true,
        attackerWithinPowerMatrix: true,
        attackerSetUpThisTurn: true,
        attackerSetToDefend: true,
        targetIsClosestEligible: true,
        targetOppositeHatchway: true,
        targetIsSpotted: true,
        targetIsUnravelling: true,
        targetWithinObjectiveRange: true,
        targetIsBattleShocked: true,
      },
    });

    expect(activeRules).toHaveLength(18);
    expect(activeRules.map((rule) => rule.type)).toEqual([
      "REROLL_HITS",
      "REROLL_WOUNDS",
      "REROLL_HITS_ONES",
      "STRENGTH_MODIFIER",
      "IGNORES_COVER",
      "REROLL_WOUNDS_ONES",
      "AP_MODIFIER",
      "REROLL_HITS",
      "REROLL_HITS",
      "FIXED_HIT_ROLL",
      "IGNORE_HIT_MODIFIERS",
      "SUSTAINED_HITS",
      "AP_MODIFIER",
      "CRITICAL_WOUND_AP_MODIFIER",
      "DAMAGE_MODIFIER",
      "STRENGTH_MODIFIER",
      "AP_MODIFIER",
      "WOUND_MODIFIER",
    ]);
  });

  it("rejects charge, vessel and character-range rules when state checks fail", () => {
    const rules: SpecialRule[] = [
      {
        type: "AP_MODIFIER",
        value: 1,
        requiresChargeTurn: true,
      },
      {
        type: "DAMAGE_MODIFIER",
        value: 1,
        requiresAttackerIsVesselOfWrath: true,
      },
      {
        type: "STRENGTH_MODIFIER",
        value: 1,
        requiresAttackerWithinFriendlyCharacterRange: true,
      },
      {
        type: "HIT_MODIFIER",
        value: 1,
        requiresAttackerWithinFriendlyMonsterAura: true,
      },
    ];

    const activeRules = filterActiveRules(rules, {
      attacker,
      defender,
      weapon,
      conditions: baseConditions,
    });

    expect(activeRules).toEqual([]);
  });

  it("respects Auxiliary Cadre stealth screening conditions", () => {
    const rules: SpecialRule[] = [
      {
        type: "TARGETING_RANGE_LIMIT",
        value: 18,
        attackType: "ranged",
        requiredDefenderKeywords: ["KROOT", "VESPID STINGWINGS"],
        requiresDefenderWithinAuxiliaryStealthRange: true,
      },
    ];

    const rangedWeapon: Weapon = {
      ...weapon,
      type: "ranged",
    };

    const krootDefender: Unit = {
      ...defender,
      keywords: ["KROOT"],
    };

    const inactiveRules = filterActiveRules(rules, {
      attacker,
      defender: krootDefender,
      weapon: rangedWeapon,
      conditions: baseConditions,
    });

    const activeRules = filterActiveRules(rules, {
      attacker,
      defender: krootDefender,
      weapon: rangedWeapon,
      conditions: {
        ...baseConditions,
        defenderWithinAuxiliaryStealthRange: true,
      },
    });

    expect(inactiveRules).toEqual([]);
    expect(activeRules).toHaveLength(1);
    expect(activeRules[0].type).toBe("TARGETING_RANGE_LIMIT");
  });

  it("applies Kroot Raiding Party overwatch denial only during Overwatch", () => {
    const rules: SpecialRule[] = [
      {
        type: "TARGETING_RANGE_LIMIT",
        value: 0,
        attackType: "ranged",
        requiredDefenderKeywords: ["KROOT"],
        requiresAttackerFiringOverwatch: true,
      },
    ];

    const rangedWeapon: Weapon = {
      ...weapon,
      type: "ranged",
    };

    const krootDefender: Unit = {
      ...defender,
      keywords: ["KROOT"],
    };

    const outsideOverwatch = filterActiveRules(rules, {
      attacker,
      defender: krootDefender,
      weapon: rangedWeapon,
      conditions: baseConditions,
    });

    const duringOverwatch = filterActiveRules(rules, {
      attacker,
      defender: krootDefender,
      weapon: rangedWeapon,
      conditions: {
        ...baseConditions,
        attackerIsFiringOverwatch: true,
      },
    });

    expect(outsideOverwatch).toEqual([]);
    expect(duringOverwatch).toHaveLength(1);
  });

  it("applies attacker-side auxiliary support conditions only when enabled", () => {
    const rules: SpecialRule[] = [
      {
        type: "STRENGTH_MODIFIER",
        value: 1,
        attackType: "ranged",
        requiresAttackerWithinAuxiliarySupportRange: true,
      },
    ];

    const rangedWeapon: Weapon = {
      ...weapon,
      type: "ranged",
    };

    const withoutSupport = filterActiveRules(rules, {
      attacker,
      defender,
      weapon: rangedWeapon,
      conditions: baseConditions,
    });

    const withSupport = filterActiveRules(rules, {
      attacker,
      defender,
      weapon: rangedWeapon,
      conditions: {
        ...baseConditions,
        attackerWithinAuxiliarySupportRange: true,
      },
    });

    expect(withoutSupport).toEqual([]);
    expect(withSupport).toHaveLength(1);
    expect(withSupport[0].type).toBe("STRENGTH_MODIFIER");
  });

  it("derives reroll modes from the active rule set", () => {
    const rules: SpecialRule[] = [
      { type: "REROLL_HITS_ONES" },
      { type: "REROLL_HITS" },
      { type: "TWIN_LINKED" },
    ];

    expect(getHitRerollMode(rules)).toBe("full");
    expect(getWoundRerollMode(rules)).toBe("full");
  });
});
 
describe("ruleApplicability negative cases", () => {
  it("rejects rules when exclusion keywords or state checks fail", () => {
    const rules: SpecialRule[] = [
      {
        type: "REROLL_HITS_ONES",
        requiredAttackerKeywords: ["VEHICLE"],
      },
      {
        type: "REROLL_WOUNDS_ONES",
        requiresAttackerBelowHalfStrength: true,
      },
      {
        type: "HIT_MODIFIER",
        value: 1,
        excludedAttackerKeywords: ["CHARACTER"],
      },
    ];

    const activeRules = filterActiveRules(rules, {
      attacker,
      defender,
      weapon,
      conditions: baseConditions,
    });

    expect(activeRules).toEqual([]);
  });
});
