import { mapNormalizedUnitToCombatUnit } from "./mappers/mapNormalizedUnitToCombatUnit";
import type { Unit } from "../types/combat";
import type { NormalizedUnit } from "../types/wahapedia";

const unitChunkModules = import.meta.glob("./normalized/units-by-faction/*.json");
type UnitChunkModule = { default: NormalizedUnit[] };

export async function loadAllUnits(): Promise<Unit[]> {
  const loaders = Object.entries(unitChunkModules)
    .filter(([path]) => !path.endsWith("/manifest.json"))
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([, loader]) => loader());

  const loadedChunks = await Promise.all(loaders);
  const normalizedUnits = loadedChunks.flatMap(
    (module) => ((module as UnitChunkModule).default ?? [])
  );

  return normalizedUnits.map(mapNormalizedUnitToCombatUnit);
}
