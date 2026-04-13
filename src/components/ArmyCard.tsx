import type { ArmyPreset } from "../types/army";
import { units } from "../data/units";

interface ArmyCardProps {
  army: ArmyPreset;
  onEdit: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onLoadInWorkspace: () => void;
}

export function ArmyCard({
  army,
  onEdit,
  onDelete,
  onDuplicate,
  onLoadInWorkspace,
}: ArmyCardProps) {
  return (
    <div className="army-card">
      <div className="army-card__header">
        <h3 className="army-card__name">{army.name}</h3>
        <p className="army-card__faction">{army.faction}</p>
      </div>

      <div className="army-card__content">
        <div className="army-card__stat">
          <span className="army-card__stat-label">Units:</span>
          <span className="army-card__stat-value">{army.units.length}</span>
        </div>

        {army.units.length > 0 && (
          <div className="army-card__units">
            <p className="army-card__units-label">Units:</p>
            <ul className="army-card__units-list">
              {army.units.slice(0, 3).map((su, idx) => {
                const unitData = units.find((u) => u.id === su.unitId);
                return (
                  <li key={idx} className="army-card__unit-item">
                    {su.nickname ?? unitData?.name ?? su.unitId}
                  </li>
                );
              })}
              {army.units.length > 3 && (
                <li className="army-card__unit-item army-card__unit-item--more">
                  +{army.units.length - 3} more
                </li>
              )}
            </ul>
          </div>
        )}
      </div>

      <div className="army-card__actions">
        <button className="army-card__action-btn" onClick={onEdit}>
          Edit
        </button>
        <button className="army-card__action-btn" onClick={onDuplicate}>
          Duplicate
        </button>
        <button
          className="army-card__action-btn army-card__action-btn--workspace"
          onClick={onLoadInWorkspace}
        >
          Use in Workspace
        </button>
        <button
          className="army-card__action-btn army-card__action-btn--danger"
          onClick={() => {
            if (confirm(`Delete "${army.name}"?`)) onDelete();
          }}
        >
          Delete
        </button>
      </div>
    </div>
  );
}
