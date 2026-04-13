/**
 * Extended Army Preset Types
 * 
 * Provides enhanced data structure for saving and reusing army presets
 * with practical setup context (model counts, detachments, enhancements, etc.)
 * 
 * Maintains backward compatibility with existing SavedUnit structure.
 */

import type { Weapon, Unit } from "./combat";

// ── Types for Enhanced Preset System ──────────────────────────────

/**
 * Single unit as it appears in a saved preset
 * 
 * Captures all the practical setup for a unit:
 * - How many models
 * - Which weapon they're using
 * - Which leader is attached (if any)
 * - Which enhancement is active (if any)
 * - Points calculation
 */
export type SavedUnitInPreset = {
  // ── Core identification ──
  unitId: string;           // Reference to base unit definition
  nickname?: string;        // Optional user label (e.g., "Heavy Weapons Squad")

  // ── Practical setup ──
  modelCount: number;       // How many models in this unit (required, ≥ 1)
  selectedWeaponId: string; // Primary weapon choice
  leaderAttachedId?: string;      // Optional leader unit ID attached to this unit
  enhancementId?: string;         // Optional enhancement from detachment
  wargearUpgrades?: string[];     // Future: wargear/upgrade IDs

  // ── Points tracking (calculated & cached) ──
  pointsPerModel: number;         // Cached from unit definition
  unitTotalPoints: number;        // Calculated: pointsPerModel × modelCount
  leaderPointsCost?: number;      // Points for attached leader (if any)
  enhancementPointsCost?: number; // Points for enhancement (if any)

  // ── Context & notes ──
  notes?: string;           // Unit-level notes ("Aggressively positioned", etc.)
  role?: string;            // Optional role hint ("Striker", "Support", "Objective holder")

  // ── Timestamps ──
  addedAt?: number;         // When unit added to preset
};

/**
 * Army preset with enhanced context
 * 
 * Replaces/extends the existing ArmyPreset type to include:
 * - Detachment information
 * - Points tracking and breakdown
 * - Enhanced unit structure with model counts, attachments, etc.
 */
export type ArmyPresetV2 = {
  // ── Identity ──
  id: string;               // Unique ID
  name: string;             // Army name (required, 1-50 chars)
  faction: string;          // Faction name (e.g., "Necrons", "Space Marines")

  // ── Army composition ──
  units: SavedUnitInPreset[];      // Units in the army
  detachmentId?: string;           // Detachment ID (optional, no blocking)
  detachmentName?: string;         // Detachment name for display

  // ── Points tracking ──
  totalPoints: number;             // Total army points (calculated)
  pointsLimit?: number;            // Target/max points (e.g., 2000)
  pointsBreakdown?: {
    [unitId: string]: number;      // Per-unit points for detail view
  };

  // ── Context ──
  notes?: string;                  // Army-level notes ("Competitive", "Fun narrative", etc.)
  purpose?: string;                // Army purpose ("1500pts casual", "2000pts competitive", etc.)
  tags?: string[];                 // Searchable tags: ["2000pts", "competitive", "necrons"]

  // ── Metadata ──
  createdAt: number;               // Creation timestamp
  updatedAt: number;               // Last modification timestamp
  createdAtReadable?: string;      // Optional: human-readable date for display

  // ── Future features (reserved) ──
  isPublic?: boolean;              // Future: share with community
  authorId?: string;               // Future: who created this
  forkedFromId?: string;           // Future: if cloned from another preset
};

/**
 * Backward-compatible type union
 * 
 * Allows code to accept either old or new preset format.
 * Migration happens on load.
 */
export type ArmyPreset = ArmyPresetV2 | ArmyPresetOld;

/**
 * Original ArmyPreset (kept for backward compat and migration)
 */
export type ArmyPresetOld = {
  id: string;
  name: string;
  faction: string;
  units: SavedUnit[];
  notes?: string;
  createdAt: number;
  updatedAt: number;
};

/**
 * Original SavedUnit (kept for backward compat)
 */
export type SavedUnit = {
  unitId: string;
  selectedWeaponId: string;
  nickname?: string;
};

// ── Helper Types ──────────────────────────────────────────────────

/**
 * Points breakdown display item
 */
export type PointsBreakdownItem = {
  unitName: string;
  modelCount: number;
  pointsPerModel: number;
  unitTotalPoints: number;
  leaderPoints?: number;
  enhancementPoints?: number;
};

/**
 * Form state for the army builder
 */
export type ArmyBuilderFormState = ArmyPresetV2 & {
  // Editing/UI state
  isEditingUnitId?: string;        // Which unit is currently being edited
  errorMessage?: string;           // Form-level error
  fieldErrors?: {
    [key: string]: string;         // Field-level errors
  };
};

/**
 * Validation result
 */
export type ValidationResult = {
  isValid: boolean;
  errors: string[];              // Critical errors (block save)
  warnings: string[];            // Non-blocking warnings
};

/**
 * Migration result when loading old presets
 */
export type MigrationResult = {
  originalVersion: "v1" | "v2";
  migratedPreset: ArmyPresetV2;
  changesApplied: string[];      // List of migrations done
};

// ── Type Guards ────────────────────────────────────────────────────

export function isArmyPresetV2(preset: ArmyPreset): preset is ArmyPresetV2 {
  return "units" in preset && Array.isArray(preset.units) &&
    (preset.units.length === 0 || "modelCount" in preset.units[0]);
}

export function isArmyPresetOld(preset: ArmyPreset): preset is ArmyPresetOld {
  return "units" in preset && Array.isArray(preset.units) &&
    (preset.units.length === 0 || ("unitId" in preset.units[0] && !("modelCount" in preset.units[0])));
}

export function isSavedUnitInPreset(unit: SavedUnit | SavedUnitInPreset): unit is SavedUnitInPreset {
  return "modelCount" in unit;
}

export function isSavedUnitOld(unit: SavedUnit | SavedUnitInPreset): unit is SavedUnit {
  return !("modelCount" in unit);
}

// ── Constants ───────────────────────────────────────────────────

export const ARMY_PRESET_DEFAULTS = {
  DEFAULT_POINTS_LIMIT: 2000,
  MIN_ARMY_NAME_LENGTH: 1,
  MAX_ARMY_NAME_LENGTH: 50,
  MIN_MODEL_COUNT: 1,
  MAX_MODEL_COUNT: 100,
  DEFAULT_MODEL_COUNT: 1,
} as const;

export const POINTS_LIMIT_PRESETS = [
  { label: "500 pts", value: 500 },
  { label: "1000 pts", value: 1000 },
  { label: "1500 pts", value: 1500 },
  { label: "2000 pts (Standard)", value: 2000 },
  { label: "2500 pts", value: 2500 },
  { label: "Unlimited", value: undefined },
] as const;
