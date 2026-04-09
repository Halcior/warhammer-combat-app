import { useMemo, useState } from "react";
import "./App.css";
import { calculateExpectedDamage } from "./lib/combat";
import { runSimulationByMode } from "./lib/combat/simulation/runSimulationByMode";

import { SetupPanel } from "./components/SetupPanel";
import { ModifiersPanel } from "./components/ModifiersPanel";
import { ResolveAttackPanel } from "./components/ResolveAttackPanel";
import { ExpectedResultPanel } from "./components/ExpectedResultPanel";
import { CompareWeaponsPanel } from "./components/CompareWeaponsPanel";
import { SimulationPanel } from "./components/SimulationPanel";

import { useBattleSetup } from "./hooks/useBattleSetup";
import { useAttackModifiers } from "./hooks/useAttackModifiers";
import { useResolver } from "./hooks/useResolver";
import { useFactionRules } from "./hooks/useFactionRules";
import {
  useRuleOptions,
  useEnhancementOptions,
  useStratagemOptions,
} from "./hooks/useRuleOptions";

import type { SimulationSummary } from "./lib/combat/simulation/analyzeSimulation";
import type { CalculationMode } from "./lib/combat/simulation/runSimulationByMode";

import { explainAttackBreakdown } from "./lib/combat/explainAttackBreakdown";
import { AttackBreakdownSourcesPanel } from "./components/AttackBreakdownSourcesPanel";

function App() {
  const battleSetup = useBattleSetup();
  const attackModifiers = useAttackModifiers();
  const factionRules = useFactionRules(battleSetup.attackerFaction);
  const ruleOptions = useRuleOptions(factionRules.allAvailableRuleOptions);
  const enhancementOptions = useEnhancementOptions(factionRules.enhancements);
  const stratagemOptions = useStratagemOptions(factionRules.stratagems);

  const resolver = useResolver({
    weapon: battleSetup.selectedWeapon,
    defender: battleSetup.defender,
    defendingModels: battleSetup.defendingModels,
  });

  const [compareWeaponId, setCompareWeaponId] = useState("");
  const [mode, setMode] = useState<CalculationMode>("fast");
  const [runs, setRuns] = useState(5000);
  const [simulationSummary, setSimulationSummary] =
    useState<SimulationSummary | null>(null);

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

  const allActiveModifierRules = useMemo(() => {
    return [
      ...attackModifiers.allActiveModifierRules,
      ...ruleOptions.activeRuleModifiers,
      ...enhancementOptions.activeEnhancementEffects,
      ...stratagemOptions.activeStratagemEffects,
    ];
  }, [
    attackModifiers.allActiveModifierRules,
    ruleOptions.activeRuleModifiers,
    enhancementOptions.activeEnhancementEffects,
    stratagemOptions.activeStratagemEffects,
  ]);

  const expectedResult = useMemo(() => {
    return calculateExpectedDamage({
      attacker: battleSetup.attacker,
      weapon: battleSetup.selectedWeapon,
      defender: battleSetup.defender,
      attackingModels: battleSetup.attackingModels,
      defendingModels: battleSetup.defendingModels,
      conditions: battleSetup.conditions,
      activeModifierRules: allActiveModifierRules,
      activeEngineTags: ruleOptions.activeEngineTags,
    });
  }, [
    battleSetup.attacker,
    battleSetup.selectedWeapon,
    battleSetup.defender,
    battleSetup.attackingModels,
    battleSetup.defendingModels,
    battleSetup.conditions,
    allActiveModifierRules,
    ruleOptions.activeEngineTags,
  ]);

  const attackBreakdownExplanation = useMemo(() => {
    return explainAttackBreakdown({
      weapon: battleSetup.selectedWeapon,
      defender: battleSetup.defender,
      conditions: battleSetup.conditions,
      activeModifierRules: allActiveModifierRules,
    });
  }, [
    battleSetup.selectedWeapon,
    battleSetup.defender,
    battleSetup.conditions,
    allActiveModifierRules,
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
      activeModifierRules: allActiveModifierRules,
      activeEngineTags: ruleOptions.activeEngineTags,
    });
  }, [
    battleSetup.attacker,
    compareWeapon,
    battleSetup.defender,
    battleSetup.attackingModels,
    battleSetup.defendingModels,
    battleSetup.conditions,
    allActiveModifierRules,
    ruleOptions.activeEngineTags,
  ]);

  const handleRunSimulation = () => {
<<<<<<< ours
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
        activeModifierRules: allActiveModifierRules,
      },
=======
    const summary = simulateAttackContext({
      attacker: battleSetup.attacker,
      weapon: battleSetup.selectedWeapon,
      defender: battleSetup.defender,
      attackingModels: battleSetup.attackingModels,
      defendingModels: battleSetup.defendingModels,
      conditions: battleSetup.conditions,
      activeModifierRules: allActiveModifierRules,
      runs,
>>>>>>> theirs
    });

    setSimulationSummary(summary);
  };

  return (
    <div className="app">
      <h1>Warhammer Helper</h1>

      <div className="top-grid">
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
          handleAttackerFactionChange={(value) => {
            battleSetup.handleAttackerFactionChange(value);
            resolver.resetResolveAttack();
          }}
          handleAttackerChange={(value) => {
            battleSetup.handleAttackerChange(value);
            resolver.resetResolveAttack();
          }}
          handleWeaponChange={(value) => {
            battleSetup.handleWeaponChange(value);
            resolver.resetResolveAttack();
          }}
          handleDefenderFactionChange={(value) => {
            battleSetup.handleDefenderFactionChange(value);
            resolver.resetResolveAttack();
          }}
          handleDefenderChange={(value) => {
            battleSetup.handleDefenderChange(value);
            resolver.resetResolveAttack();
          }}
        />

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

        <ResolveAttackPanel
          expectedTotalAttacks={expectedResult.totalAttacks}
          rolledHits={resolver.rolledHits}
          rolledWounds={resolver.rolledWounds}
          successfulSaves={resolver.successfulSaves}
          setRolledHits={resolver.setRolledHits}
          setRolledWounds={resolver.setRolledWounds}
          setSuccessfulSaves={resolver.setSuccessfulSaves}
          resolvedResult={resolver.resolvedResult}
        />
      </div>

      <ExpectedResultPanel expectedResult={expectedResult} />
      <AttackBreakdownSourcesPanel explanation={attackBreakdownExplanation} />

      <SimulationPanel
        mode={mode}
        setMode={setMode}
        runs={runs}
        setRuns={setRuns}
        onRun={handleRunSimulation}
        summary={simulationSummary}
      />

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
  );
}

export default App;
