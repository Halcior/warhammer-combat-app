import type { DetachmentConfig } from "../../../../types/faction";

export const shieldHostDetachment: DetachmentConfig = {
  id: "shield-host",
  name: "Shield Host",
  description:
    "Elite combat detachment focused on Martial Mastery and enhanced wargear.",
  ruleOptions: [
    {
      id: "martial-mastery-crit-5plus",
      name: "Martial Mastery: Critical Hit on 5+",
      description:
        "Each time a model with Martial Ka’tah makes a melee attack, a successful unmodified Hit roll of 5+ scores a Critical Hit.",
      appliesTo: "attacker",
      phase: "fight",
      isToggle: true,
      modifiers: [{ type: "CRITICAL_HITS_ON", value: 5 }],
      supportLevel: "implemented",
      engineTags: ["critical-hit-on-5plus", "melee-only"],

      selectionGroup: "custodes-martial-mastery",
      maxSelectionsInGroup: 1,
    },
    {
      id: "martial-mastery-ap-bonus",
      name: "Martial Mastery: Improve AP by 1",
      description:
        "Improve the Armour Penetration characteristic of melee weapons equipped by models with Martial Ka’tah by 1.",
      appliesTo: "attacker",
      phase: "fight",
      isToggle: true,
      modifiers: [{ type: "AP_MODIFIER", value: 1, attackType: "melee" }],
      supportLevel: "implemented",
      engineTags: ["melee-ap-plus-1"],

      selectionGroup: "custodes-martial-mastery",
      maxSelectionsInGroup: 1,
    },
  ],
  stratagems: [
    {
      id: "slayers-of-nightmares",
      name: "Slayers of Nightmares",
      description: "Combat buff placeholder for future support.",
      phase: "fight",
      cpCost: 1,
      effects: [
        {
          id: "slayers-of-nightmares-effect",
          name: "Slayers of Nightmares Effect",
          appliesTo: "attacker",
          phase: "fight",
          isToggle: true,
          modifiers: [{ type: "LANCE" }],
          supportLevel: "implemented",
          engineTags: ["lance"],
        },
      ],
      supportLevel: "implemented",
    },
  ],
  enhancements: [
    {
      id: "auric-mantle",
      name: "Auric Mantle",
      description: "Add 2 to the bearer's Wounds characteristic.",
      effects: [],
      supportLevel: "planned",
    },
    {
      id: "castellans-mark",
      name: "Castellan's Mark",
      description:
        "Pregame redeploy / reserve manipulation. Useful information, but not part of combat calculation.",
      effects: [],
      supportLevel: "info-only",
    },
    {
      id: "from-the-hall-of-armouries",
      name: "From the Hall of Armouries",
      description:
        "Add 1 to the Strength and Damage of the bearer's melee weapons.",
      effects: [
        {
          id: "hall-of-armouries-strength",
          name: "Hall of Armouries: +1 Strength",
          appliesTo: "attacker",
          phase: "fight",
          isToggle: true,
          modifiers: [],
          supportLevel: "planned",
          engineTags: ["melee-strength-plus-1"],
        },
        {
          id: "hall-of-armouries-damage",
          name: "Hall of Armouries: +1 Damage",
          appliesTo: "attacker",
          phase: "fight",
          isToggle: true,
          modifiers: [],
          supportLevel: "planned",
          engineTags: ["melee-damage-plus-1"],
        },
      ],
      supportLevel: "planned",
    },
    {
      id: "panoptispex",
      name: "Panoptispex",
      description:
        "While the bearer is leading a unit, ranged weapons in that unit gain Ignores Cover.",
      effects: [
        {
          id: "panoptispex-effect",
          name: "Panoptispex Effect",
          appliesTo: "attacker",
          phase: "shooting",
          isToggle: true,
          modifiers: [{ type: "IGNORES_COVER" }],
          supportLevel: "implemented",
          engineTags: ["ignores-cover-ranged"],
        },
      ],
      supportLevel: "implemented",
    },
  ],
};