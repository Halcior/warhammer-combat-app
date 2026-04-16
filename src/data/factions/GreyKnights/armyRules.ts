import type { RuleOption } from "../../../types/faction";

/**
 * Grey Knights army-wide rules.
 *
 * The current Grey Knights army mechanics are heavily tied to psychic and
 * repositioning workflows with no stable direct damage-calculator equivalent,
 * so we expose them as informational for now.
 */
export const greyKnightsArmyRules: RuleOption[] = [
  {
    id: "gk-brotherhood-of-psykers",
    name: "Brotherhood of Psykers",
    displayLabel: "Brotherhood of Psykers",
    description:
      "Grey Knights rely on psychic rituals, teleportation and Warp-fuelled reinforcement tools. These mechanics do not map to a fixed direct calculator effect yet.",
    modifiers: [],
    appliesTo: "attacker",
    combatRole: "attacker",
    phase: "any",
    isToggle: false,
    supportLevel: "info-only",
    engineTags: [],
  },
];
