import { PageHeader } from "../PageHeader";
import { ArmiesView } from "../ArmiesView";
import type { ArmyPresetV2 } from "../../types/armyPreset";
import type { AppView } from "../AppNav";
import type { ArmyDraft } from "../../lib/storage/armyStorage";

interface ArmiesPageProps {
  armies: ArmyPresetV2[];
  canCreate: boolean;
  freeLimit: number;
  onAdd: (data: ArmyDraft) => void;
  onEdit: (id: string, data: ArmyDraft) => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
  onOpenWorkspace: (armyId: string, setView: (v: AppView) => void) => void;
  setView: (v: AppView) => void;
}

export function ArmiesPage({
  armies,
  canCreate,
  freeLimit,
  onAdd,
  onEdit,
  onDelete,
  onDuplicate,
  onOpenWorkspace,
  setView,
}: ArmiesPageProps) {
  return (
    <div className="armies-page">
      <PageHeader
        title="My Armies"
        subtitle="Build reusable army presets with points, detachments and unit loadouts."
        helperText="Save a polished list once, then load it straight into the calculator or battle workspace."
      />

      <ArmiesView
        armies={armies}
        canCreate={canCreate}
        freeLimit={freeLimit}
        onAdd={onAdd}
        onEdit={onEdit}
        onDelete={onDelete}
        onDuplicate={onDuplicate}
        onOpenWorkspace={onOpenWorkspace}
        setView={setView}
      />
    </div>
  );
}
