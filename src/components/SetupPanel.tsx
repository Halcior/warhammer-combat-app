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
    <div className="card">
      <h2>Setup</h2>

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
        <select value={attackerId} onChange={(e) => handleAttackerChange(e.target.value)}>
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
          onChange={(e) => setAttackingModels(Math.max(1, Number(e.target.value) || 1))}
        />
      </label>

      <label>
        Weapon
        <select value={weaponId} onChange={(e) => handleWeaponChange(e.target.value)}>
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
        <select value={defenderId} onChange={(e) => handleDefenderChange(e.target.value)}>
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

      <label className="checkbox-row">
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

      <label className="checkbox-row">
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

      <label className="checkbox-row">
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

      <label className="checkbox-row">
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
        Target matches Anti keyword
      </label>

      <label className="checkbox-row">
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
        Unit is attached / led
      </label>

      <label className="checkbox-row">
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
        Attack in objective range
      </label>

      <label className="checkbox-row">
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

      <label className="checkbox-row">
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
        Attacker set up this turn
      </label>

      <label className="checkbox-row">
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

      <label className="checkbox-row">
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

      <label className="checkbox-row">
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
        Target is closest eligible
      </label>

      <label className="checkbox-row">
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

      <label className="checkbox-row">
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
        Target within objective range
      </label>

      <label className="checkbox-row">
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

      <label className="checkbox-row">
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
        Target below starting strength
      </label>

      <label className="checkbox-row">
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
        Target below half strength
      </label>

      <label className="checkbox-row">
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
        Attacker below starting strength
      </label>

      <label className="checkbox-row">
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
        Attacker below half strength
      </label>

      <label className="checkbox-row">
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
  );
}
