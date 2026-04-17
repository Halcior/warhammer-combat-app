import type { FactionConfig } from "../../../types/faction";
import type { NormalizedDetachment } from "../../../types/wahapedia";
import { tauArmyRules } from "./armyRules";
import { mapNormalizedDetachmentToDetachmentConfig } from "../../mappers/mapNormalizedDetachmentToFactionConfig";
import { findFactionDetachment } from "../findFactionDetachment";

const tauDetachmentIds = [
  "auxiliary_cadre",
  "experimental_prototype_cadre",
  "kauyon",
  "kroot_hunting_pack",
  "kroot_raiding_party",
  "mont_ka",
  "retaliation_cadre",
  "starfire_cadre",
] as const;

export function getTauFactionConfig(
  detachments: NormalizedDetachment[]
): FactionConfig {
  const factionDetachments = tauDetachmentIds
    .map((id) => findFactionDetachment(detachments, "T'au Empire", id))
    .filter((d): d is NormalizedDetachment => Boolean(d))
    .map(mapNormalizedDetachmentToDetachmentConfig);

  return {
    id: "tau-empire",
    faction: "T'au Empire",
    armyRules: tauArmyRules,
    detachments: factionDetachments,
  };
}
