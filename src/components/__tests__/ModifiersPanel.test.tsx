import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import {
  ModifiersPanel,
  buildModifiersPanelModel,
  classifyRuleGroup,
} from "../ModifiersPanel";
import type { SpecialRule, Unit, Weapon } from "../../types/combat";
import type {
  DetachmentConfig,
  EnhancementConfig,
  RuleOption,
} from "../../types/faction";

type ModifiersPanelProps = React.ComponentProps<typeof ModifiersPanel>;

function createWeapon(overrides: Partial<Weapon> = {}): Weapon {
  return {
    id: "weapon-1",
    name: "Bolt Rifle",
    attacks: 2,
    skill: 3,
    strength: 4,
    ap: -1,
    damage: 1,
    type: "ranged",
    specialRules: [],
    ...overrides,
  };
}

function createUnit(overrides: Partial<Unit> = {}): Unit {
  return {
    id: "unit-1",
    name: "Test Unit",
    faction: "Test Faction",
    toughness: 5,
    save: 3,
    woundsPerModel: 3,
    weapons: [createWeapon()],
    specialRules: [],
    abilities: [],
    keywords: [],
    ...overrides,
  };
}

function createRuleOption(overrides: Partial<RuleOption> = {}): RuleOption {
  return {
    id: "rule-1",
    name: "Focused Volley",
    appliesTo: "attacker",
    phase: "shooting",
    modifiers: [{ type: "REROLL_HITS", attackType: "ranged" }],
    isToggle: true,
    engineTags: [],
    ...overrides,
  };
}

function createDetachment(
  overrides: Partial<DetachmentConfig> = {}
): DetachmentConfig {
  return {
    id: "detachment-1",
    name: "Test Detachment",
    description: "Test detachment description",
    ruleOptions: [],
    stratagems: [],
    enhancements: [],
    ...overrides,
  };
}

function createProps(): ModifiersPanelProps {
  const attackerActiveModifierRules: SpecialRule[] = [
    { type: "REROLL_HITS", attackType: "ranged" },
  ];
  const defenderActiveModifierRules: SpecialRule[] = [
    { type: "FEEL_NO_PAIN", value: 5 },
  ];
  const selectedWeapon = createWeapon({
    specialRules: [{ type: "HEAVY", attackType: "ranged" }],
  });

  const attacker = createUnit({
    id: "attacker",
    name: "Attacker",
    weapons: [selectedWeapon],
  });

  const defender = createUnit({
    id: "defender",
    name: "Defender",
    invulnerableSave: 4,
    abilities: [
      {
        id: "ability-1",
        name: "Silent Watcher",
        description: "This unit cannot be targeted from afar.",
        modifiers: [],
        supportLevel: "info-only",
      },
    ],
  });

  return {
    activeAttackModifiers: {
      devastatingWounds: false,
      lethalHits: false,
      ignoresCover: false,
    },
    setActiveAttackModifiers: () => undefined,
    attackerActiveModifierRules,
    defenderActiveModifierRules,
    selectedWeapon,
    attacker,
    defender,
    availableDetachments: [createDetachment()],
    selectedDetachmentId: "detachment-1",
    setSelectedDetachmentId: () => undefined,
    selectedDetachment: createDetachment(),
    availableRuleOptions: [
      createRuleOption({ supportLevel: "implemented" }),
    ],
    activeRuleOptionIdsBySide: { attacker: [], defender: [] },
    toggleRuleOptionForSide: () => undefined,
    stratagems: [],
    enhancements: [],
    activeEnhancementIds: [],
    toggleEnhancement: () => undefined,
    activeStratagemIds: [],
    toggleStratagem: () => undefined,
    defenderAvailableDetachments: [],
    defenderSelectedDetachmentId: "",
    setDefenderSelectedDetachmentId: () => undefined,
    defenderAvailableRuleOptions: [
      createRuleOption({
        id: "rule-2",
        name: "Shield Protocol",
        appliesTo: "defender",
        combatRole: "defender",
        modifiers: [{ type: "INVULNERABLE_SAVE", value: 5 }],
      }),
    ],
    activeDefenderDetachmentRuleOptionIds: [],
    toggleDefenderDetachmentRuleOption: () => undefined,
    defenderDetachmentStratagems: [],
    defenderDetachmentEnhancements: [],
    activeDefenderDetachmentEnhancementIds: [],
    toggleDefenderDetachmentEnhancement: () => undefined,
    activeDefenderDetachmentStratagemIds: [],
    toggleDefenderDetachmentStratagem: () => undefined,
    attackerUnitAbilityOptions: [],
    activeAttackerUnitAbilityIds: [],
    toggleAttackerUnitAbility: () => undefined,
    defenderUnitAbilityOptions: [],
    activeDefenderUnitAbilityIds: [],
    toggleDefenderUnitAbility: () => undefined,
  };
}

