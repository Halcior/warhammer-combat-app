import type { FactionConfig } from "../../../types/faction";
import type { NormalizedDetachment } from "../../../types/wahapedia";
import { mapNormalizedDetachmentToDetachmentConfig } from "../../mappers/mapNormalizedDetachmentToFactionConfig";
import { findFactionDetachment } from "../findFactionDetachment";
import { leaguesOfVotannArmyRules } from "./armyRules";

const leaguesOfVotannDetachmentIds = [
  "brandfast_oathband",
  "delve_assault_shift",
  "hearthband",
  "hearthfire_strike",
  "hearthfyre_arsenal",
  "mercenary_oathband",
  "needgaard_oathband",
  "persecution_prospect",
  "void_salvagers",
] as const;

export function getLeaguesOfVotannFactionConfig(
  detachments: NormalizedDetachment[]
): FactionConfig {
  const factionDetachments = leaguesOfVotannDetachmentIds
    .map((id) => findFactionDetachment(detachments, "Leagues of Votann", id))
    .filter((d): d is NormalizedDetachment => Boolean(d))
    .map(mapNormalizedDetachmentToDetachmentConfig);

  return {
    id: "leagues-of-votann",
    faction: "Leagues of Votann",
    armyRules: leaguesOfVotannArmyRules,
    detachments: factionDetachments,
  };
}
