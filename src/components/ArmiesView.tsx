import { useMemo, useState } from "react";
import { units } from "../data/units";
import type { ArmyPreset, SavedUnit } from "../types/army";
import type { AppView } from "./AppNav";

// ── Helpers ──────────────────────────────────────────────────────────────────

const factions = [...new Set(units.map((u) => u.faction))].sort();

function unitsByFaction(faction: string) {
  return units.filter((u) => u.faction === faction);
}

function unitById(unitId: string) {
  return units.find((u) => u.id === unitId) ?? null;
}

// ── Army Card ─────────────────────────────────────────────────────────────────

function ArmyCard({
  army,
  onEdit,
  onDelete,
  onDuplicate,
  onLoadInWorkspace,
}: {
  army: ArmyPreset;
  onEdit: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onLoadInWorkspace: () => void;
}) {
  return (
    <div className="card army-card">
      <div>
        <p className="army-card__faction">{army.faction}</p>
        <h3 className="army-card__name">{army.name}</h3>
        <p className="army-card__unit-count">
          {army.units.length} {army.units.length === 1 ? "unit" : "units"}
        </p>
        {army.units.length > 0 && (
          <ul className="army-card__unit-list">
            {army.units.slice(0, 4).map((su) => {
              const unit = unitById(su.unitId);
              return (
                <li key={su.unitId + su.selectedWeaponId} className="army-card__unit-item">
                  {su.nickname ?? unit?.name ?? su.unitId}
                </li>
              );
            })}
            {army.units.length > 4 && (
              <li className="army-card__unit-item army-card__unit-item--more">
                +{army.units.length - 4} more
              </li>
            )}
          </ul>
        )}
      </div>

      <div className="army-card__actions">
        <button className="army-card__btn" onClick={onEdit}>
          Edit
        </button>
        <button className="army-card__btn" onClick={onDuplicate}>
          Duplicate
        </button>
        <button className="army-card__btn army-card__btn--workspace" onClick={onLoadInWorkspace}>
          Use in Workspace
        </button>
        <button
          className="army-card__btn army-card__btn--danger"
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

// ── Army Builder ──────────────────────────────────────────────────────────────

type BuilderState = {
  name: string;
  faction: string;
  units: SavedUnit[];
  notes: string;
  pickUnitId: string;
  pickWeaponId: string;
};

function initialBuilderState(initial?: ArmyPreset): BuilderState {
  const faction = initial?.faction ?? factions[0];
  const factionUnits = unitsByFaction(faction);
  const firstUnit = factionUnits[0];
  return {
    name: initial?.name ?? "",
    faction,
    units: initial?.units ?? [],
    notes: initial?.notes ?? "",
    pickUnitId: firstUnit?.id ?? "",
    pickWeaponId: firstUnit?.weapons[0]?.id ?? "",
  };
}

function ArmyBuilder({
  initial,
  onSave,
  onCancel,
}: {
  initial?: ArmyPreset;
  onSave: (data: Pick<ArmyPreset, "name" | "faction" | "units" | "notes">) => void;
  onCancel: () => void;
}) {
  const [state, setState] = useState<BuilderState>(() =>
    initialBuilderState(initial)
  );

  const factionUnits = useMemo(
    () => unitsByFaction(state.faction),
    [state.faction]
  );

  const pickUnit = useMemo(
    () => factionUnits.find((u) => u.id === state.pickUnitId) ?? factionUnits[0],
    [factionUnits, state.pickUnitId]
  );

  function handleFactionChange(faction: string) {
    if (state.units.length > 0) {
      if (!confirm(`Changing faction will remove ${state.units.length} unit(s). Continue?`)) return;
    }
    const newFactionUnits = unitsByFaction(faction);
    const firstUnit = newFactionUnits[0];
    setState((s) => ({
      ...s,
      faction,
      units: [],
      pickUnitId: firstUnit?.id ?? "",
      pickWeaponId: firstUnit?.weapons[0]?.id ?? "",
    }));
  }

  function handlePickUnitChange(unitId: string) {
    const unit = factionUnits.find((u) => u.id === unitId);
    setState((s) => ({
      ...s,
      pickUnitId: unitId,
      pickWeaponId: unit?.weapons[0]?.id ?? "",
    }));
  }

  function addUnit() {
    if (!state.pickUnitId || !state.pickWeaponId) return;
    const newUnit: SavedUnit = {
      unitId: state.pickUnitId,
      selectedWeaponId: state.pickWeaponId,
    };
    setState((s) => ({ ...s, units: [...s.units, newUnit] }));
  }

  function removeUnit(idx: number) {
    setState((s) => ({
      ...s,
      units: s.units.filter((_, i) => i !== idx),
    }));
  }

  function handleSave() {
    if (!state.name.trim()) return;
    onSave({
      name: state.name.trim(),
      faction: state.faction,
      units: state.units,
      notes: state.notes.trim() || undefined,
    });
  }

  return (
    <div className="card army-builder">
      <div className="panel-heading">
        <p className="panel-eyebrow">Army Preset</p>
        <h2>{initial ? "Edit Army" : "New Army"}</h2>
      </div>

      <div className="army-builder__fields">
        <div className="army-builder__field">
          <label className="army-builder__label" htmlFor="army-name">
            Name
          </label>
          <input
            id="army-name"
            className="army-builder__input"
            type="text"
            placeholder="e.g. Tournament Custodes"
            value={state.name}
            onChange={(e) => setState((s) => ({ ...s, name: e.target.value }))}
          />
        </div>

        <div className="army-builder__field">
          <label className="army-builder__label" htmlFor="army-faction">
            Faction
          </label>
          <select
            id="army-faction"
            className="army-builder__select"
            value={state.faction}
            onChange={(e) => handleFactionChange(e.target.value)}
          >
            {factions.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="army-builder__section">
        <h3 className="army-builder__section-title">Units</h3>

        {state.units.length > 0 && (
          <div className="army-builder__unit-list">
            {state.units.map((su, idx) => {
              const unit = unitById(su.unitId);
              const weapon = unit?.weapons.find((w) => w.id === su.selectedWeaponId);
              return (
                <div key={idx} className="army-builder__unit-row">
                  <div className="army-builder__unit-info">
                    <input
                      className="army-builder__nickname-input"
                      type="text"
                      placeholder={unit?.name ?? su.unitId}
                      value={su.nickname ?? ""}
                      onChange={(e) => {
                        const val = e.target.value;
                        setState((s) => ({
                          ...s,
                          units: s.units.map((u, i) =>
                            i === idx ? { ...u, nickname: val || undefined } : u
                          ),
                        }));
                      }}
                    />
                    <span className="army-builder__unit-weapon">
                      {weapon?.name ?? su.selectedWeaponId}
                    </span>
                  </div>
                  <button
                    className="army-builder__remove-btn"
                    onClick={() => removeUnit(idx)}
                    aria-label="Remove unit"
                  >
                    ×
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {state.units.length === 0 && (
          <p className="army-builder__units-hint">Add at least one unit to save this army.</p>
        )}

        <div className="army-builder__add-row">
          <select
            className="army-builder__select army-builder__select--grow"
            value={state.pickUnitId}
            onChange={(e) => handlePickUnitChange(e.target.value)}
          >
            {factionUnits.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name}
              </option>
            ))}
          </select>

          <select
            className="army-builder__select army-builder__select--grow"
            value={state.pickWeaponId}
            onChange={(e) =>
              setState((s) => ({ ...s, pickWeaponId: e.target.value }))
            }
          >
            {(pickUnit?.weapons ?? []).map((w) => (
              <option key={w.id} value={w.id}>
                {w.name}
              </option>
            ))}
          </select>

          <button className="army-builder__add-btn" onClick={addUnit}>
            + Add
          </button>
        </div>
      </div>

      <div className="army-builder__field">
        <label className="army-builder__label" htmlFor="army-notes">
          Notes <span className="army-builder__optional">(optional)</span>
        </label>
        <input
          id="army-notes"
          className="army-builder__input"
          type="text"
          placeholder="e.g. Shield Host detachment, Adeptus Custodes"
          value={state.notes}
          onChange={(e) => setState((s) => ({ ...s, notes: e.target.value }))}
        />
      </div>

      <div className="army-builder__footer">
        <button className="army-builder__cancel-btn" onClick={onCancel}>
          Cancel
        </button>
        <button
          className="army-builder__save-btn"
          onClick={handleSave}
          disabled={!state.name.trim() || state.units.length === 0}
        >
          {initial ? "Save Changes" : "Create Army"}
        </button>
      </div>
    </div>
  );
}

// ── Main View ─────────────────────────────────────────────────────────────────

type Props = {
  armies: ArmyPreset[];
  canCreate: boolean;
  freeLimit: number;
  onAdd: (data: Pick<ArmyPreset, "name" | "faction" | "units" | "notes">) => void;
  onEdit: (id: string, data: Pick<ArmyPreset, "name" | "faction" | "units" | "notes">) => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
  onOpenWorkspace: (armyId: string, setView: (v: AppView) => void) => void;
  setView: (v: AppView) => void;
};

type EditorState =
  | { mode: "idle" }
  | { mode: "creating" }
  | { mode: "editing"; army: ArmyPreset };

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

  if (editor.mode === "creating") {
    return (
      <ArmyBuilder
        onSave={(data) => {
          onAdd(data);
          setEditor({ mode: "idle" });
        }}
        onCancel={() => setEditor({ mode: "idle" })}
      />
    );
  }

  if (editor.mode === "editing") {
    return (
      <ArmyBuilder
        initial={editor.army}
        onSave={(data) => {
          onEdit(editor.army.id, data);
          setEditor({ mode: "idle" });
        }}
        onCancel={() => setEditor({ mode: "idle" })}
      />
    );
  }

  return (
    <div>
      <div className="armies-view__header">
        <div>
          <p className="panel-eyebrow">Saved Configurations</p>
          <h2 className="armies-view__title">My Armies</h2>
          <p className="muted-text">
            Save unit lineups to load instantly into the calculator or battle
            workspace.
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
            No armies saved yet. Create your first preset to speed up setup.
          </p>
          <button
            className="button-link button-link--primary"
            onClick={() => setEditor({ mode: "creating" })}
          >
            Create your first army
          </button>
        </div>
      ) : (
        <div className="army-list">
          {armies.map((army) => (
            <ArmyCard
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
