import { useMemo, useState } from "react";
import type { ArmyPresetV2, SavedUnitInPreset } from "../types/armyPreset";
import type { CombatUnit } from "../types/combat";

interface LoadArmySelectorProps {
  armies: ArmyPresetV2[];
  unitDefinitions: CombatUnit[];
  onLoadUnit: (faction: string, unitId: string, weaponId: string) => void;
  onClose?: () => void;
}

export function LoadArmySelector({
  armies,
  unitDefinitions,
  onLoadUnit,
  onClose,
}: LoadArmySelectorProps) {
  const [selectedArmyId, setSelectedArmyId] = useState<string | null>(null);
  const [selectedUnitInstanceId, setSelectedUnitInstanceId] = useState<string | null>(null);

  // Find the selected army
  const selectedArmy = useMemo(
    () => armies.find((army) => army.id === selectedArmyId) ?? null,
    [armies, selectedArmyId]
  );

  // Find the selected unit within the army
  const selectedUnit = useMemo(
    () => selectedArmy?.units.find((u) => u.instanceId === selectedUnitInstanceId) ?? null,
    [selectedArmy, selectedUnitInstanceId]
  );

  // Find the actual CombatUnit definition for validation
  const selectedUnitDefinition = useMemo(() => {
    if (!selectedUnit) return null;
    return unitDefinitions.find((u) => u.id === selectedUnit.unitId) ?? null;
  }, [selectedUnit, unitDefinitions]);

  const handleLoadUnit = () => {
    if (!selectedArmy || !selectedUnit || !selectedUnitDefinition) return;

    const weaponId = selectedUnit.selectedWeaponId;
    onLoadUnit(selectedArmy.faction, selectedUnit.unitId, weaponId);

    // Reset selections after loading
    setSelectedArmyId(null);
    setSelectedUnitInstanceId(null);
  };

  const canLoad = Boolean(selectedArmy && selectedUnit && selectedUnitDefinition);

  return (
    <div className="load-army-selector">
      <div className="load-army-selector__container">
        <p className="load-army-selector__title">Load from Saved Army</p>

        {/* Army Selection */}
        <div className="load-army-selector__section">
          <label className="load-army-selector__label">Select Army</label>
          <select
            className="load-army-selector__select"
            value={selectedArmyId ?? ""}
            onChange={(e) => {
              setSelectedArmyId(e.target.value || null);
              setSelectedUnitInstanceId(null); // Reset unit selection
            }}
          >
            <option value="">-- Choose an army --</option>
            {armies.map((army) => (
              <option key={army.id} value={army.id}>
                {army.name} ({army.faction})
              </option>
            ))}
          </select>
        </div>

        {/* Unit Selection */}
        {selectedArmy && (
          <div className="load-army-selector__section">
            <label className="load-army-selector__label">Select Unit</label>
            <select
              className="load-army-selector__select"
              value={selectedUnitInstanceId ?? ""}
              onChange={(e) => setSelectedUnitInstanceId(e.target.value || null)}
            >
              <option value="">-- Choose a unit --</option>
              {selectedArmy.units.map((unit) => {
                const unitDef = unitDefinitions.find((u) => u.id === unit.unitId);
                const label = unitDef
                  ? `${unitDef.name} (${unit.modelCount} models)`
                  : `Unit ${unit.unitId}`;
                return (
                  <option key={unit.instanceId} value={unit.instanceId}>
                    {label}
                  </option>
                );
              })}
            </select>
          </div>
        )}

        {/* Unit Preview */}
        {selectedUnit && selectedUnitDefinition && (
          <div className="load-army-selector__preview">
            <div className="load-army-selector__preview-row">
              <span className="load-army-selector__preview-label">Unit:</span>
              <span className="load-army-selector__preview-value">
                {selectedUnitDefinition.name} ({selectedUnit.modelCount} models)
              </span>
            </div>
            <div className="load-army-selector__preview-row">
              <span className="load-army-selector__preview-label">Weapon:</span>
              <span className="load-army-selector__preview-value">
                {selectedUnitDefinition.weapons.find((w) => w.id === selectedUnit.selectedWeaponId)
                  ?.name ?? "Unknown"}
              </span>
            </div>
            {selectedUnit.modelCount !== undefined && (
              <div className="load-army-selector__preview-row">
                <span className="load-army-selector__preview-label">Models:</span>
                <span className="load-army-selector__preview-value">{selectedUnit.modelCount}</span>
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="load-army-selector__actions">
          <button
            className="load-army-selector__button load-army-selector__button--primary"
            disabled={!canLoad}
            onClick={handleLoadUnit}
          >
            Load into Calculator
          </button>
          {onClose && (
            <button
              className="load-army-selector__button load-army-selector__button--secondary"
              onClick={onClose}
            >
              Cancel
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
