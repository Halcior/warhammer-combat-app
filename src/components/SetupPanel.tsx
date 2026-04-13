import { useMemo, useState } from "react";

import type { AttackConditions, Unit, Weapon, WeaponType } from "../types/combat";

type BattleStateToggleKey =
  | "isTargetInCover"
  | "remainedStationary"
  | "isChargeTurn"
  | "targetHasMatchingAntiKeyword"
  | "isAttachedUnit"
  | "attackerWithinObjectiveRange"
  | "attackerDisembarkedThisTurn"
  | "attackerIsFiringOverwatch"
  | "attackerIsAfflicted"
  | "attackerIsGuided"
  | "attackerIsVesselOfWrath"
  | "attackerWithinFriendlyCharacterRange"
  | "attackerWithinFriendlyMonsterAura"
  | "attackWithinObjectiveRange"
  | "attackerWithinPowerMatrix"
  | "attackerSetUpThisTurn"
  | "attackerSetToDefend"
  | "isHalfRange"
  | "targetIsClosestEligible"
  | "targetWithinPlagueLegionsEngagementRange"
  | "targetIsSpotted"
  | "targetIsAfflicted"
  | "targetWithinContagionRange"
  | "targetInOpponentDeploymentZone"
  | "attackerWithinAuxiliarySupportRange"
  | "defenderWithinFriendlyVehicleSupportRange"
  | "defenderWithinAuxiliaryStealthRange"
  | "targetWithinAuxiliarySupportRange"
  | "targetOppositeHatchway"
  | "targetIsUnravelling"
  | "targetWithinObjectiveRange"
  | "targetIsBattleShocked"
  | "targetBelowStartingStrength"
  | "targetBelowHalfStrength"
  | "attackerBelowStartingStrength"
  | "attackerBelowHalfStrength"
  | "attackerIsIsolated";

type BattleStateToggle = {
  key: BattleStateToggleKey;
  label: string;
  title: string;
  group: "core" | "advanced";
  factions?: string[];
  attackTypes?: WeaponType[];
};

