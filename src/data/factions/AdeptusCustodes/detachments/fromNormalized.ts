import { detachments } from "../../../detachments";
import { mapNormalizedDetachmentToDetachmentConfig } from "../../../mappers/mapNormalizedDetachmentToFactionConfig";
import type { DetachmentConfig } from "../../../../types/faction";

export function getAdeptusCustodesDetachmentFromNormalized(
  id: string
): DetachmentConfig {
  const detachment = detachments.find(
    (entry) => entry.factionName === "Adeptus Custodes" && entry.id === id
  );

  if (!detachment) {
    throw new Error(`Missing normalized Adeptus Custodes detachment: ${id}`);
  }

  return mapNormalizedDetachmentToDetachmentConfig(detachment);
}
