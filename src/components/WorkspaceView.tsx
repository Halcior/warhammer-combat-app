import { useMemo } from "react";
import { units } from "../data/units";
import type { ArmyPreset, SavedUnit } from "../types/army";
import type { AttackConditions } from "../types/combat";

// ── Helpers ──────────────────────────────────────────────────────────────────

function unitById(unitId: string) {
  return units.find((u) => u.id === unitId) ?? null;
}

const allFactions = [...new Set(units.map((u) => u.faction))].sort();

// ── Army Panel ────────────────────────────────────────────────────────────────

function WorkspaceArmyPanel({
  side,
  armies,
  loadedArmyId,
  activeUnitId,
  onLoadArmy,
  onSelectUnit,
}: {
  side: "A" | "B";
  armies: ArmyPreset[];
  loadedArmyId: string | null;
  activeUnitId: string;
  onLoadArmy: (armyId: string) => void;
  onSelectUnit: (su: SavedUnit, faction: string) => void;
}) {
  const loadedArmy = useMemo(
    () => armies.find((a) => a.id === loadedArmyId) ?? null,
    [armies, loadedArmyId]
  );

  const label = side === "A" ? "Attacker — Army A" : "Defender — Army B";
  const emptyHint = side === "A" ? "Select your army" : "Select opponent's army";

  return (
    <div className="card workspace-army-panel">
      <div className="workspace-army-panel__header">
        <p className="workspace-army-panel__side-label">{label}</p>
        <select
          className="workspace-army-panel__select"
          value={loadedArmyId ?? ""}
          onChange={(e) => e.target.value && onLoadArmy(e.target.value)}
        >
          <option value="">{emptyHint}</option>
          {armies.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name}
            </option>
          ))}
        </select>
      </div>

      {loadedArmy ? (
        <div className="workspace-unit-list">
          {loadedArmy.units.length === 0 ? (
            <p className="workspace-army-panel__empty">No units in this army.</p>
          ) : (
            loadedArmy.units.map((su, idx) => {
              const unit = unitById(su.unitId);
              const weapon = unit?.weapons.find(
                (w) => w.id === su.selectedWeaponId
              );
              const isActive = su.unitId === activeUnitId;
              return (
                <button
                  key={idx}
                  className={`workspace-unit-row${isActive ? " workspace-unit-row--active" : ""}`}
                  onClick={() => onSelectUnit(su, loadedArmy.faction)}
                  aria-pressed={isActive}
                >
                  <div className="workspace-unit-row__info">
                    <span className="workspace-unit-row__name">
                      {su.nickname ?? unit?.name ?? su.unitId}
                    </span>
                    <span className="workspace-unit-row__weapon">
                      {weapon?.name ?? su.selectedWeaponId}
                    </span>
                  </div>
                  {isActive && (
                    <span className="workspace-unit-row__badge">Active</span>
                  )}
                </button>
              );
            })
          )}
        </div>
      ) : (
        <div className="workspace-army-panel__no-army">
          <p>Load an army preset from the dropdown, or go to <strong>My Armies</strong> to create one.</p>
        </div>
      )}
    </div>
  );
}

// ── Battle State Strip ────────────────────────────────────────────────────────

function BattleStateStrip({
  conditions,
  setConditions,
}: {
  conditions: AttackConditions;
  setConditions: (c: AttackConditions) => void;
}) {
  function toggle(key: keyof AttackConditions) {
    setConditions({ ...conditions, [key]: !conditions[key as keyof AttackConditions] });
  }

  function setRound(round: number) {
    setConditions({ ...conditions, battleRound: Math.max(1, Math.min(5, round)) });
  }

  const pills: { label: string; key: keyof AttackConditions }[] = [
    { label: "Cover", key: "isTargetInCover" },
    { label: "Charge turn", key: "isChargeTurn" },
    { label: "Half range", key: "isHalfRange" },
    { label: "Stationary", key: "remainedStationary" },
  ];

  return (
    <div className="workspace-state-strip">
      <div className="workspace-state-strip__round">
        <span className="workspace-state-strip__label">Round</span>
        <div className="workspace-state-strip__round-controls">
          <button
            className="workspace-state-strip__round-btn"
            onClick={() => setRound(conditions.battleRound - 1)}
            disabled={conditions.battleRound <= 1}
            aria-label="Previous round"
          >
            −
          </button>
          <span className="workspace-state-strip__round-value">
            {conditions.battleRound}
          </span>
          <button
            className="workspace-state-strip__round-btn"
            onClick={() => setRound(conditions.battleRound + 1)}
            disabled={conditions.battleRound >= 5}
            aria-label="Next round"
          >
            +
          </button>
        </div>
      </div>

      <div className="workspace-state-strip__divider" aria-hidden="true" />

      {pills.map(({ label, key }) => (
        <button
          key={key}
          className={`workspace-condition-pill${conditions[key] ? " workspace-condition-pill--active" : ""}`}
          onClick={() => toggle(key)}
          aria-pressed={!!conditions[key]}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

// ── Main View ─────────────────────────────────────────────────────────────────

type Props = {
  armies: ArmyPreset[];
  workspaceArmyA: string | null;
  workspaceArmyB: string | null;
  setWorkspaceArmyA: (id: string | null) => void;
  setWorkspaceArmyB: (id: string | null) => void;
  attackerId: string;
  defenderId: string;
  conditions: AttackConditions;
  setConditions: (c: AttackConditions) => void;
  selectAttacker: (faction: string, unitId: string, weaponId: string) => void;
  selectDefender: (faction: string, unitId: string) => void;
};

export function WorkspaceView({
  armies,
  workspaceArmyA,
  workspaceArmyB,
  setWorkspaceArmyA,
  setWorkspaceArmyB,
  attackerId,
  defenderId,
  conditions,
  setConditions,
  selectAttacker,
  selectDefender,
}: Props) {
  return (
    <div className="workspace-setup">
      <div className="workspace-setup__header">
        <div>
          <p className="panel-eyebrow">Battle Workspace</p>
          <h2 className="workspace-setup__title">Matchup Analysis</h2>
          <p className="muted-text">
            Load two armies and click any unit to run the calculator instantly.
          </p>
        </div>
      </div>

      <div className="workspace-armies">
        <WorkspaceArmyPanel
          side="A"
          armies={armies}
          loadedArmyId={workspaceArmyA}
          activeUnitId={attackerId}
          onLoadArmy={(id) => {
            setWorkspaceArmyA(id);
            // Auto-select first unit of the loaded army
            const army = armies.find((a) => a.id === id);
            const firstUnit = army?.units[0];
            if (firstUnit) {
              selectAttacker(
                army!.faction,
                firstUnit.unitId,
                firstUnit.selectedWeaponId
              );
            }
          }}
          onSelectUnit={(su, faction) => {
            selectAttacker(faction, su.unitId, su.selectedWeaponId);
          }}
        />

        <WorkspaceArmyPanel
          side="B"
          armies={armies}
          loadedArmyId={workspaceArmyB}
          activeUnitId={defenderId}
          onLoadArmy={(id) => {
            setWorkspaceArmyB(id);
            const army = armies.find((a) => a.id === id);
            const firstUnit = army?.units[0];
            if (firstUnit) {
              selectDefender(army!.faction, firstUnit.unitId);
            }
          }}
          onSelectUnit={(su, faction) => {
            selectDefender(faction, su.unitId);
          }}
        />
      </div>

      <BattleStateStrip
        conditions={conditions}
        setConditions={setConditions}
      />
    </div>
  );
}
