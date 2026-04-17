import type { FactionConfig } from "../../../types/faction";
import type { NormalizedDetachment } from "../../../types/wahapedia";
import { mapNormalizedDetachmentToDetachmentConfig } from "../../mappers/mapNormalizedDetachmentToFactionConfig";
import { findFactionDetachment } from "../findFactionDetachment";
import { tyranidsArmyRules } from "./armyRules";

const tyranidsDetachmentIds = [
  "assimilation_swarm",
  "biotide",
  "boarding_swarm",
  "crusher_stampede",
  "infestation_swarm",
  "invasion_fleet",
  "subterranean_assault",
  "synaptic_nexus",
  "tyranid_attack",
  "unending_swarm",
  "vanguard_onslaught",
  "warrior_bioform_onslaught",
] as const;

export function getTyranidsFactionConfig(
  detachments: NormalizedDetachment[]
): FactionConfig {
  const factionDetachments = tyranidsDetachmentIds
    .map((id) => findFactionDetachment(detachments, "Tyranids", id))
    .filter((d): d is NormalizedDetachment => Boolean(d))
    .map(mapNormalizedDetachmentToDetachmentConfig);

  return {
    id: "tyranids",
    faction: "Tyranids",
    armyRules: tyranidsArmyRules,
    detachments: factionDetachments,
  };
}
