import type { FactionConfig } from "../../../types/faction";
import type { NormalizedDetachment } from "../../../types/wahapedia";
import { mapNormalizedDetachmentToDetachmentConfig } from "../../mappers/mapNormalizedDetachmentToFactionConfig";
import { thousandSonsArmyRules } from "./armyRules";

const thousandSonsDetachmentIds = [
  "changehost_of_deceit",
  "chosen_cabal",
  "devoted_thralls",
  "fateseekers",
  "grand_coven",
  "hexwarp_thrallband",
  "rubricae_phalanx",
  "warpforged_cabal",
  "warpmeld_pact",
] as const;

export function getThousandSonsFactionConfig(
  detachments: NormalizedDetachment[]
): FactionConfig {
  const factionDetachments = thousandSonsDetachmentIds
    .map((id) =>
      detachments.find((d) => d.factionName === "Thousand Sons" && d.id === id)
    )
    .filter((d): d is NormalizedDetachment => Boolean(d))
    .map(mapNormalizedDetachmentToDetachmentConfig);

  return {
    id: "thousand-sons",
    faction: "Thousand Sons",
    armyRules: thousandSonsArmyRules,
    detachments: factionDetachments,
  };
}