describe("ModifiersPanel model", () => {
  it("splits rules into attacker and defender combat-role sections", () => {
    const model = buildModifiersPanelModel(createProps());

    expect(
      model.attacker.activeRules.some((rule) => rule.label === "Focused Volley")
    ).toBe(true);
    expect(
      model.defender.activeRules.some((rule) => rule.label === "Shield Protocol")
    ).toBe(true);
    expect(
      model.attacker.derivedRows.some((rule) => rule.label === "Re-roll Hits")
    ).toBe(true);
    expect(
      model.defender.derivedRows.some((rule) => rule.label === "Feel No Pain 5+")
    ).toBe(true);
    expect(
      model.defender.derivedBuckets.some(
        (bucket) =>
          bucket.title === "Defense" &&
          bucket.rules.some((rule) => rule.label === "Invulnerable Save 4+")
      )
    ).toBe(true);
    expect(
      model.defender.passiveInfoRules.some((rule) => rule.label === "Silent Watcher")
    ).toBe(true);
  });

  it("keeps attacker-owned enhancements and stratagems in the attacker panel even when they apply defensively", () => {
    const props = createProps();
    props.enhancements = [
      {
        id: "attacker-defensive-enh",
        name: "Reactive Plating",
        description: "Attacks against this unit have lower AP.",
        effects: [
          {
            id: "attacker-defensive-enh-effect",
            name: "Reactive Plating",
            appliesTo: "defender",
            phase: "any",
            modifiers: [{ type: "INVULNERABLE_SAVE", value: 5 }],
            combatRole: "defender",
          },
        ],
      },
    ] as EnhancementConfig[];
    props.defenderDetachmentEnhancements = [
      {
        id: "defender-enh",
        name: "Void Shield",
        description: "Improves the defended unit's resilience.",
        effects: [
          {
            id: "defender-enh-effect",
            name: "Void Shield",
            appliesTo: "defender",
            phase: "any",
            modifiers: [{ type: "FEEL_NO_PAIN", value: 6 }],
            combatRole: "defender",
          },
        ],
      },
    ] as EnhancementConfig[];

    const model = buildModifiersPanelModel(props);

    expect(
      model.attacker.activeRules.some((rule) => rule.label === "Reactive Plating")
    ).toBe(true);
    expect(
      model.defender.activeRules.some((rule) => rule.label === "Reactive Plating")
    ).toBe(false);
    expect(
      model.defender.activeRules.some((rule) => rule.label === "Void Shield")
    ).toBe(true);
  });

  it("classifies common offensive and defensive rules into the correct chip groups", () => {
    expect(classifyRuleGroup({ type: "HEAVY", attackType: "ranged" })).toBe(
      "offense"
    );
    expect(classifyRuleGroup({ type: "INVULNERABLE_SAVE", value: 4 })).toBe(
      "defense"
    );
    expect(classifyRuleGroup({ type: "HIT_MODIFIER", value: -1 })).toBe(
      "defense"
    );
    expect(classifyRuleGroup({ type: "HIT_MODIFIER", value: 1 })).toBe(
      "offense"
    );
  });

  it("renders attacker and defender sections without developer labels", () => {
    const markup = renderToStaticMarkup(<ModifiersPanel {...createProps()} />);

    expect(markup.toLowerCase()).not.toContain("implemented");
    expect(markup.toLowerCase()).not.toContain("info-only");
    expect(markup).toContain("Attacker");
    expect(markup).toContain("Defender");
    expect(markup).toContain("Detachment");
    expect(markup).toContain("Active Toggles");
    expect(markup).toContain("Derived Effects");
    expect(markup).toContain("Passive Info");
    expect(markup).not.toContain("Always Active");
    expect(markup).not.toContain("Active Rules");
  });
});
