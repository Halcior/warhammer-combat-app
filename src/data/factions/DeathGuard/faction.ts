import type { FactionConfig } from "../../../types/faction";
import type { NormalizedDetachment } from "../../../types/wahapedia";
import { mapNormalizedDetachmentToDetachmentConfig } from "../../mappers/mapNormalizedDetachmentToFactionConfig";
import { findFactionDetachment } from "../findFactionDetachment";
import { deathGuardArmyRules } from "./armyRules";

const deathGuardDetachmentIds = [
  "arch_contaminators",
  "champions_of_contagion",
  "death_lord_s_chosen",
  "flyblown_host",
  "mortarion_s_hammer",
  "shamblerot_vectorium",
  "tallyband_summoners",
  "unclean_uprising",
  "vectors_of_decay",
  "virulent_vectorium",
] as const;

export function getDeathGuardFactionConfig(
  detachments: NormalizedDetachment[]
): FactionConfig {
  const factionDetachments = deathGuardDetachmentIds
    .map((id) => findFactionDetachment(detachments, "Death Guard", id))
    .filter((d): d is NormalizedDetachment => Boolean(d))
    .map(mapNormalizedDetachmentToDetachmentConfig);

  return {
    id: "death-guard",
    faction: "Death Guard",
    armyRules: deathGuardArmyRules,
    detachments: factionDetachments,
  };
}
