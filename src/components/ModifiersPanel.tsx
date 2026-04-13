import { formatSpecialRule } from "../lib/rules";
import type { SpecialRule, Unit, UnitAbility, Weapon } from "../types/combat";
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
  attackerActiveModifierRules: SpecialRule[];
  defenderActiveModifierRules: SpecialRule[];
  selectedWeapon: Weapon;
  attacker: Unit;
  defender: Unit;
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
  attackerUnitAbilityOptions: RuleOption[];
  activeAttackerUnitAbilityIds: string[];
  toggleAttackerUnitAbility: (id: string) => void;
  defenderUnitAbilityOptions: RuleOption[];
  activeDefenderUnitAbilityIds: string[];
  toggleDefenderUnitAbility: (id: string) => void;
};

type DisplayRuleKind = "active" | "auto" | "info";
type DisplayRuleSide = "attacker" | "defender";
type DisplayRuleGroup = "offense" | "defense" | "general";

type DisplayRule = {
  id: string;
  label: string;
  tooltip: string;
  source?: string;
  kind: DisplayRuleKind;
  side: DisplayRuleSide;
  group: DisplayRuleGroup;
  checked?: boolean;
  onToggle?: () => void;
};

type RuleBucket = {
  id: string;
  title: string;
  rules: DisplayRule[];
};

type CombatRolePanelModel = {
  activeRules: DisplayRule[];
  derivedRows: DisplayRule[];
  derivedBuckets: RuleBucket[];
  passiveInfoRules: DisplayRule[];
};

type ModifiersPanelModel = {
  attacker: CombatRolePanelModel;
  defender: CombatRolePanelModel;
};

export function ModifiersPanel(props: ModifiersPanelProps) {
  const {
    availableDetachments,
    selectedDetachment,
    selectedDetachmentId,
    setSelectedDetachmentId,
    attacker,
    defender,
  } = props;
  const selectedDetachmentDescription = selectedDetachment?.description
    ? formatDescription(selectedDetachment.description)
    : "";
  const model = buildModifiersPanelModel(props);

  return (
    <div className="card card--modifiers">
      <div className="panel-heading">
        <p className="panel-eyebrow">Rules Engine</p>
        <h2>Modifiers & Rules</h2>
        <p className="muted-text">
          See what affects the attacking unit, what protects the defender, and
          what stays informational for this matchup.
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

      <div className="combat-role-layout">
        <CombatRoleSection
          role="Attacker"
          unitName={attacker.name}
          summary="Affects the attacking unit, its weapon profile, and the final output of the attack."
          panel={model.attacker}
        />
        <CombatRoleSection
          role="Defender"
          unitName={defender.name}
          summary="Affects the defending unit, its saves, durability, and targeting protection."
          panel={model.defender}
        />
      </div>
    </div>
  );
}

