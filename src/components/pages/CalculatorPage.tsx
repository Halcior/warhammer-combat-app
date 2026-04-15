import { useState, useRef } from "react";
import { PageHeader } from "../PageHeader";
import { SetupPanel } from "../SetupPanel";
import { SimulationPanel } from "../SimulationPanel";
import { ExpectedResultPanel } from "../ExpectedResultPanel";
import { AttackBreakdownSourcesPanel } from "../AttackBreakdownSourcesPanel";
import { CompareWeaponsPanel } from "../CompareWeaponsPanel";
import { ModifiersPanel } from "../ModifiersPanel";
import { LoadArmySelector } from "../LoadArmySelector";
import { StepIndicator } from "../onboarding/StepIndicator";
import { QuickStart } from "../onboarding/QuickStart";
import { ExampleResult } from "../onboarding/ExampleResult";
import { WhatYouGet } from "../onboarding/WhatYouGet";
import type { SimulationSummary } from "../../lib/combat/simulation/analyzeSimulation";
import type { CalculationMode } from "../../lib/combat/simulation/runSimulationByMode";
import type { SpecialRule } from "../../types/combat";
import type { RuleOption } from "../../types/faction";
import type { AttackBreakdownExplanation } from "../../lib/combat/explainAttackBreakdown";
import type { ExpectedDamageResult } from "../../lib/combat/types";
import type { ArmyPresetV2 } from "../../types/armyPreset";
import type { Unit } from "../../types/combat";

type BattleSetupState = ReturnType<
  typeof import("../../hooks/useBattleSetup").useBattleSetup
>;
type AttackModifiersState = ReturnType<
  typeof import("../../hooks/useAttackModifiers").useAttackModifiers
>;
type FactionRulesState = ReturnType<
  typeof import("../../hooks/useFactionRules").useFactionRules
>;
type RuleOptionsState = ReturnType<
  typeof import("../../hooks/useRuleOptions").useRuleOptions
>;
type SidedRuleOptionsState = ReturnType<
  typeof import("../../hooks/useSidedRuleOptions").useSidedRuleOptions
>;
type EnhancementOptionsState = ReturnType<
  typeof import("../../hooks/useRuleOptions").useEnhancementOptions
>;
type StratagemOptionsState = ReturnType<
  typeof import("../../hooks/useRuleOptions").useStratagemOptions
>;

interface CalculatorPageProps {
  battleSetup: BattleSetupState;
  attackModifiers: AttackModifiersState;
  factionRules: FactionRulesState;
  ruleOptions: SidedRuleOptionsState;
  enhancementOptions: EnhancementOptionsState;
  stratagemOptions: StratagemOptionsState;
  defenderFactionRules: FactionRulesState;
  defenderDetachmentRuleOptions: RuleOptionsState;
  defenderDetachmentEnhancementOptions: EnhancementOptionsState;
  defenderDetachmentStratagemOptions: StratagemOptionsState;
  expectedResult: ExpectedDamageResult;
  attackBreakdownExplanation: AttackBreakdownExplanation;
  compareWeapon: BattleSetupState["selectedWeapon"];
  compareResult: ExpectedDamageResult;
  attackerUnitAbilityRuleOptions: RuleOption[];
  attackerUnitAbilityOptions: RuleOptionsState;
  defenderUnitAbilityRuleOptions: RuleOption[];
  defenderUnitAbilityOptions: RuleOptionsState;
  attackerScopedModifierRules: SpecialRule[];
  defenderScopedModifierRules: SpecialRule[];
  mode: CalculationMode;
  setMode: (mode: CalculationMode) => void;
  runs: number;
  setRuns: (runs: number) => void;
  onRunSimulation: () => void;
  simulationSummary: SimulationSummary | null;
  simulationError: string | null;
  isSimulationRunning: boolean;
  compareWeaponId: string;
  setCompareWeaponId: React.Dispatch<React.SetStateAction<string>>;
  armies: ArmyPresetV2[];
  unitDefinitions: Unit[];
}

