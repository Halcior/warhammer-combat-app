import { calculateUnitPoints, getPointsStatusColor } from "../lib/presetUtils";
import type { ArmyPresetV2 } from "../types/armyPreset";
import type { Unit } from "../types/combat";

interface ArmyCardProps {
  army: ArmyPresetV2;
  unitDefinitions: Map<string, Unit>;
  onEdit: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onLoadInWorkspace: () => void;
  onExport?: () => void;
}

function getPointsDeltaLabel(totalPoints: number, pointsLimit?: number) {
  if (!pointsLimit) {
    return "Unlimited";
  }

  const delta = pointsLimit - totalPoints;
  if (delta === 0) {
    return "On target";
  }

  if (delta > 0) {
    return `${delta} pts free`;
  }

  return `${Math.abs(delta)} pts over`;
}

function formatUnitPreviewMeta(unit: ArmyPresetV2["units"][number]) {
  const details: string[] = [`${unit.modelCount} models`];

  if (unit.attachedLeader?.unitName) {
    details.push(`Leader: ${unit.attachedLeader.unitName}`);
  }

  if (unit.enhancementId) {
    details.push(unit.enhancementHost === "leader" ? "Enhancement on leader" : "Enhancement on unit");
  }

  const points = calculateUnitPoints(unit);
  if (points > 0) {
    details.push(`${points} pts`);
  }

  return details.join(" • ");
}

function formatUnitDisplayName(
  unit: ArmyPresetV2["units"][number],
  unitDefinitions: Map<string, Unit>
) {
  return unit.nickname || unitDefinitions.get(unit.unitId)?.name || unit.unitId;
}

function formatUnitPreviewLabel(
  unit: ArmyPresetV2["units"][number],
  unitDefinitions: Map<string, Unit>
) {
  return formatUnitDisplayName(unit, unitDefinitions);
}

export function ArmyCard({
  army,
  unitDefinitions,
  onEdit,
  onDelete,
  onDuplicate,
  onLoadInWorkspace,
  onExport,
}: ArmyCardProps) {
  const pointsStatus = getPointsStatusColor(army.totalPoints, army.pointsLimit);
  const pointsDeltaLabel = getPointsDeltaLabel(army.totalPoints, army.pointsLimit);

  return (
    <article className="card army-card army-card--preset">
      <div className="army-card__topline">
        <p className="army-card__faction">{army.faction}</p>
        <span className={`army-card__points army-card__points--${pointsStatus}`}>
          {army.totalPoints > 0 ? `${army.totalPoints} pts` : "Points pending"}
        </span>
      </div>

      <div className="army-card__header">
        <h3 className="army-card__name">{army.name}</h3>
        <div className="army-card__meta-stack">
          {army.detachmentName && <p className="army-card__detachment">{army.detachmentName}</p>}
          {army.purpose && <p className="army-card__purpose">{army.purpose}</p>}
        </div>
      </div>

      <div className="army-card__stats">
        <div className="army-card__stat">
          <span className="army-card__stat-label">Units</span>
          <span className="army-card__stat-value">{army.units.length}</span>
        </div>
        <div className="army-card__stat">
          <span className="army-card__stat-label">Limit</span>
          <span className="army-card__stat-value">
            {army.pointsLimit ? `${army.pointsLimit} pts` : "Unlimited"}
          </span>
        </div>
        <div className="army-card__stat">
          <span className="army-card__stat-label">Status</span>
          <span className={`army-card__stat-value army-card__stat-value--${pointsStatus}`}>
            {pointsDeltaLabel}
          </span>
        </div>
      </div>

      {army.units.length > 0 && (
        <div className="army-card__units">
          <p className="army-card__units-label">Preset preview</p>
          <ul className="army-card__units-list">
            {army.units.slice(0, 4).map((unit, index) => (
              <li
                key={unit.instanceId ?? `${unit.unitId}-${unit.addedAt ?? index}`}
                className="army-card__unit-item"
              >
                <span className="army-card__unit-name">
                  {formatUnitPreviewLabel(unit, unitDefinitions)}
                </span>
                <span className="army-card__unit-meta">
                  {formatUnitPreviewMeta(unit)}
                </span>
              </li>
            ))}
            {army.units.length > 4 && (
              <li className="army-card__unit-item army-card__unit-item--more">
                +{army.units.length - 4} more units
              </li>
            )}
          </ul>
        </div>
      )}

      {army.notes && <p className="army-card__notes">{army.notes}</p>}

      <div className="army-card__actions">
        <button className="army-card__action-btn" onClick={onEdit}>
          Edit
        </button>
        <button className="army-card__action-btn" onClick={onDuplicate}>
          Duplicate
        </button>
        {onExport && (
          <button className="army-card__action-btn" onClick={onExport}>
            Export
          </button>
        )}
        <button
          className="army-card__action-btn army-card__action-btn--workspace"
          onClick={onLoadInWorkspace}
        >
          Open in Workspace
        </button>
        <button
          className="army-card__action-btn army-card__action-btn--danger"
          onClick={() => {
            if (confirm(`Delete "${army.name}"?`)) {
              onDelete();
            }
          }}
        >
          Delete
        </button>
      </div>
    </article>
  );
}
