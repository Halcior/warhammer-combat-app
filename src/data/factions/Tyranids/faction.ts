import type { FactionConfig } from "../../../types/faction";
import type { NormalizedDetachment } from "../../../types/wahapedia";
import { mapNormalizedDetachmentToDetachmentConfig } from "../../mappers/mapNormalizedDetachmentToFactionConfig";
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
    .map((id) =>
      detachments.find((d) => d.factionName === "Tyranids" && d.id === id)
    )
    .filter((d): d is NormalizedDetachment => Boolean(d))
    .map(mapNormalizedDetachmentToDetachmentConfig);

  return {
    id: "tyranids",
    faction: "Tyranids",
    armyRules: tyranidsArmyRules,
    detachments: factionDetachments,
  };
}
