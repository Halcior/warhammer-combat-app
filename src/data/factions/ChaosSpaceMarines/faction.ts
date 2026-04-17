import type { FactionConfig } from "../../../types/faction";
import type { NormalizedDetachment } from "../../../types/wahapedia";
import { mapNormalizedDetachmentToDetachmentConfig } from "../../mappers/mapNormalizedDetachmentToFactionConfig";
import { findFactionDetachment } from "../findFactionDetachment";
import { chaosSpaceMarinesArmyRules } from "./armyRules";

const chaosSpaceMarinesDetachmentIds = [
  "cabal_of_chaos",
  "champions_of_chaos",
  "chaos_cult",
  "creations_of_bile",
  "deceptors",
  "dread_talons",
  "fellhammer_siege_host",
  "huron_s_marauders",
  "infernal_reavers",
  "nightmare_hunt",
  "pactbound_zealots",
  "renegade_raiders",
  "renegade_warband",
  "soulforged_warpack",
  "underdeck_uprising",
  "veterans_of_the_long_war",
] as const;

export function getChaosSpaceMarinesFactionConfig(
  detachments: NormalizedDetachment[]
): FactionConfig {
  const factionDetachments = chaosSpaceMarinesDetachmentIds
    .map((id) => findFactionDetachment(detachments, "Chaos Space Marines", id))
    .filter((d): d is NormalizedDetachment => Boolean(d))
    .map(mapNormalizedDetachmentToDetachmentConfig);

  return {
    id: "chaos-space-marines",
    faction: "Chaos Space Marines",
    armyRules: chaosSpaceMarinesArmyRules,
    detachments: factionDetachments,
  };
}
