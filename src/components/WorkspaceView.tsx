import { useMemo } from "react";
import { units } from "../data/units";
import type { ArmyPresetV2, SavedUnitInPreset } from "../types/armyPreset";
import type { AttackConditions } from "../types/combat";

function unitById(unitId: string) {
  return units.find((unit) => unit.id === unitId) ?? null;
}

function getPresetUnitPrimaryWeapon(savedUnit: SavedUnitInPreset) {
  const selectedWeapons = savedUnit.selectedWeapons ?? [];
  const rangedWeapon = selectedWeapons.find((weapon) => weapon.category === "ranged")?.weaponId;
  const meleeWeapon = selectedWeapons.find((weapon) => weapon.category === "melee")?.weaponId;

  return (
    rangedWeapon ??
    savedUnit.selectedRangedWeaponId ??
    savedUnit.selectedWeaponId ??
    meleeWeapon ??
    savedUnit.selectedMeleeWeaponId
  );
}

function getPresetUnitWeaponLabel(savedUnit: SavedUnitInPreset) {
  const unit = unitById(savedUnit.unitId);
  if (savedUnit.selectedWeapons && savedUnit.selectedWeapons.length > 0) {
    return savedUnit.selectedWeapons
      .map((weapon) => `${weapon.name}${weapon.quantity && weapon.quantity > 1 ? ` ×${weapon.quantity}` : ""}`)
      .join(" • ");
  }

  const rangedWeapon = unit?.weapons.find(
    (weapon) => weapon.id === savedUnit.selectedRangedWeaponId
  );
  const meleeWeapon = unit?.weapons.find(
    (weapon) => weapon.id === savedUnit.selectedMeleeWeaponId
  );
  const primaryWeapon = unit?.weapons.find(
    (weapon) => weapon.id === savedUnit.selectedWeaponId
  );

  if (rangedWeapon && meleeWeapon) {
    return `${rangedWeapon.name} • ${meleeWeapon.name}`;
  }

  return rangedWeapon?.name ?? primaryWeapon?.name ?? meleeWeapon?.name ?? "Weapon not set";
}

function WorkspaceArmyPanel({
  side,
  armies,
  loadedArmyId,
  activeUnitId,
  onLoadArmy,
  onSelectUnit,
}: {
  side: "A" | "B";
  armies: ArmyPresetV2[];
  loadedArmyId: string | null;
  activeUnitId: string;
  onLoadArmy: (armyId: string) => void;
  onSelectUnit: (unit: SavedUnitInPreset, faction: string) => void;
}) {
  const loadedArmy = useMemo(
    () => armies.find((army) => army.id === loadedArmyId) ?? null,
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
          onChange={(event) => event.target.value && onLoadArmy(event.target.value)}
        >
          <option value="">{emptyHint}</option>
          {armies.map((army) => (
            <option key={army.id} value={army.id}>
              {army.name}
            </option>
          ))}
        </select>
      </div>

      {loadedArmy ? (
        <>
          <div className="workspace-army-panel__summary">
            <div className="workspace-army-panel__summary-block">
              <span className="workspace-army-panel__summary-label">Faction</span>
              <span className="workspace-army-panel__summary-value">
                {loadedArmy.faction}
              </span>
            </div>
            <div className="workspace-army-panel__summary-block">
              <span className="workspace-army-panel__summary-label">Points</span>
              <span className="workspace-army-panel__summary-value">
                {loadedArmy.totalPoints > 0 ? `${loadedArmy.totalPoints} pts` : "Pending"}
              </span>
            </div>
            <div className="workspace-army-panel__summary-block">
              <span className="workspace-army-panel__summary-label">Units</span>
              <span className="workspace-army-panel__summary-value">
                {loadedArmy.units.length}
              </span>
            </div>
          </div>

          <div className="workspace-unit-list">
            {loadedArmy.units.length === 0 ? (
              <p className="workspace-army-panel__empty">No units in this army.</p>
            ) : (
              loadedArmy.units.map((savedUnit, index) => {
                const unit = unitById(savedUnit.unitId);
                const isActive =
                  savedUnit.unitId === activeUnitId ||
                  (savedUnit.nickname && savedUnit.nickname === activeUnitId);

                return (
                  <button
                    key={savedUnit.instanceId ?? `${savedUnit.unitId}-${savedUnit.addedAt ?? index}`}
                    className={`workspace-unit-row${isActive ? " workspace-unit-row--active" : ""}`}
                    onClick={() => onSelectUnit(savedUnit, loadedArmy.faction)}
                    aria-pressed={Boolean(isActive)}
                  >
                    <div className="workspace-unit-row__info">
                      <span className="workspace-unit-row__name">
                        {savedUnit.nickname ?? unit?.name ?? savedUnit.unitId}
                      </span>
                      <span className="workspace-unit-row__weapon">
                        {getPresetUnitWeaponLabel(savedUnit)}
                      </span>
                    </div>
                    <div className="workspace-unit-row__meta">
                      <span>{savedUnit.modelCount} models</span>
                      {savedUnit.unitTotalPoints > 0 && (
                        <span>{savedUnit.unitTotalPoints} pts</span>
                      )}
                    </div>
                    {isActive && (
                      <span className="workspace-unit-row__badge">Active</span>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </>
      ) : (
        <div className="workspace-army-panel__no-army">
          <p>
            Load an army preset from the dropdown, or go to <strong>My Armies</strong>{" "}
            to create one.
          </p>
        </div>
      )}
    </div>
  );
}

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
            -
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

type Props = {
  armies: ArmyPresetV2[];
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
            Load two saved armies, then click any unit row to move straight into
            an active combat matchup.
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
            const army = armies.find((item) => item.id === id);
            const firstUnit = army?.units[0];
            if (army && firstUnit) {
              selectAttacker(
                army.faction,
                firstUnit.unitId,
                getPresetUnitPrimaryWeapon(firstUnit) ?? ""
              );
            }
          }}
          onSelectUnit={(savedUnit, faction) => {
            selectAttacker(
              faction,
              savedUnit.unitId,
              getPresetUnitPrimaryWeapon(savedUnit) ?? ""
            );
          }}
        />

        <WorkspaceArmyPanel
          side="B"
          armies={armies}
          loadedArmyId={workspaceArmyB}
          activeUnitId={defenderId}
          onLoadArmy={(id) => {
            setWorkspaceArmyB(id);
            const army = armies.find((item) => item.id === id);
            const firstUnit = army?.units[0];
            if (army && firstUnit) {
              selectDefender(army.faction, firstUnit.unitId);
            }
          }}
          onSelectUnit={(savedUnit, faction) => {
            selectDefender(faction, savedUnit.unitId);
          }}
        />
      </div>

      <BattleStateStrip conditions={conditions} setConditions={setConditions} />
    </div>
  );
}
