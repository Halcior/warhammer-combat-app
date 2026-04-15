import unitChunkManifest from "./normalized/units-by-faction/manifest.json";
import { mapNormalizedUnitToCombatUnit } from "./mappers/mapNormalizedUnitToCombatUnit";
import type { Unit } from "../types/combat";
import type { ArmyPresetV2 } from "../types/armyPreset";
import type { NormalizedUnit } from "../types/wahapedia";
import type { SavedBattleSetup } from "../lib/storage/uiStorage";

const unitChunkModules = import.meta.glob("./normalized/units-by-faction/*.json");

type UnitChunkModule = { default: NormalizedUnit[] };

type WorkspaceUISession = {
  workspaceArmyA?: string | null;
  workspaceArmyB?: string | null;
};

export type UnitChunkManifestEntry = {
  factionName: string;
  slug: string;
  fileName: string;
  unitCount: number;
};

type PriorityUnitLoadContext = {
  battleSetup?: Partial<SavedBattleSetup> | null;
  uiSession?: WorkspaceUISession | null;
  armies?: Pick<ArmyPresetV2, "id" | "faction">[];
  fallbackCount?: number;
};

const manifestEntries = unitChunkManifest as UnitChunkManifestEntry[];

function getChunkLoaderByFileName(fileName: string) {
  const entry = Object.entries(unitChunkModules).find(([path]) =>
    path.endsWith(`/${fileName}`)
  );

  return entry?.[1] ?? null;
}

function mapLoadedChunksToUnits(loadedChunks: unknown[]): Unit[] {
  const normalizedUnits = loadedChunks.flatMap(
    (module) => ((module as UnitChunkModule).default ?? [])
  );

  return normalizedUnits.map(mapNormalizedUnitToCombatUnit);
}

export function getAvailableUnitFactions(
  manifest: UnitChunkManifestEntry[] = manifestEntries
): string[] {
  return manifest.map((entry) => entry.factionName);
}

export function resolvePriorityUnitFactions(
  {
    battleSetup,
    uiSession,
    armies = [],
    fallbackCount = 5,
  }: PriorityUnitLoadContext,
  manifest: UnitChunkManifestEntry[] = manifestEntries
): string[] {
  const availableFactions = new Set(manifest.map((entry) => entry.factionName));
  const priorityFactions: string[] = [];
  const armiesById = new Map(armies.map((army) => [army.id, army]));

  function addFaction(factionName?: string | null) {
    if (!factionName || !availableFactions.has(factionName)) {
      return;
    }

    if (!priorityFactions.includes(factionName)) {
      priorityFactions.push(factionName);
    }
  }

  addFaction(battleSetup?.attackerFaction);
  addFaction(battleSetup?.defenderFaction);
  addFaction(
    uiSession?.workspaceArmyA
      ? armiesById.get(uiSession.workspaceArmyA)?.faction
      : null
  );
  addFaction(
    uiSession?.workspaceArmyB
      ? armiesById.get(uiSession.workspaceArmyB)?.faction
      : null
  );

  armies.forEach((army) => addFaction(army.faction));

  if (priorityFactions.length === 0) {
    manifest
      .slice(0, Math.min(fallbackCount, manifest.length))
      .forEach((entry) => addFaction(entry.factionName));
  }

  return priorityFactions;
}

export async function loadUnitsForFactions(factionNames: string[]): Promise<Unit[]> {
  const requestedFactionNames = new Set(factionNames);
  const loaders = manifestEntries
    .filter((entry) => requestedFactionNames.has(entry.factionName))
    .map((entry) => getChunkLoaderByFileName(entry.fileName))
    .filter((loader): loader is NonNullable<typeof loader> => Boolean(loader));

  if (loaders.length === 0) {
    return [];
  }

  const loadedChunks = await Promise.all(loaders.map((loader) => loader()));
  return mapLoadedChunksToUnits(loadedChunks);
}

export async function loadRemainingUnits(
  loadedFactionNames: string[]
): Promise<Unit[]> {
  const alreadyLoaded = new Set(loadedFactionNames);
  const remainingFactions = manifestEntries
    .filter((entry) => !alreadyLoaded.has(entry.factionName))
    .map((entry) => entry.factionName);

  return loadUnitsForFactions(remainingFactions);
}

export async function loadAllUnits(): Promise<Unit[]> {
  return loadUnitsForFactions(getAvailableUnitFactions());
}
