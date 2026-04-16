import type { FactionConfig } from "../../../types/faction";
import type { NormalizedDetachment } from "../../../types/wahapedia";
import { mapNormalizedDetachmentToDetachmentConfig } from "../../mappers/mapNormalizedDetachmentToFactionConfig";
import { orksArmyRules } from "./armyRules";

const orkDetachmentIds = [
  "bully_boyz",
  "da_big_hunt",
  "dread_mob",
  "freebooter_krew",
  "green_tide",
  "kaptin_killers",
  "kult_of_speed",
  "more_dakka",
  "ramship_raiders",
  "taktikal_brigade",
  "war_horde",
] as const;

export function getOrksFactionConfig(
  detachments: NormalizedDetachment[]
): FactionConfig {
  const factionDetachments = orkDetachmentIds
    .map((id) => detachments.find((d) => d.factionName === "Orks" && d.id === id))
    .filter((d): d is NormalizedDetachment => Boolean(d))
    .map(mapNormalizedDetachmentToDetachmentConfig);

  return {
    id: "orks",
    faction: "Orks",
    armyRules: orksArmyRules,
    detachments: factionDetachments,
  };
}
