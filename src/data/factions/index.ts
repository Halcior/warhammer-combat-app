import type { FactionConfig } from "../../types/faction";
import { adeptusCustodesFactionConfig } from "./AdeptusCustodes/faction";

export const factionConfigs: FactionConfig[] = [
  adeptusCustodesFactionConfig,
];

export function getFactionConfigByName(
  factionName: string
): FactionConfig | undefined {
  return factionConfigs.find((config) => config.faction === factionName);
}