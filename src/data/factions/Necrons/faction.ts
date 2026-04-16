import type { FactionConfig } from "../../../types/faction";
import type { NormalizedDetachment } from "../../../types/wahapedia";
import { mapNormalizedDetachmentToDetachmentConfig } from "../../mappers/mapNormalizedDetachmentToFactionConfig";
import { necronsArmyRules } from "./armyRules";

const necronsDetachmentIds = [
  "annihilation_legion",
  "awakened_dynasty",
  "canoptek_court",
  "canoptek_harvesters",
  "cryptek_conclave",
  "cursed_legion",
  "deranged_outcasts",
  "hypercrypt_legion",
  "obeisance_phalanx",
  "pantheon_of_woe",
  "starshatter_arsenal",
  "tomb_ship_complement",
] as const;

export function getNecronsFactionConfig(
  detachments: NormalizedDetachment[]
): FactionConfig {
  const factionDetachments = necronsDetachmentIds
    .map((id) => detachments.find((d) => d.factionName === "Necrons" && d.id === id))
    .filter((d): d is NormalizedDetachment => Boolean(d))
    .map(mapNormalizedDetachmentToDetachmentConfig);

  return {
    id: "necrons",
    faction: "Necrons",
    armyRules: necronsArmyRules,
    detachments: factionDetachments,
  };
}
