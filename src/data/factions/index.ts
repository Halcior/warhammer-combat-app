import type { FactionConfig } from "../../types/faction";
import type { NormalizedDetachment } from "../../types/wahapedia";
import { getAdeptaSororitasFactionConfig } from "./AdeptaSororitas/faction";
import { getAdeptusMechanicusFactionConfig } from "./AdeptusMechanicus/faction";
import { getAstraMilitarumFactionConfig } from "./AstraMilitarum/faction";
import { getAdeptusCustodesFactionConfig } from "./AdeptusCustodes/faction";
import { getAeldariFactionConfig } from "./Aeldari/faction";
import { getChaosKnightsFactionConfig } from "./ChaosKnights/faction";
import { getChaosSpaceMarinesFactionConfig } from "./ChaosSpaceMarines/faction";
import { getDeathGuardFactionConfig } from "./DeathGuard/faction";
import { getGreyKnightsFactionConfig } from "./GreyKnights/faction";
import { getLeaguesOfVotannFactionConfig } from "./LeaguesOfVotann/faction";
import { getNecronsFactionConfig } from "./Necrons/faction";
import { getOrksFactionConfig } from "./Orks/faction";
import { getSpaceMarinesFactionConfig } from "./SpaceMarines/faction";
import { getTauFactionConfig } from "./Tau/faction";
import { getThousandSonsFactionConfig } from "./ThousandSons/faction";
import { getTyranidsFactionConfig } from "./Tyranids/faction";
import { getWorldEatersFactionConfig } from "./WorldEaters/faction";
import { normalizeFactionName } from "../../lib/normalizeFactionName";

const factionConfigFactories: Record<
  string,
  (detachments: NormalizedDetachment[]) => FactionConfig
> = {
  "Adepta Sororitas": getAdeptaSororitasFactionConfig,
  "Adeptus Mechanicus": getAdeptusMechanicusFactionConfig,
  "Astra Militarum": getAstraMilitarumFactionConfig,
  "Adeptus Custodes": getAdeptusCustodesFactionConfig,
  Aeldari: getAeldariFactionConfig,
  "Chaos Knights": getChaosKnightsFactionConfig,
  "Chaos Space Marines": getChaosSpaceMarinesFactionConfig,
  "Death Guard": getDeathGuardFactionConfig,
  "Grey Knights": getGreyKnightsFactionConfig,
  "Leagues of Votann": getLeaguesOfVotannFactionConfig,
  Necrons: getNecronsFactionConfig,
  Orks: getOrksFactionConfig,
  "Space Marines": getSpaceMarinesFactionConfig,
  "T'au Empire": getTauFactionConfig,
  "Thousand Sons": getThousandSonsFactionConfig,
  Tyranids: getTyranidsFactionConfig,
  "World Eaters": getWorldEatersFactionConfig,
};

export function getFactionConfigs(
  detachments: NormalizedDetachment[]
): FactionConfig[] {
  return Object.values(factionConfigFactories).map((factory) => factory(detachments));
}

export function getFactionConfigByName(
  factionName: string,
  detachments: NormalizedDetachment[]
): FactionConfig | undefined {
  const factory = factionConfigFactories[normalizeFactionName(factionName)];
  return factory ? factory(detachments) : undefined;
}