export function buildModifiersPanelModel(
  props: ModifiersPanelProps
): ModifiersPanelModel {
  const visibleAttackerAbilities = (props.attacker.abilities ?? []).filter(
    isDisplayableAbility
  );
  const visibleDefenderAbilities = (props.defender.abilities ?? []).filter(
    isDisplayableAbility
  );
  const attackerCoreRules = getCoreUnitRules(props.attacker);
  const defenderCoreRules = getCoreUnitRules(props.defender);

  const activeRules = dedupeDisplayRules([
    ...props.availableRuleOptions.map((rule) =>
      createToggleRule({
        id: `rule-option-${rule.id}`,
        label: formatUiName(rule.name),
        tooltip: buildRuleOptionTooltip(rule),
        source: "Faction / Detachment",
        side: inferRuleOptionSide(rule),
        checked: props.activeRuleOptionIds.includes(rule.id),
        onToggle: () => props.toggleRuleOption(rule.id),
        group: inferRuleOptionGroup(rule),
      })
    ),
    ...props.enhancements.map((enhancement) =>
      createToggleRule({
        id: `enhancement-${enhancement.id}`,
        label: formatUiName(enhancement.name),
        tooltip: buildEnhancementTooltip(enhancement),
        source: "Enhancement",
        side: inferRuleCollectionSide(enhancement.effects),
        checked: props.activeEnhancementIds.includes(enhancement.id),
        onToggle: () => props.toggleEnhancement(enhancement.id),
        group: inferRuleCollectionGroup(enhancement.effects),
      })
    ),
    ...props.stratagems.map((stratagem) =>
      createToggleRule({
        id: `stratagem-${stratagem.id}`,
        label: formatUiName(stratagem.name),
        tooltip: buildStratagemTooltip(stratagem),
        source: "Stratagem",
        side: inferRuleCollectionSide(stratagem.effects),
        checked: props.activeStratagemIds.includes(stratagem.id),
        onToggle: () => props.toggleStratagem(stratagem.id),
        group: inferRuleCollectionGroup(stratagem.effects),
      })
    ),
    ...buildManualModifierRules(props),
    ...visibleAttackerAbilities
      .map((ability) => {
        const toggledOption = props.attackerUnitAbilityOptions.find(
          (option) => option.id === `attacker-ability-${ability.id}`
        );

        if (!toggledOption) {
          return null;
        }

        return createToggleRule({
          id: `attacker-ability-${ability.id}`,
          label: formatUiName(ability.name),
          tooltip: buildUnitAbilityTooltip(ability),
          source: "Attacker ability",
          side: "attacker",
          checked: props.activeAttackerUnitAbilityIds.includes(toggledOption.id),
          onToggle: () => props.toggleAttackerUnitAbility(toggledOption.id),
          group: inferAbilityGroup(ability, "attacker"),
        });
      })
      .filter(Boolean) as DisplayRule[],
    ...visibleDefenderAbilities
      .map((ability) => {
        const toggledOption = props.defenderUnitAbilityOptions.find(
          (option) => option.id === `defender-ability-${ability.id}`
        );

        if (!toggledOption) {
          return null;
        }

        return createToggleRule({
          id: `defender-ability-${ability.id}`,
          label: formatUiName(ability.name),
          tooltip: buildUnitAbilityTooltip(ability),
          source: "Defender ability",
          side: "defender",
          checked: props.activeDefenderUnitAbilityIds.includes(toggledOption.id),
          onToggle: () => props.toggleDefenderUnitAbility(toggledOption.id),
          group: inferAbilityGroup(ability, "defender"),
        });
      })
      .filter(Boolean) as DisplayRule[],
  ]);

  const derivedRows = dedupeDisplayRules([
    ...props.attackerActiveModifierRules.map((rule, index) =>
      createAutoRule({
        id: `attacker-active-${index}-${JSON.stringify(rule)}`,
        label: formatSpecialRule(rule),
        tooltip: buildActiveRuleTooltip(rule),
        source: "Attacker",
        side: "attacker",
        group: classifyRuleGroup(rule),
      })
    ),
    ...props.defenderActiveModifierRules.map((rule, index) =>
      createAutoRule({
        id: `defender-active-${index}-${JSON.stringify(rule)}`,
        label: formatSpecialRule(rule),
        tooltip: buildActiveRuleTooltip(rule),
        source: "Defender",
        side: "defender",
        group: classifyRuleGroup(rule),
      })
    ),
  ]);

  const derivedRules = dedupeDisplayRules([
    ...(props.selectedWeapon.specialRules ?? []).map((rule, index) =>
      createAutoRule({
        id: `weapon-rule-${props.selectedWeapon.id}-${index}`,
        label: formatSpecialRule(rule),
        tooltip: buildActiveRuleTooltip(rule),
        source: "Weapon",
        side: "attacker",
        group: classifyRuleGroup(rule),
      })
    ),
    ...attackerCoreRules.map((rule, index) =>
      createAutoRule({
        id: `attacker-core-${props.attacker.id}-${index}`,
        label: formatSpecialRule(rule),
        tooltip: buildCoreRuleTooltip(rule),
        source: "Attacker",
        side: "attacker",
        group: classifyRuleGroup(rule),
      })
    ),
    ...(props.attacker.specialRules ?? []).map((rule, index) =>
      createAutoRule({
        id: `attacker-rule-${props.attacker.id}-${index}`,
        label: formatSpecialRule(rule),
        tooltip: buildActiveRuleTooltip(rule),
        source: "Attacker",
        side: "attacker",
        group: classifyRuleGroup(rule),
      })
    ),
    ...defenderCoreRules.map((rule, index) =>
      createAutoRule({
        id: `defender-core-${props.defender.id}-${index}`,
        label: formatSpecialRule(rule),
        tooltip: buildCoreRuleTooltip(rule),
        source: "Defender",
        side: "defender",
        group: classifyRuleGroup(rule),
      })
    ),
    ...(props.defender.specialRules ?? []).map((rule, index) =>
      createAutoRule({
        id: `defender-rule-${props.defender.id}-${index}`,
        label: formatSpecialRule(rule),
        tooltip: buildActiveRuleTooltip(rule),
        source: "Defender",
        side: "defender",
        group: classifyRuleGroup(rule),
      })
    ),
  ]);

  const passiveInfoRules = dedupeDisplayRules([
    ...visibleAttackerAbilities
      .filter(
        (ability) =>
          !props.attackerUnitAbilityOptions.some(
            (option) => option.id === `attacker-ability-${ability.id}`
          )
      )
      .map((ability) =>
        createInfoRule({
          id: `attacker-info-${ability.id}`,
          label: formatUiName(ability.name),
          tooltip: buildUnitAbilityTooltip(ability),
          source: "Attacker ability",
          side: "attacker",
        })
      ),
    ...visibleDefenderAbilities
      .filter(
        (ability) =>
          !props.defenderUnitAbilityOptions.some(
            (option) => option.id === `defender-ability-${ability.id}`
          )
      )
      .map((ability) =>
        createInfoRule({
          id: `defender-info-${ability.id}`,
          label: formatUiName(ability.name),
          tooltip: buildUnitAbilityTooltip(ability),
          source: "Defender ability",
          side: "defender",
        })
      ),
  ]);

  return {
    attacker: {
      activeRules: activeRules.filter((rule) => rule.side === "attacker"),
      derivedRows: derivedRows.filter((rule) => rule.side === "attacker"),
      derivedBuckets: buildDerivedBuckets(
        derivedRules.filter((rule) => rule.side === "attacker")
      ),
      passiveInfoRules: passiveInfoRules.filter(
        (rule) => rule.side === "attacker"
      ),
    },
    defender: {
      activeRules: activeRules.filter((rule) => rule.side === "defender"),
      derivedRows: derivedRows.filter((rule) => rule.side === "defender"),
      derivedBuckets: buildDerivedBuckets(
        derivedRules.filter((rule) => rule.side === "defender")
      ),
      passiveInfoRules: passiveInfoRules.filter(
        (rule) => rule.side === "defender"
      ),
    },
  };
}

