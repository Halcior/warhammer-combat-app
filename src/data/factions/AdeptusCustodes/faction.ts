import type { FactionConfig } from "../../../types/faction";
import { adeptusCustodesArmyRules } from "./armyRules";
import { shieldHostDetachment } from "./detachments/shieldHost";

export const adeptusCustodesFactionConfig: FactionConfig = {
  id: "adeptus-custodes",
  faction: "Adeptus Custodes",
  armyRules: adeptusCustodesArmyRules,
  detachments: [shieldHostDetachment],
};