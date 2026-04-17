import type { RuleOption } from "../../../types/faction";

/**
 * T'au Empire army-wide rule options for the combat calculator.
 *
 * Markerlight: the +1 to hit effect fires automatically when the battle-state
 * toggle "Spotted / markerlit" (targetIsSpotted) is active in SetupPanel.
 * It is listed here as an explicit army rule toggle for clarity in the Rules
 * Engine panel so players know it is active when they set that condition.
 *
 * Saviour Protocols (drone intercept) is modelled as FNP 5+ — a calculator
 * approximation. The real mechanic transfers wounds to a Drone model; FNP 5+
 * is the closest per-wound equivalent for a single combat calculation.
 */
export const tauArmyRules: RuleOption[] = [
  {
    id: "tau-markerlight-hit-bonus",
    name: "For the Greater Good: Guided Fire",
    displayLabel: "Guided Fire",
    description:
      "T'au ranged attacks improve their Ballistic Skill by 1 when a Guided unit attacks its Spotted target. Requires both 'Attacker is Guided' and 'Spotted / markerlit' battle-state toggles.",
    modifiers: [
      {
        type: "HIT_MODIFIER",
        value: 1,
        attackType: "ranged",
        requiresAttackerGuided: true,
        requiresTargetSpotted: true,
      },
    ],
    appliesTo: "attacker",
    combatRole: "attacker",
    phase: "shooting",
    isToggle: true,
    supportLevel: "implemented",
    engineTags: ["markerlight", "hit-plus-1-ranged"],
  },
  {
    id: "tau-saviour-protocols",
    name: "Saviour Protocols (FNP 5+)",
    displayLabel: "Saviour Protocols",
    description:
      "While a T'au Infantry unit is within 3\" of a friendly Drone unit, each time that Infantry unit would lose a wound, roll one D6: on a 5+, that wound is not lost. Modelled as FNP 5+ for calculator purposes.",
    modifiers: [{ type: "FEEL_NO_PAIN", value: 5 }],
    appliesTo: "defender",
    combatRole: "defender",
    phase: "any",
    isToggle: true,
    supportLevel: "implemented",
    engineTags: ["saviour-protocols", "fnp-5plus"],
  },
];
