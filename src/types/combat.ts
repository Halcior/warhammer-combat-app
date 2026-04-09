export type DiceValue = number | string;

export type WeaponType = "melee" | "ranged";

export type ConditionalRuleFields = {
  attackType?: WeaponType;
  requiresAttackWithinObjectiveRange?: boolean;
  requiresAttackerDisembarkedThisTurn?: boolean;
  requiresAttackerFiringOverwatch?: boolean;
  requiresAttackerIsVesselOfWrath?: boolean;
  requiresAttackerWithinFriendlyCharacterRange?: boolean;
  requiresChargeTurn?: boolean;
  requiresHalfRange?: boolean;
  requiresAttachedUnit?: boolean;
  requiresAttackerGuided?: boolean;
  requiresAttackerWithinPowerMatrix?: boolean;
  requiresAttackerSetUpThisTurn?: boolean;
  requiresAttackerSetToDefend?: boolean;
  requiresBattleRoundAtLeast?: number;
  requiresBattleRoundAtMost?: number;
  requiresTargetIsClosestEligible?: boolean;
  requiresTargetModelCountAtLeast?: number;
  requiresTargetOppositeHatchway?: boolean;
  requiresTargetSpotted?: boolean;
  requiresTargetUnravelling?: boolean;
  requiresTargetWithinRange?: number;
  requiresTargetWithinObjectiveRange?: boolean;
  requiredAttackerKeywords?: string[];
  requiredDefenderKeywords?: string[];
  excludedAttackerKeywords?: string[];
  excludedDefenderKeywords?: string[];
  requiresTargetBattleShocked?: boolean;
  requiresTargetBelowStartingStrength?: boolean;
  requiresTargetBelowHalfStrength?: boolean;
  requiresAttackerBelowStartingStrength?: boolean;
  requiresAttackerBelowHalfStrength?: boolean;
  requiresAttackerIsolated?: boolean;
};

export type SpecialRule =
  | ({ type: "ASSAULT" } & ConditionalRuleFields)
  | { type: "PISTOL" }
  | { type: "RAPID_FIRE"; value: number }
  | ({ type: "IGNORES_COVER" } & ConditionalRuleFields)
  | { type: "TWIN_LINKED" }
  | { type: "TORRENT" }
  | ({ type: "LETHAL_HITS" } & ConditionalRuleFields)
  | ({ type: "LANCE" } & ConditionalRuleFields)
  | { type: "INDIRECT_FIRE" }
  | { type: "PRECISION" }
  | { type: "BLAST" }
  | ({ type: "MELTA"; value: number } & ConditionalRuleFields)
  | { type: "HEAVY" }
  | ({ type: "HAZARDOUS" } & ConditionalRuleFields)
  | ({ type: "SUSTAINED_HITS"; value: number } & ConditionalRuleFields)
  | { type: "EXTRA_ATTACKS" }
  | ({ type: "DEVASTATING_WOUNDS" } & ConditionalRuleFields)
  | { type: "ANTI"; keyword: string; value: number }
  | { type: "FEEL_NO_PAIN"; value: number }
  | { type: "DAMAGE_REDUCTION"; value: number }
  | ({ type: "REROLL_HITS" } & ConditionalRuleFields)
  | ({ type: "REROLL_HITS_ONES" } & ConditionalRuleFields)
  | ({ type: "REROLL_ATTACKS" } & ConditionalRuleFields)
  | ({ type: "REROLL_WOUNDS" } & ConditionalRuleFields)
  | ({ type: "REROLL_WOUNDS_ONES" } & ConditionalRuleFields)
  | ({ type: "FIXED_HIT_ROLL"; value: number } & ConditionalRuleFields)
  | ({ type: "HIT_MODIFIER"; value: number } & ConditionalRuleFields)
  | ({ type: "ATTACKS_MODIFIER"; value: number } & ConditionalRuleFields)
  | ({ type: "CRITICAL_WOUND_AP_MODIFIER"; value: number } & ConditionalRuleFields)
  | ({ type: "CRITICAL_HITS_ON"; value: number } & ConditionalRuleFields)
  | ({ type: "AP_MODIFIER"; value: number } & ConditionalRuleFields)
  | ({ type: "STRENGTH_MODIFIER"; value: number } & ConditionalRuleFields)
  | ({ type: "DAMAGE_MODIFIER"; value: number } & ConditionalRuleFields)
  | ({
      type: "WOUND_MODIFIER";
      value: number;
      targetToughnessAtLeast?: number;
    } & ConditionalRuleFields);


export type Weapon = {
  id: string;
  name: string;
  attacks: DiceValue;
  skill: number;
  strength: number;
  ap: number;
  damage: DiceValue;
  type: WeaponType;
  specialRules?: SpecialRule[];
};

export type Unit = {
  id: string;
  name: string;
  faction: string;
  toughness: number;
  save: number;
  invulnerableSave?: number;
  woundsPerModel: number;
  weapons: Weapon[];
  specialRules?: SpecialRule[];
  keywords?: string[];
};

export type AttackConditions = {
  battleRound: number;
  isTargetInCover: boolean;
  isHalfRange: boolean;
  remainedStationary: boolean;
  advancedThisTurn: boolean;
  targetVisible: boolean;
  targetDistanceInches: number;
  targetInEngagementRange: boolean;
  targetModelCount: number;
  targetHasMatchingAntiKeyword: boolean;
  isChargeTurn: boolean;
  isAttachedUnit: boolean;
  attackWithinObjectiveRange: boolean;
  attackerDisembarkedThisTurn: boolean;
  attackerIsFiringOverwatch: boolean;
  attackerIsGuided: boolean;
  attackerIsVesselOfWrath: boolean;
  attackerWithinFriendlyCharacterRange: boolean;
  attackerWithinPowerMatrix: boolean;
  attackerSetUpThisTurn: boolean;
  attackerSetToDefend: boolean;
  targetIsClosestEligible: boolean;
  targetIsSpotted: boolean;
  targetOppositeHatchway: boolean;
  targetIsUnravelling: boolean;
  targetWithinObjectiveRange: boolean;
  targetIsBattleShocked: boolean;
  targetBelowStartingStrength: boolean;
  targetBelowHalfStrength: boolean;
  attackerBelowStartingStrength: boolean;
  attackerBelowHalfStrength: boolean;
  attackerIsIsolated: boolean;
};
