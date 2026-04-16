import type { FactionConfig } from "../../../types/faction";
import type { NormalizedDetachment } from "../../../types/wahapedia";
import { mapNormalizedDetachmentToDetachmentConfig } from "../../mappers/mapNormalizedDetachmentToFactionConfig";
import { worldEatersArmyRules } from "./armyRules";

const worldEatersDetachmentIds = [
  "berzerker_warband",
  "boarding_butchers",
  "cult_of_blood",
  "goretrack_onslaught",
  "khorne_daemonkin",
  "possessed_slaughterband",
  "skullsworn",
  "vessels_of_wrath",
] as const;

export function getWorldEatersFactionConfig(
  detachments: NormalizedDetachment[]
): FactionConfig {
  const factionDetachments = worldEatersDetachmentIds
    .map((id) => detachments.find((d) => d.factionName === "World Eaters" && d.id === id))
    .filter((d): d is NormalizedDetachment => Boolean(d))
    .map(mapNormalizedDetachmentToDetachmentConfig);

  return {
    id: "world-eaters",
    faction: "World Eaters",
    armyRules: worldEatersArmyRules,
    detachments: factionDetachments,
  };
}
