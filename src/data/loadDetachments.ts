import detachmentChunkManifest from "./normalized/detachments-by-faction/manifest.json";
import type { NormalizedDetachment } from "../types/wahapedia";

const detachmentChunkModules = import.meta.glob("./normalized/detachments-by-faction/*.json");

type DetachmentChunkModule = { default: NormalizedDetachment[] };

export type DetachmentChunkManifestEntry = {
  factionName: string;
  slug: string;
  fileName: string;
  detachmentCount: number;
};

const manifestEntries = detachmentChunkManifest as DetachmentChunkManifestEntry[];

function getChunkLoaderByFileName(fileName: string) {
  const entry = Object.entries(detachmentChunkModules).find(([path]) =>
    path.endsWith(`/${fileName}`)
  );

  return entry?.[1] ?? null;
}

function mapLoadedChunksToDetachments(loadedChunks: unknown[]): NormalizedDetachment[] {
  return loadedChunks.flatMap(
    (module) => ((module as DetachmentChunkModule).default ?? [])
  );
}

export async function loadDetachmentsForFactions(
  factionNames: string[]
): Promise<NormalizedDetachment[]> {
  const requestedFactionNames = new Set(factionNames);
  const loaders = manifestEntries
    .filter((entry) => requestedFactionNames.has(entry.factionName))
    .map((entry) => getChunkLoaderByFileName(entry.fileName))
    .filter((loader): loader is NonNullable<typeof loader> => Boolean(loader));

  if (loaders.length === 0) {
    return [];
  }

  const loadedChunks = await Promise.all(loaders.map((loader) => loader()));
  return mapLoadedChunksToDetachments(loadedChunks);
}

export async function loadRemainingDetachments(
  loadedFactionNames: string[]
): Promise<NormalizedDetachment[]> {
  const alreadyLoaded = new Set(loadedFactionNames);
  const remainingFactions = manifestEntries
    .filter((entry) => !alreadyLoaded.has(entry.factionName))
    .map((entry) => entry.factionName);

  return loadDetachmentsForFactions(remainingFactions);
}

export async function loadAllDetachments(): Promise<NormalizedDetachment[]> {
  return loadDetachmentsForFactions(manifestEntries.map((entry) => entry.factionName));
}
