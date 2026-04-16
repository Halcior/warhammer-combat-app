import type { FactionConfig } from "../../../types/faction";
import type { NormalizedDetachment } from "../../../types/wahapedia";
import { mapNormalizedDetachmentToDetachmentConfig } from "../../mappers/mapNormalizedDetachmentToFactionConfig";
import { adeptusMechanicusArmyRules } from "./armyRules";

const adeptusMechanicusDetachmentIds = [
  "cohort_cybernetica",
  "data_psalm_conclave",
  "electromartyrs",
  "explorator_maniple",
  "haloscreed_battle_clade",
  "machine_cult",
  "rad_zone_corps",
  "response_clade",
  "skitarii_hunter_cohort",
] as const;

export function getAdeptusMechanicusFactionConfig(
  detachments: NormalizedDetachment[]
): FactionConfig {
  const factionDetachments = adeptusMechanicusDetachmentIds
    .map((id) =>
      detachments.find(
        (d) => d.factionName === "Adeptus Mechanicus" && d.id === id
      )
    )
    .filter((d): d is NormalizedDetachment => Boolean(d))
    .map(mapNormalizedDetachmentToDetachmentConfig);

  return {
    id: "adeptus-mechanicus",
    faction: "Adeptus Mechanicus",
    armyRules: adeptusMechanicusArmyRules,
    detachments: factionDetachments,
  };
}
