import type { RuleOption } from "../../../types/faction";

/**
 * Adeptus Mechanicus army-wide rule options for the combat calculator.
 *
 * Doctrina Imperatives switch between mixed offensive and defensive modes and
 * also modify BS/WS directly, which the current rule model does not yet
 * represent cleanly as a single mutually exclusive army state. We therefore
 * expose them as info-only until the engine can model mixed-role army modes
 * without lossy side-splitting.
 */
export const adeptusMechanicusArmyRules: RuleOption[] = [
  {
    id: "admech-doctrina-imperatives",
    name: "Doctrina Imperatives",
    displayLabel: "Doctrina Imperatives",
    description:
      "Adeptus Mechanicus units switch between Protector and Conqueror Imperatives each battle round. The rule mixes Heavy / Assault, direct BS / WS changes and situational attack and defence bonuses, so it is currently tracked as info-only.",
    modifiers: [],
    appliesTo: "attacker",
    combatRole: "attacker",
    phase: "any",
    isToggle: false,
    supportLevel: "info-only",
    engineTags: [],
  },
];
