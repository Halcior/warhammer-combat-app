import { mapNormalizedDetachmentToDetachmentConfig } from "../../../mappers/mapNormalizedDetachmentToFactionConfig";
import type { DetachmentConfig } from "../../../../types/faction";
import type { NormalizedDetachment } from "../../../../types/wahapedia";
import { normalizeFactionName } from "../../../../lib/normalizeFactionName";

export function getAdeptusCustodesDetachmentFromNormalized(
  id: string,
  detachments?: NormalizedDetachment[]
): DetachmentConfig {
  if (!detachments) {
    throw new Error(
      `Normalized detachment data must be provided to resolve Adeptus Custodes detachment: ${id}`
    );
  }

  const detachment = detachments.find(
    (entry) =>
      normalizeFactionName(entry.factionName) === "Adeptus Custodes" &&
      entry.id === id
  );

  if (!detachment) {
    throw new Error(`Missing normalized Adeptus Custodes detachment: ${id}`);
  }

  return mapNormalizedDetachmentToDetachmentConfig(detachment);
}
