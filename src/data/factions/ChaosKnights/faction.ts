import type { FactionConfig } from "../../../types/faction";
import type { NormalizedDetachment } from "../../../types/wahapedia";
import { mapNormalizedDetachmentToDetachmentConfig } from "../../mappers/mapNormalizedDetachmentToFactionConfig";
import { findFactionDetachment } from "../findFactionDetachment";
import { chaosKnightsArmyRules } from "./armyRules";

const chaosKnightsDetachmentIds = [
  "houndpack_lance",
  "iconoclast_fiefdom",
  "infernal_lance",
  "lords_of_dread",
  "traitoris_lance",
] as const;

export function getChaosKnightsFactionConfig(
  detachments: NormalizedDetachment[]
): FactionConfig {
  const factionDetachments = chaosKnightsDetachmentIds
    .map((id) => findFactionDetachment(detachments, "Chaos Knights", id))
    .filter((d): d is NormalizedDetachment => Boolean(d))
    .map(mapNormalizedDetachmentToDetachmentConfig);

  return {
    id: "chaos-knights",
    faction: "Chaos Knights",
    armyRules: chaosKnightsArmyRules,
    detachments: factionDetachments,
  };
}
