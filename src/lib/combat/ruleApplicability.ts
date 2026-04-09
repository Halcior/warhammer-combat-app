import type {
  AttackConditions,
  SpecialRule,
  Unit,
  Weapon,
} from "../../types/combat";

export type CombatRuleContext = {
  attacker: Unit;
  defender: Unit;
  weapon: Weapon;
  conditions: AttackConditions;
};

export type RerollMode = "none" | "ones" | "full";

export function filterActiveRules(
  rules: SpecialRule[],
  context: CombatRuleContext
): SpecialRule[] {
  return rules.filter((rule) => ruleApplies(rule, context));
}

export function ruleApplies(
  rule: SpecialRule,
  context: CombatRuleContext
): boolean {
  if ("attackType" in rule && rule.attackType && rule.attackType !== context.weapon.type) {
    return false;
  }

  if (
    "requiresAttackerDisembarkedThisTurn" in rule &&
    rule.requiresAttackerDisembarkedThisTurn &&
    !context.conditions.attackerDisembarkedThisTurn
  ) {
    return false;
  }

  if (
    "requiresAttackerFiringOverwatch" in rule &&
    rule.requiresAttackerFiringOverwatch &&
    !context.conditions.attackerIsFiringOverwatch
  ) {
    return false;
  }

  if (
    "requiresAttackerIsVesselOfWrath" in rule &&
    rule.requiresAttackerIsVesselOfWrath &&
    !context.conditions.attackerIsVesselOfWrath
  ) {
    return false;
  }

  if (
    "requiresAttackerWithinFriendlyCharacterRange" in rule &&
    rule.requiresAttackerWithinFriendlyCharacterRange &&
    !context.conditions.attackerWithinFriendlyCharacterRange
  ) {
    return false;
  }

  if (
    "requiresAttackerGuided" in rule &&
    rule.requiresAttackerGuided &&
    !context.conditions.attackerIsGuided
  ) {
    return false;
  }

  if (
    "requiresAttackWithinObjectiveRange" in rule &&
    rule.requiresAttackWithinObjectiveRange &&
    !context.conditions.attackWithinObjectiveRange
  ) {
    return false;
  }

  if (
    "requiresHalfRange" in rule &&
    rule.requiresHalfRange &&
    !context.conditions.isHalfRange
  ) {
    return false;
  }

  if (
    "requiresChargeTurn" in rule &&
    rule.requiresChargeTurn &&
    !context.conditions.isChargeTurn
  ) {
    return false;
  }

  if (
    "requiresAttachedUnit" in rule &&
    rule.requiresAttachedUnit &&
    !context.conditions.isAttachedUnit
  ) {
    return false;
  }

  if (
    "requiresAttackerWithinPowerMatrix" in rule &&
    rule.requiresAttackerWithinPowerMatrix &&
    !context.conditions.attackerWithinPowerMatrix
  ) {
    return false;
  }

  if (
    "requiresAttackerSetUpThisTurn" in rule &&
    rule.requiresAttackerSetUpThisTurn &&
    !context.conditions.attackerSetUpThisTurn
  ) {
    return false;
  }

  if (
    "requiresAttackerSetToDefend" in rule &&
    rule.requiresAttackerSetToDefend &&
    !context.conditions.attackerSetToDefend
  ) {
    return false;
  }

  if (
    "requiresBattleRoundAtLeast" in rule &&
    typeof rule.requiresBattleRoundAtLeast === "number" &&
    context.conditions.battleRound < rule.requiresBattleRoundAtLeast
  ) {
    return false;
  }

  if (
    "requiresBattleRoundAtMost" in rule &&
    typeof rule.requiresBattleRoundAtMost === "number" &&
    context.conditions.battleRound > rule.requiresBattleRoundAtMost
  ) {
    return false;
  }

  if (
    "requiresTargetIsClosestEligible" in rule &&
    rule.requiresTargetIsClosestEligible &&
    !context.conditions.targetIsClosestEligible
  ) {
    return false;
  }

  if (
    "requiresTargetModelCountAtLeast" in rule &&
    typeof rule.requiresTargetModelCountAtLeast === "number" &&
    context.conditions.targetModelCount < rule.requiresTargetModelCountAtLeast
  ) {
    return false;
  }

  if (
    "requiresTargetOppositeHatchway" in rule &&
    rule.requiresTargetOppositeHatchway &&
    !context.conditions.targetOppositeHatchway
  ) {
    return false;
  }

  if (
    "requiresTargetSpotted" in rule &&
    rule.requiresTargetSpotted &&
    !context.conditions.targetIsSpotted
  ) {
    return false;
  }

  if (
    "requiresTargetUnravelling" in rule &&
    rule.requiresTargetUnravelling &&
    !context.conditions.targetIsUnravelling
  ) {
    return false;
  }

  if (
    "requiresTargetWithinRange" in rule &&
    typeof rule.requiresTargetWithinRange === "number" &&
    context.conditions.targetDistanceInches > rule.requiresTargetWithinRange
  ) {
    return false;
  }

  if (
    "requiresTargetWithinObjectiveRange" in rule &&
    rule.requiresTargetWithinObjectiveRange &&
    !context.conditions.targetWithinObjectiveRange
  ) {
    return false;
  }

  if (
    "requiredAttackerKeywords" in rule &&
    rule.requiredAttackerKeywords &&
    !hasAnyKeyword(context.attacker.keywords, rule.requiredAttackerKeywords)
  ) {
    return false;
  }

  if (
    "requiredDefenderKeywords" in rule &&
    rule.requiredDefenderKeywords &&
    !hasAnyKeyword(context.defender.keywords, rule.requiredDefenderKeywords)
  ) {
    return false;
  }

  if (
    "excludedAttackerKeywords" in rule &&
    rule.excludedAttackerKeywords &&
    hasAnyKeyword(context.attacker.keywords, rule.excludedAttackerKeywords)
  ) {
    return false;
  }

  if (
    "excludedDefenderKeywords" in rule &&
    rule.excludedDefenderKeywords &&
    hasAnyKeyword(context.defender.keywords, rule.excludedDefenderKeywords)
  ) {
    return false;
  }

  if (
    "requiresTargetBattleShocked" in rule &&
    rule.requiresTargetBattleShocked &&
    !context.conditions.targetIsBattleShocked
  ) {
    return false;
  }

  if (
    "requiresTargetBelowStartingStrength" in rule &&
    rule.requiresTargetBelowStartingStrength &&
    !context.conditions.targetBelowStartingStrength
  ) {
    return false;
  }

  if (
    "requiresTargetBelowHalfStrength" in rule &&
    rule.requiresTargetBelowHalfStrength &&
    !context.conditions.targetBelowHalfStrength
  ) {
    return false;
  }

  if (
    "requiresAttackerBelowStartingStrength" in rule &&
    rule.requiresAttackerBelowStartingStrength &&
    !context.conditions.attackerBelowStartingStrength
  ) {
    return false;
  }

  if (
    "requiresAttackerBelowHalfStrength" in rule &&
    rule.requiresAttackerBelowHalfStrength &&
    !context.conditions.attackerBelowHalfStrength
  ) {
    return false;
  }

  if (
    "requiresAttackerIsolated" in rule &&
    rule.requiresAttackerIsolated &&
    !context.conditions.attackerIsIsolated
  ) {
    return false;
  }

  return true;
}

export function getHitRerollMode(rules: SpecialRule[]): RerollMode {
  if (rules.some((rule) => rule.type === "REROLL_HITS")) return "full";
  if (rules.some((rule) => rule.type === "REROLL_HITS_ONES")) return "ones";
  return "none";
}

export function getWoundRerollMode(rules: SpecialRule[]): RerollMode {
  if (
    rules.some(
      (rule) => rule.type === "REROLL_WOUNDS" || rule.type === "TWIN_LINKED"
    )
  ) {
    return "full";
  }

  if (rules.some((rule) => rule.type === "REROLL_WOUNDS_ONES")) return "ones";
  return "none";
}

function hasAnyKeyword(
  unitKeywords: string[] | undefined,
  requiredKeywords: string[]
): boolean {
  if (!unitKeywords || requiredKeywords.length === 0) return false;

  const normalizedUnitKeywords = unitKeywords.map(normalizeKeyword);

  return requiredKeywords
    .map(normalizeKeyword)
    .some((keyword) => normalizedUnitKeywords.includes(keyword));
}

function normalizeKeyword(keyword: string): string {
  return keyword.trim().toUpperCase();
}
