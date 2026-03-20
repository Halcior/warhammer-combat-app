import type { Unit } from "../../../types/combat";

export const necronUnits: Unit[] = [
 {
  id: "necron_warriors",
  name: "Necron Warriors",
  faction: "Necrons",
  toughness: 4,
  save: 4,
  woundsPerModel: 1,
  weapons: [
    {
      id: "gauss_reaper",
      name: "Gauss Reaper",
      attacks: 2,
      skill: 4,
      strength: 5,
      ap: -1,
      damage: 1,
      type: "ranged",
      specialRules: [],
    },
  ],
  specialRules: [],
  keywords: ["INFANTRY"],
}
  
];