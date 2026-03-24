import { useEffect, useMemo, useState } from "react";
import "./App.css";
import { calculateExpectedDamage } from "./lib/combat";
import { simulateExpectedDamage } from "./lib/combat/simulation/simulateExpectedDamage";

import { SetupPanel } from "./components/SetupPanel";
import { ModifiersPanel } from "./components/ModifiersPanel";
import { ResolveAttackPanel } from "./components/ResolveAttackPanel";
import { ExpectedResultPanel } from "./components/ExpectedResultPanel";
import { CompareWeaponsPanel } from "./components/CompareWeaponsPanel";
import { SimulationPanel, type CalculationMode } from "./components/SimulationPanel";

import { useBattleSetup } from "./hooks/useBattleSetup";
import { useAttackModifiers } from "./hooks/useAttackModifiers";
import { useResolver } from "./hooks/useResolver";
import { useFactionRules } from "./hooks/useFactionRules";
import { useRuleOptions } from "./hooks/useRuleOptions";

import type { SimulationSummary } from "./lib/combat/simulation/analyzeSimulation";

function App() {
  const battleSetup = useBattleSetup();
  const attackModifiers = useAttackModifiers();
  const factionRules = useFactionRules(battleSetup.attackerFaction);
  const ruleOptions = useRuleOptions(factionRules.allAvailableRuleOptions);

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

  useEffect(() => {
    const fallbackWeapon =
      battleSetup.attacker.weapons.find(
        (w) => w.id !== battleSetup.selectedWeapon.id
      ) ?? battleSetup.selectedWeapon;

    setCompareWeaponId(fallbackWeapon.id);
  }, [battleSetup.attacker, battleSetup.selectedWeapon]);

  const allActiveModifierRules = useMemo(() => {
    return [
      ...attackModifiers.allActiveModifierRules,
      ...ruleOptions.activeRuleModifiers,
    ];
  }, [attackModifiers.allActiveModifierRules, ruleOptions.activeRuleModifiers]);

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
    battleSetup,
    allActiveModifierRules,
    ruleOptions.activeEngineTags,
  ]);

  const compareWeapon =
    battleSetup.attacker.weapons.find((w) => w.id === compareWeaponId) ??
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
    battleSetup,
    compareWeapon,
    allActiveModifierRules,
    ruleOptions.activeEngineTags,
  ]);

  const handleRunSimulation = () => {
    const summary = simulateExpectedDamage({
      expectedResult,
      weapon: battleSetup.selectedWeapon,
      targetWounds: battleSetup.defender.woundsPerModel,
      runs,
    });

    setSimulationSummary(summary);
  };

  return (
    <div className="app">
      <h1>Warhammer Helper</h1>

      <div className="top-grid">
        <SetupPanel {...battleSetup} />

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
          compareWeaponId={compareWeaponId}
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