export function classifyRuleGroup(rule: SpecialRule): DisplayRuleGroup {
  switch (rule.type) {
    case "SET_SAVE_CHARACTERISTIC":
    case "INVULNERABLE_SAVE":
    case "FEEL_NO_PAIN":
    case "DAMAGE_REDUCTION":
    case "TARGETING_RANGE_LIMIT":
    case "TOUGHNESS_MODIFIER":
      return "defense";
    case "HIT_MODIFIER":
    case "WOUND_MODIFIER":
      return rule.value < 0 ? "defense" : "offense";
    case "ASSAULT":
    case "PISTOL":
    case "RAPID_FIRE":
    case "IGNORES_COVER":
    case "TWIN_LINKED":
    case "TORRENT":
    case "LETHAL_HITS":
    case "LANCE":
    case "INDIRECT_FIRE":
    case "PRECISION":
    case "BLAST":
    case "MELTA":
    case "HEAVY":
    case "HAZARDOUS":
    case "SUSTAINED_HITS":
    case "EXTRA_ATTACKS":
    case "DEVASTATING_WOUNDS":
    case "ANTI":
    case "REROLL_HITS":
    case "REROLL_HITS_ONES":
    case "REROLL_ATTACKS":
    case "REROLL_WOUNDS":
    case "REROLL_WOUNDS_ONES":
    case "FIXED_HIT_ROLL":
    case "IGNORE_HIT_MODIFIERS":
    case "ATTACKS_MODIFIER":
    case "CRITICAL_WOUND_AP_MODIFIER":
    case "CRITICAL_HITS_ON":
    case "AP_MODIFIER":
    case "STRENGTH_MODIFIER":
    case "DAMAGE_MODIFIER":
      return "offense";
    default:
      return "general";
  }
}

