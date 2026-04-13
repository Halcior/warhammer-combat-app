/**
 * Utility functions for Army Preset system
 * 
 * Handles:
 * - Points calculation
 * - Validation
 * - Migration from old format
 * - Preset manipulation
 */

import type {
  ArmyPreset,
  ArmyPresetV2,
  ArmyPresetOld,
  SavedUnit,
  SavedUnitInPreset,
  ValidationResult,
  MigrationResult,
  PointsBreakdownItem,
} from "../types/armyPreset";
import type { Unit } from "../types/combat";
import { ARMY_PRESET_DEFAULTS } from "../types/armyPreset";

// ── Points Calculation ────────────────────────────────────────────

/**
 * Calculate total points for a single unit in preset
 */
export function calculateUnitPoints(unit: SavedUnitInPreset): number {
  let total = unit.unitTotalPoints || 0;
  
  if (unit.leaderPointsCost) {
    total += unit.leaderPointsCost;
  }
  
  if (unit.enhancementPointsCost) {
    total += unit.enhancementPointsCost;
  }
  
  return total;
}

function getSortedPointsOptions(unitDefinition: Unit | undefined) {
  return [...(unitDefinition?.pointsOptions ?? [])]
    .filter((option) => option.cost > 0)
    .sort((left, right) => (left.modelCount ?? Number.MAX_SAFE_INTEGER) - (right.modelCount ?? Number.MAX_SAFE_INTEGER));
}

export function getBestPointsOptionForModelCount(
  unitDefinition: Unit | undefined,
  modelCount: number
) {
  const options = getSortedPointsOptions(unitDefinition);

  if (options.length === 0) {
    return undefined;
  }

  const exact = options.find((option) => option.modelCount === modelCount);
  if (exact) {
    return exact;
  }

  const nextLargest = options.find(
    (option) => option.modelCount !== undefined && option.modelCount >= modelCount
  );
  if (nextLargest) {
    return nextLargest;
  }

  return options[options.length - 1];
}

export function getEstimatedPointsPerModel(unitDefinition: Unit | undefined): number {
  if (!unitDefinition) {
    return 0;
  }

  const primaryOption = getSortedPointsOptions(unitDefinition).find(
    (option) => option.modelCount && option.modelCount > 0
  );

  if (primaryOption?.modelCount) {
    return Math.round(primaryOption.cost / primaryOption.modelCount);
  }

  return unitDefinition.points ?? 0;
}

export function calculateUnitTotalPointsFromDefinition(
  unitDefinition: Unit | undefined,
  modelCount: number
): number {
  if (!unitDefinition) {
    return 0;
  }

  const bestOption = getBestPointsOptionForModelCount(unitDefinition, modelCount);
  if (bestOption) {
    return bestOption.cost;
  }

  const estimatedPointsPerModel = getEstimatedPointsPerModel(unitDefinition);
  return estimatedPointsPerModel > 0 ? estimatedPointsPerModel * modelCount : 0;
}

export function formatUnitPointsOptionsSummary(unitDefinition: Unit | undefined): string {
  const options = getSortedPointsOptions(unitDefinition);

  if (options.length === 0) {
    return unitDefinition?.points ? `${unitDefinition.points} pts` : "Points unavailable";
  }

  return options
    .map((option) =>
      option.modelCount
        ? `${option.modelCount}: ${option.cost} pts`
        : `${option.description}: ${option.cost} pts`
    )
    .join(" • ");
}

/**
 * Calculate total points for entire army
 */
export function calculateArmyPoints(preset: ArmyPresetV2): number {
  return preset.units.reduce((sum, unit) => sum + calculateUnitPoints(unit), 0);
}

/**
 * Generate points breakdown for display
 */
