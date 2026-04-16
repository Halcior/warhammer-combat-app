import { mapNormalizedDetachmentToDetachmentConfig } from "../mappers/mapNormalizedDetachmentToFactionConfig";
import type { NormalizedDetachment } from "../../types/wahapedia";

export function getFactionRuntimeDetachments(
  factionName: string,
  detachments: NormalizedDetachment[]
) {
  const factionDetachments = detachments.filter(
    (detachment) => detachment.factionName === factionName
  );

  const mappedDetachments = factionDetachments.map(
    mapNormalizedDetachmentToDetachmentConfig
  );

  return {
    detachments: mappedDetachments,
    enhancements: mappedDetachments.flatMap((detachment) => detachment.enhancements ?? []),
    stratagems: mappedDetachments.flatMap((detachment) => detachment.stratagems),
    armyRules: [] as import("../../types/faction").RuleOption[],
  };
}
