import type { SpecialRule, Unit, Weapon } from "../types/combat";
import { formatSpecialRule } from "../lib/rules";

type ModifiersPanelProps = {
  attackerFaction: string;
  activeFactionModifiers: {
    martialKatahLethalHits: boolean;
    martialKatahSustainedHits: boolean;
  };
  setActiveFactionModifiers: React.Dispatch<
    React.SetStateAction<{
      martialKatahLethalHits: boolean;
      martialKatahSustainedHits: boolean;
    }>
  >;
  activeAttackModifiers: {
    devastatingWounds: boolean;
    lethalHits: boolean;
    ignoresCover: boolean;
  };
  setActiveAttackModifiers: React.Dispatch<
    React.SetStateAction<{
      devastatingWounds: boolean;
      lethalHits: boolean;
      ignoresCover: boolean;
    }>
  >;
  allActiveModifierRules: SpecialRule[];
  selectedWeapon: Weapon;
  attacker: Unit;
};

export function ModifiersPanel({
  attackerFaction,
  activeFactionModifiers,
  setActiveFactionModifiers,
  activeAttackModifiers,
  setActiveAttackModifiers,
  allActiveModifierRules,
  selectedWeapon,
  attacker,
}: ModifiersPanelProps) {
  return (
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
  );
}