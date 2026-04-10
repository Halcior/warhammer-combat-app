import type { AttackConditions, Unit, Weapon } from "../types/combat";

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

        <div className="setup-fields-grid">
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
      </section>

      <section className="form-section">
        <div className="form-section__header">
          <h3>Battle state</h3>
          <p className="muted-text">
            Toggle only the conditions that meaningfully affect this attack.
          </p>
        </div>

        <div className="setup-conditions-grid">
          <label className="checkbox-row" title="The defender benefits from cover.">
        <input
          type="checkbox"
          checked={conditions.isTargetInCover}
          onChange={(e) =>
            setConditions((prev) => ({
              ...prev,
              isTargetInCover: e.target.checked,
            }))
          }
        />
        Target in cover
      </label>

      <label className="checkbox-row" title="The attacking unit remained stationary this turn.">
        <input
          type="checkbox"
          checked={conditions.remainedStationary}
          onChange={(e) =>
            setConditions((prev) => ({
              ...prev,
              remainedStationary: e.target.checked,
            }))
          }
        />
        Remained stationary
      </label>

      <label className="checkbox-row" title="The current attack happens during a charge turn.">
        <input
          type="checkbox"
          checked={conditions.isChargeTurn}
          onChange={(e) =>
            setConditions((prev) => ({
              ...prev,
              isChargeTurn: e.target.checked,
            }))
          }
        />
        Charge turn
      </label>

      <label className="checkbox-row" title="The target matches the attack's Anti keyword.">
        <input
          type="checkbox"
          checked={conditions.targetHasMatchingAntiKeyword}
          onChange={(e) =>
            setConditions((prev) => ({
              ...prev,
              targetHasMatchingAntiKeyword: e.target.checked,
            }))
          }
        />
        Anti keyword match
      </label>

      <label className="checkbox-row" title="The attacking unit is led by a Character or attached.">
        <input
          type="checkbox"
          checked={conditions.isAttachedUnit}
          onChange={(e) =>
            setConditions((prev) => ({
              ...prev,
              isAttachedUnit: e.target.checked,
            }))
          }
        />
        Led / attached unit
      </label>

      <label className="checkbox-row" title="The attacking unit disembarked from a transport this turn.">
        <input
          type="checkbox"
          checked={conditions.attackerDisembarkedThisTurn}
          onChange={(e) =>
            setConditions((prev) => ({
              ...prev,
              attackerDisembarkedThisTurn: e.target.checked,
            }))
          }
        />
        Disembarked this turn
      </label>

      <label className="checkbox-row" title="The attacking unit is making Overwatch attacks.">
        <input
          type="checkbox"
          checked={conditions.attackerIsFiringOverwatch}
          onChange={(e) =>
            setConditions((prev) => ({
              ...prev,
              attackerIsFiringOverwatch: e.target.checked,
            }))
          }
        />
        Firing Overwatch
      </label>

      <label className="checkbox-row" title="The attacking unit is Guided.">
        <input
          type="checkbox"
          checked={conditions.attackerIsGuided}
          onChange={(e) =>
            setConditions((prev) => ({
              ...prev,
              attackerIsGuided: e.target.checked,
            }))
          }
        />
        Attacker is Guided
      </label>

      <label className="checkbox-row" title="The attacking unit is currently a Vessel of Wrath.">
        <input
          type="checkbox"
          checked={conditions.attackerIsVesselOfWrath}
          onChange={(e) =>
            setConditions((prev) => ({
              ...prev,
              attackerIsVesselOfWrath: e.target.checked,
            }))
          }
        />
        Vessel of Wrath
      </label>

      <label className="checkbox-row" title="The attacking unit is within friendly Character support range.">
        <input
          type="checkbox"
          checked={conditions.attackerWithinFriendlyCharacterRange}
          onChange={(e) =>
            setConditions((prev) => ({
              ...prev,
              attackerWithinFriendlyCharacterRange: e.target.checked,
            }))
          }
        />
        Near friendly Character
      </label>

      <label className="checkbox-row" title="The attacking unit is within a friendly Monster or Titanic aura.">
        <input
          type="checkbox"
          checked={conditions.attackerWithinFriendlyMonsterAura}
          onChange={(e) =>
            setConditions((prev) => ({
              ...prev,
              attackerWithinFriendlyMonsterAura: e.target.checked,
            }))
          }
        />
        Near Monster/Titanic aura
      </label>

      <label className="checkbox-row" title="The attack targets a unit within objective range.">
        <input
          type="checkbox"
          checked={conditions.attackWithinObjectiveRange}
          onChange={(e) =>
            setConditions((prev) => ({
              ...prev,
              attackWithinObjectiveRange: e.target.checked,
            }))
          }
        />
        Attack on objective
      </label>

      <label className="checkbox-row" title="The attacker is inside the Power Matrix.">
        <input
          type="checkbox"
          checked={conditions.attackerWithinPowerMatrix}
          onChange={(e) =>
            setConditions((prev) => ({
              ...prev,
              attackerWithinPowerMatrix: e.target.checked,
            }))
          }
        />
        Attacker in Power Matrix
      </label>

      <label className="checkbox-row" title="The attacking unit was set up on the battlefield this turn.">
        <input
          type="checkbox"
          checked={conditions.attackerSetUpThisTurn}
          onChange={(e) =>
            setConditions((prev) => ({
              ...prev,
              attackerSetUpThisTurn: e.target.checked,
            }))
          }
        />
        Set up this turn
      </label>

      <label className="checkbox-row" title="The attacker is in a defensive set-to-defend state.">
        <input
          type="checkbox"
          checked={conditions.attackerSetToDefend}
          onChange={(e) =>
            setConditions((prev) => ({
              ...prev,
              attackerSetToDefend: e.target.checked,
            }))
          }
        />
        Attacker set to defend
      </label>

      <label className="checkbox-row" title="The target is inside half range for the active weapon.">
        <input
          type="checkbox"
          checked={conditions.isHalfRange}
          onChange={(e) =>
            setConditions((prev) => ({
              ...prev,
              isHalfRange: e.target.checked,
            }))
          }
        />
        Half range
      </label>

      <label className="checkbox-row" title="The defender is the closest eligible target.">
        <input
          type="checkbox"
          checked={conditions.targetIsClosestEligible}
          onChange={(e) =>
            setConditions((prev) => ({
              ...prev,
              targetIsClosestEligible: e.target.checked,
            }))
          }
        />
        Closest eligible target
      </label>

      <label className="checkbox-row" title="The defender is the spotted or markerlit target.">
        <input
          type="checkbox"
          checked={conditions.targetIsSpotted}
          onChange={(e) =>
            setConditions((prev) => ({
              ...prev,
              targetIsSpotted: e.target.checked,
            }))
          }
        />
        Spotted / markerlit
      </label>

      <label className="checkbox-row" title="The attacker is within support range of friendly Kroot or Vespid auxiliaries.">
        <input
          type="checkbox"
          checked={conditions.attackerWithinAuxiliarySupportRange}
          onChange={(e) =>
            setConditions((prev) => ({
              ...prev,
              attackerWithinAuxiliarySupportRange: e.target.checked,
            }))
          }
        />
        Attacker near Kroot/Vespid support
      </label>

      <label className="checkbox-row" title="A nearby Tau unit is screening the Kroot or Vespid defender.">
        <input
          type="checkbox"
          checked={conditions.defenderWithinAuxiliaryStealthRange}
          onChange={(e) =>
            setConditions((prev) => ({
              ...prev,
              defenderWithinAuxiliaryStealthRange: e.target.checked,
            }))
          }
        />
        Auxiliary stealth screen
      </label>

      <label className="checkbox-row" title="The target is within range of friendly Kroot or Vespid support.">
        <input
          type="checkbox"
          checked={conditions.targetWithinAuxiliarySupportRange}
          onChange={(e) =>
            setConditions((prev) => ({
              ...prev,
              targetWithinAuxiliarySupportRange: e.target.checked,
            }))
          }
        />
        Near Kroot/Vespid support
      </label>

      <label className="checkbox-row" title="The defender is on the opposite side of a hatchway.">
        <input
          type="checkbox"
          checked={conditions.targetOppositeHatchway}
          onChange={(e) =>
            setConditions((prev) => ({
              ...prev,
              targetOppositeHatchway: e.target.checked,
            }))
          }
        />
        Target opposite hatchway
      </label>

      <label className="checkbox-row" title="The target currently counts as unravelling.">
        <input
          type="checkbox"
          checked={conditions.targetIsUnravelling}
          onChange={(e) =>
            setConditions((prev) => ({
              ...prev,
              targetIsUnravelling: e.target.checked,
            }))
          }
        />
        Target is unravelling
      </label>

      <label className="checkbox-row" title="The defender is within range of an objective marker.">
        <input
          type="checkbox"
          checked={conditions.targetWithinObjectiveRange}
          onChange={(e) =>
            setConditions((prev) => ({
              ...prev,
              targetWithinObjectiveRange: e.target.checked,
            }))
          }
        />
        Target on objective
      </label>

      <label className="checkbox-row" title="The defender is Battle-shocked.">
        <input
          type="checkbox"
          checked={conditions.targetIsBattleShocked}
          onChange={(e) =>
            setConditions((prev) => ({
              ...prev,
              targetIsBattleShocked: e.target.checked,
            }))
          }
        />
        Target is Battle-shocked
      </label>

      <label className="checkbox-row" title="The defender has already lost at least one wound or model.">
        <input
          type="checkbox"
          checked={conditions.targetBelowStartingStrength}
          onChange={(e) =>
            setConditions((prev) => ({
              ...prev,
              targetBelowStartingStrength: e.target.checked,
            }))
          }
        />
        Target damaged
      </label>

      <label className="checkbox-row" title="The defender is below half of its starting strength.">
        <input
          type="checkbox"
          checked={conditions.targetBelowHalfStrength}
          onChange={(e) =>
            setConditions((prev) => ({
              ...prev,
              targetBelowHalfStrength: e.target.checked,
            }))
          }
        />
        Target below half
      </label>

      <label className="checkbox-row" title="The attacker has already lost at least one wound or model.">
        <input
          type="checkbox"
          checked={conditions.attackerBelowStartingStrength}
          onChange={(e) =>
            setConditions((prev) => ({
              ...prev,
              attackerBelowStartingStrength: e.target.checked,
            }))
          }
        />
        Attacker damaged
      </label>

      <label className="checkbox-row" title="The attacker is below half of its starting strength.">
        <input
          type="checkbox"
          checked={conditions.attackerBelowHalfStrength}
          onChange={(e) =>
            setConditions((prev) => ({
              ...prev,
              attackerBelowHalfStrength: e.target.checked,
            }))
          }
        />
        Attacker below half
      </label>

      <label className="checkbox-row" title="The attacking unit counts as isolated.">
        <input
          type="checkbox"
          checked={conditions.attackerIsIsolated}
          onChange={(e) =>
            setConditions((prev) => ({
              ...prev,
              attackerIsIsolated: e.target.checked,
            }))
          }
        />
        Attacker is isolated
      </label>
        </div>
      </section>
    </div>
  );
}
