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
  activeEnhancementIds: string[];
  toggleEnhancement: (id: string) => void;
  activeStratagemIds: string[];
  toggleStratagem: (id: string) => void;
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
  activeEnhancementIds = [],
  toggleEnhancement,
  activeStratagemIds = [],
  toggleStratagem,
}: ModifiersPanelProps) {
  const selectedDetachmentDescription = selectedDetachment?.description
    ? formatDescription(selectedDetachment.description)
    : "";

  return (
    <div className="card card--modifiers">
      <div className="panel-heading">
        <p className="panel-eyebrow">Rules Engine</p>
        <h2>Modifiers & Rules</h2>
        <p className="muted-text">
          Keep the active effects visible without turning the sidebar into a wall
          of text.
        </p>
      </div>

      {availableDetachments.length > 0 && (
        <CollapsibleSection title="Detachment">
          <div className="rules-section__content">
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

            {selectedDetachment && (
              <div className="detachment-summary">
                <HoverInfo
                  label={
                    <span className="detachment-summary__name">
                      {selectedDetachment.name}
                    </span>
                  }
                  tooltip={buildDetachmentTooltip(selectedDetachment)}
                />
                {selectedDetachmentDescription && (
                  <p className="muted-text">{selectedDetachmentDescription}</p>
                )}
              </div>
            )}
          </div>
        </CollapsibleSection>
      )}

      {availableRuleOptions.length > 0 && (
        <CollapsibleSection title="Faction & Detachment Rules">
          <div className="rules-section__content">
            <div className="option-list">
              {availableRuleOptions.map((rule) => (
                <label key={rule.id} className="checkbox-row">
                <input
                  type="checkbox"
                  checked={activeRuleOptionIds.includes(rule.id)}
                  onChange={() => toggleRuleOption(rule.id)}
                />
                <HoverInfo
                  label={
                    <OptionCardLabel
                      title={formatUiName(rule.name)}
                      meta={rule.supportLevel}
                    />
                  }
                  tooltip={buildRuleOptionTooltip(rule)}
                />
              </label>
              ))}
            </div>
          </div>
        </CollapsibleSection>
      )}

      {enhancements.length > 0 && (
        <CollapsibleSection title="Enhancements" defaultOpen={false}>
          <div className="rules-section__content">
            <div className="option-list">
              {enhancements.map((enhancement) => (
                <label key={enhancement.id} className="checkbox-row">
                  <input
                  type="checkbox"
                  checked={activeEnhancementIds.includes(enhancement.id)}
                  onChange={() => toggleEnhancement(enhancement.id)}
                />
                <HoverInfo
                  label={
                    <OptionCardLabel
                      title={formatUiName(enhancement.name)}
                      meta={enhancement.supportLevel}
                    />
                  }
                  tooltip={buildEnhancementTooltip(enhancement)}
                />
              </label>
              ))}
            </div>
          </div>
        </CollapsibleSection>
      )}

      {stratagems.length > 0 && (
        <CollapsibleSection title="Stratagems" defaultOpen={false}>
          <div className="rules-section__content">
            <div className="option-list">
              {stratagems.map((stratagem) => (
                <label key={stratagem.id} className="checkbox-row">
                  <input
                  type="checkbox"
                  checked={activeStratagemIds.includes(stratagem.id)}
                  onChange={() => toggleStratagem(stratagem.id)}
                />
                <HoverInfo
                  label={
                    <OptionCardLabel
                      title={formatUiName(stratagem.name)}
                      meta={formatOptionMeta([
                        `${stratagem.cpCost}CP`,
                        stratagem.supportLevel,
                      ])}
                    />
                  }
                  tooltip={buildStratagemTooltip(stratagem)}
                />
              </label>
              ))}
            </div>
          </div>
        </CollapsibleSection>
      )}

      <CollapsibleSection title="Manual attack modifiers" defaultOpen={false}>
        <div className="rules-section__content">
          <div className="option-list option-list--compact">
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
              <OptionCardLabel title="Devastating Wounds" />
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
              <OptionCardLabel title="Lethal Hits" />
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
              <OptionCardLabel title="Ignores Cover" />
            </label>
          </div>
        </div>
      </CollapsibleSection>

      <CollapsibleSection title="Active modifiers">
        <div className="rules-section__content">
          {allActiveModifierRules.length > 0 ? (
            <div className="rules-list">
              {allActiveModifierRules.map((rule, index) => (
                <span key={`temp-rule-${index}`} className="rule-tag">
                  <HoverInfo
                    label={<span>{formatSpecialRule(rule)}</span>}
                    tooltip={buildActiveRuleTooltip(rule)}
                  />
                </span>
              ))}
            </div>
          ) : (
            <p className="muted-text">No active modifiers</p>
          )}
        </div>
      </CollapsibleSection>

      <CollapsibleSection title="Weapon & Unit Rules">
        <div className="rules-section__content">
          <h3>Weapon rules</h3>
          {selectedWeapon.specialRules && selectedWeapon.specialRules.length > 0 ? (
            <div className="rules-list">
              {selectedWeapon.specialRules.map((rule, index) => (
                <span
                  key={`${selectedWeapon.id}-rule-${index}`}
                  className="rule-tag"
                >
                  <HoverInfo
                    label={<span>{formatSpecialRule(rule)}</span>}
                    tooltip={buildActiveRuleTooltip(rule)}
                  />
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
                  <HoverInfo
                    label={<span>{formatSpecialRule(rule)}</span>}
                    tooltip={buildActiveRuleTooltip(rule)}
                  />
                </span>
              ))}
            </div>
          ) : (
            <p className="muted-text">No unit rules</p>
          )}
        </div>
      </CollapsibleSection>
    </div>
  );
}

