import { useEffect, useMemo, useState } from "react";
import "./App.css";
import appLogo from "./assets/Nowe_LogoPNG.png";
import { calculateExpectedDamage } from "./lib/combat";
import { runSimulationByMode } from "./lib/combat/simulation/runSimulationByMode";

import { SetupPanel } from "./components/SetupPanel";
import { ModifiersPanel } from "./components/ModifiersPanel";
import { ExpectedResultPanel } from "./components/ExpectedResultPanel";
import { CompareWeaponsPanel } from "./components/CompareWeaponsPanel";
import { SimulationPanel } from "./components/SimulationPanel";

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
import { AttackBreakdownSourcesPanel } from "./components/AttackBreakdownSourcesPanel";

function App() {
  const battleSetup = useBattleSetup();
  const attackModifiers = useAttackModifiers();
  const factionRules = useFactionRules(battleSetup.attackerFaction);
  const ruleOptions = useRuleOptions(factionRules.allAvailableRuleOptions);
  const enhancementOptions = useEnhancementOptions(factionRules.enhancements);
  const stratagemOptions = useStratagemOptions(factionRules.stratagems);

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

  const activeRuleEffects = useMemo(() => {
    return [
      ...ruleOptions.activeRuleOptions,
      ...enhancementOptions.activeEnhancementRuleEffects,
      ...stratagemOptions.activeStratagemRuleEffects,
    ];
  }, [
    ruleOptions.activeRuleOptions,
    enhancementOptions.activeEnhancementRuleEffects,
    stratagemOptions.activeStratagemRuleEffects,
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

  const allActiveModifierRules = useMemo(() => {
    return [...attackerScopedModifierRules, ...defenderScopedModifierRules];
  }, [attackerScopedModifierRules, defenderScopedModifierRules]);

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
  }, [
    mode,
    runs,
    expectedResult,
    battleSetup.selectedWeapon,
    battleSetup.defender.woundsPerModel,
    battleSetup.defendingModels,
    battleSetup.attacker,
    battleSetup.defender,
    battleSetup.attackingModels,
    battleSetup.conditions,
    attackerScopedModifierRules,
    defenderScopedModifierRules,
    simulationRefreshKey,
  ]);

  return (
    <div className="app">
      <header className="app-hero">
        <div className="app-hero__content">
          <div className="app-brand">
            <img className="app-brand__logo" src={appLogo} alt="DamageForge logo" />
            <div className="app-brand__copy">
              <p className="app-hero__eyebrow">Damage Sandbox</p>
              <h1>DamageForge</h1>
            </div>
          </div>
          <p className="app-hero__lead">
            Fast attack math, detachment rules and simulation results in a
            cleaner forge-themed workspace.
          </p>
        </div>

        <div className="app-hero__meta">
          <div className="hero-chip">
            <span className="hero-chip__label">Attacker</span>
            <span className="hero-chip__value">{battleSetup.attacker.name}</span>
          </div>

          <div className="hero-chip">
            <span className="hero-chip__label">Weapon</span>
            <span className="hero-chip__value">
              {battleSetup.selectedWeapon.name}
            </span>
          </div>

          {factionRules.selectedDetachment && (
            <div className="hero-chip">
              <span className="hero-chip__label">Detachment</span>
              <span className="hero-chip__value">
                {factionRules.selectedDetachment.name}
              </span>
            </div>
          )}
        </div>
      </header>

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

      <div className="workspace-grid">
        <div className="workspace-main">
          <SimulationPanel
            mode={mode}
            setMode={setMode}
            runs={runs}
            setRuns={setRuns}
            onRun={handleRunSimulation}
            summary={simulationSummary}
            error={simulationError}
            isRunning={isSimulationRunning}
          />

          <div className="analysis-grid">
            <ExpectedResultPanel expectedResult={expectedResult} />
            <AttackBreakdownSourcesPanel explanation={attackBreakdownExplanation} />
          </div>

          {battleSetup.attacker.weapons.length > 1 && (
            <CompareWeaponsPanel
              weaponA={battleSetup.selectedWeapon}
              weaponB={compareWeapon}
              compareWeaponId={activeCompareWeaponId}
              setCompareWeaponId={setCompareWeaponId}
              availableWeapons={battleSetup.attacker.weapons}
              resultA={expectedResult}
              resultB={compareResult}
            />
          )}
        </div>

        <div className="workspace-sidebar">
          <ModifiersPanel
            activeAttackModifiers={attackModifiers.activeAttackModifiers}
            setActiveAttackModifiers={attackModifiers.setActiveAttackModifiers}
            allActiveModifierRules={allActiveModifierRules}
            selectedWeapon={battleSetup.selectedWeapon}
            attacker={battleSetup.attacker}
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
          />
        </div>
      </div>
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
