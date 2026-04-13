import { useEffect, useMemo, useState } from "react";
import "./App.css";
import appLogo from "./assets/Nowe_LogoPNG.png";
import { calculateExpectedDamage } from "./lib/combat";
import { runSimulationByMode } from "./lib/combat/simulation/runSimulationByMode";

import { useBattleSetup } from "./hooks/useBattleSetup";
import { useAttackModifiers } from "./hooks/useAttackModifiers";
import { useFactionRules } from "./hooks/useFactionRules";
import {
  useRuleOptions,
  useEnhancementOptions,
  useStratagemOptions,
} from "./hooks/useRuleOptions";

import type { SimulationSummary } from "./lib/combat/simulation/analyzeSimulation";
import type { CalculationMode } from "./lib/combat/simulation/runSimulationByMode";
import type { RuleOption } from "./types/faction";

import { explainAttackBreakdown } from "./lib/combat/explainAttackBreakdown";
import type { AppView } from "./components/AppNav";
import { useArmyPresets } from "./hooks/useArmyPresets";
import { loadUISession, saveUISession } from "./lib/storage/uiStorage";

import { CalculatorPage } from "./components/pages/CalculatorPage";
import { ArmiesPage } from "./components/pages/ArmiesPage";
import { WorkspacePage } from "./components/pages/WorkspacePage";

