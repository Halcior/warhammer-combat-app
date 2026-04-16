import type { RuleOption } from "../../../types/faction";

/**
 * Orks army-wide rule options for the combat calculator.
 *
 * Waaagh! is the most direct calculator-relevant part of the army rule for
 * first public support: when it is active, Ork units get extra melee output.
 * We model it as a manual toggle so players can turn it on only in the round
 * where Waaagh! has actually been declared.
 */
export const orksArmyRules: RuleOption[] = [
  {
    id: "orks-waaagh",
    name: "Waaagh!",
    displayLabel: "Waaagh! (declared)",
    description:
      "Waaagh! has been called. Ork units get +1 Attack in melee this battle round.",
    modifiers: [{ type: "ATTACKS_MODIFIER", value: 1, attackType: "melee" }],
    appliesTo: "attacker",
    combatRole: "attacker",
    phase: "fight",
    isToggle: true,
    supportLevel: "implemented",
    engineTags: ["waaagh", "attacks-modifier-melee"],
  },
];
