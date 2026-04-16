import type { RuleOption } from "../../../types/faction";

/**
 * Chaos Knights army-wide rules.
 *
 * Harbingers of Dread is mostly about battle-shock pressure and escalating
 * table-state effects. It matters strategically, but has no stable direct
 * calculator equivalent for a single resolved attack.
 */
export const chaosKnightsArmyRules: RuleOption[] = [
  {
    id: "ck-harbingers-of-dread",
    name: "Harbingers of Dread",
    displayLabel: "Harbingers of Dread",
    description:
      "Chaos Knights project escalating dread effects that pressure Battle-shock and positioning over multiple rounds. This is tracked as informational only for now.",
    modifiers: [],
    appliesTo: "attacker",
    combatRole: "attacker",
    phase: "any",
    isToggle: false,
    supportLevel: "info-only",
    engineTags: [],
  },
];