function buildManualModifierRules(
  props: Pick<
    ModifiersPanelProps,
    "activeAttackModifiers" | "setActiveAttackModifiers"
  >
): DisplayRule[] {
  return [
    createToggleRule({
      id: "manual-devastating-wounds",
      label: "Devastating Wounds",
      tooltip: "Apply Devastating Wounds as a manual attack modifier.",
      source: "Manual",
      side: "attacker",
      checked: props.activeAttackModifiers.devastatingWounds,
      onToggle: () =>
        props.setActiveAttackModifiers((prev) => ({
          ...prev,
          devastatingWounds: !prev.devastatingWounds,
        })),
      group: "offense",
    }),
    createToggleRule({
      id: "manual-lethal-hits",
      label: "Lethal Hits",
      tooltip: "Apply Lethal Hits as a manual attack modifier.",
      source: "Manual",
      side: "attacker",
      checked: props.activeAttackModifiers.lethalHits,
      onToggle: () =>
        props.setActiveAttackModifiers((prev) => ({
          ...prev,
          lethalHits: !prev.lethalHits,
        })),
      group: "offense",
    }),
    createToggleRule({
      id: "manual-ignores-cover",
      label: "Ignores Cover",
      tooltip: "Apply Ignores Cover as a manual attack modifier.",
      source: "Manual",
      side: "attacker",
      checked: props.activeAttackModifiers.ignoresCover,
      onToggle: () =>
        props.setActiveAttackModifiers((prev) => ({
          ...prev,
          ignoresCover: !prev.ignoresCover,
        })),
      group: "offense",
    }),
  ];
}

function buildDerivedBuckets(rules: DisplayRule[]): RuleBucket[] {
  const order: Array<[DisplayRuleGroup, string]> = [
    ["offense", "Offense"],
    ["defense", "Defense"],
    ["general", "General"],
  ];

  return order
    .map(([group, title]) => ({
      id: group,
      title,
      rules: dedupeDisplayRules(rules.filter((rule) => rule.group === group)),
    }))
    .filter((bucket) => bucket.rules.length > 0);
}

function inferRuleOptionSide(
  rule: Pick<RuleOption, "appliesTo" | "modifiers">
): DisplayRuleSide {
  if (rule.appliesTo === "attacker") {
    return "attacker";
  }

  if (rule.appliesTo === "defender") {
    return "defender";
  }

  const inferred = inferSideFromModifiers(rule.modifiers);
  return inferred ?? "attacker";
}

function inferRuleCollectionSide(
  rules: Array<Pick<RuleOption, "appliesTo" | "modifiers">>
): DisplayRuleSide {
  const counts = { attacker: 0, defender: 0 };

  rules.forEach((rule) => {
    counts[inferRuleOptionSide(rule)] += 1;
  });

  return counts.defender > counts.attacker ? "defender" : "attacker";
}

function inferRuleOptionGroup(
  rule: Pick<RuleOption, "modifiers">
): DisplayRuleGroup {
  return inferGroupFromModifiers(rule.modifiers);
}

function inferRuleCollectionGroup(
  rules: Array<Pick<RuleOption, "modifiers">>
): DisplayRuleGroup {
  return inferGroupFromModifiers(rules.flatMap((rule) => rule.modifiers));
}

function inferAbilityGroup(
  ability: Pick<UnitAbility, "modifiers">,
  side: DisplayRuleSide
): DisplayRuleGroup {
  const inferred = inferGroupFromModifiers(ability.modifiers);

  if (inferred !== "general") {
    return inferred;
  }

  return side === "attacker" ? "offense" : "defense";
}

function inferSideFromModifiers(
  modifiers: SpecialRule[]
): DisplayRuleSide | undefined {
  let attackerScore = 0;
  let defenderScore = 0;

  modifiers.forEach((modifier) => {
    const group = classifyRuleGroup(modifier);
    if (group === "offense") {
      attackerScore += 1;
    }
    if (group === "defense") {
      defenderScore += 1;
    }
  });

  if (attackerScore > defenderScore) {
    return "attacker";
  }

  if (defenderScore > attackerScore) {
    return "defender";
  }

  return undefined;
}

function inferGroupFromModifiers(modifiers: SpecialRule[]): DisplayRuleGroup {
  let offenseCount = 0;
  let defenseCount = 0;

  modifiers.forEach((modifier) => {
    const group = classifyRuleGroup(modifier);
    if (group === "offense") {
      offenseCount += 1;
    }
    if (group === "defense") {
      defenseCount += 1;
    }
  });

  if (offenseCount > defenseCount) {
    return "offense";
  }

  if (defenseCount > offenseCount) {
    return "defense";
  }

  return "general";
}

