import type { FactionConfig } from "../../../types/faction";
import type { NormalizedDetachment } from "../../../types/wahapedia";
import { mapNormalizedDetachmentToDetachmentConfig } from "../../mappers/mapNormalizedDetachmentToFactionConfig";
import { findFactionDetachment } from "../findFactionDetachment";
import { aeldariArmyRules } from "./armyRules";

const aeldariDetachmentIds = [
  "armoured_warhost",
  "aspect_host",
  "corsair_coterie",
  "devoted_of_ynnead",
  "eldritch_raiders",
  "ghosts_of_the_webway",
  "guardian_battlehost",
  "khaine_s_arrow",
  "protector_host",
  "seer_council",
  "serpent_s_brood",
  "spirit_conclave",
  "star_dancer_masque",
  "warhost",
  "windrider_host",
  "wraiths_of_the_void",
] as const;

export function getAeldariFactionConfig(
  detachments: NormalizedDetachment[]
): FactionConfig {
  const factionDetachments = aeldariDetachmentIds
    .map((id) => findFactionDetachment(detachments, "Aeldari", id))
    .filter((d): d is NormalizedDetachment => Boolean(d))
    .map(mapNormalizedDetachmentToDetachmentConfig);

  return {
    id: "aeldari",
    faction: "Aeldari",
    armyRules: aeldariArmyRules,
    detachments: factionDetachments,
  };
}
