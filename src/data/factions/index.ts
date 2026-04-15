import type { FactionConfig } from "../../types/faction";
import type { NormalizedDetachment } from "../../types/wahapedia";
import { getAdeptusCustodesFactionConfig } from "./AdeptusCustodes/faction";

export function getFactionConfigs(
  detachments: NormalizedDetachment[]
): FactionConfig[] {
  return [getAdeptusCustodesFactionConfig(detachments)];
}

export function getFactionConfigByName(
  factionName: string,
  detachments: NormalizedDetachment[]
): FactionConfig | undefined {
  return getFactionConfigs(detachments).find((config) => config.faction === factionName);
}
