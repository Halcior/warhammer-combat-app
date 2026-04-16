import type { RuleOption } from "../../../types/faction";

/**
 * World Eaters army-wide rule options for the combat calculator.
 *
 * Blessings of Khorne: Each battle round the World Eaters player rolls 2D6
 * and selects one of six Blessings. The most impactful combat-calculator
 * Blessings are modelled as separate toggles so players can test the effect
 * of the blessing they actually rolled.
 *
 * Berzerker Charge (Fights First on charge turn) has no calculator equivalent
 * and is listed as info-only.
 */
export const worldEatersArmyRules: RuleOption[] = [
  {
    id: "we-blessing-reroll-hits",
    name: "Blessing of Khorne: Re-roll Hits",
    displayLabel: "Blessing: Re-roll Hits",
    description:
      "One of the Blessings of Khorne grants re-roll Hit rolls to a friendly World Eaters unit. Toggle when the attacking unit benefits from this Blessing.",
    modifiers: [{ type: "REROLL_HITS", attackType: "melee" }],
    appliesTo: "attacker",
    combatRole: "attacker",
    phase: "fight",
    isToggle: true,
    supportLevel: "implemented",
    selectionGroup: "we-blessing",
    engineTags: ["blessing-of-khorne", "reroll-hits-melee"],
  },
  {
    id: "we-blessing-reroll-wounds",
    name: "Blessing of Khorne: Re-roll Wounds",
    displayLabel: "Blessing: Re-roll Wounds",
    description:
      "One of the Blessings of Khorne grants re-roll Wound rolls to a friendly World Eaters unit. Toggle when the attacking unit benefits from this Blessing.",
    modifiers: [{ type: "REROLL_WOUNDS", attackType: "melee" }],
    appliesTo: "attacker",
    combatRole: "attacker",
    phase: "fight",
    isToggle: true,
    supportLevel: "implemented",
    selectionGroup: "we-blessing",
    engineTags: ["blessing-of-khorne", "reroll-wounds-melee"],
  },
  {
    id: "we-blessing-lethal-hits",
    name: "Blessing of Khorne: Lethal Hits",
    displayLabel: "Blessing: Lethal Hits",
    description:
      "One of the Blessings of Khorne grants Lethal Hits to a friendly World Eaters unit in melee. Toggle when the attacking unit benefits from this Blessing.",
    modifiers: [{ type: "LETHAL_HITS", attackType: "melee" }],
    appliesTo: "attacker",
    combatRole: "attacker",
    phase: "fight",
    isToggle: true,
    supportLevel: "implemented",
    selectionGroup: "we-blessing",
    engineTags: ["blessing-of-khorne", "lethal-hits-melee"],
  },
  {
    id: "we-berzerker-charge",
    name: "Berzerker Charge (Fights First)",
    displayLabel: "Berzerker Charge",
    description:
      "World Eaters units that charged this turn fight before non-charging units. This affects fight order, not the attack or damage rolls calculated here.",
    modifiers: [],
    appliesTo: "attacker",
    combatRole: "attacker",
    phase: "fight",
    isToggle: false,
    supportLevel: "info-only",
    engineTags: [],
  },
];