function createToggleRule(
  input: Omit<DisplayRule, "kind"> & { group?: DisplayRuleGroup }
): DisplayRule {
  return {
    ...input,
    kind: "active",
    group: input.group ?? "general",
  };
}

function createAutoRule(input: Omit<DisplayRule, "kind">): DisplayRule {
  return {
    ...input,
    kind: "auto",
  };
}

function createInfoRule(
  input: Omit<DisplayRule, "kind" | "group" | "checked" | "onToggle">
): DisplayRule {
  return {
    ...input,
    kind: "info",
    group: "general",
  };
}

function dedupeDisplayRules(rules: DisplayRule[]): DisplayRule[] {
  const seen = new Set<string>();

  return rules.filter((rule) => {
    const key = `${rule.kind}|${rule.side}|${rule.group}|${rule.source ?? ""}|${rule.label}|${rule.tooltip}`;
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
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

type CombatRoleSectionProps = {
  role: "Attacker" | "Defender";
  unitName: string;
  summary: string;
  panel: CombatRolePanelModel;
};

function CombatRoleSection({
  role,
  unitName,
  summary,
  panel,
}: CombatRoleSectionProps) {
  return (
    <section className="combat-role-panel">
      <div className="combat-role-panel__header">
        <p className="combat-role-panel__eyebrow">{role}</p>
        <h3 className="combat-role-panel__title">{unitName}</h3>
        <p className="muted-text">{summary}</p>
      </div>

      <RuleGroup title="Active Effects">
        {panel.activeRules.length > 0 ? (
          <div className="rule-list">
            {panel.activeRules.map((rule) => (
              <RuleToggleRow key={rule.id} rule={rule} />
            ))}
          </div>
        ) : (
          <p className="muted-text">No toggleable effects for this side.</p>
        )}
      </RuleGroup>

      <RuleGroup title="Derived Effects">
        <div className="combat-role-panel__derived">
          {panel.derivedRows.length > 0 && (
            <div className="rule-list">
              {panel.derivedRows.map((rule) => (
                <RuleAuto key={rule.id} rule={rule} />
              ))}
            </div>
          )}

          {panel.derivedBuckets.length > 0 && (
            <div className="rule-chip-grid">
              {panel.derivedBuckets.map((bucket) => (
                <div key={bucket.id} className="rule-chip-group">
                  <h4 className="rule-chip-group__title">{bucket.title}</h4>
                  <div className="rules-list">
                    {bucket.rules.map((rule) => (
                      <span key={rule.id} className="rule-tag">
                        <HoverInfo
                          label={<span>{rule.label}</span>}
                          tooltip={rule.tooltip}
                        />
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {panel.derivedRows.length === 0 && panel.derivedBuckets.length === 0 && (
            <p className="muted-text">No derived effects are active right now.</p>
          )}
        </div>
      </RuleGroup>

      <RuleGroup title="Passive Info" subtle>
        {panel.passiveInfoRules.length > 0 ? (
          <div className="rule-info-list">
            {panel.passiveInfoRules.map((rule) => (
              <RuleInfo key={rule.id} rule={rule} />
            ))}
          </div>
        ) : (
          <p className="muted-text">No additional passive info for this side.</p>
        )}
      </RuleGroup>
    </section>
  );
}

type RuleGroupProps = {
  title: string;
  subtle?: boolean;
  children: React.ReactNode;
};

function RuleGroup({ title, subtle = false, children }: RuleGroupProps) {
  return (
    <section className={`rule-group${subtle ? " rule-group--subtle" : ""}`}>
      <h3 className="rule-group__title">{title}</h3>
      {children}
    </section>
  );
}

type RuleToggleRowProps = {
  rule: DisplayRule;
};

function RuleToggleRow({ rule }: RuleToggleRowProps) {
  const sourceBadge = getSourceBadgeLabel(rule.source);

  return (
    <label className="rule-row rule-row--toggle" title={rule.label}>
      <span className="rule-row__toggle">
        <input
          type="checkbox"
          checked={Boolean(rule.checked)}
          onChange={rule.onToggle}
        />
      </span>
      <span className="rule-row__content">
        <span className="rule-row__main">
          <HoverInfo
            label={
              <span className="rule-row__title" title={rule.label}>
                {getCompactRuleLabel(rule)}
              </span>
            }
            tooltip={rule.tooltip}
          />
          {sourceBadge && <span className="rule-source-badge">{sourceBadge}</span>}
        </span>
      </span>
    </label>
  );
}

type RuleAutoProps = {
  rule: DisplayRule;
};

function RuleAuto({ rule }: RuleAutoProps) {
  const sourceBadge = getSourceBadgeLabel(rule.source);

  return (
    <div className="rule-row rule-row--auto">
      <div className="rule-row__content">
        <span className="rule-row__main">
          <HoverInfo
            label={
              <span className="rule-row__title" title={rule.label}>
                {getCompactRuleLabel(rule)}
              </span>
            }
            tooltip={rule.tooltip}
          />
          {sourceBadge && (
            <span className="rule-source-badge rule-source-badge--muted">
              {sourceBadge}
            </span>
          )}
        </span>
      </div>
      <span className="rule-badge">Auto</span>
    </div>
  );
}

type RuleInfoProps = {
  rule: DisplayRule;
};

function RuleInfo({ rule }: RuleInfoProps) {
  const sourceBadge = getSourceBadgeLabel(rule.source);

  return (
    <div className="rule-info-item">
      <HoverInfo
        label={
          <span className="rule-info-item__title" title={rule.label}>
            {getCompactRuleLabel(rule)}
          </span>
        }
        tooltip={rule.tooltip}
      />
      {sourceBadge && (
        <span className="rule-source-badge rule-source-badge--subtle">
          {sourceBadge}
        </span>
      )}
    </div>
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
    formatDescription(enhancement.description),
    formatList("Effects", effectDescriptions),
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
    formatDescription(stratagem.description),
    formatList("Effects", effectDescriptions),
  ];

  return lines.filter(Boolean).join("\n\n");
}

function buildActiveRuleTooltip(rule: SpecialRule): string {
  return formatSpecialRule(rule);
}

function buildUnitAbilityTooltip(ability: UnitAbility): string {
  const lines = [
    ability.name,
    formatDescription(ability.description),
    formatList(
      "Effects",
      ability.modifiers.map((modifier) => formatSpecialRule(modifier))
    ),
  ];

  return lines.filter(Boolean).join("\n\n");
}

function isDisplayableAbility(ability: UnitAbility): boolean {
  const normalizedName = ability.name.trim().toLowerCase();
  const hasRealName =
    normalizedName.length > 0 && !/^ability \d+$/.test(normalizedName);
  const hasDescription = Boolean(ability.description?.trim());

  return hasRealName || hasDescription || ability.modifiers.length > 0;
}

function getCoreUnitRules(unit: Unit): SpecialRule[] {
  const rules: SpecialRule[] = [];

  if (unit.invulnerableSave) {
    rules.push({ type: "INVULNERABLE_SAVE", value: unit.invulnerableSave });
  }

  return rules;
}

function buildCoreRuleTooltip(rule: SpecialRule): string {
  switch (rule.type) {
    case "INVULNERABLE_SAVE":
      return `Core unit profile\n\nThis unit has a native ${formatSpecialRule(rule)} from its datasheet profile.`;
    default:
      return formatSpecialRule(rule);
  }
}

function formatList(title: string, items: string[]): string {
  const nonEmptyItems = items.filter(Boolean);

  if (nonEmptyItems.length === 0) {
    return "";
  }

  return `${title}:\n${nonEmptyItems.map((item) => `- ${item}`).join("\n")}`;
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

function getSourceBadgeLabel(source?: string): string | undefined {
  switch (source) {
    case "Faction / Detachment":
      return "Detachment";
    case "Enhancement":
      return "Enhancement";
    case "Stratagem":
      return "Stratagem";
    case "Manual":
      return "Manual";
    case "Attacker ability":
    case "Defender ability":
      return "Ability";
    default:
      return source;
  }
}

function getCompactRuleLabel(rule: DisplayRule): string {
  return rule.label
    .replace(/^[^:]{1,40}:\s*/g, "")
    .replace(/^[^-]{1,40}\s+-\s+/g, "")
    .replace(/\s*\([^)]*\)\s*/g, " ")
    .replace(/\bEffect\b/gi, "")
    .replace(/\bRe-roll\b/gi, "Reroll")
    .replace(/\s{2,}/g, " ")
    .trim();
}
