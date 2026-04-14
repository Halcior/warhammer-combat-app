import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

let capturedModifiersPanelProps: Record<string, unknown> | null = null;

vi.mock("../../PageHeader", () => ({
  PageHeader: () => <div>PageHeader</div>,
}));

vi.mock("../../SetupPanel", () => ({
  SetupPanel: () => <div>SetupPanel</div>,
}));

vi.mock("../../SimulationPanel", () => ({
  SimulationPanel: () => <div>SimulationPanel</div>,
}));

vi.mock("../../ExpectedResultPanel", () => ({
  ExpectedResultPanel: () => <div>ExpectedResultPanel</div>,
}));

vi.mock("../../AttackBreakdownSourcesPanel", () => ({
  AttackBreakdownSourcesPanel: () => <div>AttackBreakdownSourcesPanel</div>,
}));

vi.mock("../../CompareWeaponsPanel", () => ({
  CompareWeaponsPanel: () => <div>CompareWeaponsPanel</div>,
}));

vi.mock("../../ModifiersPanel", () => ({
  ModifiersPanel: (props: Record<string, unknown>) => {
    capturedModifiersPanelProps = props;
    return <div>ModifiersPanel</div>;
  },
}));

vi.mock("../../onboarding/StepIndicator", () => ({
  StepIndicator: () => <div>StepIndicator</div>,
}));

vi.mock("../../onboarding/QuickStart", () => ({
  QuickStart: () => <div>QuickStart</div>,
}));

vi.mock("../../onboarding/ExampleResult", () => ({
  ExampleResult: () => <div>ExampleResult</div>,
}));

vi.mock("../../onboarding/WhatYouGet", () => ({
  WhatYouGet: () => <div>WhatYouGet</div>,
}));

vi.mock("../../LoadArmySelector", () => ({
  LoadArmySelector: () => <div>LoadArmySelector</div>,
}));

import { CalculatorPage } from "../CalculatorPage";

