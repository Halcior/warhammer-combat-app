import { useMemo, useState } from "react";

import type { AttackConditions, Unit, Weapon } from "../types/combat";
import {
  type BattleStateToggle,
  type BattleStateToggleKey,
  battleStateToggles,
  isBattleStateToggleRelevant,
} from "../lib/battleStateToggles";

// Re-export types so existing consumers keep working without import path changes.
export type { BattleStateToggle, BattleStateToggleKey };

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
    return isBattleStateToggleRelevant({
      toggle,
      conditions,
      relevantFactions,
      attackType: isRangedAttack ? "ranged" : "melee",
    });
  };

  const coreToggles = battleStateToggles.filter((toggle) => toggle.group === "core");
  const advancedToggles = battleStateToggles.filter((toggle) => toggle.group === "advanced");
  const visibleCoreToggles = showAllBattleState
    ? coreToggles
    : coreToggles.filter(isRelevantToggle);
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
                : `Showing ${visibleCoreToggles.length + visibleAdvancedToggles.length} relevant toggles for this matchup`}
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
              <span>{showAllBattleState ? coreToggles.length : visibleCoreToggles.length}</span>
            </div>
            <div className="setup-conditions-grid">
              {visibleCoreToggles.map(({ key, label, title }) => (
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
