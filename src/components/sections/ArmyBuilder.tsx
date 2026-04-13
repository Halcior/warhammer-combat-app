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
  calculateUnitTotalPointsFromDefinition,
  getEstimatedPointsPerModel,
  formatUnitPointsOptionsSummary,
} from "../../lib/presetUtils";
import { ArmyHeaderSection } from "./ArmyHeaderSection";
import { PointsSummarySection } from "./PointsSummarySection";
import { UnitCard } from "./UnitCard";

interface Enhancement {
  id: string;
  name: string;
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
  availableEnhancements: Enhancement[];
}

function getDefaultWeaponSelections(unitDefinition: Unit) {
  const rangedWeapon = unitDefinition.weapons.find((weapon) => weapon.type === "ranged");
  const meleeWeapon = unitDefinition.weapons.find((weapon) => weapon.type === "melee");
  const primaryWeaponId = rangedWeapon?.id ?? meleeWeapon?.id ?? unitDefinition.weapons[0]?.id ?? "";

  return {
    selectedWeaponId: primaryWeaponId,
    selectedRangedWeaponId: rangedWeapon?.id,
    selectedMeleeWeaponId: meleeWeapon?.id,
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
  availableEnhancements,
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
    () => availableUnits.filter((unit) => !preset.faction || unit.faction === preset.faction),
    [availableUnits, preset.faction]
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

  const handleAddUnit = (unitId: string) => {
    const unitDef = unitDefinitions.get(unitId);
    if (!unitDef) return;
    const weaponSelections = getDefaultWeaponSelections(unitDef);
    const modelCount = unitDef.pointsOptions?.[0]?.modelCount ?? 1;
    const pointsPerModel = getEstimatedPointsPerModel(unitDef);

    const newUnit: SavedUnitInPreset = {
      unitId,
      nickname: unitDef.name,
      modelCount,
      ...weaponSelections,
      leaderAttachedId: undefined,
      enhancementId: undefined,
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

  const handleUpdateUnit = (unitId: string, updates: Partial<SavedUnitInPreset>) => {
    const unit = preset.units.find((u) => u.unitId === unitId);
    if (!unit) return;

    const updated = updateUnitInPreset(preset, unitId, { ...unit, ...updates });
    setPreset(updated);
  };

  const handleDeleteUnit = (unitId: string) => {
    const updated = removeUnitFromPreset(preset, unitId);
    setPreset(updated);
  };

  const handleDuplicateUnit = (unitId: string) => {
    const updated = duplicateUnitInPreset(preset, unitId);
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
        onNameChange={(name) => setPreset({ ...preset, name })}
        onFactionChange={(faction) => setPreset({ ...preset, faction })}
        onDetachmentChange={(detachmentId) => setPreset({ ...preset, detachmentId })}
        onNotesChange={(notes) => setPreset({ ...preset, notes })}
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
            <p className="army-builder__empty-text">No units added yet</p>
            <button
              className="button-link button-link--primary"
              onClick={() => {
                if (unitToAddId) {
                  handleAddUnit(unitToAddId);
                }
              }}
              disabled={!unitToAddId}
            >
              Add Units to Start
            </button>
          </div>
        ) : (
          <div className="army-builder__units-list">
            {preset.units.map((unit) => {
              const unitDef = unitDefinitions.get(unit.unitId);
              if (!unitDef) return null;

              return (
                <UnitCard
                  key={unit.unitId}
                  unit={unit}
                  unitDefinition={unitDef}
                  onUpdate={(updates) => handleUpdateUnit(unit.unitId, updates)}
                  onDelete={() => handleDeleteUnit(unit.unitId)}
                  onDuplicate={() => handleDuplicateUnit(unit.unitId)}
                  availableLeaders={availableLeaders}
                  availableEnhancements={availableEnhancements}
                />
              );
            })}
          </div>
        )}

        {factionScopedUnits.length > 0 && (
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

        {unitToAdd && (
          <p className="army-builder__units-hint">
            {formatUnitPointsOptionsSummary(unitToAdd)}
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
