import type { FactionConfig } from "../../../types/faction";
import type { NormalizedDetachment } from "../../../types/wahapedia";
import { adeptusCustodesArmyRules } from "./armyRules";
import { getAdeptusCustodesDetachmentFromNormalized } from "./detachments/fromNormalized";

const adeptusCustodesDetachmentIds = [
  "shield_host",
  "talons_of_the_emperor",
  "null_maiden_vigil",
  "auric_champions",
  "voyagers_in_darkness",
  "black_ship_guardians",
  "solar_spearhead",
  "lions_of_the_emperor",
] as const;

export function getAdeptusCustodesFactionConfig(
  detachments: NormalizedDetachment[]
): FactionConfig {
  return {
    id: "adeptus-custodes",
    faction: "Adeptus Custodes",
    armyRules: adeptusCustodesArmyRules,
    detachments: adeptusCustodesDetachmentIds.map((id) =>
      getAdeptusCustodesDetachmentFromNormalized(id, detachments)
    ),
  };
}
