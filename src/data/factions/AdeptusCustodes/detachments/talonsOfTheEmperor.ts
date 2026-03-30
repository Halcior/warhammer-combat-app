import type { DetachmentConfig } from "../../../../types/faction";


export const talonsOfTheEmperorDetachment: DetachmentConfig = {
  id: "talons-of-the-emperor",
  name: "Talons of the Emperor",
  description:
    "Focuses on synergy between Adeptus Custodes and Sisters of Silence.",

  ruleOptions: [
    {
      id: "talons-synergy",
      name: "Talons Synergy (placeholder)",
      description:
        "Buffs apply when Custodes and Sisters fight together.",
      appliesTo: "attacker",
      phase: "fight",
      isToggle: true,
      modifiers: [],
      supportLevel: "info-only",
    },
  ],

  stratagems: [],
  enhancements: [],
};