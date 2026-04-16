import type { RuleOption } from "../../../types/faction";

/**
 * Death Guard army-wide rule options for the combat calculator.
 *
 * These represent broadly applicable offensive and defensive properties
 * of Death Guard armies that a player can toggle per matchup.
 *
 * Complex table-state mechanics (full Contagion spreading, reinforcement
 * abilities) are out of scope for the calculator and are tracked via
 * battle-state condition toggles in SetupPanel instead.
 */
export const deathGuardArmyRules: RuleOption[] = [
  {
    id: "dg-plague-weapons-wound-bonus",
    name: "Plague Weapons: +1 to Wound",
    displayLabel: "Plague Weapons",
    description:
      "Death Guard weapons with the Plague Weapons keyword add +1 to their wound rolls. Toggle when the attacking unit is using Plague Weapons and the bonus applies.",
    modifiers: [{ type: "WOUND_MODIFIER", value: 1 }],
    appliesTo: "attacker",
    combatRole: "attacker",
    phase: "any",
    isToggle: true,
    supportLevel: "implemented",
    engineTags: ["plague-weapons"],
  },
  {
    id: "dg-disgustingly-resilient",
    name: "Disgustingly Resilient (FNP 5+)",
    displayLabel: "Disgustingly Resilient",
    description:
      "Core Death Guard units have a 5+ Feel No Pain save against all damage. Toggle when the targeted Death Guard unit has Disgustingly Resilient.",
    modifiers: [{ type: "FEEL_NO_PAIN", value: 5 }],
    appliesTo: "defender",
    combatRole: "defender",
    phase: "any",
    isToggle: true,
    supportLevel: "implemented",
    engineTags: ["disgustingly-resilient", "fnp-5plus"],
  },
];
