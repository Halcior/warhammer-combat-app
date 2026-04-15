import { useEffect, useMemo, useState } from "react";
import { units } from "../data/units";
import { calculateUnitPoints } from "../lib/presetUtils";
import type { ArmyPresetV2, SavedUnitInPreset } from "../types/armyPreset";
import type { AttackConditions } from "../types/combat";
import { battleStateToggles } from "../lib/battleStateToggles";

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

function formatSelectedWeapons(
  selectedWeapons: SavedUnitInPreset["selectedWeapons"] | undefined,
  fallbackLabel = "Weapon not set"
) {
  if (!selectedWeapons || selectedWeapons.length === 0) {
    return fallbackLabel;
  }

  return selectedWeapons
    .map((weapon) => weapon.name)
    .join(" | ");
}

function getPresetUnitWeaponLabel(savedUnit: SavedUnitInPreset) {
  const unit = unitById(savedUnit.unitId);
  if (savedUnit.selectedWeapons && savedUnit.selectedWeapons.length > 0) {
    return formatSelectedWeapons(savedUnit.selectedWeapons);
  }

  const rangedWeapon = unit?.weapons.find((weapon) => weapon.id === savedUnit.selectedRangedWeaponId);
  const meleeWeapon = unit?.weapons.find((weapon) => weapon.id === savedUnit.selectedMeleeWeaponId);
  const primaryWeapon = unit?.weapons.find((weapon) => weapon.id === savedUnit.selectedWeaponId);

  if (rangedWeapon && meleeWeapon) {
    return `${rangedWeapon.name} | ${meleeWeapon.name}`;
  }

  return rangedWeapon?.name ?? primaryWeapon?.name ?? meleeWeapon?.name ?? "Weapon not set";
}

export type WorkspaceSelectableEntry = {
  entryId: string;
  unitId: string;
  displayName: string;
  weaponLabel: string;
  modelCount: number;
  points: number;
  source: "unit" | "attachedLeader";
  parentLabel?: string;
  primaryWeaponId?: string;
  weaponOptions: Array<{ weaponId: string; label: string }>;
};

// eslint-disable-next-line react-refresh/only-export-components
export function buildWorkspaceSelectableEntries(army: ArmyPresetV2 | null): WorkspaceSelectableEntry[] {
  if (!army) {
    return [];
  }

  return army.units.flatMap((savedUnit, index) => {
    const hostUnit = unitById(savedUnit.unitId);
    const hostEntry: WorkspaceSelectableEntry = {
      entryId: savedUnit.instanceId ?? `${savedUnit.unitId}-${savedUnit.addedAt ?? index}`,
      unitId: savedUnit.unitId,
      displayName: savedUnit.nickname ?? hostUnit?.name ?? savedUnit.unitId,
      weaponLabel: getPresetUnitWeaponLabel(savedUnit),
      modelCount: savedUnit.modelCount,
      points: calculateUnitPoints(savedUnit),
      source: "unit",
      primaryWeaponId: getPresetUnitPrimaryWeapon(savedUnit),
      weaponOptions: (savedUnit.selectedWeapons ?? []).map((weapon) => ({
        weaponId: weapon.weaponId,
        label: weapon.name,
      })),
    };

    const leaderEntry = savedUnit.attachedLeader
      ? {
          entryId: `${hostEntry.entryId}::leader`,
          unitId: savedUnit.attachedLeader.unitId,
          displayName: savedUnit.attachedLeader.unitName,
          weaponLabel: formatSelectedWeapons(savedUnit.attachedLeader.selectedWeapons),
          modelCount: savedUnit.attachedLeader.modelCount,
          points: savedUnit.leaderPointsCost ?? savedUnit.attachedLeader.pointsTotal ?? 0,
          source: "attachedLeader" as const,
          parentLabel: hostEntry.displayName,
          primaryWeaponId:
            savedUnit.attachedLeader.selectedRangedWeaponId ??
            savedUnit.attachedLeader.selectedWeaponId ??
            savedUnit.attachedLeader.selectedMeleeWeaponId,
          weaponOptions: (savedUnit.attachedLeader.selectedWeapons ?? []).map((weapon) => ({
            weaponId: weapon.weaponId,
            label: weapon.name,
          })),
        }
      : undefined;

    return leaderEntry ? [hostEntry, leaderEntry] : [hostEntry];
  });
}

type WorkspaceArmyPanelProps = {
  side: "A" | "B";
  armies: ArmyPresetV2[];
  loadedArmyId: string | null;
  activeEntryId: string;
  onLoadArmy: (armyId: string) => void;
  onSelectUnit: (entry: WorkspaceSelectableEntry, faction: string) => void;
};

