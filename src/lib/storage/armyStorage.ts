import type { ArmyPreset } from "../../types/army";

const STORAGE_KEY = "df_army_presets_v1";
export const FREE_LIMIT = 3;

export function loadArmies(): ArmyPreset[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as ArmyPreset[]) : [];
  } catch {
    return [];
  }
}

function persistAll(armies: ArmyPreset[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(armies));
}

type ArmyData = Pick<ArmyPreset, "name" | "faction" | "units" | "notes">;

export function createArmy(data: ArmyData): ArmyPreset {
  const armies = loadArmies();
  const now = Date.now();
  const army: ArmyPreset = {
    id: `army_${now}_${Math.random().toString(36).slice(2, 7)}`,
    name: data.name,
    faction: data.faction,
    units: data.units,
    notes: data.notes,
    createdAt: now,
    updatedAt: now,
  };
  persistAll([...armies, army]);
  return army;
}

export function updateArmy(id: string, data: ArmyData): ArmyPreset | null {
  const armies = loadArmies();
  const idx = armies.findIndex((a) => a.id === id);
  if (idx === -1) return null;
  const updated: ArmyPreset = {
    ...armies[idx],
    name: data.name,
    faction: data.faction,
    units: data.units,
    notes: data.notes,
    updatedAt: Date.now(),
  };
  armies[idx] = updated;
  persistAll(armies);
  return updated;
}

export function deleteArmy(id: string): void {
  persistAll(loadArmies().filter((a) => a.id !== id));
}

export function duplicateArmy(id: string): ArmyPreset | null {
  const armies = loadArmies();
  const source = armies.find((a) => a.id === id);
  if (!source) return null;
  const now = Date.now();
  const copy: ArmyPreset = {
    ...source,
    id: `army_${now}_${Math.random().toString(36).slice(2, 7)}`,
    name: `${source.name} (copy)`,
    createdAt: now,
    updatedAt: now,
  };
  persistAll([...armies, copy]);
  return copy;
}