export function CalculatorPage({
  battleSetup,
  factionRules,
  expectedResult,
  attackBreakdownExplanation,
  compareWeapon,
  compareResult,
  attackModifiers,
  ruleOptions,
  enhancementOptions,
  stratagemOptions,
  defenderFactionRules,
  defenderDetachmentRuleOptions,
  defenderDetachmentEnhancementOptions,
  defenderDetachmentStratagemOptions,
  attackerScopedModifierRules,
  defenderScopedModifierRules,
  mode,
  setMode,
  runs,
  setRuns,
  onRunSimulation,
  simulationSummary,
  simulationError,
  isSimulationRunning,
  compareWeaponId,
  setCompareWeaponId,
  attackerUnitAbilityRuleOptions,
  attackerUnitAbilityOptions,
  defenderUnitAbilityRuleOptions,
  defenderUnitAbilityOptions,
  armies,
  unitDefinitions,
}: CalculatorPageProps) {
  const [isLoadingExample, setIsLoadingExample] = useState(false);
  const [isLoadingArmyModal, setIsLoadingArmyModal] = useState(false);
  const resultsRef = useRef<HTMLDivElement>(null);

  const handleLoadExample = async () => {
    setIsLoadingExample(true);
    
    // Simulate loading delay
    await new Promise((resolve) => setTimeout(resolve, 500));
    
    // Load example: Necron Warriors vs Space Marine Tactical Squad
    const necronWarriors = battleSetup.attackerUnits.find(
      (u) => u.name.includes("Necron") && u.name.includes("Warrior")
    );
    const spaceMarines = battleSetup.defenderUnits.find(
      (u) => u.name.includes("Tactical")
    );

    if (necronWarriors && spaceMarines) {
      battleSetup.handleAttackerChange(necronWarriors.id);
      battleSetup.handleDefenderChange(spaceMarines.id);
      
      if (necronWarriors.weapons.length > 0) {
        battleSetup.handleWeaponChange(necronWarriors.weapons[0].id);
      }
    }

    setIsLoadingExample(false);

    // Scroll to results
    setTimeout(() => {
      resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };

  const handleLoadUnitFromArmy = (faction: string, unitId: string, weaponId: string) => {
    battleSetup.selectAttacker(faction, unitId, weaponId);
    setIsLoadingArmyModal(false);

    // Scroll to results to show the loaded setup
    setTimeout(() => {
      resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };

  // Determine current step based on selections
  const currentStep = battleSetup.attackerId ? (battleSetup.conditions.battleRound ? 3 : 2) : (1 as const);

  return (
    <div className="calculator-page">
      <PageHeader
        title="Combat Calculator"
        subtitle="Set up a matchup and analyze damage output"
      />

      {/* Load from Army Modal */}
      {isLoadingArmyModal && armies.length > 0 && (
        <div className="calculator-page__army-modal">
          <LoadArmySelector
            armies={armies}
            unitDefinitions={unitDefinitions}
            onLoadUnit={handleLoadUnitFromArmy}
            onClose={() => setIsLoadingArmyModal(false)}
          />
        </div>
      )}

      {/* Quick Start & Example Preview */}
      <div className="calculator-page__intro">
        <QuickStart onLoadExample={handleLoadExample} isLoading={isLoadingExample} />
        {armies.length > 0 && !isLoadingArmyModal && (
          <button
            className="calculator-page__load-army-button"
            onClick={() => setIsLoadingArmyModal(true)}
            title="Load a unit from one of your saved armies"
          >
            Load from Saved Army
          </button>
        )}
        <ExampleResult />
      </div>

      {/* Step Indicator */}
      <StepIndicator currentStep={currentStep} />

      {/* Setup Form */}
      <div className="calculator-page__setup-wrapper">
        <SetupPanel
        factions={battleSetup.factions}
        attackerFaction={battleSetup.attackerFaction}
        defenderFaction={battleSetup.defenderFaction}
        attackerId={battleSetup.attackerId}
        defenderId={battleSetup.defenderId}
        weaponId={battleSetup.weaponId}
        attackingModels={battleSetup.attackingModels}
        defendingModels={battleSetup.defendingModels}
        conditions={battleSetup.conditions}
        attackerUnits={battleSetup.attackerUnits}
        defenderUnits={battleSetup.defenderUnits}
        attacker={battleSetup.attacker}
        setAttackingModels={battleSetup.setAttackingModels}
        setDefendingModels={battleSetup.setDefendingModels}
        setConditions={battleSetup.setConditions}
        handleAttackerFactionChange={battleSetup.handleAttackerFactionChange}
        handleAttackerChange={battleSetup.handleAttackerChange}
        handleWeaponChange={battleSetup.handleWeaponChange}
        handleDefenderFactionChange={battleSetup.handleDefenderFactionChange}
        handleDefenderChange={battleSetup.handleDefenderChange}
      />
      </div>

      {/* What You Get Section */}
      <WhatYouGet />

      {/* Results Grid */}
      <div className="calculator-page__results" ref={resultsRef}>
        <div className="workspace-main">
          <SimulationPanel
            mode={mode}
            setMode={setMode}
            runs={runs}
            setRuns={setRuns}
            onRun={onRunSimulation}
            summary={simulationSummary}
            error={simulationError}
            isRunning={isSimulationRunning}
          />

          <div className="analysis-grid">
            <ExpectedResultPanel expectedResult={expectedResult} />
            <AttackBreakdownSourcesPanel explanation={attackBreakdownExplanation} />
          </div>
        </div>

        <ModifiersPanel
          activeAttackModifiers={attackModifiers.activeAttackModifiers}
          setActiveAttackModifiers={attackModifiers.setActiveAttackModifiers}
          attackerActiveModifierRules={attackerScopedModifierRules}
          defenderActiveModifierRules={defenderScopedModifierRules}
          selectedWeapon={battleSetup.selectedWeapon}
          attacker={battleSetup.attacker}
          defender={battleSetup.defender}
          availableDetachments={factionRules.availableDetachments}
          selectedDetachmentId={factionRules.selectedDetachmentId}
          setSelectedDetachmentId={factionRules.setSelectedDetachmentId}
          selectedDetachment={factionRules.selectedDetachment}
          availableRuleOptions={factionRules.allAvailableRuleOptions}
          activeRuleOptionIdsBySide={ruleOptions.activeRuleOptionIdsBySide}
          toggleRuleOptionForSide={ruleOptions.toggleRuleOptionForSide}
          stratagems={factionRules.stratagems}
          enhancements={factionRules.enhancements}
          activeEnhancementIds={enhancementOptions.activeEnhancementIds}
          toggleEnhancement={enhancementOptions.toggleEnhancement}
          activeStratagemIds={stratagemOptions.activeStratagemIds}
          toggleStratagem={stratagemOptions.toggleStratagem}
          defenderAvailableDetachments={defenderFactionRules.availableDetachments}
          defenderSelectedDetachmentId={defenderFactionRules.selectedDetachmentId}
          setDefenderSelectedDetachmentId={defenderFactionRules.setSelectedDetachmentId}
          defenderAvailableRuleOptions={defenderFactionRules.allAvailableRuleOptions}
          activeDefenderDetachmentRuleOptionIds={defenderDetachmentRuleOptions.activeRuleOptionIds}
          toggleDefenderDetachmentRuleOption={defenderDetachmentRuleOptions.toggleRuleOption}
          defenderDetachmentStratagems={defenderFactionRules.stratagems}
          defenderDetachmentEnhancements={defenderFactionRules.enhancements}
          activeDefenderDetachmentEnhancementIds={defenderDetachmentEnhancementOptions.activeEnhancementIds}
          toggleDefenderDetachmentEnhancement={defenderDetachmentEnhancementOptions.toggleEnhancement}
          activeDefenderDetachmentStratagemIds={defenderDetachmentStratagemOptions.activeStratagemIds}
          toggleDefenderDetachmentStratagem={defenderDetachmentStratagemOptions.toggleStratagem}
          attackerUnitAbilityOptions={attackerUnitAbilityRuleOptions}
          activeAttackerUnitAbilityIds={attackerUnitAbilityOptions.activeRuleOptionIds}
          toggleAttackerUnitAbility={attackerUnitAbilityOptions.toggleRuleOption}
          defenderUnitAbilityOptions={defenderUnitAbilityRuleOptions}
          activeDefenderUnitAbilityIds={defenderUnitAbilityOptions.activeRuleOptionIds}
          toggleDefenderUnitAbility={defenderUnitAbilityOptions.toggleRuleOption}
        />

        {battleSetup.attacker.weapons.length > 1 && (
          <CompareWeaponsPanel
            weaponA={battleSetup.selectedWeapon}
            weaponB={compareWeapon}
            compareWeaponId={compareWeaponId}
            setCompareWeaponId={setCompareWeaponId}
            availableWeapons={battleSetup.attacker.weapons}
            resultA={expectedResult}
            resultB={compareResult}
          />
        )}
      </div>

      <section className="calculator-page__info">
        <article className="info-card" id="docs">
          <span className="info-card__label">Docs</span>
          <p>
            Breakdown traces and rule tooltips keep the combat logic readable
            inside the app.
          </p>
        </article>

        <article className="info-card">
          <span className="info-card__label">Sources</span>
          <p>
            Use Wahapedia as a quick external rules reference when you want to
            cross-check wording while building a matchup.
          </p>
          <div className="info-card__actions">
            <a
              className="inline-link"
              href="https://wahapedia.ru/"
              target="_blank"
              rel="noreferrer"
            >
              Open Wahapedia
            </a>
          </div>
        </article>

        <article className="info-card" id="pricing">
          <span className="info-card__label">Pricing</span>
          <p>
            The current focus is a strong core calculator, with room for
            future premium flows like saved scenarios and team presets.
          </p>
        </article>
      </section>
    </div>
  );
}
