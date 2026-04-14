import { useState, useMemo, useEffect } from "react";
import type { ArmyPresetV2, SavedUnitInPreset } from "../../types/armyPreset";
import type { Unit } from "../../types/combat";
import {
  validateArmyPreset,
  generatePointsBreakdown,
  calculateArmyPoints,
  addUnitToPreset,
  removeUnitFromPreset,
  updateUnitInPreset,
  duplicateUnitInPreset,
  buildDefaultSelectedWeapons,
  calculateUnitTotalPointsFromDefinition,
  createPresetUnitInstanceId,
  deriveLegacyWeaponSelection,
  getEstimatedPointsPerModel,
  formatUnitPointsOptionsSummary,
} from "../../lib/presetUtils";
import { ArmyHeaderSection } from "./ArmyHeaderSection";
import { PointsSummarySection } from "./PointsSummarySection";
import { UnitCard } from "./UnitCard";

interface Enhancement {
  id: string;
  name: string;
  description?: string;
  cost?: number;
}

interface ArmyBuilderProps {
  initial?: ArmyPresetV2;
  onSave: (preset: ArmyPresetV2) => void;
  onCancel: () => void;
  factions: string[];
  detachmentsByFaction: Record<string, Array<{ id: string; name: string }>>;
  unitDefinitions: Map<string, Unit>;
  availableUnits: Unit[];
  availableLeaders: Unit[];
  availableEnhancementsByDetachment: Record<string, Enhancement[]>;
}

