import { useState } from "react";
import type { SavedUnitInPreset } from "../../types/armyPreset";
import type { Unit } from "../../types/combat";

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
                setLocalUnit({
                  ...localUnit,
                  modelCount: count,
                  unitTotalPoints: count * localUnit.pointsPerModel,
                });
              }}
              className="form-input"
            />
          </div>

          {/* Weapon */}
          <div className="form-field">
            <label className="form-label">Weapon *</label>
            <select
              value={localUnit.selectedWeaponId}
              onChange={(e) =>
                setLocalUnit({ ...localUnit, selectedWeaponId: e.target.value })
              }
              className="form-select"
            >
              {unitDefinition.weapons.map((weapon) => (
                <option key={weapon.id} value={weapon.id}>
                  {weapon.name}
                </option>
              ))}
            </select>
          </div>

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
              <span>{localUnit.unitTotalPoints} pts</span>
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

  const selectedWeapon = unitDefinition.weapons.find((w) => w.id === unit.selectedWeaponId);

  return (
    <div className="unit-card">
      <div className="unit-card__header">
        <div className="unit-card__info">
          <h4 className="unit-card__title">{unit.nickname || unitDefinition.name}</h4>
          <p className="unit-card__subtitle">
            {unit.modelCount} Models | {unit.unitTotalPoints} pts
          </p>
        </div>
        <div className="unit-card__actions-compact">
          <button
            className="unit-card__btn unit-card__btn--compact"
            onClick={() => setIsEditing(true)}
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
        <p className="unit-card__detail">
          <span className="unit-card__detail-label">Weapon:</span>
          <span className="unit-card__detail-value">{selectedWeapon?.name ?? "Unknown"}</span>
        </p>
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
