import { useMemo, useState } from "react";
import { units } from "../data/units";
import { detachments } from "../data/detachments";
import { ArmyBuilder } from "./sections";
import { ExportArmyModal } from "./modals/ExportArmyModal";
import { ImportArmyModal } from "./modals/ImportArmyModal";
import { ArmyCard } from "./ArmyCard";
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
  const [exportingArmy, setExportingArmy] = useState<ArmyPresetV2 | null>(null);
  const [showImportModal, setShowImportModal] = useState(false);

  const factions = useMemo(
    () => [...new Set(units.map((unit) => unit.faction))].sort(),
    []
  );
  const unitDefinitions = useMemo(
    () => new Map(units.map((unit) => [unit.id, unit])),
    []
  );
  const detachmentsByFaction = useMemo(() => buildDetachmentsByFaction(), []);
  const enhancementsByDetachment = useMemo(() => buildEnhancementsByDetachment(), []);
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
          <button
            className="button-link button-link--secondary"
            onClick={() => setShowImportModal(true)}
          >
            Import Army
          </button>
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
            <ArmyCard
              key={army.id}
              army={army}
              unitDefinitions={unitDefinitions}
              onEdit={() => setEditor({ mode: "editing", army })}
              onDelete={() => onDelete(army.id)}
              onDuplicate={() => onDuplicate(army.id)}
              onLoadInWorkspace={() => onOpenWorkspace(army.id, setView)}
              onExport={() => setExportingArmy(army)}
            />
          ))}
        </div>
      )}

      {exportingArmy && (
        <ExportArmyModal
          army={exportingArmy}
          unitDefinitions={unitDefinitions}
          onClose={() => setExportingArmy(null)}
        />
      )}

      {showImportModal && (
        <ImportArmyModal
          unitDefinitions={unitDefinitions}
          onImport={(preset) => {
            const detachmentName =
              detachmentsByFaction[preset.faction]?.find(
                (item) => item.id === preset.detachmentId
              )?.name ?? preset.detachmentName;

            onAdd(toArmyDraft(preset, detachmentName));
            setShowImportModal(false);
          }}
          onClose={() => setShowImportModal(false)}
        />
      )}
    </div>
  );
}
