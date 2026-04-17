import type { FactionConfig } from "../../../types/faction";
import type { NormalizedDetachment } from "../../../types/wahapedia";
import { mapNormalizedDetachmentToDetachmentConfig } from "../../mappers/mapNormalizedDetachmentToFactionConfig";
import { findFactionDetachment } from "../findFactionDetachment";
import { adeptaSororitasArmyRules } from "./armyRules";

const adeptaSororitasDetachmentIds = [
  "army_of_faith",
  "bringers_of_flame",
  "champions_of_faith",
  "hallowed_martyrs",
  "penitent_host",
  "penitents_and_pilgrims",
  "pious_protectors",
] as const;

export function getAdeptaSororitasFactionConfig(
  detachments: NormalizedDetachment[]
): FactionConfig {
  const factionDetachments = adeptaSororitasDetachmentIds
    .map((id) => findFactionDetachment(detachments, "Adepta Sororitas", id))
    .filter((d): d is NormalizedDetachment => Boolean(d))
    .map(mapNormalizedDetachmentToDetachmentConfig);

  return {
    id: "adepta-sororitas",
    faction: "Adepta Sororitas",
    armyRules: adeptaSororitasArmyRules,
    detachments: factionDetachments,
  };
}