export function generatePointsBreakdown(
  preset: ArmyPresetV2,
  unitDefinitions: Map<string, Unit>
): PointsBreakdownItem[] {
  return preset.units.map((unit) => {
    const unitDef = unitDefinitions.get(unit.unitId);
    return {
      unitName: unit.nickname ?? unitDef?.name ?? unit.unitId,
      modelCount: unit.modelCount,
      pointsPerModel: unit.pointsPerModel,
      unitTotalPoints: unit.unitTotalPoints || 0,
      leaderPoints: unit.leaderPointsCost,
      enhancementPoints: unit.enhancementPointsCost,
    };
  });
}

// ── Validation ────────────────────────────────────────────────────

/**
 * Validate an army preset
 * 
 * Returns both critical errors (should block save) and warnings
 */
export function validateArmyPreset(preset: ArmyPresetV2): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Critical validations (block save)
  if (!preset.name || preset.name.trim().length === 0) {
    errors.push("Army name is required");
  }

  if (preset.name.length > ARMY_PRESET_DEFAULTS.MAX_ARMY_NAME_LENGTH) {
    errors.push(`Army name must be ${ARMY_PRESET_DEFAULTS.MAX_ARMY_NAME_LENGTH} characters or less`);
  }

  if (!preset.faction) {
    errors.push("Faction is required");
  }

  if (preset.units.length === 0) {
    errors.push("At least one unit is required");
  }

  // Validate each unit
  for (const unit of preset.units) {
    if (unit.modelCount < ARMY_PRESET_DEFAULTS.MIN_MODEL_COUNT) {
      errors.push(`Unit ${unit.nickname || unit.unitId}: model count must be at least 1`);
    }

    if (unit.modelCount > ARMY_PRESET_DEFAULTS.MAX_MODEL_COUNT) {
      errors.push(`Unit ${unit.nickname || unit.unitId}: model count cannot exceed 100`);
    }

    if (!unit.selectedWeaponId) {
      errors.push(`Unit ${unit.nickname || unit.unitId}: weapon selection is required`);
    }
  }

  // Warnings (don't block)
  if (!preset.detachmentId) {
    warnings.push("No detachment selected (optional)");
  }

  if (preset.pointsLimit && preset.totalPoints > preset.pointsLimit) {
    warnings.push(`Army exceeds point limit: ${preset.totalPoints} / ${preset.pointsLimit}`);
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

// ── Migration ──────────────────────────────────────────────────────

/**
 * Migrate old preset format (SavedUnit) to new format (SavedUnitInPreset)
 */
export function migrateUnitToPreset(
  oldUnit: SavedUnit
): SavedUnitInPreset {
  const pointsPerModel = 0;

  return {
    unitId: oldUnit.unitId,
    nickname: oldUnit.nickname,
    modelCount: 1, // Default assumption
    selectedWeaponId: oldUnit.selectedWeaponId,
    pointsPerModel,
    unitTotalPoints: pointsPerModel * 1,
  };
}

/**
 * Migrate old preset format (ArmyPresetOld) to new format (ArmyPresetV2)
 */
export function migratePresetToV2(
  oldPreset: ArmyPresetOld
): MigrationResult {
  const changesApplied: string[] = [];

  const newUnits: SavedUnitInPreset[] = oldPreset.units.map((oldUnit) => {
    const migrated = migrateUnitToPreset(oldUnit);
    changesApplied.push(`Migrated unit ${migrated.nickname || migrated.unitId} with default model count (1)`);
    return migrated;
  });

  const migratedPreset: ArmyPresetV2 = {
    id: oldPreset.id,
    name: oldPreset.name,
    faction: oldPreset.faction,
    units: newUnits,
    notes: oldPreset.notes,
    detachmentId: undefined,
    detachmentName: undefined,
    totalPoints: newUnits.reduce((sum, unit) => sum + unit.unitTotalPoints, 0),
    pointsLimit: ARMY_PRESET_DEFAULTS.DEFAULT_POINTS_LIMIT,
    createdAt: oldPreset.createdAt,
    updatedAt: oldPreset.updatedAt,
  };

  return {
    originalVersion: "v1",
    migratedPreset,
    changesApplied,
  };
}

/**
 * Load a preset and auto-migrate if old format
 */
export function loadAndMigratePreset(preset: ArmyPreset): ArmyPresetV2 {
  // Check if it's the old format
  if ("units" in preset && preset.units.length > 0 && "modelCount" in preset.units[0]) {
    // Already new format
    return preset as ArmyPresetV2;
  }

  // Migrate old format
  const migration = migratePresetToV2(preset as ArmyPresetOld);
  console.info(`Migrated preset "${preset.name}" to new format`, migration.changesApplied);

  return migration.migratedPreset;
}

// ── Preset Manipulation ────────────────────────────────────────────

/**
 * Add a unit to a preset
 */
export function addUnitToPreset(
  preset: ArmyPresetV2,
  newUnit: SavedUnitInPreset
): ArmyPresetV2 {
  const updatedUnits = [...preset.units, newUnit];
  const totalPoints = updatedUnits.reduce((sum, unit) => sum + calculateUnitPoints(unit), 0);

  return {
    ...preset,
    units: updatedUnits,
    totalPoints,
    updatedAt: Date.now(),
  };
}

/**
 * Update a unit in a preset
 */
export function updateUnitInPreset(
  preset: ArmyPresetV2,
  unitId: string,
  updates: Partial<SavedUnitInPreset>
): ArmyPresetV2 {
  const updatedUnits = preset.units.map((unit) =>
    unit.unitId === unitId ? { ...unit, ...updates } : unit
  );
  const totalPoints = updatedUnits.reduce((sum, unit) => sum + calculateUnitPoints(unit), 0);

  return {
    ...preset,
    units: updatedUnits,
    totalPoints,
    updatedAt: Date.now(),
  };
}

/**
 * Remove a unit from a preset
 */
export function removeUnitFromPreset(
  preset: ArmyPresetV2,
  unitId: string
): ArmyPresetV2 {
  const updatedUnits = preset.units.filter((unit) => unit.unitId !== unitId);
  const totalPoints = updatedUnits.reduce((sum, unit) => sum + calculateUnitPoints(unit), 0);

  return {
    ...preset,
    units: updatedUnits,
    totalPoints,
    updatedAt: Date.now(),
  };
}

/**
 * Duplicate a unit within a preset
 */
export function duplicateUnitInPreset(
  preset: ArmyPresetV2,
  unitId: string,
  newNickname?: string
): ArmyPresetV2 {
  const unitToDuplicate = preset.units.find((unit) => unit.unitId === unitId);
  if (!unitToDuplicate) {
    return preset;
  }

  const duplicatedUnit: SavedUnitInPreset = {
    ...unitToDuplicate,
    nickname: newNickname ?? `${unitToDuplicate.nickname} (copy)`,
  };

  return addUnitToPreset(preset, duplicatedUnit);
}

/**
 * Clone an entire preset
 */
export function clonePreset(preset: ArmyPresetV2, newName: string): ArmyPresetV2 {
  return {
    ...preset,
    id: `${preset.id}-clone-${Date.now()}`, // Simple ID generation
    name: newName,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}

/**
 * Get unit nickname with fallback
 */
export function getUnitDisplayName(
  unit: SavedUnitInPreset,
  unitDefinition: Unit | undefined
): string {
  return unit.nickname || unitDefinition?.name || unit.unitId;
}

/**
 * Check if points are within limit
 */
export function isWithinPointsLimit(
  totalPoints: number,
  pointsLimit: number | undefined
): boolean {
  if (!pointsLimit) {
    return true; // Unlimited
  }
  return totalPoints <= pointsLimit;
}

/**
 * Format points for display
 */
export function formatPoints(points: number): string {
  return `${points} pts`;
}

/**
 * Get points status color (for UI)
 */
export function getPointsStatusColor(
  totalPoints: number,
  pointsLimit: number | undefined
): "success" | "warning" | "error" {
  if (!pointsLimit) {
    return "success";
  }

  const percentage = (totalPoints / pointsLimit) * 100;

  if (percentage <= 90) {
    return "success";
  } else if (percentage <= 100) {
    return "warning";
  } else {
    return "error";
  }
}
