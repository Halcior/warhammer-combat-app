import type { FactionConfig } from "../../../types/faction";
import type { NormalizedDetachment } from "../../../types/wahapedia";
import { mapNormalizedDetachmentToDetachmentConfig } from "../../mappers/mapNormalizedDetachmentToFactionConfig";
import { findFactionDetachment } from "../findFactionDetachment";
import { spaceMarinesArmyRules } from "./armyRules";

const spaceMarinesDetachmentIds = [
  "1st_company_task_force",
  "angelic_inheritors",
  "anvil_siege_force",
  "bastion_task_force",
  "black_spear_task_force",
  "blade_of_ultramar",
  "boarding_strike",
  "champions_of_fenris",
  "companions_of_vehemence",
  "company_of_hunters",
  "emperor_s_shield",
  "firestorm_assault_force",
  "forgefather_s_seekers",
  "gladius_task_force",
  "godhammer_assault_force",
  "hammer_of_avernii",
  "inner_circle_task_force",
  "ironstorm_spearhead",
  "liberator_assault_group",
  "librarius_conclave",
  "lion_s_blade_task_force",
  "orbital_assault_force",
  "pilum_strike_team",
  "rage_cursed_onslaught",
  "reclamation_force",
  "saga_of_the_beastslayer",
  "saga_of_the_bold",
  "saga_of_the_great_wolf",
  "saga_of_the_hunter",
  "shadowmark_talon",
  "spearpoint_task_force",
  "stormlance_task_force",
  "terminator_assault",
  "the_angelic_host",
  "the_lost_brethren",
  "unforgiven_task_force",
  "vanguard_spearhead",
  "vindication_task_force",
  "wrath_of_the_rock",
  "wrathful_procession",
] as const;

export function getSpaceMarinesFactionConfig(
  detachments: NormalizedDetachment[]
): FactionConfig {
  const factionDetachments = spaceMarinesDetachmentIds
    .map((id) => findFactionDetachment(detachments, "Space Marines", id))
    .filter((d): d is NormalizedDetachment => Boolean(d))
    .map(mapNormalizedDetachmentToDetachmentConfig);

  return {
    id: "space-marines",
    faction: "Space Marines",
    armyRules: spaceMarinesArmyRules,
    detachments: factionDetachments,
  };
}
