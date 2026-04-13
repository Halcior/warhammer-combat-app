export type DiceValue = number | string;

export type WeaponType = "melee" | "ranged";

export type ConditionalRuleFields = {
  attackType?: WeaponType;
  limitsTargetingRangeTo?: number;
  requiresAttackWithinObjectiveRange?: boolean;
  requiresAttackerWithinObjectiveRange?: boolean;
  requiresAttackerWithinAuxiliarySupportRange?: boolean;
  requiresDefenderWithinFriendlyVehicleSupportRange?: boolean;
  requiresDefenderWithinAuxiliaryStealthRange?: boolean;
  requiresTargetWithinAuxiliarySupportRange?: boolean;
  requiresAttackerDisembarkedThisTurn?: boolean;
  requiresAttackerFiringOverwatch?: boolean;
  requiresAttackerIsAfflicted?: boolean;
  requiresAttackerIsVesselOfWrath?: boolean;
  requiresAttackerWithinFriendlyCharacterRange?: boolean;
  requiresAttackerWithinFriendlyMonsterAura?: boolean;
  requiresChargeTurn?: boolean;
  requiresHalfRange?: boolean;
  requiresAttachedUnit?: boolean;
  requiresAttackerGuided?: boolean;
  requiresAttackerWithinPowerMatrix?: boolean;
  requiresAttackerSetUpThisTurn?: boolean;
  requiresAttackerSetToDefend?: boolean;
  requiresBattleRoundAtLeast?: number;
  requiresBattleRoundAtMost?: number;
  requiresWeaponNameIncludes?: string[];
  requiresTargetIsClosestEligible?: boolean;
  requiresTargetWithinPlagueLegionsEngagementRange?: boolean;
  requiresTargetModelCountAtLeast?: number;
  requiresTargetOppositeHatchway?: boolean;
  requiresTargetIsAfflicted?: boolean;
  requiresTargetWithinContagionRange?: boolean;
  requiresTargetInOpponentDeploymentZone?: boolean;
  requiresTargetSpotted?: boolean;
  requiresTargetUnravelling?: boolean;
  requiresTargetWithinRange?: number;
  requiresTargetWithinObjectiveRange?: boolean;
  requiresAttackStrengthGreaterThanTargetToughness?: boolean;
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
  | ({ type: "HEAVY" } & ConditionalRuleFields)
  | ({ type: "HAZARDOUS" } & ConditionalRuleFields)
  | ({ type: "SUSTAINED_HITS"; value: number } & ConditionalRuleFields)
  | { type: "EXTRA_ATTACKS" }
  | ({ type: "DEVASTATING_WOUNDS" } & ConditionalRuleFields)
  | { type: "ANTI"; keyword: string; value: number }
  | ({ type: "SET_SAVE_CHARACTERISTIC"; value: number } & ConditionalRuleFields)
  | ({ type: "INVULNERABLE_SAVE"; value: number } & ConditionalRuleFields)
  | ({ type: "FEEL_NO_PAIN"; value: number } & ConditionalRuleFields)
  | ({ type: "DAMAGE_REDUCTION"; value: number } & ConditionalRuleFields)
  | ({ type: "TARGETING_RANGE_LIMIT"; value: number } & ConditionalRuleFields)
  | ({ type: "REROLL_HITS" } & ConditionalRuleFields)
  | ({ type: "REROLL_HITS_ONES" } & ConditionalRuleFields)
  | ({ type: "REROLL_ATTACKS" } & ConditionalRuleFields)
  | ({ type: "REROLL_WOUNDS" } & ConditionalRuleFields)
  | ({ type: "REROLL_WOUNDS_ONES" } & ConditionalRuleFields)
  | ({ type: "FIXED_HIT_ROLL"; value: number } & ConditionalRuleFields)
  | ({ type: "IGNORE_HIT_MODIFIERS" } & ConditionalRuleFields)
  | ({ type: "HIT_MODIFIER"; value: number } & ConditionalRuleFields)
  | ({ type: "ATTACKS_MODIFIER"; value: number } & ConditionalRuleFields)
  | ({ type: "CRITICAL_WOUND_AP_MODIFIER"; value: number } & ConditionalRuleFields)
  | ({ type: "CRITICAL_HITS_ON"; value: number } & ConditionalRuleFields)
  | ({ type: "AP_MODIFIER"; value: number } & ConditionalRuleFields)
  | ({ type: "STRENGTH_MODIFIER"; value: number } & ConditionalRuleFields)
  | ({ type: "TOUGHNESS_MODIFIER"; value: number } & ConditionalRuleFields)
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

export type UnitAbility = {
  id: string;
  name: string;
  description?: string;
  modifiers: SpecialRule[];
  supportLevel?: "implemented" | "planned" | "info-only";
  selectionGroup?: string;
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
  abilities?: UnitAbility[];
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
  attackerWithinAuxiliarySupportRange: boolean;
  defenderWithinFriendlyVehicleSupportRange: boolean;
  defenderWithinAuxiliaryStealthRange: boolean;
  targetWithinAuxiliarySupportRange: boolean;
  targetModelCount: number;
  targetHasMatchingAntiKeyword: boolean;
  isChargeTurn: boolean;
  isAttachedUnit: boolean;
  attackWithinObjectiveRange: boolean;
  attackerWithinObjectiveRange: boolean;
  attackerDisembarkedThisTurn: boolean;
  attackerIsFiringOverwatch: boolean;
  attackerIsAfflicted: boolean;
  attackerIsGuided: boolean;
  attackerIsVesselOfWrath: boolean;
  attackerWithinFriendlyCharacterRange: boolean;
  attackerWithinFriendlyMonsterAura: boolean;
  attackerWithinPowerMatrix: boolean;
  attackerSetUpThisTurn: boolean;
  attackerSetToDefend: boolean;
  targetIsClosestEligible: boolean;
  targetWithinPlagueLegionsEngagementRange: boolean;
  targetIsAfflicted: boolean;
  targetWithinContagionRange: boolean;
  targetInOpponentDeploymentZone: boolean;
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
