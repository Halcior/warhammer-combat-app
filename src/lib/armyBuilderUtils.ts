import type { ArmyPresetV2 } from "../types/armyPreset";
import type { Unit } from "../types/combat";

interface Enhancement {
  id: string;
  name: string;
  description?: string;
  cost?: number;
}

export function getFactionScopedUnits(availableUnits: Unit[], faction: string): Unit[] {
  if (!faction) {
    return [];
  }
  return availableUnits.filter((unit) => unit.faction === faction);
}

export function applyFactionSelectionToPreset(
  preset: ArmyPresetV2,
  faction: string,
  unitDefinitions: Map<string, Unit>
): ArmyPresetV2 {
  const nextUnits = preset.units.filter(
    (unit) => unitDefinitions.get(unit.unitId)?.faction === faction
  );
  const totalPoints = nextUnits.reduce(
    (sum, unit) =>
      sum + unit.unitTotalPoints + (unit.leaderPointsCost ?? 0) + (unit.enhancementPointsCost ?? 0),
    0
  );

  return {
    ...preset,
    faction,
    detachmentId: undefined,
    detachmentName: undefined,
    units: nextUnits,
    totalPoints,
    updatedAt: Date.now(),
  };
}

export function applyDetachmentSelectionToPreset(
  preset: ArmyPresetV2,
  detachmentId: string | undefined,
  detachmentName: string | undefined,
  availableEnhancementsByDetachment: Record<string, Enhancement[]>
): ArmyPresetV2 {
  const allowedEnhancementIds = new Set(
    (detachmentId ? availableEnhancementsByDetachment[detachmentId] : [])?.map(
      (enhancement) => enhancement.id
    ) ?? []
  );

  const nextUnits = preset.units.map((unit) => {
    if (!unit.enhancementId || allowedEnhancementIds.has(unit.enhancementId)) {
      return unit;
    }

    return {
      ...unit,
      enhancementId: undefined,
      enhancementHost: "unit" as const,
      enhancementPointsCost: 0,
    };
  });

  return {
    ...preset,
    detachmentId,
    detachmentName,
    units: nextUnits,
    totalPoints: nextUnits.reduce(
      (sum, unit) =>
        sum + unit.unitTotalPoints + (unit.leaderPointsCost ?? 0) + (unit.enhancementPointsCost ?? 0),
      0
    ),
    updatedAt: Date.now(),
  };
}
