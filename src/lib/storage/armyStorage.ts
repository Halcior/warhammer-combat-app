import type { ArmyPresetV2 } from "../../types/armyPreset";
import { loadAndMigratePreset } from "../presetUtils";
import { normalizeFactionName } from "../normalizeFactionName";

const STORAGE_KEY = "df_army_presets_v2";
const LEGACY_STORAGE_KEY = "df_army_presets_v1";
export const FREE_LIMIT = 3;

export type ArmyDraft = Omit<ArmyPresetV2, "id" | "createdAt" | "updatedAt">;

export function loadArmies(): ArmyPresetV2[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return (JSON.parse(raw) as ArmyPresetV2[]).map(loadAndMigratePreset);
    }

    const legacyRaw = localStorage.getItem(LEGACY_STORAGE_KEY);
    if (!legacyRaw) {
      return [];
    }

    const migrated = (JSON.parse(legacyRaw) as Array<ArmyPresetV2>).map(
      loadAndMigratePreset
    );
    persistAll(migrated);
    return migrated;
  } catch {
    return [];
  }
}

function persistAll(armies: ArmyPresetV2[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(armies));
}

export function createArmy(data: ArmyDraft): ArmyPresetV2 {
  const armies = loadArmies();
  const now = Date.now();
  const army: ArmyPresetV2 = {
    ...data,
    faction: normalizeFactionName(data.faction),
    id: `army_${now}_${Math.random().toString(36).slice(2, 7)}`,
    createdAt: now,
    updatedAt: now,
  };
  persistAll([...armies, army]);
  return army;
}

export function updateArmy(id: string, data: ArmyDraft): ArmyPresetV2 | null {
  const armies = loadArmies();
  const idx = armies.findIndex((army) => army.id === id);
  if (idx === -1) {
    return null;
  }

  const updated: ArmyPresetV2 = {
    ...armies[idx],
    ...data,
    faction: normalizeFactionName(data.faction),
    id,
    updatedAt: Date.now(),
  };

  armies[idx] = updated;
  persistAll(armies);
  return updated;
}

export function deleteArmy(id: string): void {
  persistAll(loadArmies().filter((army) => army.id !== id));
}

function makeCopyName(name: string): string {
  const base = name.replace(/ \(copy(?: \d+)?\)$/, "").trim();
  const armies = loadArmies();
  const pattern = new RegExp(
    `^${base.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")} \\(copy(?: (\\d+))?\\)$`
  );
  const existingNumbers = armies
    .map((army) => {
      const match = army.name.match(pattern);
      return match ? (match[1] ? parseInt(match[1], 10) : 1) : null;
    })
    .filter((value): value is number => value !== null);

  if (existingNumbers.length === 0) {
    return `${base} (copy)`;
  }

  return `${base} (copy ${Math.max(...existingNumbers) + 1})`;
}

export function duplicateArmy(id: string): ArmyPresetV2 | null {
  const armies = loadArmies();
  const source = armies.find((army) => army.id === id);
  if (!source) {
    return null;
  }

  const now = Date.now();
  const copy: ArmyPresetV2 = {
    ...source,
    id: `army_${now}_${Math.random().toString(36).slice(2, 7)}`,
    name: makeCopyName(source.name),
    createdAt: now,
    updatedAt: now,
  };

  persistAll([...armies, copy]);
  return copy;
}
