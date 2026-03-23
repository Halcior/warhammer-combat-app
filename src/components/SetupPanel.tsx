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
    </div>
  );
}