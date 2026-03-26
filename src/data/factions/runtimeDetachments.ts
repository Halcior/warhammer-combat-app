import { detachments } from "../detachments";
import { mapNormalizedDetachmentToDetachmentConfig } from "../mappers/mapNormalizedDetachmentToFactionConfig";

export function getFactionRuntimeDetachments(factionName: string) {
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
  };
}