const battleStateToggles: BattleStateToggle[] = [
  { key: "isTargetInCover", label: "Target in cover", title: "The defender benefits from cover.", group: "core" },
  { key: "remainedStationary", label: "Remained stationary", title: "The attacking unit remained stationary this turn.", group: "core", attackTypes: ["ranged"] },
  { key: "isChargeTurn", label: "Charge turn", title: "The current attack happens during a charge turn.", group: "core", attackTypes: ["melee"] },
  { key: "targetHasMatchingAntiKeyword", label: "Anti keyword match", title: "The target matches the attack's Anti keyword.", group: "core" },
  { key: "isAttachedUnit", label: "Led / attached unit", title: "The attacking unit is led by a Character or attached.", group: "core" },
  { key: "attackerWithinObjectiveRange", label: "Attacker on objective", title: "The attacking unit is within range of an objective marker you control.", group: "advanced" },
  { key: "attackerDisembarkedThisTurn", label: "Disembarked this turn", title: "The attacking unit disembarked from a transport this turn.", group: "core" },
  { key: "attackerIsFiringOverwatch", label: "Firing Overwatch", title: "The attacking unit is making Overwatch attacks.", group: "core", attackTypes: ["ranged"] },
  { key: "attackerIsAfflicted", label: "Attacker is Afflicted", title: "The attacking unit currently counts as Afflicted for Death Guard interactions.", group: "advanced", factions: ["Death Guard"] },
  { key: "attackerIsGuided", label: "Attacker is Guided", title: "The attacking unit is Guided.", group: "core", factions: ["Tau Empire"] },
  { key: "isHalfRange", label: "Half range", title: "The target is inside half range for the active weapon.", group: "core", attackTypes: ["ranged"] },
  { key: "targetIsClosestEligible", label: "Closest eligible target", title: "The defender is the closest eligible target.", group: "core" },
  { key: "targetWithinPlagueLegionsEngagementRange", label: "Near Plague Legions", title: "The defender is within Engagement Range of one or more friendly Plague Legions units.", group: "advanced", factions: ["Death Guard"] },
  { key: "targetIsSpotted", label: "Spotted / markerlit", title: "The defender is the spotted or markerlit target.", group: "core", factions: ["Tau Empire"] },
  { key: "targetWithinObjectiveRange", label: "Target on objective", title: "The defender is within range of an objective marker.", group: "core" },
  { key: "targetIsBattleShocked", label: "Target is Battle-shocked", title: "The defender is Battle-shocked.", group: "core" },
  { key: "targetBelowStartingStrength", label: "Target damaged", title: "The defender has already lost at least one wound or model.", group: "core" },
  { key: "targetBelowHalfStrength", label: "Target below half", title: "The defender is below half of its starting strength.", group: "core" },
  { key: "attackerBelowStartingStrength", label: "Attacker damaged", title: "The attacker has already lost at least one wound or model.", group: "core" },
  { key: "attackerBelowHalfStrength", label: "Attacker below half", title: "The attacker is below half of its starting strength.", group: "core" },
  { key: "attackerIsVesselOfWrath", label: "Vessel of Wrath", title: "The attacking unit is currently a Vessel of Wrath.", group: "advanced", factions: ["World Eaters"] },
  { key: "attackerWithinFriendlyCharacterRange", label: "Near friendly Character", title: "The attacking unit is within friendly Character support range.", group: "advanced", factions: ["World Eaters"] },
  { key: "attackerWithinFriendlyMonsterAura", label: "Near Monster/Titanic aura", title: "The attacking unit is within a friendly Monster or Titanic aura.", group: "advanced", factions: ["World Eaters"] },
  { key: "attackWithinObjectiveRange", label: "Attack on objective", title: "The attack targets a unit within objective range.", group: "advanced" },
  { key: "attackerWithinPowerMatrix", label: "Attacker in Power Matrix", title: "The attacker is inside the Power Matrix.", group: "advanced", factions: ["Necrons"] },
  { key: "attackerSetUpThisTurn", label: "Set up this turn", title: "The attacking unit was set up on the battlefield this turn.", group: "advanced" },
  { key: "attackerSetToDefend", label: "Attacker set to defend", title: "The attacker is in a defensive set-to-defend state.", group: "advanced" },
  { key: "targetIsAfflicted", label: "Target is Afflicted", title: "The defender currently counts as Afflicted for Death Guard rules.", group: "advanced", factions: ["Death Guard"] },
  { key: "targetWithinContagionRange", label: "Target in Contagion Range", title: "The defender is currently within Contagion Range of one or more Death Guard units.", group: "advanced", factions: ["Death Guard"] },
  { key: "targetInOpponentDeploymentZone", label: "Target in enemy deployment", title: "The defender is within its controller's deployment zone.", group: "advanced", factions: ["Death Guard"] },
  { key: "defenderWithinFriendlyVehicleSupportRange", label: "Defender near friendly Vehicle", title: "The defended model is within support range of a friendly vehicle unit.", group: "advanced", factions: ["Death Guard"] },
  { key: "attackerWithinAuxiliarySupportRange", label: "Attacker near Kroot/Vespid support", title: "The attacker is within support range of friendly Kroot or Vespid auxiliaries.", group: "advanced", factions: ["Tau Empire"] },
  { key: "defenderWithinAuxiliaryStealthRange", label: "Auxiliary stealth screen", title: "A nearby Tau unit is screening the Kroot or Vespid defender.", group: "advanced", factions: ["Tau Empire"] },
  { key: "targetWithinAuxiliarySupportRange", label: "Near Kroot/Vespid support", title: "The target is within range of friendly Kroot or Vespid support.", group: "advanced", factions: ["Tau Empire"] },
  { key: "targetOppositeHatchway", label: "Target opposite hatchway", title: "The defender is on the opposite side of a hatchway.", group: "advanced" },
  { key: "targetIsUnravelling", label: "Target is unravelling", title: "The target currently counts as unravelling.", group: "advanced", factions: ["Necrons"] },
  { key: "attackerIsIsolated", label: "Attacker is isolated", title: "The attacking unit counts as isolated.", group: "advanced", factions: ["World Eaters"] },
];

