import type { FactionConfig } from "../../types/faction";
import type { NormalizedDetachment } from "../../types/wahapedia";
import { getAdeptaSororitasFactionConfig } from "./AdeptaSororitas/faction";
import { getAdeptusCustodesFactionConfig } from "./AdeptusCustodes/faction";
import { getAeldariFactionConfig } from "./Aeldari/faction";
import { getChaosSpaceMarinesFactionConfig } from "./ChaosSpaceMarines/faction";
import { getDeathGuardFactionConfig } from "./DeathGuard/faction";
import { getGreyKnightsFactionConfig } from "./GreyKnights/faction";
import { getNecronsFactionConfig } from "./Necrons/faction";
import { getOrksFactionConfig } from "./Orks/faction";
import { getSpaceMarinesFactionConfig } from "./SpaceMarines/faction";
import { getTauFactionConfig } from "./Tau/faction";
import { getTyranidsFactionConfig } from "./Tyranids/faction";
import { getWorldEatersFactionConfig } from "./WorldEaters/faction";

export function getFactionConfigs(
  detachments: NormalizedDetachment[]
): FactionConfig[] {
  return [
    getAdeptaSororitasFactionConfig(detachments),
    getAdeptusCustodesFactionConfig(detachments),
    getAeldariFactionConfig(detachments),
    getChaosSpaceMarinesFactionConfig(detachments),
    getDeathGuardFactionConfig(detachments),
    getGreyKnightsFactionConfig(detachments),
    getNecronsFactionConfig(detachments),
    getOrksFactionConfig(detachments),
    getSpaceMarinesFactionConfig(detachments),
    getTauFactionConfig(detachments),
    getTyranidsFactionConfig(detachments),
    getWorldEatersFactionConfig(detachments),
  ];
}

export function getFactionConfigByName(
  factionName: string,
  detachments: NormalizedDetachment[]
): FactionConfig | undefined {
  return getFactionConfigs(detachments).find((config) => config.faction === factionName);
}