function WorkspaceArmyPanel({
  side,
  armies,
  loadedArmyId,
  activeEntryId,
  onLoadArmy,
  onSelectUnit,
}: WorkspaceArmyPanelProps) {
  const loadedArmy = useMemo(
    () => armies.find((army) => army.id === loadedArmyId) ?? null,
    [armies, loadedArmyId]
  );
  const selectableEntries = useMemo(
    () => buildWorkspaceSelectableEntries(loadedArmy),
    [loadedArmy]
  );

  const label = side === "A" ? "Attacker - Army A" : "Defender - Army B";
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
              <span className="workspace-army-panel__summary-value">{loadedArmy.faction}</span>
            </div>
            <div className="workspace-army-panel__summary-block">
              <span className="workspace-army-panel__summary-label">Points</span>
              <span className="workspace-army-panel__summary-value">
                {loadedArmy.totalPoints > 0 ? `${loadedArmy.totalPoints} pts` : "Pending"}
              </span>
            </div>
            <div className="workspace-army-panel__summary-block">
              <span className="workspace-army-panel__summary-label">Units</span>
              <span className="workspace-army-panel__summary-value">{loadedArmy.units.length}</span>
            </div>
          </div>

          <div className="workspace-unit-list">
            {selectableEntries.length === 0 ? (
              <p className="workspace-army-panel__empty">No units in this army.</p>
            ) : (
              selectableEntries.map((entry) => {
                const isActive = entry.entryId === activeEntryId;

                return (
                  <button
                    key={entry.entryId}
                    className={`workspace-unit-row${isActive ? " workspace-unit-row--active" : ""}${
                      entry.source === "attachedLeader" ? " workspace-unit-row--nested" : ""
                    }`}
                    onClick={() => onSelectUnit(entry, loadedArmy.faction)}
                    aria-pressed={Boolean(isActive)}
                  >
                    <div className="workspace-unit-row__info">
                      <div className="workspace-unit-row__title-line">
                        <span className="workspace-unit-row__name">{entry.displayName}</span>
                        {entry.source === "attachedLeader" && (
                          <span className="workspace-unit-row__source">Attached Leader</span>
                        )}
                      </div>
                      <span className="workspace-unit-row__weapon">{entry.weaponLabel}</span>
                      {entry.parentLabel && (
                        <span className="workspace-unit-row__submeta">Attached to {entry.parentLabel}</span>
                      )}
                    </div>
                    <div className="workspace-unit-row__meta">
                      <span>{entry.modelCount} model{entry.modelCount === 1 ? "" : "s"}</span>
                      {entry.points > 0 && <span>{entry.points} pts</span>}
                    </div>
                    {isActive && <span className="workspace-unit-row__badge">Active</span>}
                  </button>
                );
              })
            )}
          </div>
        </>
      ) : (
        <div className="workspace-army-panel__no-army">
          <p>
            Load an army preset from the dropdown, or go to <strong>My Armies</strong> to create one.
          </p>
        </div>
      )}
    </div>
  );
}

type WorkspaceCombatSetupProps = {
  attackerEntry: WorkspaceSelectableEntry | null;
  defenderEntry: WorkspaceSelectableEntry | null;
  attackerFaction: string;
  defenderFaction: string;
  weaponId: string;
  onWeaponChange: (weaponId: string) => void;
  attackingModels: number;
  defendingModels: number;
  setAttackingModels: (value: number) => void;
  setDefendingModels: (value: number) => void;
  conditions: AttackConditions;
  setConditions: (c: AttackConditions) => void;
};

