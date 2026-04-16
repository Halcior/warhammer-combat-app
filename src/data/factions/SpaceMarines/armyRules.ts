import type { RuleOption } from "../../../types/faction";

/**
 * Space Marines army-wide rule options for the combat calculator.
 *
 * Oath of Moment: At the start of each Command phase the Space Marines player
 * selects one enemy unit. Until the start of the next Command phase, all
 * friendly ADEPTUS ASTARTES attacks targeting that unit can re-roll Hit rolls
 * AND re-roll Wound rolls.
 *
 * Toggle this when the active target has the Oath of Moment selected against it.
 */
export const spaceMarinesArmyRules: RuleOption[] = [
  {
    id: "sm-oath-of-moment",
    name: "Oath of Moment",
    displayLabel: "Oath of Moment",
    description:
      "The target unit has been selected for Oath of Moment. All attacks from friendly ADEPTUS ASTARTES units against this target may re-roll Hit rolls and re-roll Wound rolls.",
    modifiers: [
      { type: "REROLL_HITS" },
      { type: "REROLL_WOUNDS" },
    ],
    appliesTo: "attacker",
    combatRole: "attacker",
    phase: "shooting",
    isToggle: true,
    supportLevel: "implemented",
    engineTags: ["oath-of-moment", "reroll-hits", "reroll-wounds"],
  },
];
