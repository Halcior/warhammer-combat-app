import type { SpecialRule } from "../../types/combat";

/**
 * Rule types that are exclusively attacker-beneficial.
 *
 * These model things the ATTACKER does (rerolls, extra hits, special
 * hit/wound generation). They must never be applied via the defender
 * modifier list, because the engine is blind to rule origin — it reads
 * `REROLL_HITS` from the flat combined list and immediately boosts the
 * attacker's hit chance regardless of which side supplied it.
 */
export const ATTACKER_EXCLUSIVE_RULE_TYPES: ReadonlySet<SpecialRule["type"]> =
  new Set([
    "REROLL_HITS",
    "REROLL_HITS_ONES",
    "REROLL_ATTACKS",
    "REROLL_WOUNDS",
    "REROLL_WOUNDS_ONES",
    "TWIN_LINKED",         // reroll wounds on every hit
    "LETHAL_HITS",         // critical hits auto-wound
    "DEVASTATING_WOUNDS",  // critical wounds become mortals
    "SUSTAINED_HITS",      // critical hits generate extra hits
    "EXTRA_ATTACKS",       // +N attacks
    "TORRENT",             // auto-hit
    "FIXED_HIT_ROLL",      // fixes the attacker's hit roll target
    "IGNORE_HIT_MODIFIERS",
    "CRITICAL_HITS_ON",    // attacker crits on a lower roll
  ]);

/**
 * Rule types that are exclusively defender-beneficial.
 *
 * These model the defender's durability / damage mitigation.
 * They must never flow into the attacker modifier list — an accidental
 * FEEL_NO_PAIN in the attacker pool would still be picked up by
 * `getFeelNoPain(combinedRules)` and silently reduce the defender's damage
 * taken, but it would be untraceable and inconsistent with data intent.
 */
export const DEFENDER_EXCLUSIVE_RULE_TYPES: ReadonlySet<SpecialRule["type"]> =
  new Set([
    "FEEL_NO_PAIN",
    "DAMAGE_REDUCTION",
    "INVULNERABLE_SAVE",
    "SET_SAVE_CHARACTERISTIC",
  ]);

/**
 * Strip attacker-exclusive modifiers from a defender modifier list.
 *
 * Call this on every list that will be passed as `activeDefenderModifierRules`
 * to the combat engine. Rules classified as attacker-exclusive cannot have
 * any valid meaning when supplied from the defender side.
 */
export function guardDefenderModifiers(rules: SpecialRule[]): SpecialRule[] {
  return rules.filter((rule) => !ATTACKER_EXCLUSIVE_RULE_TYPES.has(rule.type));
}

/**
 * Strip defender-exclusive modifiers from an attacker modifier list.
 *
 * Call this on every list that will be passed as `activeModifierRules`
 * to the combat engine. Rules classified as defender-exclusive cannot have
 * any valid meaning when supplied from the attacker side.
 */
export function guardAttackerModifiers(rules: SpecialRule[]): SpecialRule[] {
  return rules.filter((rule) => !DEFENDER_EXCLUSIVE_RULE_TYPES.has(rule.type));
}
