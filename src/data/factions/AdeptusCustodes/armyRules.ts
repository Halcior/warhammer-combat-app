import type { RuleOption } from "../../../types/faction";

export const adeptusCustodesArmyRules: RuleOption[] = [
  {
    id: "martial-katah-lethal",
    name: "Martial Ka’tah: Lethal Hits",
    description: "Selected stance grants Lethal Hits.",
    modifiers: [{ type: "LETHAL_HITS" }],
    appliesTo: "attacker",
    combatRole: "attacker",
    phase: "fight",
    isToggle: true,

    selectionGroup: "custodes-martial-katah",
    maxSelectionsInGroup: 1,
  },
  {
    id: "martial-katah-sustained",
    name: "Martial Ka’tah: Sustained Hits 1",
    description: "Selected stance grants Sustained Hits 1.",
    modifiers: [{ type: "SUSTAINED_HITS", value: 1 }],
    appliesTo: "attacker",
    combatRole: "attacker",
    phase: "fight",
    isToggle: true,

    selectionGroup: "custodes-martial-katah",
    maxSelectionsInGroup: 1,
  },
];