type SetupPanelProps = {
  factions: string[];
  attackerFaction: string;
  defenderFaction: string;
  attackerId: string;
  defenderId: string;
  weaponId: string;
  attackingModels: number;
  defendingModels: number;
  conditions: AttackConditions;
  attackerUnits: Unit[];
  defenderUnits: Unit[];
  attacker: Unit;
  setAttackingModels: React.Dispatch<React.SetStateAction<number>>;
  setDefendingModels: React.Dispatch<React.SetStateAction<number>>;
  setConditions: React.Dispatch<React.SetStateAction<AttackConditions>>;
  handleAttackerFactionChange: (newFaction: string) => void;
  handleAttackerChange: (newAttackerId: string) => void;
  handleWeaponChange: (newWeaponId: string) => void;
  handleDefenderFactionChange: (newFaction: string) => void;
  handleDefenderChange: (newDefenderId: string) => void;
};

export function SetupPanel({
  factions,
  attackerFaction,
  defenderFaction,
  attackerId,
  defenderId,
  weaponId,
  attackingModels,
  defendingModels,
  conditions,
  attackerUnits,
  defenderUnits,
  attacker,
  setAttackingModels,
  setDefendingModels,
  setConditions,
  handleAttackerFactionChange,
  handleAttackerChange,
  handleWeaponChange,
  handleDefenderFactionChange,
  handleDefenderChange,
}: SetupPanelProps) {
  const [showAllBattleState, setShowAllBattleState] = useState(false);
  const relevantFactions = useMemo(
    () => new Set([attackerFaction, defenderFaction]),
    [attackerFaction, defenderFaction],
  );
  const isRangedAttack = attacker.weapons.some((weapon) => weapon.id === weaponId && weapon.type === "ranged");

  const isRelevantToggle = (toggle: BattleStateToggle) => {
    if (conditions[toggle.key]) {
      return true;
    }

    const matchesFaction =
      !toggle.factions || toggle.factions.some((faction) => relevantFactions.has(faction));
    const matchesAttackType =
      !toggle.attackTypes ||
      toggle.attackTypes.includes(isRangedAttack ? "ranged" : "melee");

    return matchesFaction && matchesAttackType;
  };

  const coreToggles = battleStateToggles.filter((toggle) => toggle.group === "core");
  const advancedToggles = battleStateToggles.filter((toggle) => toggle.group === "advanced");
  const visibleAdvancedToggles = showAllBattleState
    ? advancedToggles
    : advancedToggles.filter(isRelevantToggle);

  return (
    <div className="card card--setup">
      <div className="panel-heading">
        <p className="panel-eyebrow">Battle Setup</p>
        <h2>Setup</h2>
        <p className="muted-text">
          Pick the units, weapon and the battle-state flags that actually matter.
        </p>
      </div>

      <section className="form-section">
        <div className="form-section__header">
          <h3>Army</h3>
          <p className="muted-text">
            Choose both sides, the attacking weapon and the core matchup context.
          </p>
        </div>

        <div className="setup-flow">
          <div className="setup-field-group setup-field-group--attacker">
            <div className="setup-field-group__header">
              <h4>Attacker</h4>
            </div>
            <div className="setup-fields-grid setup-fields-grid--attacker">
              <label>
                Attacker faction
                <select
                  value={attackerFaction}
                  onChange={(e) => handleAttackerFactionChange(e.target.value)}
                >
                  {factions.map((faction) => (
                    <option key={faction} value={faction}>
                      {faction}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Attacker unit
                <select
                  value={attackerId}
                  onChange={(e) => handleAttackerChange(e.target.value)}
                >
                  {attackerUnits.map((unit) => (
                    <option key={unit.id} value={unit.id}>
                      {unit.name}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Weapon
                <select
                  value={weaponId}
                  onChange={(e) => handleWeaponChange(e.target.value)}
                >
                  {attacker.weapons.map((weapon: Weapon) => (
                    <option key={weapon.id} value={weapon.id}>
                      {weapon.name}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Attacking models
                <input
                  type="number"
                  min={1}
                  value={attackingModels}
                  onChange={(e) =>
                    setAttackingModels(Math.max(1, Number(e.target.value) || 1))
                  }
                />
              </label>
            </div>
          </div>

          <div className="setup-field-group setup-field-group--defender">
            <div className="setup-field-group__header">
              <h4>Defender</h4>
            </div>
            <div className="setup-fields-grid setup-fields-grid--defender">
              <label>
                Defender faction
                <select
                  value={defenderFaction}
                  onChange={(e) => handleDefenderFactionChange(e.target.value)}
                >
                  {factions.map((faction) => (
                    <option key={faction} value={faction}>
                      {faction}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Defender unit
                <select
                  value={defenderId}
                  onChange={(e) => handleDefenderChange(e.target.value)}
                >
                  {defenderUnits.map((unit) => (
                    <option key={unit.id} value={unit.id}>
                      {unit.name}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Defending models
                <input
                  type="number"
                  min={1}
                  value={defendingModels}
                  onChange={(e) => {
                    const value = Math.max(1, Number(e.target.value) || 1);
                    setDefendingModels(value);
                    setConditions((prev) => ({
                      ...prev,
                      targetModelCount: value,
                    }));
                  }}
                />
              </label>
            </div>
          </div>

          <div className="setup-field-group setup-field-group--context">
            <div className="setup-field-group__header">
              <h4>Match context</h4>
            </div>
            <div className="setup-fields-grid setup-fields-grid--context">
              <label>
                Battle round
                <input
                  type="number"
                  min={1}
                  max={5}
                  value={conditions.battleRound}
                  onChange={(e) =>
                    setConditions((prev) => ({
                      ...prev,
                      battleRound: Math.min(5, Math.max(1, Number(e.target.value) || 1)),
                    }))
                  }
                />
              </label>

              <label>
                Target distance (")
                <input
                  type="number"
                  min={0}
                  step={1}
                  value={conditions.targetDistanceInches}
                  onChange={(e) =>
                    setConditions((prev) => ({
                      ...prev,
                      targetDistanceInches: Math.max(0, Number(e.target.value) || 0),
                    }))
                  }
                />
              </label>
            </div>
          </div>
        </div>
      </section>

      <section className="form-section">
        <div className="form-section__header">
          <h3>Battle state</h3>
          <p className="muted-text">
            Toggle only the conditions that meaningfully affect this attack.
          </p>
        </div>

        <div className="setup-state-stack">
          <div className="setup-state-toolbar">
            <p className="setup-state-toolbar__meta">
              {showAllBattleState
                ? `Showing all ${battleStateToggles.length} battle-state toggles`
                : `Showing ${coreToggles.length + visibleAdvancedToggles.length} relevant toggles for this matchup`}
            </p>
            <button
              type="button"
              className="setup-state-toolbar__button"
              onClick={() => setShowAllBattleState((prev) => !prev)}
            >
              {showAllBattleState ? "Show relevant only" : "Show all battle-state options"}
            </button>
          </div>

          <div className="setup-state-group">
            <div className="setup-state-group__header">
              <h4>Core conditions</h4>
              <span>{coreToggles.length}</span>
            </div>
            <div className="setup-conditions-grid">
              {coreToggles.map(({ key, label, title }) => (
                <label key={key} className="checkbox-row" title={title}>
                  <input
                    type="checkbox"
                    checked={conditions[key]}
                    onChange={(e) =>
                      setConditions((prev) => ({
                        ...prev,
                        [key]: e.target.checked,
                      }))
                    }
                  />
                  <span className="checkbox-row__label">{label}</span>
                </label>
              ))}
            </div>
          </div>

          <details className="setup-state-advanced">
            <summary className="rules-section__summary">
              <span>Advanced / faction-specific</span>
              <span className="setup-state-advanced__meta">
                {!showAllBattleState && visibleAdvancedToggles.length !== advancedToggles.length
                  ? `${visibleAdvancedToggles.length} relevant`
                  : `${advancedToggles.length} total`}
              </span>
              <span className="rules-section__chevron" aria-hidden="true">
                +
              </span>
            </summary>
            <div className="rules-section__content">
              {visibleAdvancedToggles.length > 0 ? (
                <div className="setup-conditions-grid">
                  {visibleAdvancedToggles.map(({ key, label, title }) => (
                    <label key={key} className="checkbox-row" title={title}>
                      <input
                        type="checkbox"
                        checked={conditions[key]}
                        onChange={(e) =>
                          setConditions((prev) => ({
                            ...prev,
                            [key]: e.target.checked,
                          }))
                        }
                      />
                      <span className="checkbox-row__label">{label}</span>
                    </label>
                  ))}
                </div>
              ) : (
                <p className="muted-text">
                  No extra faction-specific battle-state toggles are relevant for this matchup.
                </p>
              )}
            </div>
          </details>
        </div>
      </section>
    </div>
  );
}
