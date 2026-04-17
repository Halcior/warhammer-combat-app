import { normalizeFactionName } from "../../lib/normalizeFactionName";
import type { NormalizedDetachment } from "../../types/wahapedia";

export function findFactionDetachment(
  detachments: NormalizedDetachment[],
  factionName: string,
  id: string
): NormalizedDetachment | undefined {
  const normalizedFactionName = normalizeFactionName(factionName);

  return detachments.find(
    (detachment) =>
      normalizeFactionName(detachment.factionName) === normalizedFactionName &&
      detachment.id === id
  );
}
