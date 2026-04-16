import type { FactionConfig } from "../../../types/faction";
import type { NormalizedDetachment } from "../../../types/wahapedia";
import { mapNormalizedDetachmentToDetachmentConfig } from "../../mappers/mapNormalizedDetachmentToFactionConfig";
import { greyKnightsArmyRules } from "./armyRules";

const greyKnightsDetachmentIds = [
  "augurium_task_force",
  "baneslayer_strike",
  "banishers",
  "brotherhood_strike",
  "hallowed_conclave",
  "sanctic_spearhead",
  "void_purge_force",
  "warpbane_task_force",
] as const;

export function getGreyKnightsFactionConfig(
  detachments: NormalizedDetachment[]
): FactionConfig {
  const factionDetachments = greyKnightsDetachmentIds
    .map((id) =>
      detachments.find((d) => d.factionName === "Grey Knights" && d.id === id)
    )
    .filter((d): d is NormalizedDetachment => Boolean(d))
    .map(mapNormalizedDetachmentToDetachmentConfig);

  return {
    id: "grey-knights",
    faction: "Grey Knights",
    armyRules: greyKnightsArmyRules,
    detachments: factionDetachments,
  };
}
