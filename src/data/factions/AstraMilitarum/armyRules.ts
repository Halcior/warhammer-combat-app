import type { RuleOption } from "../../../types/faction";

/**
 * Astra Militarum army-wide rule options for the combat calculator.
 *
 * We start with Born Soldiers because it has a stable, direct combat effect:
 * ranged attacks against non-MONSTER/non-VEHICLE visible targets gain
 * Lethal Hits. This makes the faction meaningfully testable without pretending
 * to cover the broader order / command infrastructure yet.
 */
export const astraMilitarumArmyRules: RuleOption[] = [
  {
    id: "am-born-soldiers",
    name: "Born Soldiers",
    displayLabel: "Born Soldiers",
    description:
      "The attacking Astra Militarum unit is benefiting from Born Soldiers. Ranged attacks against non-MONSTER, non-VEHICLE targets gain Lethal Hits.",
    modifiers: [
      {
        type: "LETHAL_HITS",
        attackType: "ranged",
        excludedDefenderKeywords: ["MONSTER", "VEHICLE"],
      },
    ],
    appliesTo: "attacker",
    combatRole: "attacker",
    phase: "shooting",
    isToggle: true,
    supportLevel: "implemented",
    engineTags: ["born-soldiers", "lethal-hits-ranged"],
  },
];
