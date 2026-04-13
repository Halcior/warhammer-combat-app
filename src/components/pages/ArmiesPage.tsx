import { PageHeader } from "../PageHeader";
import { ArmiesView } from "../ArmiesView";
import type { ArmyPreset } from "../../types/army";
import type { AppView } from "../AppNav";

interface ArmiesPageProps {
  armies: ArmyPreset[];
  canCreate: boolean;
  freeLimit: number;
  onAdd: (data: Pick<ArmyPreset, "name" | "faction" | "units" | "notes">) => void;
  onEdit: (id: string, data: Pick<ArmyPreset, "name" | "faction" | "units" | "notes">) => void;
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
        subtitle="Save and reuse your army presets to speed up analysis."
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
