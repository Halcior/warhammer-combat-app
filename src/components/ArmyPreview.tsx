import type { ArmyPreset } from "../types/army";
import { units } from "../data/units";

interface ArmyPreviewProps {
  army: ArmyPreset | null;
}

export function ArmyPreview({ army }: ArmyPreviewProps) {
  if (!army) {
    return (
      <div className="army-preview army-preview--empty">
        <p className="army-preview__placeholder">No army selected</p>
      </div>
    );
  }

  return (
    <div className="army-preview">
      <div className="army-preview__header">
        <h3 className="army-preview__name">{army.name}</h3>
        <p className="army-preview__faction">{army.faction}</p>
      </div>

      <div className="army-preview__stats">
        <div className="army-preview__stat">
          <span className="army-preview__stat-label">Units</span>
          <span className="army-preview__stat-value">{army.units.length}</span>
        </div>
      </div>

      {army.units.length > 0 && (
        <div className="army-preview__units">
          <p className="army-preview__units-title">Unit List</p>
          <ul className="army-preview__units-list">
            {army.units.map((su, idx) => {
              const unitData = units.find((u) => u.id === su.unitId);
              return (
                <li key={idx} className="army-preview__unit">
                  {su.nickname ?? unitData?.name ?? su.unitId}
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