function WorkspaceCombatSetup({
  attackerEntry,
  defenderEntry,
  attackerFaction,
  defenderFaction,
  weaponId,
  onWeaponChange,
  attackingModels,
  defendingModels,
  setAttackingModels,
  setDefendingModels,
  conditions,
  setConditions,
}: WorkspaceCombatSetupProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  function toggle(key: keyof AttackConditions) {
    setConditions({ ...conditions, [key]: !conditions[key] });
  }

  function setRound(round: number) {
    setConditions({ ...conditions, battleRound: Math.max(1, Math.min(5, round)) });
  }

  const corePills: { label: string; key: keyof AttackConditions }[] = [
    { label: "Cover", key: "isTargetInCover" },
    { label: "Charge turn", key: "isChargeTurn" },
    { label: "Half range", key: "isHalfRange" },
    { label: "Stationary", key: "remainedStationary" },
  ];

  const relevantFactions = useMemo(
    () => new Set([attackerFaction, defenderFaction].filter(Boolean)),
    [attackerFaction, defenderFaction]
  );
  const isRangedAttack = useMemo(() => {
    if (!attackerEntry) {
      return true;
    }

    const actorUnit = unitById(attackerEntry.unitId);
    const selectedWeapon = actorUnit?.weapons.find((weapon) => weapon.id === weaponId);
    return selectedWeapon?.type !== "melee";
  }, [attackerEntry, weaponId]);
  const advancedToggles = battleStateToggles.filter((toggle) => toggle.group === "advanced");
  const visibleAdvancedToggles = advancedToggles.filter((toggle) => {
    if (conditions[toggle.key]) {
      return true;
    }

    const matchesFaction =
      !toggle.factions || toggle.factions.some((faction) => relevantFactions.has(faction));
    const matchesAttackType =
      !toggle.attackTypes || toggle.attackTypes.includes(isRangedAttack ? "ranged" : "melee");

    return matchesFaction && matchesAttackType;
  });

  return (
    <div className="card workspace-combat-setup">
      <div className="workspace-combat-setup__header">
        <div>
          <p className="panel-eyebrow">Combat Setup</p>
          <h3 className="workspace-combat-setup__title">Preset-aware battle state</h3>
          <p className="muted-text">
            Pick the active weapon, adjust the matchup context and keep the simulation grounded in the saved loadout.
          </p>
        </div>
      </div>

      <div className="workspace-combat-setup__grid">
        <label className="workspace-combat-setup__field">
          <span>Attacking Weapon</span>
          <select
            value={weaponId}
            onChange={(event) => onWeaponChange(event.target.value)}
            disabled={!attackerEntry || attackerEntry.weaponOptions.length === 0}
          >
            {!attackerEntry ? (
              <option value="">Select an attacker first</option>
            ) : (
              attackerEntry.weaponOptions.map((option) => (
                <option key={option.weaponId} value={option.weaponId}>
                  {option.label}
                </option>
              ))
            )}
          </select>
        </label>

        <label className="workspace-combat-setup__field">
          <span>Attacking models</span>
          <input
            type="number"
            min={1}
            value={attackingModels}
            onChange={(event) => setAttackingModels(Math.max(1, Number(event.target.value) || 1))}
          />
        </label>

        <label className="workspace-combat-setup__field">
          <span>Defending models</span>
          <input
            type="number"
            min={1}
            value={defendingModels}
            onChange={(event) => {
              const value = Math.max(1, Number(event.target.value) || 1);
              setDefendingModels(value);
              setConditions({ ...conditions, targetModelCount: value });
            }}
          />
        </label>

        <label className="workspace-combat-setup__field">
          <span>Target distance (")</span>
          <input
            type="number"
            min={0}
            value={conditions.targetDistanceInches}
            onChange={(event) =>
              setConditions({
                ...conditions,
                targetDistanceInches: Math.max(0, Number(event.target.value) || 0),
              })
            }
          />
        </label>
      </div>

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
            <span className="workspace-state-strip__round-value">{conditions.battleRound}</span>
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

        {corePills.map(({ label, key }) => (
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

      <details className="workspace-advanced-state" open={showAdvanced}>
        <summary
          className="workspace-advanced-state__summary"
          onClick={(event) => {
            event.preventDefault();
            setShowAdvanced((prev) => !prev);
          }}
        >
          <span>Advanced battle state</span>
          <span className="workspace-advanced-state__meta">{visibleAdvancedToggles.length} relevant</span>
        </summary>

        {showAdvanced && (
          <div className="workspace-advanced-state__grid">
            {visibleAdvancedToggles.map(({ key, label, title }) => (
              <label key={key} className="checkbox-row" title={title}>
                <input
                  type="checkbox"
                  checked={conditions[key]}
                  onChange={(event) =>
                    setConditions({
                      ...conditions,
                      [key]: event.target.checked,
                    })
                  }
                />
                <span className="checkbox-row__label">{label}</span>
              </label>
            ))}
          </div>
        )}
      </details>

      <div className="workspace-combat-setup__actors">
        <span>
          Attacker: <strong>{attackerEntry?.displayName ?? "Not selected"}</strong>
        </span>
        <span>
          Defender: <strong>{defenderEntry?.displayName ?? "Not selected"}</strong>
        </span>
        <span>
          Weapon: <strong>{attackerEntry?.weaponOptions.find((option) => option.weaponId === weaponId)?.label ?? "Not selected"}</strong>
        </span>
        <span>
          Models attacking: <strong>{attackingModels}</strong>
        </span>
      </div>
    </div>
  );
}

type Props = {
  armies: ArmyPresetV2[];
  workspaceArmyA: string | null;
  workspaceArmyB: string | null;
  setWorkspaceArmyA: (id: string | null) => void;
  setWorkspaceArmyB: (id: string | null) => void;
  attackerFaction: string;
  defenderFaction: string;
  attackerId: string;
  defenderId: string;
  weaponId: string;
  attackingModels: number;
  defendingModels: number;
  conditions: AttackConditions;
  setConditions: (c: AttackConditions) => void;
  handleWeaponChange: (weaponId: string) => void;
  setAttackingModels: (value: number) => void;
  setDefendingModels: (value: number) => void;
  selectAttacker: (faction: string, unitId: string, weaponId: string) => void;
  selectDefender: (faction: string, unitId: string) => void;
};

export function WorkspaceView({
  armies,
  workspaceArmyA,
  workspaceArmyB,
  setWorkspaceArmyA,
  setWorkspaceArmyB,
  attackerFaction,
  defenderFaction,
  attackerId,
  defenderId,
  weaponId,
  attackingModels,
  defendingModels,
  conditions,
  setConditions,
  handleWeaponChange,
  setAttackingModels,
  setDefendingModels,
  selectAttacker,
  selectDefender,
}: Props) {
  const [activeAttackerEntryId, setActiveAttackerEntryId] = useState("");
  const [activeDefenderEntryId, setActiveDefenderEntryId] = useState("");

  const attackerArmy = useMemo(
    () => armies.find((army) => army.id === workspaceArmyA) ?? null,
    [armies, workspaceArmyA]
  );
  const defenderArmy = useMemo(
    () => armies.find((army) => army.id === workspaceArmyB) ?? null,
    [armies, workspaceArmyB]
  );
  const attackerEntries = useMemo(
    () => buildWorkspaceSelectableEntries(attackerArmy),
    [attackerArmy]
  );
  const defenderEntries = useMemo(
    () => buildWorkspaceSelectableEntries(defenderArmy),
    [defenderArmy]
  );

  const activeAttackerEntry = useMemo(
    () =>
      attackerEntries.find((entry) => entry.entryId === activeAttackerEntryId) ??
      attackerEntries.find((entry) => entry.unitId === attackerId) ??
      null,
    [attackerEntries, activeAttackerEntryId, attackerId]
  );
  const activeDefenderEntry = useMemo(
    () =>
      defenderEntries.find((entry) => entry.entryId === activeDefenderEntryId) ??
      defenderEntries.find((entry) => entry.unitId === defenderId) ??
      null,
    [defenderEntries, activeDefenderEntryId, defenderId]
  );

  useEffect(() => {
    if (!activeAttackerEntry?.weaponOptions.length) {
      return;
    }

    if (activeAttackerEntry.weaponOptions.some((option) => option.weaponId === weaponId)) {
      return;
    }

    handleWeaponChange(activeAttackerEntry.weaponOptions[0].weaponId);
  }, [activeAttackerEntry, handleWeaponChange, weaponId]);

  return (
    <div className="workspace-setup">
      <div className="workspace-setup__header">
        <div>
          <p className="panel-eyebrow">Battle Workspace</p>
          <h2 className="workspace-setup__title">Matchup Analysis</h2>
          <p className="muted-text">
            Load two saved armies, choose the actual combat actors and carry the saved loadout into simulation.
          </p>
        </div>
      </div>

      <div className="workspace-armies">
        <WorkspaceArmyPanel
          side="A"
          armies={armies}
          loadedArmyId={workspaceArmyA}
          activeEntryId={activeAttackerEntryId}
          onLoadArmy={(id) => {
            setWorkspaceArmyA(id);
            const army = armies.find((item) => item.id === id) ?? null;
            const firstEntry = buildWorkspaceSelectableEntries(army)[0];
            if (army && firstEntry) {
              setActiveAttackerEntryId(firstEntry.entryId);
              selectAttacker(army.faction, firstEntry.unitId, firstEntry.primaryWeaponId ?? "");
            }
          }}
          onSelectUnit={(entry, faction) => {
            setActiveAttackerEntryId(entry.entryId);
            selectAttacker(faction, entry.unitId, entry.primaryWeaponId ?? "");
          }}
        />

        <WorkspaceArmyPanel
          side="B"
          armies={armies}
          loadedArmyId={workspaceArmyB}
          activeEntryId={activeDefenderEntryId}
          onLoadArmy={(id) => {
            setWorkspaceArmyB(id);
            const army = armies.find((item) => item.id === id) ?? null;
            const firstEntry = buildWorkspaceSelectableEntries(army)[0];
            if (army && firstEntry) {
              setActiveDefenderEntryId(firstEntry.entryId);
              selectDefender(army.faction, firstEntry.unitId);
            }
          }}
          onSelectUnit={(entry, faction) => {
            setActiveDefenderEntryId(entry.entryId);
            selectDefender(faction, entry.unitId);
          }}
        />
      </div>

      <WorkspaceCombatSetup
        attackerEntry={activeAttackerEntry}
        defenderEntry={activeDefenderEntry}
        attackerFaction={attackerFaction}
        defenderFaction={defenderFaction}
        weaponId={weaponId}
        onWeaponChange={handleWeaponChange}
        attackingModels={attackingModels}
        defendingModels={defendingModels}
        setAttackingModels={setAttackingModels}
        setDefendingModels={setDefendingModels}
        conditions={conditions}
        setConditions={setConditions}
      />
    </div>
  );
}
