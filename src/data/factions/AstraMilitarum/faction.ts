import type { FactionConfig } from "../../../types/faction";
import type { NormalizedDetachment } from "../../../types/wahapedia";
import { mapNormalizedDetachmentToDetachmentConfig } from "../../mappers/mapNormalizedDetachmentToFactionConfig";
import { findFactionDetachment } from "../findFactionDetachment";
import { astraMilitarumArmyRules } from "./armyRules";

const astraMilitarumDetachmentIds = [
  "bridgehead_strike",
  "combined_arms",
  "embarked_regiment",
  "grizzled_company",
  "hammer_of_the_emperor",
  "mechanised_assault",
  "recon_element",
  "siege_regiment",
  "tempestus_boarding_regiment",
] as const;

export function getAstraMilitarumFactionConfig(
  detachments: NormalizedDetachment[]
): FactionConfig {
  const factionDetachments = astraMilitarumDetachmentIds
    .map((id) => findFactionDetachment(detachments, "Astra Militarum", id))
    .filter((d): d is NormalizedDetachment => Boolean(d))
    .map(mapNormalizedDetachmentToDetachmentConfig);

  return {
    id: "astra-militarum",
    faction: "Astra Militarum",
    armyRules: astraMilitarumArmyRules,
    detachments: factionDetachments,
  };
}