type CollapsibleSectionProps = {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
};

function CollapsibleSection({
  title,
  defaultOpen = true,
  children,
}: CollapsibleSectionProps) {
  return (
    <details className="rules-section rules-section--collapsible" open={defaultOpen}>
      <summary className="rules-section__summary">
        <span>{title}</span>
        <span className="rules-section__chevron" aria-hidden="true">
          +
        </span>
      </summary>
      {children}
    </details>
  );
}

type OptionCardLabelProps = {
  title: string;
  meta?: string;
};

function OptionCardLabel({ title, meta }: OptionCardLabelProps) {
  return (
    <span className="option-card">
      <span className="option-card__title">{title}</span>
      {meta && <span className="option-card__meta">{meta}</span>}
    </span>
  );
}

type HoverInfoProps = {
  label: React.ReactNode;
  tooltip: string;
};

function HoverInfo({ label, tooltip }: HoverInfoProps) {
  if (!tooltip) {
    return <span>{label}</span>;
  }

  return (
    <span className="hover-info" tabIndex={0}>
      <span className="hover-info__label">{label}</span>
      <span className="hover-info__tooltip" role="tooltip">
        {tooltip}
      </span>
    </span>
  );
}

function buildDetachmentTooltip(detachment: DetachmentConfig): string {
  const lines = [
    detachment.name,
    formatDescription(detachment.description),
    formatList("Rules", detachment.ruleOptions.map((rule) => rule.name)),
    formatList("Enhancements", (detachment.enhancements ?? []).map((item) => item.name)),
    formatList("Stratagems", detachment.stratagems.map((item) => item.name)),
  ];

  return lines.filter(Boolean).join("\n\n");
}

function buildRuleOptionTooltip(rule: RuleOption): string {
  const lines = [
    rule.name,
    rule.supportLevel ? `Support: ${rule.supportLevel}` : "",
    formatDescription(rule.description),
    formatList("Effects", rule.modifiers.map((modifier) => formatSpecialRule(modifier))),
  ];

  return lines.filter(Boolean).join("\n\n");
}

function buildEnhancementTooltip(enhancement: EnhancementConfig): string {
  const effectDescriptions = enhancement.effects
    .map((effect) => formatDescription(effect.description))
    .filter(Boolean);

  const lines = [
    enhancement.name,
    enhancement.supportLevel ? `Support: ${enhancement.supportLevel}` : "",
    formatDescription(enhancement.description),
    formatList("Implemented effects", effectDescriptions),
  ];

  return lines.filter(Boolean).join("\n\n");
}

function buildStratagemTooltip(stratagem: StratagemConfig): string {
  const effectDescriptions = stratagem.effects
    .map((effect) => formatDescription(effect.description))
    .filter(Boolean);

  const lines = [
    stratagem.name,
    `Phase: ${stratagem.phase}`,
    `Cost: ${stratagem.cpCost}CP`,
    stratagem.supportLevel ? `Support: ${stratagem.supportLevel}` : "",
    formatDescription(stratagem.description),
    formatList("Implemented effects", effectDescriptions),
  ];

  return lines.filter(Boolean).join("\n\n");
}

function buildActiveRuleTooltip(rule: SpecialRule): string {
  return formatSpecialRule(rule);
}

function formatList(title: string, items: string[]): string {
  const nonEmptyItems = items.filter(Boolean);

  if (nonEmptyItems.length === 0) {
    return "";
  }

  return `${title}:\n${nonEmptyItems.map((item) => `- ${item}`).join("\n")}`;
}

function formatOptionMeta(parts: Array<string | undefined>): string {
  return parts.filter(Boolean).join(" • ");
}

function formatUiName(name: string): string {
  if (/[a-z]/.test(name)) {
    return name;
  }

  return name
    .toLowerCase()
    .replace(/\b([a-z])/g, (match) => match.toUpperCase());
}

function formatDescription(description?: string): string {
  if (!description) {
    return "";
  }

  return description
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/li>/gi, "\n")
    .replace(/<li>/gi, "- ")
    .replace(/<\/(ul|ol|p|div)>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]+\n/g, "\n")
    .trim();
}
