import type { RuleOption } from "../../../types/faction";

/**
 * Aeldari army-wide rule options for the combat calculator.
 *
 * Strands of Fate: Before the battle, the Aeldari player rolls 9 dice and
 * banks the results to substitute for future dice rolls during the game.
 * This meta-game mechanic has no fixed calculator equivalent and is listed
 * as info-only.
 *
 * Battle Focus: After a unit shoots, it can make a Normal Move as if it were
 * the Movement phase. Movement mechanic — no calculator equivalent.
 */
export const aeldariArmyRules: RuleOption[] = [
  {
    id: "aeldari-strands-of-fate",
    name: "Strands of Fate",
    displayLabel: "Strands of Fate",
    description:
      "Before the battle, roll 9 dice and bank them to replace future dice rolls. Variable per game — toggle when a banked die is being used to re-roll a critical hit or wound roll for this attack.",
    modifiers: [],
    appliesTo: "attacker",
    combatRole: "attacker",
    phase: "any",
    isToggle: false,
    supportLevel: "info-only",
    engineTags: [],
  },
  {
    id: "aeldari-battle-focus",
    name: "Battle Focus",
    displayLabel: "Battle Focus",
    description:
      "After shooting, the unit can make a Normal Move. Movement mechanic — no combat calculator effect.",
    modifiers: [],
    appliesTo: "attacker",
    combatRole: "attacker",
    phase: "shooting",
    isToggle: false,
    supportLevel: "info-only",
    engineTags: [],
  },
];
