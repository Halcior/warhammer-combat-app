import { useState } from "react";
import type { SavedUnitInPreset } from "../../types/armyPreset";
import type { Unit } from "../../types/combat";
import {
  calculateUnitTotalPointsFromDefinition,
  getEstimatedPointsPerModel,
} from "../../lib/presetUtils";

interface UnitCardProps {
  unit: SavedUnitInPreset;
  unitDefinition: Unit;
  onUpdate: (updates: Partial<SavedUnitInPreset>) => void;
  onDelete: () => void;
  onDuplicate: () => void;
  availableLeaders: Unit[];
  availableEnhancements: Array<{ id: string; name: string }>;
}

export function UnitCard({
  unit,
  unitDefinition,
  onUpdate,
  onDelete,
  onDuplicate,
  availableLeaders,
  availableEnhancements,
}: UnitCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [localUnit, setLocalUnit] = useState<SavedUnitInPreset>(unit);
  const rangedWeapons = unitDefinition.weapons.filter((weapon) => weapon.type === "ranged");
  const meleeWeapons = unitDefinition.weapons.filter((weapon) => weapon.type === "melee");
  const selectedRangedWeapon =
    rangedWeapons.find((weapon) => weapon.id === unit.selectedRangedWeaponId) ?? rangedWeapons[0];
  const selectedMeleeWeapon =
    meleeWeapons.find((weapon) => weapon.id === unit.selectedMeleeWeaponId) ?? meleeWeapons[0];

  function syncLocalUnit(
    updates: Partial<SavedUnitInPreset>,
    nextModelCount = updates.modelCount ?? localUnit.modelCount
  ) {
    const nextUnit: SavedUnitInPreset = {
      ...localUnit,
      ...updates,
      pointsPerModel: getEstimatedPointsPerModel(unitDefinition),
      unitTotalPoints: calculateUnitTotalPointsFromDefinition(unitDefinition, nextModelCount),
    };
    setLocalUnit(nextUnit);
  }

  if (isEditing) {
    return (
      <div className="unit-card unit-card--editing">
        <div className="unit-card__header">
          <h4 className="unit-card__title">Edit Unit</h4>
          <button
            className="unit-card__close-btn"
            onClick={() => setIsEditing(false)}
            aria-label="Close editor"
          >
            ✕
          </button>
        </div>

        <div className="unit-card__editor">
          {/* Model Count */}
          <div className="form-field">
            <label className="form-label">Model Count *</label>
            <input
              type="number"
              min="1"
              max="100"
              value={localUnit.modelCount}
              onChange={(e) => {
                const count = Math.max(1, Math.min(100, parseInt(e.target.value) || 1));
                syncLocalUnit({ modelCount: count }, count);
              }}
              className="form-input"
            />
          </div>

          {rangedWeapons.length > 0 && (
            <div className="form-field">
              <label className="form-label">Ranged Weapon</label>
              <select
                value={localUnit.selectedRangedWeaponId ?? rangedWeapons[0]?.id ?? ""}
                onChange={(e) =>
                  syncLocalUnit({
                    selectedRangedWeaponId: e.target.value || undefined,
                    selectedWeaponId:
                      e.target.value ||
                      localUnit.selectedMeleeWeaponId ||
                      localUnit.selectedWeaponId,
                  })
                }
                className="form-select"
              >
                {rangedWeapons.map((weapon) => (
                  <option key={weapon.id} value={weapon.id}>
                    {weapon.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {meleeWeapons.length > 0 && (
            <div className="form-field">
              <label className="form-label">Melee Weapon</label>
              <select
                value={localUnit.selectedMeleeWeaponId ?? meleeWeapons[0]?.id ?? ""}
                onChange={(e) =>
                  syncLocalUnit({
                    selectedMeleeWeaponId: e.target.value || undefined,
                    selectedWeaponId:
                      localUnit.selectedRangedWeaponId ||
                      e.target.value ||
                      localUnit.selectedWeaponId,
                  })
                }
                className="form-select"
              >
                {meleeWeapons.map((weapon) => (
                  <option key={weapon.id} value={weapon.id}>
                    {weapon.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Leader */}
          <div className="form-field">
            <label className="form-label">Leader (Optional)</label>
            <select
              value={localUnit.leaderAttachedId ?? ""}
              onChange={(e) =>
                setLocalUnit({
                  ...localUnit,
                  leaderAttachedId: e.target.value || undefined,
                })
              }
              className="form-select"
            >
              <option value="">-- None --</option>
              {availableLeaders.map((leader) => (
                <option key={leader.id} value={leader.id}>
                  {leader.name}
                </option>
              ))}
            </select>
          </div>

          {/* Enhancement */}
          <div className="form-field">
            <label className="form-label">Enhancement (Optional)</label>
            <select
              value={localUnit.enhancementId ?? ""}
              onChange={(e) =>
                setLocalUnit({
                  ...localUnit,
                  enhancementId: e.target.value || undefined,
                })
              }
              className="form-select"
            >
              <option value="">-- None --</option>
              {availableEnhancements.map((enh) => (
                <option key={enh.id} value={enh.id}>
                  {enh.name}
                </option>
              ))}
            </select>
          </div>

          {/* Points Display */}
          <div className="unit-card__points-display">
            <div className="unit-card__points-row">
              <span>Unit Points:</span>
              <span>{localUnit.unitTotalPoints > 0 ? `${localUnit.unitTotalPoints} pts` : "Unavailable"}</span>
            </div>
            {localUnit.leaderAttachedId && (
              <div className="unit-card__points-row">
                <span>Leader Points:</span>
                <span>{localUnit.leaderPointsCost || 0} pts</span>
              </div>
            )}
            {localUnit.enhancementId && (
              <div className="unit-card__points-row">
                <span>Enhancement Points:</span>
                <span>{localUnit.enhancementPointsCost || 0} pts</span>
              </div>
            )}
            <div className="unit-card__points-row unit-card__points-row--total">
              <span>Total:</span>
              <span>
                {localUnit.unitTotalPoints +
                  (localUnit.leaderPointsCost || 0) +
                  (localUnit.enhancementPointsCost || 0)}{" "}
                pts
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="unit-card__actions">
            <button
              className="button-link button-link--secondary"
              onClick={() => setIsEditing(false)}
            >
              Cancel
            </button>
            <button
              className="button-link button-link--danger"
              onClick={() => {
                onDelete();
                setIsEditing(false);
              }}
            >
              Delete Unit
            </button>
            <button
              className="button-link button-link--primary"
              onClick={() => {
                onUpdate(localUnit);
                setIsEditing(false);
              }}
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    );
  }

  const fallbackWeapon = unitDefinition.weapons.find((w) => w.id === unit.selectedWeaponId);

  return (
    <div className="unit-card">
      <div className="unit-card__header">
        <div className="unit-card__info">
          <h4 className="unit-card__title">{unit.nickname || unitDefinition.name}</h4>
          <p className="unit-card__subtitle">
            {unit.modelCount} Models | {unit.unitTotalPoints > 0 ? `${unit.unitTotalPoints} pts` : unitDefinition.points ? `Starts at ${unitDefinition.points} pts` : "Points unavailable"}
          </p>
        </div>
        <div className="unit-card__actions-compact">
          <button
            className="unit-card__btn unit-card__btn--compact"
            onClick={() => {
              setLocalUnit(unit);
              setIsEditing(true);
            }}
            title="Edit unit"
          >
            Edit
          </button>
          <button
            className="unit-card__btn unit-card__btn--compact"
            onClick={onDuplicate}
            title="Duplicate unit"
          >
            Dup
          </button>
          <button
            className="unit-card__btn unit-card__btn--compact unit-card__btn--danger"
            onClick={onDelete}
            title="Delete unit"
          >
            ✕
          </button>
        </div>
      </div>

      <div className="unit-card__details">
        {selectedRangedWeapon && (
          <p className="unit-card__detail">
            <span className="unit-card__detail-label">Ranged:</span>
            <span className="unit-card__detail-value">{selectedRangedWeapon.name}</span>
          </p>
        )}
        {selectedMeleeWeapon && (
          <p className="unit-card__detail">
            <span className="unit-card__detail-label">Melee:</span>
            <span className="unit-card__detail-value">{selectedMeleeWeapon.name}</span>
          </p>
        )}
        {!selectedRangedWeapon && !selectedMeleeWeapon && (
          <p className="unit-card__detail">
            <span className="unit-card__detail-label">Weapon:</span>
            <span className="unit-card__detail-value">{fallbackWeapon?.name ?? "Unknown"}</span>
          </p>
        )}
        {unitDefinition.points && (
          <p className="unit-card__detail">
            <span className="unit-card__detail-label">Datasheet cost:</span>
            <span className="unit-card__detail-value">
              {unitDefinition.points} pts{unitDefinition.pointsDescription ? ` (${unitDefinition.pointsDescription})` : ""}
            </span>
          </p>
        )}
        {unit.leaderAttachedId && (
          <p className="unit-card__detail">
            <span className="unit-card__detail-label">Leader:</span>
            <span className="unit-card__detail-value">{unit.leaderAttachedId}</span>
          </p>
        )}
        {unit.enhancementId && (
          <p className="unit-card__detail">
            <span className="unit-card__detail-label">Enhancement:</span>
            <span className="unit-card__detail-value">{unit.enhancementId}</span>
          </p>
        )}
      </div>
    </div>
  );
}
