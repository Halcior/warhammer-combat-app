import type { RuleOption } from "../../../types/faction";

/**
 * Chaos Space Marines army-wide rule options for the combat calculator.
 *
 * Veterans of the Long War: Each time a CHAOS SPACE MARINES unit is selected
 * to fight, you can select one enemy unit within Engagement Range. Until the
 * end of the fight phase, each time a model in your unit makes a melee attack
 * that targets that unit, you can re-roll the Wound roll.
 *
 * Toggle when the attacking CSM unit is using Veterans of the Long War against
 * the target defender.
 */
export const chaosSpaceMarinesArmyRules: RuleOption[] = [
  {
    id: "csm-veterans-of-the-long-war",
    name: "Veterans of the Long War",
    displayLabel: "Veterans of the Long War",
    description:
      "The attacking unit is using Veterans of the Long War. Re-roll Wound rolls for melee attacks against the selected target.",
    modifiers: [{ type: "REROLL_WOUNDS", attackType: "melee" }],
    appliesTo: "attacker",
    combatRole: "attacker",
    phase: "fight",
    isToggle: true,
    supportLevel: "implemented",
    engineTags: ["veterans-of-the-long-war", "reroll-wounds-melee"],
  },
];
