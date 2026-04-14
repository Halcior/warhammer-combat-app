import { useMemo, useState } from "react";
import { units } from "../data/units";
import { detachments } from "../data/detachments";
import { ArmyBuilder } from "./sections";
import { calculateUnitPoints } from "../lib/presetUtils";
import type { AppView } from "./AppNav";
import type { ArmyPresetV2 } from "../types/armyPreset";
import type { ArmyDraft } from "../lib/storage/armyStorage";

type Props = {
  armies: ArmyPresetV2[];
  canCreate: boolean;
  freeLimit: number;
  onAdd: (data: ArmyDraft) => void;
  onEdit: (id: string, data: ArmyDraft) => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
  onOpenWorkspace: (armyId: string, setView: (v: AppView) => void) => void;
  setView: (v: AppView) => void;
};

type EditorState =
  | { mode: "idle" }
  | { mode: "creating" }
  | { mode: "editing"; army: ArmyPresetV2 };

function unitById(unitId: string) {
  return units.find((unit) => unit.id === unitId) ?? null;
}

function toArmyDraft(preset: ArmyPresetV2, detachmentName?: string): ArmyDraft {
  return {
    name: preset.name,
    faction: preset.faction,
    units: preset.units,
    detachmentId: preset.detachmentId,
    detachmentName: detachmentName ?? preset.detachmentName,
    totalPoints: preset.totalPoints,
    pointsLimit: preset.pointsLimit,
    pointsBreakdown: preset.pointsBreakdown,
    notes: preset.notes,
    purpose: preset.purpose,
    tags: preset.tags,
    createdAtReadable: preset.createdAtReadable,
    isPublic: preset.isPublic,
    authorId: preset.authorId,
    forkedFromId: preset.forkedFromId,
  };
}

function buildDetachmentsByFaction() {
  return detachments.reduce<Record<string, Array<{ id: string; name: string }>>>(
    (accumulator, detachment) => {
      const current = accumulator[detachment.factionName] ?? [];

      if (!current.some((item) => item.id === detachment.id)) {
        current.push({ id: detachment.id, name: detachment.name });
      }

      accumulator[detachment.factionName] = current.sort((left, right) =>
        left.name.localeCompare(right.name)
      );
      return accumulator;
    },
    {}
  );
}

function buildEnhancementsByDetachment() {
  return detachments.reduce<
    Record<string, Array<{ id: string; name: string; description?: string; cost?: number }>>
  >((accumulator, detachment) => {
    accumulator[detachment.id] = [...detachment.enhancements]
      .map((enhancement) => ({
        id: enhancement.id,
        name: enhancement.name,
        description: enhancement.description,
        cost: enhancement.points,
      }))
      .sort((left, right) => left.name.localeCompare(right.name));

    return accumulator;
  }, {});
}

