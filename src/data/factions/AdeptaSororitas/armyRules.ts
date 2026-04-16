import type { RuleOption } from "../../../types/faction";

/**
 * Adepta Sororitas army-wide rules.
 *
 * Acts of Faith is based around Miracle dice substitutions earned over the
 * course of the battle. That economy is too variable for a fixed calculator
 * equivalent, so we surface it as informational support for now.
 */
export const adeptaSororitasArmyRules: RuleOption[] = [
  {
    id: "sororitas-acts-of-faith",
    name: "Acts of Faith",
    displayLabel: "Acts of Faith",
    description:
      "Miracle dice earned during the battle can substitute for future rolls. The value depends on current dice economy, so there is no fixed direct calculator effect yet.",
    modifiers: [],
    appliesTo: "attacker",
    combatRole: "attacker",
    phase: "any",
    isToggle: false,
    supportLevel: "info-only",
    engineTags: [],
  },
];