describe("CalculatorPage -> ModifiersPanel integration", () => {
  beforeEach(() => {
    capturedModifiersPanelProps = null;
  });

  it("passes attacker and defender ability options through to ModifiersPanel", () => {
    renderToStaticMarkup(
      <CalculatorPage
        battleSetup={{
          factions: ["A", "B"],
          attackerFaction: "A",
          defenderFaction: "B",
          attackerId: "attacker-1",
          defenderId: "defender-1",
          weaponId: "weapon-1",
          attackingModels: 1,
          defendingModels: 5,
          conditions: {
            battleRound: 1,
            isTargetInCover: false,
            isHalfRange: false,
            remainedStationary: false,
            advancedThisTurn: false,
            targetVisible: true,
            targetDistanceInches: 24,
            targetInEngagementRange: false,
            attackerWithinAuxiliarySupportRange: false,
            defenderWithinFriendlyVehicleSupportRange: false,
            defenderWithinAuxiliaryStealthRange: false,
            targetWithinAuxiliarySupportRange: false,
            targetModelCount: 5,
            targetHasMatchingAntiKeyword: false,
            isChargeTurn: false,
            isAttachedUnit: false,
            attackWithinObjectiveRange: false,
            attackerWithinObjectiveRange: false,
            attackerDisembarkedThisTurn: false,
            attackerIsFiringOverwatch: false,
            attackerIsAfflicted: false,
            attackerIsGuided: false,
            attackerIsVesselOfWrath: false,
            attackerWithinFriendlyCharacterRange: false,
            attackerWithinFriendlyMonsterAura: false,
            attackerWithinPowerMatrix: false,
            attackerSetUpThisTurn: false,
            attackerSetToDefend: false,
            targetIsClosestEligible: false,
            targetWithinPlagueLegionsEngagementRange: false,
            targetIsAfflicted: false,
            targetWithinContagionRange: false,
            targetInOpponentDeploymentZone: false,
            targetIsSpotted: false,
            targetOppositeHatchway: false,
            targetIsUnravelling: false,
            targetWithinObjectiveRange: false,
            targetIsBattleShocked: false,
            targetBelowStartingStrength: false,
            targetBelowHalfStrength: false,
            attackerBelowStartingStrength: false,
            attackerBelowHalfStrength: false,
            attackerIsIsolated: false,
          },
          attackerUnits: [],
          defenderUnits: [],
          attacker: {
            id: "attacker-1",
            name: "Attacker",
            faction: "A",
            toughness: 5,
            save: 3,
            woundsPerModel: 3,
            weapons: [
              {
                id: "weapon-1",
                name: "Pulse Rifle",
                attacks: 2,
                skill: 4,
                strength: 5,
                ap: 0,
                damage: 1,
                type: "ranged",
                specialRules: [],
              },
            ],
            specialRules: [],
            abilities: [],
            keywords: [],
          },
          defender: {
            id: "defender-1",
            name: "Defender",
            faction: "B",
            toughness: 5,
            save: 3,
            woundsPerModel: 3,
            weapons: [],
            specialRules: [],
            abilities: [],
            keywords: [],
          },
          selectedWeapon: {
            id: "weapon-1",
            name: "Pulse Rifle",
            attacks: 2,
            skill: 4,
            strength: 5,
            ap: 0,
            damage: 1,
            type: "ranged",
            specialRules: [],
          },
          setAttackingModels: () => undefined,
          setDefendingModels: () => undefined,
          setConditions: () => undefined,
          handleAttackerFactionChange: () => undefined,
          handleAttackerChange: () => undefined,
          handleWeaponChange: () => undefined,
          handleDefenderFactionChange: () => undefined,
          handleDefenderChange: () => undefined,
          selectAttacker: () => undefined,
          selectDefender: () => undefined,
        }}
        attackModifiers={{
          activeAttackModifiers: {
            devastatingWounds: false,
            lethalHits: false,
            ignoresCover: false,
          },
          setActiveAttackModifiers: () => undefined,
          activeFactionModifiers: {
            martialKatahLethalHits: false,
            martialKatahSustainedHits: false,
          },
          setActiveFactionModifiers: () => undefined,
          activeModifierRules: [],
          activeFactionModifierRules: [],
          allActiveModifierRules: [],
        }}
        factionRules={{
          availableDetachments: [],
          selectedDetachmentId: "",
          setSelectedDetachmentId: () => undefined,
          selectedDetachment: {
            id: "detachment-1",
            name: "Detachment",
            ruleOptions: [],
            stratagems: [],
            enhancements: [],
          },
          allAvailableRuleOptions: [],
          stratagems: [],
          enhancements: [],
        }}
        ruleOptions={{
          activeRuleOptionIds: [],
          setActiveRuleOptionIds: () => undefined,
          activeRuleOptions: [],
          activeRuleModifiers: [],
          activeEngineTags: [],
          toggleRuleOption: () => undefined,
        }}
        enhancementOptions={{
          activeEnhancementIds: [],
          toggleEnhancement: () => undefined,
          activeEnhancementRuleEffects: [],
          activeEnhancementEffects: [],
        }}
        stratagemOptions={{
          activeStratagemIds: [],
          toggleStratagem: () => undefined,
          activeStratagemRuleEffects: [],
          activeStratagemEffects: [],
        }}
        defenderFactionRules={{
          availableDetachments: [],
          selectedDetachmentId: "",
          setSelectedDetachmentId: () => undefined,
          selectedDetachment: {
            id: "detachment-2",
            name: "Defender Detachment",
            ruleOptions: [],
            stratagems: [],
            enhancements: [],
          },
          allAvailableRuleOptions: [],
          stratagems: [],
          enhancements: [],
        }}
        defenderDetachmentRuleOptions={{
          activeRuleOptionIds: [],
          setActiveRuleOptionIds: () => undefined,
          activeRuleOptions: [],
          activeRuleModifiers: [],
          activeEngineTags: [],
          toggleRuleOption: () => undefined,
        }}
        defenderDetachmentEnhancementOptions={{
          activeEnhancementIds: [],
          toggleEnhancement: () => undefined,
          activeEnhancementRuleEffects: [],
          activeEnhancementEffects: [],
        }}
        defenderDetachmentStratagemOptions={{
          activeStratagemIds: [],
          toggleStratagem: () => undefined,
          activeStratagemRuleEffects: [],
          activeStratagemEffects: [],
        }}
        expectedResult={{
          totalAttacks: 2,
          hitTarget: 4,
          woundTarget: 4,
          saveTarget: 3,
          expectedHits: 1,
          expectedWounds: 1,
          expectedUnsavedWounds: 1,
          expectedDamage: 1,
          expectedSlainModels: 0.33,
          attacksPerModel: 2,
          damagePerFailedSave: 1,
          blastBonus: 0,
          criticalHits: 0,
          extraHitsFromSustained: 0,
          autoWoundsFromLethalHits: 0,
          criticalWoundsFromRolls: 0,
          mortalWoundsFromDevastating: 0,
          effectiveAp: 0,
        }}
        attackBreakdownExplanation={{
          hit: { resolved: "4+", rows: [] },
          wound: { resolved: "4+", rows: [] },
          save: { resolved: "3+", rows: [] },
          damage: { resolved: "1", rows: [] },
        }}
        compareWeapon={{
          id: "weapon-1",
          name: "Pulse Rifle",
          attacks: 2,
          skill: 4,
          strength: 5,
          ap: 0,
          damage: 1,
          type: "ranged",
          specialRules: [],
        }}
        compareResult={{
          totalAttacks: 2,
          hitTarget: 4,
          woundTarget: 4,
          saveTarget: 3,
          expectedHits: 1,
          expectedWounds: 1,
          expectedUnsavedWounds: 1,
          expectedDamage: 1,
          expectedSlainModels: 0.33,
          attacksPerModel: 2,
          damagePerFailedSave: 1,
          blastBonus: 0,
          criticalHits: 0,
          extraHitsFromSustained: 0,
          autoWoundsFromLethalHits: 0,
          criticalWoundsFromRolls: 0,
          mortalWoundsFromDevastating: 0,
          effectiveAp: 0,
        }}
        attackerUnitAbilityRuleOptions={[
          {
            id: "attacker-ability-a1",
            name: "Captain-General",
            appliesTo: "attacker",
            phase: "any",
            modifiers: [{ type: "IGNORE_HIT_MODIFIERS" }],
            engineTags: [],
          },
        ]}
        attackerUnitAbilityOptions={{
          activeRuleOptionIds: [],
          setActiveRuleOptionIds: () => undefined,
          activeRuleOptions: [],
          activeRuleModifiers: [],
          activeEngineTags: [],
          toggleRuleOption: () => undefined,
        }}
        defenderUnitAbilityRuleOptions={[
          {
            id: "defender-ability-d1",
            name: "Stealth",
            appliesTo: "defender",
            phase: "any",
            modifiers: [{ type: "HIT_MODIFIER", value: -1, attackType: "ranged" }],
            engineTags: [],
          },
        ]}
        defenderUnitAbilityOptions={{
          activeRuleOptionIds: [],
          setActiveRuleOptionIds: () => undefined,
          activeRuleOptions: [],
          activeRuleModifiers: [],
          activeEngineTags: [],
          toggleRuleOption: () => undefined,
        }}
        attackerScopedModifierRules={[]}
        defenderScopedModifierRules={[]}
        mode="fast"
        setMode={() => undefined}
        runs={1000}
        setRuns={() => undefined}
        onRunSimulation={() => undefined}
        simulationSummary={null}
        simulationError={null}
        isSimulationRunning={false}
        compareWeaponId=""
        setCompareWeaponId={() => undefined}
        armies={[]}
        unitDefinitions={[]}
      />
    );

    expect(capturedModifiersPanelProps).not.toBeNull();
    expect(capturedModifiersPanelProps?.attackerUnitAbilityOptions).toHaveLength(1);
    expect(capturedModifiersPanelProps?.defenderUnitAbilityOptions).toHaveLength(1);
  });
});
