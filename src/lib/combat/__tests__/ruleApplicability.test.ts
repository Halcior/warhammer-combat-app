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
  targetModelCount: 10,
  targetHasMatchingAntiKeyword: false,
  isChargeTurn: false,
  isAttachedUnit: false,
  attackWithinObjectiveRange: false,
  attackerIsGuided: false,
  attackerWithinPowerMatrix: false,
  attackerSetUpThisTurn: false,
  attackerSetToDefend: false,
  targetIsClosestEligible: false,
  targetIsSpotted: false,
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
        type: "IGNORES_COVER",
        requiresTargetWithinObjectiveRange: true,
      },
      {
        type: "REROLL_WOUNDS_ONES",
        requiresHalfRange: true,
        requiresAttachedUnit: true,
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
        type: "AP_MODIFIER",
        value: 1,
        attackType: "melee",
        requiresTargetModelCountAtLeast: 10,
        requiresTargetWithinRange: 12,
        requiresTargetSpotted: true,
      },
    ];

    const activeRules = filterActiveRules(rules, {
      attacker,
      defender,
      weapon,
      conditions: {
        ...baseConditions,
        attackWithinObjectiveRange: true,
        attackerIsGuided: true,
        isHalfRange: true,
        isAttachedUnit: true,
        battleRound: 3,
        targetDistanceInches: 9,
        attackerWithinPowerMatrix: true,
        attackerSetUpThisTurn: true,
        attackerSetToDefend: true,
        targetIsClosestEligible: true,
        targetIsSpotted: true,
        targetIsUnravelling: true,
        targetWithinObjectiveRange: true,
        targetIsBattleShocked: true,
      },
    });

    expect(activeRules).toHaveLength(13);
    expect(activeRules.map((rule) => rule.type)).toEqual([
      "REROLL_HITS",
      "REROLL_WOUNDS",
      "REROLL_HITS_ONES",
      "IGNORES_COVER",
      "REROLL_WOUNDS_ONES",
      "REROLL_HITS",
      "AP_MODIFIER",
      "REROLL_HITS",
      "LETHAL_HITS",
      "SUSTAINED_HITS",
      "AP_MODIFIER",
      "CRITICAL_WOUND_AP_MODIFIER",
      "AP_MODIFIER",
    ]);
  });

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
