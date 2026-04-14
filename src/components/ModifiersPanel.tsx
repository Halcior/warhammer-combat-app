import { useState, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
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
  // Attacker detachment
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
  // Defender detachment
  defenderAvailableDetachments: DetachmentConfig[];
  defenderSelectedDetachmentId: string;
  setDefenderSelectedDetachmentId: React.Dispatch<React.SetStateAction<string>>;
  defenderAvailableRuleOptions: RuleOption[];
  activeDefenderDetachmentRuleOptionIds: string[];
  toggleDefenderDetachmentRuleOption: (id: string) => void;
  defenderDetachmentStratagems: StratagemConfig[];
  defenderDetachmentEnhancements: EnhancementConfig[];
  activeDefenderDetachmentEnhancementIds: string[];
  toggleDefenderDetachmentEnhancement: (id: string) => void;
  activeDefenderDetachmentStratagemIds: string[];
  toggleDefenderDetachmentStratagem: (id: string) => void;
  // Unit abilities
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
    selectedDetachmentId,
    setSelectedDetachmentId,
    defenderAvailableDetachments,
    defenderSelectedDetachmentId,
    setDefenderSelectedDetachmentId,
    attacker,
    defender,
  } = props;
  const model = buildModifiersPanelModel(props);

  return (
    <div className="card card--modifiers">
      <div className="panel-heading">
        <p className="panel-eyebrow">Rules Engine</p>
        <h2>Modifiers &amp; Rules</h2>
      </div>

      <div className="combat-role-layout">
        <CombatRoleSection
          role="Attacker"
          unitName={attacker.name}
          summary="Weapon profile, hit/wound modifiers, active buffs."
          panel={model.attacker}
          availableDetachments={availableDetachments}
          selectedDetachmentId={selectedDetachmentId}
          onDetachmentChange={setSelectedDetachmentId}
        />
        <CombatRoleSection
          role="Defender"
          unitName={defender.name}
          summary="Saves, feel no pain, durability, cover effects."
          panel={model.defender}
          availableDetachments={defenderAvailableDetachments}
          selectedDetachmentId={defenderSelectedDetachmentId}
          onDetachmentChange={setDefenderSelectedDetachmentId}
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

  const defenderDetachmentActiveRules = dedupeDisplayRules([
    ...props.defenderAvailableRuleOptions.map((rule) =>
      createToggleRule({
        id: `defender-det-rule-${rule.id}`,
        label: rule.displayLabel ?? formatUiName(rule.name),
        tooltip: buildRuleOptionTooltip(rule),
        source: "Faction / Detachment",
        side: "defender",
        checked: props.activeDefenderDetachmentRuleOptionIds.includes(rule.id),
        onToggle: () => props.toggleDefenderDetachmentRuleOption(rule.id),
        group: inferRuleOptionGroup(rule),
      })
    ),
    ...props.defenderDetachmentEnhancements.map((enhancement) =>
      createToggleRule({
        id: `defender-det-enhancement-${enhancement.id}`,
        label: formatUiName(enhancement.name),
        tooltip: buildEnhancementTooltip(enhancement),
        source: "Enhancement",
        side: "defender",
        checked: props.activeDefenderDetachmentEnhancementIds.includes(enhancement.id),
        onToggle: () => props.toggleDefenderDetachmentEnhancement(enhancement.id),
        group: inferRuleCollectionGroup(enhancement.effects),
      })
    ),
    ...props.defenderDetachmentStratagems.map((stratagem) =>
      createToggleRule({
        id: `defender-det-stratagem-${stratagem.id}`,
        label: formatUiName(stratagem.name),
        tooltip: buildStratagemTooltip(stratagem),
        source: "Stratagem",
        side: "defender",
        checked: props.activeDefenderDetachmentStratagemIds.includes(stratagem.id),
        onToggle: () => props.toggleDefenderDetachmentStratagem(stratagem.id),
        group: inferRuleCollectionGroup(stratagem.effects),
      })
    ),
  ]);

  const activeRules = dedupeDisplayRules([
    ...props.availableRuleOptions.map((rule) =>
      createToggleRule({
        id: `rule-option-${rule.id}`,
        label: rule.displayLabel ?? formatUiName(rule.name),
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
          label: ability.displayLabel ?? toggledOption.displayLabel ?? formatUiName(ability.name),
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
          label: ability.displayLabel ?? toggledOption.displayLabel ?? formatUiName(ability.name),
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
          label: ability.displayLabel ?? formatUiName(ability.name),
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
          label: ability.displayLabel ?? formatUiName(ability.name),
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
      activeRules: dedupeDisplayRules([
        ...activeRules.filter((rule) => rule.side === "defender"),
        ...defenderDetachmentActiveRules,
      ]),
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
  rule: Pick<RuleOption, "appliesTo" | "modifiers" | "combatRole">
): DisplayRuleSide {
  if (rule.combatRole === "attacker") return "attacker";
  if (rule.combatRole === "defender") return "defender";

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
  rules: Array<Pick<RuleOption, "appliesTo" | "modifiers" | "combatRole">>
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

// ── Portal tooltip ────────────────────────────────────────────────────────

function usePortalTooltip() {
  const [visible, setVisible] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });

  const show = useCallback((el: HTMLElement) => {
    const rect = el.getBoundingClientRect();
    const left = Math.max(
      8,
      Math.min(rect.left + window.scrollX, window.innerWidth - 468)
    );
    setCoords({ top: rect.bottom + window.scrollY + 6, left });
    setVisible(true);
  }, []);

  const hide = useCallback(() => setVisible(false), []);

  return { visible, coords, show, hide };
}

// ── Sub-section header (no <details> to avoid flex/block conflicts) ──────

type CrpSubSectionProps = {
  title: string;
  children: React.ReactNode;
};

function CrpSubSection({ title, children }: CrpSubSectionProps) {
  return (
    <div className="crp-sub">
      <p className="crp-sub__title">{title}</p>
      {children}
    </div>
  );
}

// ── Combat role panel ─────────────────────────────────────────────────────

type CombatRoleSectionProps = {
  role: "Attacker" | "Defender";
  unitName: string;
  summary: string;
  panel: CombatRolePanelModel;
  availableDetachments?: DetachmentConfig[];
  selectedDetachmentId?: string;
  onDetachmentChange?: (id: string) => void;
};

function CombatRoleSection({
  role,
  unitName,
  summary,
  panel,
  availableDetachments,
  selectedDetachmentId,
  onDetachmentChange,
}: CombatRoleSectionProps) {
  const selectedDetachment = availableDetachments?.find(
    (d) => d.id === selectedDetachmentId
  );
  const { visible: detTooltipVisible, coords: detCoords, show: detShow, hide: detHide } =
    usePortalTooltip();
  const detSelectRef = useRef<HTMLSelectElement>(null);

  const detachmentRules = panel.activeRules.filter(
    (r) => r.source === "Faction / Detachment"
  );
  const enhancementRules = panel.activeRules.filter(
    (r) => r.source === "Enhancement"
  );
  const stratagemRules = panel.activeRules.filter(
    (r) => r.source === "Stratagem"
  );
  const abilityRules = panel.activeRules.filter(
    (r) => r.source === "Attacker ability" || r.source === "Defender ability"
  );

  // Flatten all derived effects into a single chip list
  const allDerivedChips: Array<{ id: string; label: string; tooltip: string }> = [
    ...panel.derivedRows.map((r) => ({
      id: r.id,
      label: getCompactRuleLabel(r),
      tooltip: r.tooltip,
    })),
    ...panel.derivedBuckets.flatMap((bucket) =>
      bucket.rules.map((r) => ({
        id: r.id,
        label: getCompactRuleLabel(r),
        tooltip: r.tooltip,
      }))
    ),
  ];

  const passiveChips = panel.passiveInfoRules.map((r) => ({
    id: r.id,
    label: r.label,
    tooltip: r.tooltip,
  }));

  const hasAnyToggles =
    detachmentRules.length > 0 ||
    enhancementRules.length > 0 ||
    stratagemRules.length > 0 ||
    abilityRules.length > 0;

  return (
    <section className="crp">
      {/* Header */}
      <div className="crp__head">
        <p className="crp__eyebrow">{role}</p>
        <h3 className="crp__name">{unitName}</h3>
        <p className="crp__summary">{summary}</p>
      </div>

      {/* Detachment selector */}
      {availableDetachments && availableDetachments.length > 0 && (
        <div className="crp__det">
          <label className="crp__det-label">
            <span className="crp__det-name">Detachment</span>
            <select
              ref={detSelectRef}
              className="crp__det-select"
              value={selectedDetachmentId || ""}
              onChange={(e) => onDetachmentChange?.(e.target.value)}
              onMouseEnter={() => detSelectRef.current && detShow(detSelectRef.current)}
              onMouseLeave={detHide}
            >
              {availableDetachments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </label>
          {detTooltipVisible && selectedDetachment && createPortal(
            <div className="tt" style={{ top: detCoords.top, left: detCoords.left }}>
              {buildDetachmentTooltip(selectedDetachment)}
            </div>,
            document.body
          )}
        </div>
      )}

      {/* Active Toggles */}
      {hasAnyToggles && (
        <CrpSubSection title="Active Toggles">
          <div className="toggle-list">
            {detachmentRules.map((r) => (
              <ToggleRow key={r.id} rule={r} />
            ))}
            {enhancementRules.map((r) => (
              <ToggleRow key={r.id} rule={r} />
            ))}
            {stratagemRules.map((r) => (
              <ToggleRow key={r.id} rule={r} />
            ))}
            {abilityRules.map((r) => (
              <ToggleRow key={r.id} rule={r} />
            ))}
          </div>
        </CrpSubSection>
      )}

      {/* Derived Effects — chips only */}
      {allDerivedChips.length > 0 && (
        <CrpSubSection title="Derived Effects">
          <div className="chip-row">
            {allDerivedChips.map((chip) => (
              <Chip
                key={chip.id}
                label={chip.label}
                tooltip={chip.tooltip}
                className="auto-chip"
              />
            ))}
          </div>
        </CrpSubSection>
      )}

      {/* Passive Info — chips only */}
      {passiveChips.length > 0 && (
        <CrpSubSection title="Passive Info">
          <div className="chip-row">
            {passiveChips.map((chip) => (
              <Chip
                key={chip.id}
                label={chip.label}
                tooltip={chip.tooltip}
                className="info-chip"
              />
            ))}
          </div>
        </CrpSubSection>
      )}
    </section>
  );
}

// ── Toggle row ────────────────────────────────────────────────────────────

function ToggleRow({ rule }: { rule: DisplayRule }) {
  const { visible, coords, show, hide } = usePortalTooltip();
  const labelRef = useRef<HTMLLabelElement>(null);
  const badge = getSourceBadgeLabel(rule.source);

  return (
    <>
      <label
        ref={labelRef}
        className={`toggle-row${rule.checked ? " toggle-row--on" : ""}`}
        onMouseEnter={() => labelRef.current && show(labelRef.current)}
        onMouseLeave={hide}
      >
        <input
          className="toggle-row__input"
          type="checkbox"
          checked={Boolean(rule.checked)}
          onChange={rule.onToggle}
        />
        <span className="toggle-row__name">{rule.label}</span>
        {badge && <span className="toggle-row__badge">{badge}</span>}
      </label>
      {visible && rule.tooltip && createPortal(
        <div className="tt" style={{ top: coords.top, left: coords.left }}>
          {rule.tooltip}
        </div>,
        document.body
      )}
    </>
  );
}

// ── Chip — auto-chip and info-chip with portal tooltip ───────────────────

function Chip({
  label,
  tooltip,
  className,
}: {
  label: string;
  tooltip: string;
  className: string;
}) {
  const { visible, coords, show, hide } = usePortalTooltip();
  const ref = useRef<HTMLSpanElement>(null);

  return (
    <>
      <span
        ref={ref}
        className={className}
        onMouseEnter={() => ref.current && show(ref.current)}
        onMouseLeave={hide}
      >
        {label}
      </span>
      {visible && tooltip && createPortal(
        <div className="tt" style={{ top: coords.top, left: coords.left }}>
          {tooltip}
        </div>,
        document.body
      )}
    </>
  );
}

// ── Tooltip builders ──────────────────────────────────────────────────────

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