function App() {
  const battleSetup = useBattleSetup();
  const attackModifiers = useAttackModifiers();
  const factionRules = useFactionRules(battleSetup.attackerFaction);
  const ruleOptions = useRuleOptions(factionRules.allAvailableRuleOptions);
  const enhancementOptions = useEnhancementOptions(factionRules.enhancements);
  const stratagemOptions = useStratagemOptions(factionRules.stratagems);

  const armyPresets = useArmyPresets();
  
  const session = loadUISession();
  const [view, setView] = useState<AppView>(session.view ?? "calculator");
  const [workspaceArmyA, setWorkspaceArmyA] = useState<string | null>(session.workspaceArmyA ?? null);
  const [workspaceArmyB, setWorkspaceArmyB] = useState<string | null>(session.workspaceArmyB ?? null);

  useEffect(() => {
    saveUISession({ view, workspaceArmyA, workspaceArmyB });
  }, [view, workspaceArmyA, workspaceArmyB]);

  const [compareWeaponId, setCompareWeaponId] = useState("");
  const [mode, setMode] = useState<CalculationMode>("fast");
  const [runs, setRuns] = useState(5000);
  const [simulationSummary, setSimulationSummary] =
    useState<SimulationSummary | null>(null);
  const [simulationError, setSimulationError] = useState<string | null>(null);
  const [isSimulationRunning, setIsSimulationRunning] = useState(false);
  const [simulationRefreshKey, setSimulationRefreshKey] = useState(0);

  const fallbackCompareWeaponId = useMemo(() => {
    const fallbackWeapon =
      battleSetup.attacker.weapons.find(
        (weapon) => weapon.id !== battleSetup.selectedWeapon.id
      ) ?? battleSetup.selectedWeapon;

    return fallbackWeapon.id;
  }, [battleSetup.attacker.weapons, battleSetup.selectedWeapon]);

  const activeCompareWeaponId = useMemo(() => {
    const isCurrentCompareWeaponValid = battleSetup.attacker.weapons.some(
      (weapon) =>
        weapon.id === compareWeaponId && weapon.id !== battleSetup.selectedWeapon.id
    );

    return isCurrentCompareWeaponValid ? compareWeaponId : fallbackCompareWeaponId;
  }, [
    battleSetup.attacker.weapons,
    battleSetup.selectedWeapon.id,
    compareWeaponId,
    fallbackCompareWeaponId,
  ]);

  const attackerUnitAbilityRuleOptions = useMemo(() => {
    return (battleSetup.attacker.abilities ?? [])
      .filter((ability) => ability.modifiers.length > 0)
      .map((ability) => ({
        id: `attacker-ability-${ability.id}`,
        name: ability.name,
        description: ability.description,
        appliesTo: "attacker" as const,
        phase: "any" as const,
        modifiers: ability.modifiers,
        isToggle: true,
        supportLevel: ability.supportLevel,
        engineTags: [],
        selectionGroup: ability.selectionGroup,
      }));
  }, [battleSetup.attacker.abilities]);

  const defenderUnitAbilityRuleOptions = useMemo(() => {
    return (battleSetup.defender.abilities ?? [])
      .filter((ability) => ability.modifiers.length > 0)
      .map((ability) => ({
        id: `defender-ability-${ability.id}`,
        name: ability.name,
        description: ability.description,
        appliesTo: "defender" as const,
        phase: "any" as const,
        modifiers: ability.modifiers,
        isToggle: true,
        supportLevel: ability.supportLevel,
        engineTags: [],
        selectionGroup: ability.selectionGroup,
      }));
  }, [battleSetup.defender.abilities]);

  const attackerUnitAbilityOptions = useRuleOptions(attackerUnitAbilityRuleOptions);
  const defenderUnitAbilityOptions = useRuleOptions(defenderUnitAbilityRuleOptions);

  const activeRuleEffects = useMemo(() => {
    return [
      ...ruleOptions.activeRuleOptions,
      ...enhancementOptions.activeEnhancementRuleEffects,
      ...stratagemOptions.activeStratagemRuleEffects,
      ...attackerUnitAbilityOptions.activeRuleOptions,
      ...defenderUnitAbilityOptions.activeRuleOptions,
    ];
  }, [
    ruleOptions.activeRuleOptions,
    enhancementOptions.activeEnhancementRuleEffects,
    stratagemOptions.activeStratagemRuleEffects,
    attackerUnitAbilityOptions.activeRuleOptions,
    defenderUnitAbilityOptions.activeRuleOptions,
  ]);

  const attackerScopedModifierRules = useMemo(() => {
    return [
      ...attackModifiers.allActiveModifierRules,
      ...activeRuleEffects
        .filter((effect: RuleOption) => effect.appliesTo !== "defender")
        .flatMap((effect) => effect.modifiers),
    ];
  }, [attackModifiers.allActiveModifierRules, activeRuleEffects]);

  const defenderScopedModifierRules = useMemo(() => {
    return activeRuleEffects
      .filter((effect: RuleOption) => effect.appliesTo === "defender")
      .flatMap((effect) => effect.modifiers);
  }, [activeRuleEffects]);

  const expectedResult = useMemo(() => {
    return calculateExpectedDamage({
      attacker: battleSetup.attacker,
      weapon: battleSetup.selectedWeapon,
      defender: battleSetup.defender,
      attackingModels: battleSetup.attackingModels,
      defendingModels: battleSetup.defendingModels,
      conditions: battleSetup.conditions,
      activeModifierRules: attackerScopedModifierRules,
      activeDefenderModifierRules: defenderScopedModifierRules,
    });
  }, [
    battleSetup.attacker,
    battleSetup.selectedWeapon,
    battleSetup.defender,
    battleSetup.attackingModels,
    battleSetup.defendingModels,
    battleSetup.conditions,
    attackerScopedModifierRules,
    defenderScopedModifierRules,
  ]);

  const attackBreakdownExplanation = useMemo(() => {
    return explainAttackBreakdown({
      attacker: battleSetup.attacker,
      weapon: battleSetup.selectedWeapon,
      defender: battleSetup.defender,
      conditions: battleSetup.conditions,
      activeModifierRules: attackerScopedModifierRules,
      activeDefenderModifierRules: defenderScopedModifierRules,
    });
  }, [
    battleSetup.attacker,
    battleSetup.selectedWeapon,
    battleSetup.defender,
    battleSetup.conditions,
    attackerScopedModifierRules,
    defenderScopedModifierRules,
  ]);

  const compareWeapon =
    battleSetup.attacker.weapons.find((w) => w.id === activeCompareWeaponId) ??
    battleSetup.selectedWeapon;

  const compareResult = useMemo(() => {
    return calculateExpectedDamage({
      attacker: battleSetup.attacker,
      weapon: compareWeapon,
      defender: battleSetup.defender,
      attackingModels: battleSetup.attackingModels,
      defendingModels: battleSetup.defendingModels,
      conditions: battleSetup.conditions,
      activeModifierRules: attackerScopedModifierRules,
      activeDefenderModifierRules: defenderScopedModifierRules,
    });
  }, [
    battleSetup.attacker,
    compareWeapon,
    battleSetup.defender,
    battleSetup.attackingModels,
    battleSetup.defendingModels,
    battleSetup.conditions,
    attackerScopedModifierRules,
    defenderScopedModifierRules,
  ]);

  const simulationInputSignature = useMemo(() => {
    return JSON.stringify({
      mode,
      runs,
      attackerId: battleSetup.attacker.id,
      defenderId: battleSetup.defender.id,
      weaponId: battleSetup.selectedWeapon.id,
      compareWeaponId: compareWeapon.id,
      attackingModels: battleSetup.attackingModels,
      defendingModels: battleSetup.defendingModels,
      defenderWoundsPerModel: battleSetup.defender.woundsPerModel,
      conditions: battleSetup.conditions,
      attackerRules: attackerScopedModifierRules,
      defenderRules: defenderScopedModifierRules,
      expectedDamage: {
        totalAttacks: expectedResult.totalAttacks,
        hitTarget: expectedResult.hitTarget,
        woundTarget: expectedResult.woundTarget,
        saveTarget: expectedResult.saveTarget,
        expectedHits: expectedResult.expectedHits,
        expectedWounds: expectedResult.expectedWounds,
        expectedUnsavedWounds: expectedResult.expectedUnsavedWounds,
        expectedDamage: expectedResult.expectedDamage,
        expectedSlainModels: expectedResult.expectedSlainModels,
        attacksPerModel: expectedResult.attacksPerModel,
        damagePerFailedSave: expectedResult.damagePerFailedSave,
        blastBonus: expectedResult.blastBonus,
        criticalHits: expectedResult.criticalHits,
        extraHitsFromSustained: expectedResult.extraHitsFromSustained,
        autoWoundsFromLethalHits: expectedResult.autoWoundsFromLethalHits,
        criticalWoundsFromRolls: expectedResult.criticalWoundsFromRolls,
        mortalWoundsFromDevastating: expectedResult.mortalWoundsFromDevastating,
        effectiveAp: expectedResult.effectiveAp,
      },
    });
  }, [
    mode,
    runs,
    battleSetup.attacker.id,
    battleSetup.defender.id,
    battleSetup.selectedWeapon.id,
    compareWeapon.id,
    battleSetup.attackingModels,
    battleSetup.defendingModels,
    battleSetup.defender.woundsPerModel,
    battleSetup.conditions,
    attackerScopedModifierRules,
    defenderScopedModifierRules,
    expectedResult,
  ]);

  const handleRunSimulation = () => {
    setSimulationRefreshKey((current) => current + 1);
  };

  useEffect(() => {
    let isCancelled = false;

    setIsSimulationRunning(true);
    setSimulationError(null);

    const timeoutId = window.setTimeout(() => {
      try {
        const summary = runSimulationByMode({
          mode,
          expectedResult,
          selectedWeapon: battleSetup.selectedWeapon,
          targetWounds: battleSetup.defender.woundsPerModel,
          defendingModels: battleSetup.defendingModels,
          runs,
          accurateParams: {
            attacker: battleSetup.attacker,
            weapon: battleSetup.selectedWeapon,
            defender: battleSetup.defender,
            attackingModels: battleSetup.attackingModels,
            defendingModels: battleSetup.defendingModels,
            conditions: battleSetup.conditions,
            activeModifierRules: attackerScopedModifierRules,
            activeDefenderModifierRules: defenderScopedModifierRules,
          },
        });

        validateSimulationSummary(summary);

        if (!isCancelled) {
          setSimulationSummary(summary);
          setSimulationError(null);
        }
      } catch (error) {
        if (!isCancelled) {
          setSimulationSummary(null);
          setSimulationError(getSimulationErrorMessage(error));
        }
      } finally {
        if (!isCancelled) {
          setIsSimulationRunning(false);
        }
      }
    }, 0);

    return () => {
      isCancelled = true;
      window.clearTimeout(timeoutId);
    };
  }, [simulationInputSignature, simulationRefreshKey]);

  return (
    <div className="app">
      <header className="app-header">
        <div className="page-shell">
          <div className="app-header__content">
            <a className="app-header__brand" href="#top">
              <img
                className="app-header__logo"
                src={appLogo}
                alt="DamageForge logo"
              />
              <span className="app-header__brand-name">DamageForge</span>
            </a>

            <nav className="app-header__nav" aria-label="Views">
              <button
                className={`app-header__tab ${view === "calculator" ? "app-header__tab--active" : ""}`}
                onClick={() => setView("calculator")}
              >
                Calculator
              </button>
              <button
                className={`app-header__tab ${view === "armies" ? "app-header__tab--active" : ""}`}
                onClick={() => setView("armies")}
              >
                My Armies
              </button>
              <button
                className={`app-header__tab ${view === "workspace" ? "app-header__tab--active" : ""}`}
                onClick={() => setView("workspace")}
              >
                Battle Workspace
              </button>
            </nav>

            <a className="app-header__link" href="https://github.com/Halcior/warhammer-combat-app.git" target="_blank" rel="noreferrer">
              GitHub
            </a>
          </div>
        </div>
      </header>

      <main className="page-shell app-main">
        {view === "calculator" && (
          <CalculatorPage
            battleSetup={battleSetup}
            attackModifiers={attackModifiers}
            factionRules={factionRules}
            ruleOptions={ruleOptions}
            enhancementOptions={enhancementOptions}
            stratagemOptions={stratagemOptions}
            expectedResult={expectedResult}
            attackBreakdownExplanation={attackBreakdownExplanation}
            compareWeapon={compareWeapon}
            compareResult={compareResult}
            attackerUnitAbilityRuleOptions={attackerUnitAbilityRuleOptions}
            attackerUnitAbilityOptions={attackerUnitAbilityOptions}
            defenderUnitAbilityRuleOptions={defenderUnitAbilityRuleOptions}
            defenderUnitAbilityOptions={defenderUnitAbilityOptions}
            attackerScopedModifierRules={attackerScopedModifierRules}
            defenderScopedModifierRules={defenderScopedModifierRules}
            mode={mode}
            setMode={setMode}
            runs={runs}
            setRuns={setRuns}
            onRunSimulation={handleRunSimulation}
            simulationSummary={simulationSummary}
            simulationError={simulationError}
            isSimulationRunning={isSimulationRunning}
            compareWeaponId={compareWeaponId}
            setCompareWeaponId={setCompareWeaponId}
          />
        )}

        {view === "armies" && (
          <ArmiesPage
            armies={armyPresets.armies}
            canCreate={armyPresets.canCreate}
            freeLimit={armyPresets.freeLimit}
            onAdd={armyPresets.addArmy}
            onEdit={armyPresets.editArmy}
            onDelete={armyPresets.removeArmy}
            onDuplicate={armyPresets.dupeArmy}
            setView={setView}
            onOpenWorkspace={(armyId, sv) => {
              setWorkspaceArmyA(armyId);
              sv("workspace");
            }}
          />
        )}

        {view === "workspace" && (
          <WorkspacePage
            armies={armyPresets.armies}
            workspaceArmyA={workspaceArmyA}
            workspaceArmyB={workspaceArmyB}
            setWorkspaceArmyA={setWorkspaceArmyA}
            setWorkspaceArmyB={setWorkspaceArmyB}
            attackerId={battleSetup.attackerId}
            defenderId={battleSetup.defenderId}
            conditions={battleSetup.conditions}
            setConditions={battleSetup.setConditions}
            selectAttacker={battleSetup.selectAttacker}
            selectDefender={battleSetup.selectDefender}
            expectedResult={expectedResult}
            attackBreakdownExplanation={attackBreakdownExplanation}
            mode={mode}
            setMode={setMode}
            runs={runs}
            setRuns={setRuns}
            onRunSimulation={handleRunSimulation}
            simulationSummary={simulationSummary}
            simulationError={simulationError}
            isSimulationRunning={isSimulationRunning}
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
            activeRuleOptionIds={ruleOptions.activeRuleOptionIds}
            toggleRuleOption={ruleOptions.toggleRuleOption}
            stratagems={factionRules.stratagems}
            enhancements={factionRules.enhancements}
            activeEnhancementIds={enhancementOptions.activeEnhancementIds}
            toggleEnhancement={enhancementOptions.toggleEnhancement}
            activeStratagemIds={stratagemOptions.activeStratagemIds}
            toggleStratagem={stratagemOptions.toggleStratagem}
            attackerUnitAbilityOptions={attackerUnitAbilityRuleOptions}
            activeAttackerUnitAbilityIds={attackerUnitAbilityOptions.activeRuleOptionIds}
            toggleAttackerUnitAbility={attackerUnitAbilityOptions.toggleRuleOption}
            defenderUnitAbilityOptions={defenderUnitAbilityRuleOptions}
            activeDefenderUnitAbilityIds={defenderUnitAbilityOptions.activeRuleOptionIds}
            toggleDefenderUnitAbility={defenderUnitAbilityOptions.toggleRuleOption}
          />
        )}
      </main>
    </div>
  );
}

export default App;

function validateSimulationSummary(summary: SimulationSummary) {
  const values = Object.entries(summary);

  for (const [key, value] of values) {
    if (typeof value === "number" && !Number.isFinite(value)) {
      throw new Error(`Simulation produced a non-finite value for "${key}".`);
    }
  }
}

function getSimulationErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  return "Simulation failed for this setup.";
}
