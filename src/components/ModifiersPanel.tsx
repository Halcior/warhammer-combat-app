import { formatSpecialRule } from "../lib/rules";
import type { SpecialRule, Unit, Weapon } from "../types/combat";
import type {
  RuleOption,
  StratagemConfig,
  DetachmentConfig,
  EnhancementConfig,
} from "../types/faction";

type ModifiersPanelProps = {
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

  availableDetachments: DetachmentConfig[];
  selectedDetachmentId: string;
  setSelectedDetachmentId: React.Dispatch<React.SetStateAction<string>>;
  selectedDetachment?: DetachmentConfig;
  availableRuleOptions: RuleOption[];
  activeRuleOptionIds: string[];
  toggleRuleOption: (ruleId: string) => void;
  stratagems: StratagemConfig[];
  enhancements: EnhancementConfig[];
};

export function ModifiersPanel({
  activeAttackModifiers,
  setActiveAttackModifiers,
  allActiveModifierRules,
  selectedWeapon,
  attacker,
  availableDetachments,
  selectedDetachmentId,
  setSelectedDetachmentId,
  selectedDetachment,
  availableRuleOptions,
  activeRuleOptionIds,
  toggleRuleOption,
  stratagems,
  enhancements,
}: ModifiersPanelProps) {
  return (
    <div className="card">
      <h2>Modifiers & Rules</h2>

      {availableDetachments.length > 0 && (
        <div className="rules-section">
          <h3>Detachment</h3>

          <label>
            Active detachment
            <select
              value={selectedDetachmentId || selectedDetachment?.id || ""}
              onChange={(e) => setSelectedDetachmentId(e.target.value)}
            >
              {availableDetachments.map((detachment) => (
                <option key={detachment.id} value={detachment.id}>
                  {detachment.name}
                </option>
              ))}
            </select>
          </label>

          {selectedDetachment?.description && (
            <p className="muted-text">{selectedDetachment.description}</p>
          )}
        </div>
      )}

      {availableRuleOptions.length > 0 && (
        <div className="rules-section">
          <h3>Faction & Detachment Rules</h3>

          {availableRuleOptions.map((rule) => (
            <label key={rule.id} className="checkbox-row">
              <input
                type="checkbox"
                checked={activeRuleOptionIds.includes(rule.id)}
                onChange={() => toggleRuleOption(rule.id)}
              />
              <span>
                {rule.name}
                {rule.supportLevel && (
                  <span className="muted-text"> ({rule.supportLevel})</span>
                )}
              </span>
            </label>
          ))}
        </div>
      )}

      {enhancements.length > 0 && (
        <div className="rules-section">
          <h3>Enhancements</h3>
          <div className="rules-list">
            {enhancements.map((enhancement) => (
              <span key={enhancement.id} className="rule-tag">
                {enhancement.name}
                {enhancement.supportLevel && ` - ${enhancement.supportLevel}`}
              </span>
            ))}
          </div>
        </div>
      )}

      {stratagems.length > 0 && (
        <div className="rules-section">
          <h3>Available Stratagems</h3>
          <div className="rules-list">
            {stratagems.map((stratagem) => (
              <span key={stratagem.id} className="rule-tag">
                {stratagem.name} ({stratagem.cpCost}CP)
                {stratagem.supportLevel && ` - ${stratagem.supportLevel}`}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="rules-section">
        <h3>Manual attack modifiers</h3>

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
        <h3>Active modifiers</h3>
        {allActiveModifierRules.length > 0 ? (
          <div className="rules-list">
            {allActiveModifierRules.map((rule, index) => (
              <span key={`temp-rule-${index}`} className="rule-tag">
                {formatSpecialRule(rule)}
              </span>
            ))}
          </div>
        ) : (
          <p className="muted-text">No active modifiers</p>
        )}
      </div>

      <div className="rules-section">
        <h3>Weapon rules</h3>
        {selectedWeapon.specialRules && selectedWeapon.specialRules.length > 0 ? (
          <div className="rules-list">
            {selectedWeapon.specialRules.map((rule, index) => (
              <span
                key={`${selectedWeapon.id}-rule-${index}`}
                className="rule-tag"
              >
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