export function getFactionScopedUnits(availableUnits: Unit[], faction: string) {
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

export function ArmyBuilder({
  initial,
  onSave,
  onCancel,
  factions,
  detachmentsByFaction,
  unitDefinitions,
  availableUnits,
  availableLeaders,
  availableEnhancementsByDetachment,
}: ArmyBuilderProps) {
  const [preset, setPreset] = useState<ArmyPresetV2>(
    initial ?? {
      id: `army-${Date.now()}`,
      name: "",
      faction: "",
      units: [],
      totalPoints: 0,
      pointsLimit: 2000,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }
  );
  const [unitToAddId, setUnitToAddId] = useState("");
  const factionScopedUnits = useMemo(
    () => getFactionScopedUnits(availableUnits, preset.faction),
    [availableUnits, preset.faction]
  );
  const factionScopedLeaders = useMemo(
    () => getFactionScopedUnits(availableLeaders, preset.faction),
    [availableLeaders, preset.faction]
  );
  const detachmentScopedEnhancements = useMemo(
    () => (preset.detachmentId ? availableEnhancementsByDetachment[preset.detachmentId] ?? [] : []),
    [availableEnhancementsByDetachment, preset.detachmentId]
  );

  useEffect(() => {
    if (factionScopedUnits.length === 0) {
      if (unitToAddId !== "") {
        setUnitToAddId("");
      }
      return;
    }

    if (!unitToAddId || !factionScopedUnits.some((unit) => unit.id === unitToAddId)) {
      setUnitToAddId(factionScopedUnits[0].id);
    }
  }, [factionScopedUnits, unitToAddId]);

  const validation = useMemo(() => validateArmyPreset(preset), [preset]);
  const breakdown = useMemo(
    () => generatePointsBreakdown(preset, unitDefinitions),
    [preset, unitDefinitions]
  );
  const unitToAdd = factionScopedUnits.find((unit) => unit.id === unitToAddId);

  const handleSave = () => {
    if (validation.isValid) {
      const updated: ArmyPresetV2 = {
        ...preset,
        totalPoints: calculateArmyPoints(preset),
        updatedAt: Date.now(),
      };
      onSave(updated);
    }
  };

  const handleFactionChange = (faction: string) => {
    setPreset((current) => applyFactionSelectionToPreset(current, faction, unitDefinitions));
    setUnitToAddId("");
  };

  const handleDetachmentChange = (detachmentId: string | undefined) => {
    const detachmentName =
      preset.faction && detachmentId
        ? detachmentsByFaction[preset.faction]?.find((item) => item.id === detachmentId)?.name
        : undefined;

    setPreset((current) =>
      applyDetachmentSelectionToPreset(
        current,
        detachmentId,
        detachmentName,
        availableEnhancementsByDetachment
      )
    );
  };

  const handleAddUnit = (unitId: string) => {
    const unitDef = unitDefinitions.get(unitId);
    if (!unitDef) return;
    const selectedWeapons = buildDefaultSelectedWeapons(unitDef);
    const legacyWeaponSelection = deriveLegacyWeaponSelection(selectedWeapons, unitDef);
    const modelCount = unitDef.pointsOptions?.[0]?.modelCount ?? 1;
    const pointsPerModel = getEstimatedPointsPerModel(unitDef);

    const newUnit: SavedUnitInPreset = {
      instanceId: createPresetUnitInstanceId(),
      unitId,
      nickname: unitDef.name,
      modelCount,
      ...legacyWeaponSelection,
      selectedWeapons: legacyWeaponSelection.selectedWeapons,
      leaderAttachedId: undefined,
      attachedLeader: undefined,
      enhancementId: undefined,
      enhancementHost: "unit",
      pointsPerModel,
      unitTotalPoints: calculateUnitTotalPointsFromDefinition(unitDef, modelCount),
      leaderPointsCost: 0,
      enhancementPointsCost: 0,
      notes: "",
      role: "troop",
      addedAt: Date.now(),
    };

    const updated = addUnitToPreset(preset, newUnit);
    setPreset(updated);
  };

  const handleUpdateUnit = (instanceId: string, updates: Partial<SavedUnitInPreset>) => {
    const unit = preset.units.find((u) => u.instanceId === instanceId);
    if (!unit) return;

    const updated = updateUnitInPreset(preset, instanceId, { ...unit, ...updates });
    setPreset(updated);
  };

  const handleDeleteUnit = (instanceId: string) => {
    const updated = removeUnitFromPreset(preset, instanceId);
    setPreset(updated);
  };

  const handleDuplicateUnit = (instanceId: string) => {
    const updated = duplicateUnitInPreset(preset, instanceId);
    setPreset(updated);
  };

  return (
    <div className="army-builder">
      {/* Validation Errors */}
      {validation.errors.length > 0 && (
        <div className="army-builder__validation army-builder__validation--error">
          <h4 className="army-builder__validation-title">⚠️ Please fix these errors</h4>
          <ul className="army-builder__validation-list">
            {validation.errors.map((err, idx) => (
              <li key={idx}>{err}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Validation Warnings */}
      {validation.warnings.length > 0 && (
        <div className="army-builder__validation army-builder__validation--warning">
          <h4 className="army-builder__validation-title">📋 Suggestions</h4>
          <ul className="army-builder__validation-list">
            {validation.warnings.map((warn, idx) => (
              <li key={idx}>{warn}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Army Header Section */}
      <ArmyHeaderSection
        preset={preset}
        onNameChange={(name) => setPreset((current) => ({ ...current, name }))}
        onFactionChange={handleFactionChange}
        onDetachmentChange={handleDetachmentChange}
        onNotesChange={(notes) => setPreset((current) => ({ ...current, notes }))}
        onPointsLimitChange={(limit) => setPreset((current) => ({ ...current, pointsLimit: limit }))}
        factions={factions}
        detachmentsByFaction={detachmentsByFaction}
        validationErrors={
          validation.errors.reduce((acc: Record<string, string>, err) => {
            if (err.includes("name")) acc.name = err;
            if (err.includes("faction")) acc.faction = err;
            return acc;
          }, {})
        }
      />

      {/* Points Summary Section */}
      <PointsSummarySection preset={preset} breakdown={breakdown} />

      {/* Units Section */}
      <div className="army-builder__units">
        <div className="army-builder__units-header">
          <h3 className="army-builder__units-title">Units ({preset.units.length})</h3>
          <button
            className="button-link button-link--primary"
            onClick={() => {
              if (unitToAddId) {
                handleAddUnit(unitToAddId);
              }
            }}
            disabled={!unitToAddId}
          >
            + Add Unit
          </button>
        </div>

        {preset.units.length === 0 ? (
          <div className="army-builder__empty">
            <p className="army-builder__empty-text">No units added yet. Use the + Add Unit button above to get started.</p>
          </div>
        ) : (
          <div className="army-builder__units-list">
            {preset.units.map((unit) => {
              const unitDef = unitDefinitions.get(unit.unitId);
              if (!unitDef) return null;

              return (
                <UnitCard
                  key={unit.instanceId}
                  unit={unit}
                  unitDefinition={unitDef}
                  onUpdate={(updates) => handleUpdateUnit(unit.instanceId, updates)}
                  onDelete={() => handleDeleteUnit(unit.instanceId)}
                  onDuplicate={() => handleDuplicateUnit(unit.instanceId)}
                  availableLeaders={factionScopedLeaders}
                  availableEnhancements={detachmentScopedEnhancements}
                  detachmentSelected={Boolean(preset.detachmentId)}
                />
              );
            })}
          </div>
        )}

        {!preset.faction && (
          <p className="army-builder__units-hint army-builder__units-hint--empty">
            Select a faction first to narrow the unit list to a legal roster.
          </p>
        )}

        {preset.faction && factionScopedUnits.length > 0 && (
          <div className="army-builder__add-row">
            <select
              className="army-builder__select army-builder__select--grow"
              value={unitToAddId}
              onChange={(event) => setUnitToAddId(event.target.value)}
            >
              {factionScopedUnits.map((unit) => (
                <option key={unit.id} value={unit.id}>
                  {unit.name}
                  {unit.points ? ` · ${unit.points} pts` : ""}
                </option>
              ))}
            </select>

            <button
              className="army-builder__add-btn"
              onClick={() => {
                if (unitToAddId) {
                  handleAddUnit(unitToAddId);
                }
              }}
              disabled={!unitToAddId}
            >
              Add Selected
            </button>
          </div>
        )}

        {preset.faction && unitToAdd && (
          <p className="army-builder__units-hint">
            {formatUnitPointsOptionsSummary(unitToAdd)}
          </p>
        )}

        {preset.faction && factionScopedUnits.length === 0 && (
          <p className="army-builder__units-hint army-builder__units-hint--empty">
            No units were found for {preset.faction}.
          </p>
        )}
      </div>

      {/* Action Buttons */}
      <div className="army-builder__actions">
        <button className="button-link button-link--secondary" onClick={onCancel}>
          Cancel
        </button>
        <button
          className="button-link button-link--primary"
          onClick={handleSave}
          disabled={!validation.isValid}
        >
          {initial ? "Save Changes" : "Create Army"}
        </button>
      </div>
    </div>
  );
}