function ArmyPresetCard({
  army,
  onEdit,
  onDelete,
  onDuplicate,
  onLoadInWorkspace,
}: {
  army: ArmyPresetV2;
  onEdit: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onLoadInWorkspace: () => void;
}) {
  return (
    <article className="card army-card army-card--preset">
      <div className="army-card__topline">
        <p className="army-card__faction">{army.faction}</p>
        <span className="army-card__points">
          {army.totalPoints > 0 ? `${army.totalPoints} pts` : "Points pending"}
        </span>
      </div>

      <div className="army-card__header">
        <h3 className="army-card__name">{army.name}</h3>
        {army.detachmentName && (
          <p className="army-card__detachment">{army.detachmentName}</p>
        )}
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
                  {unit.nickname || unitById(unit.unitId)?.name || unit.unitId}
                </span>
                <span className="army-card__unit-meta">
                  {unit.modelCount} models
                  {calculateUnitPoints(unit) > 0 ? ` • ${calculateUnitPoints(unit)} pts` : ""}
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

export function ArmiesView({
  armies,
  canCreate,
  freeLimit,
  onAdd,
  onEdit,
  onDelete,
  onDuplicate,
  onOpenWorkspace,
  setView,
}: Props) {
  const [editor, setEditor] = useState<EditorState>({ mode: "idle" });

  const factions = useMemo(
    () => [...new Set(units.map((unit) => unit.faction))].sort(),
    []
  );
  const unitDefinitions = useMemo(
    () => new Map(units.map((unit) => [unit.id, unit])),
    []
  );
  const detachmentsByFaction = useMemo(buildDetachmentsByFaction, []);
  const enhancementsByDetachment = useMemo(buildEnhancementsByDetachment, []);
  const availableLeaders = useMemo(
    () =>
      units.filter((unit) =>
        (unit.keywords ?? []).some(
          (keyword) => keyword.toUpperCase() === "CHARACTER"
        )
      ),
    []
  );

  if (editor.mode === "creating") {
    return (
      <ArmyBuilder
        onSave={(preset) => {
          const detachmentName =
            detachmentsByFaction[preset.faction]?.find(
              (item) => item.id === preset.detachmentId
            )?.name ?? preset.detachmentName;

          onAdd(toArmyDraft(preset, detachmentName));
          setEditor({ mode: "idle" });
        }}
        onCancel={() => setEditor({ mode: "idle" })}
        factions={factions}
        detachmentsByFaction={detachmentsByFaction}
        unitDefinitions={unitDefinitions}
        availableUnits={units}
        availableLeaders={availableLeaders}
        availableEnhancementsByDetachment={enhancementsByDetachment}
      />
    );
  }

  if (editor.mode === "editing") {
    return (
      <ArmyBuilder
        initial={editor.army}
        onSave={(preset) => {
          const detachmentName =
            detachmentsByFaction[preset.faction]?.find(
              (item) => item.id === preset.detachmentId
            )?.name ?? preset.detachmentName;

          onEdit(editor.army.id, toArmyDraft(preset, detachmentName));
          setEditor({ mode: "idle" });
        }}
        onCancel={() => setEditor({ mode: "idle" })}
        factions={factions}
        detachmentsByFaction={detachmentsByFaction}
        unitDefinitions={unitDefinitions}
        availableUnits={units}
        availableLeaders={availableLeaders}
        availableEnhancementsByDetachment={enhancementsByDetachment}
      />
    );
  }

  return (
    <div className="armies-view">
      <div className="armies-view__header">
        <div>
          <p className="panel-eyebrow">Saved Configurations</p>
          <h2 className="armies-view__title">My Armies</h2>
          <p className="muted-text">
            Build once, keep points visible, and reopen the same army instantly
            in calculator or workspace flow.
          </p>
        </div>

        <div className="armies-view__header-actions">
          <span className="armies-view__limit">
            {armies.length}/{freeLimit} presets
          </span>
          {canCreate ? (
            <button
              className="button-link button-link--primary"
              onClick={() => setEditor({ mode: "creating" })}
            >
              + New Army
            </button>
          ) : (
            <div className="armies-view__limit-notice">
              Upgrade for unlimited presets
            </div>
          )}
        </div>
      </div>

      {armies.length === 0 ? (
        <div className="armies-view__empty">
          <p className="armies-view__empty-text">
            No armies saved yet. Create your first preset to unlock faster matchup
            setup and workspace comparisons.
          </p>
          <button
            className="button-link button-link--primary"
            onClick={() => setEditor({ mode: "creating" })}
          >
            Create your first army
          </button>
        </div>
      ) : (
        <div className="army-list army-list--presets">
          {armies.map((army) => (
            <ArmyPresetCard
              key={army.id}
              army={army}
              onEdit={() => setEditor({ mode: "editing", army })}
              onDelete={() => onDelete(army.id)}
              onDuplicate={() => onDuplicate(army.id)}
              onLoadInWorkspace={() => onOpenWorkspace(army.id, setView)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
