import { useMemo, useState } from "react";
import "./App.css";
import { units } from "./data/units";
import { calculateExpectedDamage, resolveAttack } from "./lib/combat";
import { formatSpecialRule } from "./lib/rules";

function App() {
  const factions = [...new Set(units.map((unit) => unit.faction))];

  const initialAttackerFaction = units[0].faction;
  const initialAttackerUnits = units.filter((unit) => unit.faction === initialAttackerFaction);
  const initialAttacker = initialAttackerUnits[0];

  const initialDefenderFaction = units[1]?.faction ?? units[0].faction;
  const initialDefenderUnits = units.filter((unit) => unit.faction === initialDefenderFaction);
  const initialDefender = initialDefenderUnits[0];

  const [attackerFaction, setAttackerFaction] = useState(initialAttackerFaction);
  const [defenderFaction, setDefenderFaction] = useState(initialDefenderFaction);

  const [attackerId, setAttackerId] = useState(initialAttacker.id);
  const [defenderId, setDefenderId] = useState(initialDefender.id);
  const [weaponId, setWeaponId] = useState(initialAttacker.weapons[0].id);

  const [attackingModels, setAttackingModels] = useState(1);
  const [defendingModels, setDefendingModels] = useState(10);
  const [conditions, setConditions] = useState({
  isTargetInCover: false,
  isHalfRange: false,
  remainedStationary: false,
  advancedThisTurn: false,
  targetVisible: true,
  targetInEngagementRange: false,
  targetModelCount: 10,
  targetHasMatchingAntiKeyword: false,
  isChargeTurn: false,
  isAttachedUnit: false,
});

  const [rolledHits, setRolledHits] = useState(0);
  const [rolledWounds, setRolledWounds] = useState(0);
  const [successfulSaves, setSuccessfulSaves] = useState(0);
  const [activeAttackModifiers, setActiveAttackModifiers] = useState({
  devastatingWounds: false,
  lethalHits: false,
  ignoresCover: false,
});

  const attackerUnits = useMemo(() => {
    return units.filter((unit) => unit.faction === attackerFaction);
  }, [attackerFaction]);

  const defenderUnits = useMemo(() => {
    return units.filter((unit) => unit.faction === defenderFaction);
  }, [defenderFaction]);

  const attacker =
    attackerUnits.find((unit) => unit.id === attackerId) ?? attackerUnits[0];

  const defender =
    defenderUnits.find((unit) => unit.id === defenderId) ?? defenderUnits[0];

  const selectedWeapon =
    attacker.weapons.find((weapon) => weapon.id === weaponId) ?? attacker.weapons[0];

  const [activeFactionModifiers, setActiveFactionModifiers] = useState({
  martialKatahLethalHits: false,
  martialKatahSustainedHits: false,
});


  const activeModifierRules = useMemo(() => {
  const rules = [];

  if (activeAttackModifiers.devastatingWounds) {
    rules.push({ type: "DEVASTATING_WOUNDS" as const });
  }

  if (activeAttackModifiers.lethalHits) {
    rules.push({ type: "LETHAL_HITS" as const });
  }

  if (activeAttackModifiers.ignoresCover) {
    rules.push({ type: "IGNORES_COVER" as const });
  }

  return rules;
}, [activeAttackModifiers]);

const activeFactionModifierRules = useMemo(() => {
  const rules = [];

  if (activeFactionModifiers.martialKatahLethalHits) {
    rules.push({ type: "LETHAL_HITS" as const });
  }

  if (activeFactionModifiers.martialKatahSustainedHits) {
    rules.push({ type: "SUSTAINED_HITS" as const, value: 1 });
  }

  return rules;
}, [activeFactionModifiers]);

const allActiveModifierRules = useMemo(() => {
  return [...activeModifierRules, ...activeFactionModifierRules];
}, [activeModifierRules, activeFactionModifierRules]);

const expectedResult = useMemo(() => {
  return calculateExpectedDamage({
    attacker,
    weapon: selectedWeapon,
    defender,
    attackingModels,
    defendingModels,
    conditions,
    activeModifierRules: allActiveModifierRules,
  });
}, [
  attacker,
  selectedWeapon,
  defender,
  attackingModels,
  defendingModels,
  conditions,
  allActiveModifierRules,
]);

  const resolvedResult = useMemo(() => {
    return resolveAttack({
      weapon: selectedWeapon,
      defender,
      defendingModels,
      rolledHits,
      rolledWounds,
      successfulSaves,
    });
  }, [
    selectedWeapon,
    defender,
    defendingModels,
    rolledHits,
    rolledWounds,
    successfulSaves,
  ]);

  function resetResolveAttack() {
    setRolledHits(0);
    setRolledWounds(0);
    setSuccessfulSaves(0);
  }

  function handleAttackerFactionChange(newFaction: string) {
    const newAttackerUnits = units.filter((unit) => unit.faction === newFaction);
    const newAttacker = newAttackerUnits[0];

    setAttackerFaction(newFaction);

    if (newAttacker) {
      setAttackerId(newAttacker.id);
      setWeaponId(newAttacker.weapons[0].id);
    }

    resetResolveAttack();
  }

  function handleAttackerChange(newAttackerId: string) {
    const newAttacker = attackerUnits.find((unit) => unit.id === newAttackerId);

    setAttackerId(newAttackerId);

    if (newAttacker) {
      setWeaponId(newAttacker.weapons[0].id);
    }

    resetResolveAttack();
  }

  function handleWeaponChange(newWeaponId: string) {
    setWeaponId(newWeaponId);
    resetResolveAttack();
  }

  function handleDefenderFactionChange(newFaction: string) {
    const newDefenderUnits = units.filter((unit) => unit.faction === newFaction);
    const newDefender = newDefenderUnits[0];

    setDefenderFaction(newFaction);

    if (newDefender) {
      setDefenderId(newDefender.id);
    }

    resetResolveAttack();
  }

  function handleDefenderChange(newDefenderId: string) {
    setDefenderId(newDefenderId);
    resetResolveAttack();
  }

  return (
  <div className="app">
    <h1>Warhammer Helper</h1>

    <div className="top-grid">
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
            {attacker.weapons.map((weapon) => (
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

      <div className="card">
        <h2>Modifiers & Rules</h2>

        {attackerFaction === "Adeptus Custodes" && (
          <div className="rules-section">
            <h3>Faction modifiers</h3>

            <label className="checkbox-row">
              <input
                type="checkbox"
                checked={activeFactionModifiers.martialKatahLethalHits}
                onChange={(e) =>
                  setActiveFactionModifiers((prev) => ({
                    ...prev,
                    martialKatahLethalHits: e.target.checked,
                  }))
                }
              />
              Martial Ka’tah: Lethal Hits
            </label>

            <label className="checkbox-row">
              <input
                type="checkbox"
                checked={activeFactionModifiers.martialKatahSustainedHits}
                onChange={(e) =>
                  setActiveFactionModifiers((prev) => ({
                    ...prev,
                    martialKatahSustainedHits: e.target.checked,
                  }))
                }
              />
              Martial Ka’tah: Sustained Hits 1
            </label>
          </div>
        )}

        <div className="rules-section">
          <h3>Active attack modifiers</h3>

          <label className="checkbox-row">
            <input
              type="checkbox"
              checked={activeAttackModifiers.devastatingWounds}
              onChange={(e) =>
                setActiveAttackModifiers((prev) => ({
                  ...prev,
                  devastatingWounds: e.target.checked,
                }))
              }
            />
            Devastating Wounds
          </label>

          <label className="checkbox-row">
            <input
              type="checkbox"
              checked={activeAttackModifiers.lethalHits}
              onChange={(e) =>
                setActiveAttackModifiers((prev) => ({
                  ...prev,
                  lethalHits: e.target.checked,
                }))
              }
            />
            Lethal Hits
          </label>

          <label className="checkbox-row">
            <input
              type="checkbox"
              checked={activeAttackModifiers.ignoresCover}
              onChange={(e) =>
                setActiveAttackModifiers((prev) => ({
                  ...prev,
                  ignoresCover: e.target.checked,
                }))
              }
            />
            Ignores Cover
          </label>
        </div>

        <div className="rules-section">
          <h3>Temporary modifiers</h3>
          {allActiveModifierRules.length > 0 ? (
            <div className="rules-list">
              {allActiveModifierRules.map((rule, index) => (
                <span key={`temp-rule-${index}`} className="rule-tag">
                  {formatSpecialRule(rule)}
                </span>
              ))}
            </div>
          ) : (
            <p className="muted-text">No temporary modifiers</p>
          )}
        </div>

        <div className="rules-section">
          <h3>Weapon rules</h3>
          {selectedWeapon.specialRules && selectedWeapon.specialRules.length > 0 ? (
            <div className="rules-list">
              {selectedWeapon.specialRules.map((rule, index) => (
                <span key={`${selectedWeapon.id}-rule-${index}`} className="rule-tag">
                  {formatSpecialRule(rule)}
                </span>
              ))}
            </div>
          ) : (
            <p className="muted-text">No weapon rules</p>
          )}

          <h3>Unit rules</h3>
          {attacker.specialRules && attacker.specialRules.length > 0 ? (
            <div className="rules-list">
              {attacker.specialRules.map((rule, index) => (
                <span key={`${attacker.id}-rule-${index}`} className="rule-tag">
                  {formatSpecialRule(rule)}
                </span>
              ))}
            </div>
          ) : (
            <p className="muted-text">No unit rules</p>
          )}
        </div>
      </div>

      <div className="card">
        <h2>Resolve Attack</h2>

        <div className="resolver-inputs">
          <label>
            Rolled hits
            <input
              type="number"
              min={0}
              max={expectedResult.totalAttacks}
              value={rolledHits}
              onChange={(e) => setRolledHits(Math.max(0, Number(e.target.value) || 0))}
            />
          </label>

          <label>
            Rolled wounds
            <input
              type="number"
              min={0}
              max={rolledHits}
              value={rolledWounds}
              onChange={(e) => setRolledWounds(Math.max(0, Number(e.target.value) || 0))}
            />
          </label>

          <label>
            Successful saves
            <input
              type="number"
              min={0}
              max={rolledWounds}
              value={successfulSaves}
              onChange={(e) => setSuccessfulSaves(Math.max(0, Number(e.target.value) || 0))}
            />
          </label>
        </div>

        <div className="stats-grid">
          <div className="stat-box">
            <span className="stat-label">Unsaved wounds</span>
            <span className="stat-value">{resolvedResult.unsavedWounds}</span>
          </div>

          <div className="stat-box stat-box--highlight">
            <span className="stat-label">Resolved damage</span>
            <span className="stat-value">{resolvedResult.resolvedDamage}</span>
          </div>

          <div className="stat-box stat-box--highlight">
            <span className="stat-label">Resolved slain models</span>
            <span className="stat-value">
              {resolvedResult.resolvedSlainModels.toFixed(2)}
            </span>
          </div>
        </div>
      </div>
    </div>

    <div className="card">
      <h2>Expected Result</h2>

      <div className="stats-grid">
        <div className="stat-box">
          <span className="stat-label">Total attacks</span>
          <span className="stat-value">{expectedResult.totalAttacks}</span>
        </div>

        <div className="stat-box">
          <span className="stat-label">Hit on</span>
          <span className="stat-value">
            {expectedResult.hitTarget === null ? "Auto" : `${expectedResult.hitTarget}+`}
          </span>
        </div>

        <div className="stat-box">
          <span className="stat-label">Wound on</span>
          <span className="stat-value">{expectedResult.woundTarget}+</span>
        </div>

        <div className="stat-box">
          <span className="stat-label">Save on</span>
          <span className="stat-value">{expectedResult.saveTarget}+</span>
        </div>

        <div className="stat-box">
          <span className="stat-label">Expected hits</span>
          <span className="stat-value">{expectedResult.expectedHits.toFixed(2)}</span>
        </div>

        <div className="stat-box">
          <span className="stat-label">Expected wounds</span>
          <span className="stat-value">{expectedResult.expectedWounds.toFixed(2)}</span>
        </div>

        <div className="stat-box">
          <span className="stat-label">Expected unsaved wounds</span>
          <span className="stat-value">{expectedResult.expectedUnsavedWounds.toFixed(2)}</span>
        </div>

        <div className="stat-box stat-box--highlight">
          <span className="stat-label">Expected damage</span>
          <span className="stat-value">{expectedResult.expectedDamage.toFixed(2)}</span>
        </div>

        <div className="stat-box stat-box--highlight">
          <span className="stat-label">Expected slain models</span>
          <span className="stat-value">{expectedResult.expectedSlainModels.toFixed(2)}</span>
        </div>

        <div className="stat-box">
          <span className="stat-label">Blast bonus</span>
          <span className="stat-value">{expectedResult.blastBonus ?? 0}</span>
        </div>

        <div className="stat-box">
          <span className="stat-label">Critical hits</span>
          <span className="stat-value">
            {expectedResult.criticalHits?.toFixed(2) ?? "0.00"}
          </span>
        </div>

        <div className="stat-box">
          <span className="stat-label">Extra hits</span>
          <span className="stat-value">
            {expectedResult.extraHitsFromSustained?.toFixed(2) ?? "0.00"}
          </span>
        </div>

        <div className="stat-box">
          <span className="stat-label">Auto wounds</span>
          <span className="stat-value">
            {expectedResult.autoWoundsFromLethalHits?.toFixed(2) ?? "0.00"}
          </span>
        </div>

        <div className="stat-box">
          <span className="stat-label">Critical wounds</span>
          <span className="stat-value">
            {expectedResult.criticalWoundsFromRolls?.toFixed(2) ?? "0.00"}
          </span>
        </div>

        <div className="stat-box stat-box--highlight">
          <span className="stat-label">Mortal wounds</span>
          <span className="stat-value">
            {expectedResult.mortalWoundsFromDevastating?.toFixed(2) ?? "0.00"}
          </span>
        </div>
      </div>
    </div>
  </div>
);
}

export default App;