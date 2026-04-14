import type { ArmyPresetV2, SavedUnitInPreset } from "../types/armyPreset";
import type { Unit } from "../types/combat";

/**
 * Export format version
 */
export const EXPORT_FORMAT_VERSION = "1.0";
export const EXPORT_FORMAT_TYPE = "damageforge_army_preset";

/**
 * Serialized unit in export format
 */
export interface SerializedUnit extends SavedUnitInPreset {
  unitName: string;
  resolvedPoints: number;
}

/**
 * Export format for army presets
 */
export interface ArmyPresetExport {
  version: string;
  type: string;
  exportedAt: string;
  armyName: string;
  faction: string;
  detachmentId?: string;
  detachmentName?: string;
  notes?: string;
  totalPoints: number;
  pointsLimit: number;
  purpose?: string;
  tags?: string[];
  units: SerializedUnit[];
}

/**
 * Export a single army preset to JSON format
 */
export function exportArmyPreset(
  preset: ArmyPresetV2,
  unitDefinitions: Map<string, Unit>
): ArmyPresetExport {
  const serializedUnits: SerializedUnit[] = preset.units.map((unit) => {
    const unitDef = unitDefinitions.get(unit.unitId);
    return {
      ...unit,
      unitName: unitDef?.name || "Unknown Unit",
      resolvedPoints:
        unit.unitTotalPoints +
        (unit.leaderPointsCost || 0) +
        (unit.enhancementPointsCost || 0),
    };
  });

  return {
    version: EXPORT_FORMAT_VERSION,
    type: EXPORT_FORMAT_TYPE,
    exportedAt: new Date().toISOString(),
    armyName: preset.name,
    faction: preset.faction,
    detachmentId: preset.detachmentId,
    detachmentName: preset.detachmentName,
    notes: preset.notes,
    totalPoints: preset.totalPoints,
    pointsLimit: preset.pointsLimit,
    purpose: preset.purpose,
    tags: preset.tags,
    units: serializedUnits,
  };
}

/**
 * Validate exported format
 */
export function validateArmyPresetExport(data: unknown): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!data || typeof data !== "object") {
    errors.push("Invalid format: data must be an object");
    return { valid: false, errors };
  }

  const obj = data as Record<string, unknown>;

  // Check version and type
  if (obj.version !== EXPORT_FORMAT_VERSION) {
    errors.push(
      `Unsupported format version: ${obj.version}. Expected: ${EXPORT_FORMAT_VERSION}`
    );
  }

  if (obj.type !== EXPORT_FORMAT_TYPE) {
    errors.push(`Invalid type: ${obj.type}. Expected: ${EXPORT_FORMAT_TYPE}`);
  }

  // Check required fields
  const requiredFields = ["armyName", "faction", "totalPoints", "units"];
  for (const field of requiredFields) {
    if (!(field in obj)) {
      errors.push(`Missing required field: ${field}`);
    }
  }

  // Check array fields
  if (!Array.isArray(obj.units)) {
    errors.push("Invalid format: units must be an array");
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Import army preset from export format
 */
export function importArmyPreset(
  exportData: ArmyPresetExport,
  unitDefinitions: Map<string, Unit>
): ArmyPresetV2 {
  // Reconstruct units, filtering out any that don't exist in current unit database
  const units = exportData.units
    .filter((u) => unitDefinitions.has(u.unitId))
    .map((u) => {
      const { unitName, resolvedPoints, ...rest } = u;
      return rest;
    });

  return {
    id: `army-${Date.now()}`,
    name: exportData.armyName,
    faction: exportData.faction,
    units,
    detachmentId: exportData.detachmentId,
    detachmentName: exportData.detachmentName,
    totalPoints: exportData.totalPoints,
    pointsLimit: exportData.pointsLimit,
    notes: exportData.notes,
    purpose: exportData.purpose,
    tags: exportData.tags,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    createdAtReadable: new Date().toLocaleString(),
    isPublic: false,
    authorId: undefined,
    forkedFromId: undefined,
  };
}

/**
 * Export preset as JSON string
 */
export function exportArmyAsJSON(
  preset: ArmyPresetV2,
  unitDefinitions: Map<string, Unit>
): string {
  const exportData = exportArmyPreset(preset, unitDefinitions);
  return JSON.stringify(exportData, null, 2);
}

/**
 * Try to parse and validate JSON import
 */
export function parseArmyJSON(jsonString: string): {
  valid: boolean;
  data: ArmyPresetExport | null;
  errors: string[];
} {
  try {
    const data = JSON.parse(jsonString);
    const validation = validateArmyPresetExport(data);

    if (!validation.valid) {
      return { valid: false, data: null, errors: validation.errors };
    }

    return { valid: true, data, errors: [] };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return {
      valid: false,
      data: null,
      errors: [`JSON parse error: ${message}`],
    };
  }
}

/**
 * Download file helper
 */
export function downloadFile(content: string, filename: string): void {
  const element = document.createElement("a");
  element.setAttribute(
    "href",
    `data:application/json;charset=utf-8,${encodeURIComponent(content)}`
  );
  element.setAttribute("download", filename);
  element.style.display = "none";
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
}

/**
 * Copy to clipboard helper
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}
