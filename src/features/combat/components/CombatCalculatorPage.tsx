import { CompareWeaponsPanel } from "../../../components/CompareWeaponsPanel";
import { ExpectedResultPanel } from "../../../components/ExpectedResultPanel";
import { ModifiersPanel } from "../../../components/ModifiersPanel";
import { ResolveAttackPanel } from "../../../components/ResolveAttackPanel";
import { SetupPanel } from "../../../components/SetupPanel";
import { useCombatCalculatorPage } from "../hooks/useCombatCalculatorPage";
import { SimulationPanel } from "./SimulationPanel";
import { useSimulationMode } from "../hooks/useSimulationMode";

export function CombatCalculatorPage() {
  const calculator = useCombatCalculatorPage();

  const simulation = useSimulationMode({
    expectedResult: calculator.expectedResult,
    weapon: calculator.battleSetup.selectedWeapon,
    defender: calculator.battleSetup.defender,
  });

  return (
    <div className="app">
      <h1>Warhammer Helper</h1>

      <div className="top-grid">
        <SetupPanel
          factions={calculator.battleSetup.factions}
          attackerFaction={calculator.battleSetup.attackerFaction}
          defenderFaction={calculator.battleSetup.defenderFaction}
          attackerId={calculator.battleSetup.attackerId}
          defenderId={calculator.battleSetup.defenderId}
          weaponId={calculator.battleSetup.weaponId}
          attackingModels={calculator.battleSetup.attackingModels}
          defendingModels={calculator.battleSetup.defendingModels}
          conditions={calculator.battleSetup.conditions}
          attackerUnits={calculator.battleSetup.attackerUnits}
          defenderUnits={calculator.battleSetup.defenderUnits}
          attacker={calculator.battleSetup.attacker}
          setAttackingModels={calculator.battleSetup.setAttackingModels}
          setDefendingModels={calculator.battleSetup.setDefendingModels}
          setConditions={calculator.battleSetup.setConditions}
          handleAttackerFactionChange={(value) => {
            calculator.battleSetup.handleAttackerFactionChange(value);
            calculator.resetResolvedAttack();
          }}
          handleAttackerChange={(value) => {
            calculator.battleSetup.handleAttackerChange(value);
            calculator.resetResolvedAttack();
          }}
          handleWeaponChange={(value) => {
            calculator.battleSetup.handleWeaponChange(value);
            calculator.resetResolvedAttack();
          }}
          handleDefenderFactionChange={(value) => {
            calculator.battleSetup.handleDefenderFactionChange(value);
            calculator.resetResolvedAttack();
          }}
          handleDefenderChange={(value) => {
            calculator.battleSetup.handleDefenderChange(value);
            calculator.resetResolvedAttack();
          }}
        />

        <ModifiersPanel
          activeAttackModifiers={calculator.attackModifiers.activeAttackModifiers}
          setActiveAttackModifiers={calculator.attackModifiers.setActiveAttackModifiers}
          allActiveModifierRules={calculator.allActiveModifierRules}
          selectedWeapon={calculator.battleSetup.selectedWeapon}
          attacker={calculator.battleSetup.attacker}
          availableDetachments={calculator.factionRules.availableDetachments}
          selectedDetachmentId={calculator.factionRules.selectedDetachmentId}
          setSelectedDetachmentId={calculator.factionRules.setSelectedDetachmentId}
          selectedDetachment={calculator.factionRules.selectedDetachment}
          availableRuleOptions={calculator.factionRules.allAvailableRuleOptions}
          activeRuleOptionIds={calculator.ruleOptions.activeRuleOptionIds}
          toggleRuleOption={calculator.ruleOptions.toggleRuleOption}
          stratagems={calculator.factionRules.stratagems}
          enhancements={calculator.factionRules.enhancements}
        />

        <ResolveAttackPanel
          expectedTotalAttacks={calculator.expectedResult.totalAttacks}
          rolledHits={calculator.resolver.rolledHits}
          rolledWounds={calculator.resolver.rolledWounds}
          successfulSaves={calculator.resolver.successfulSaves}
          setRolledHits={calculator.resolver.setRolledHits}
          setRolledWounds={calculator.resolver.setRolledWounds}
          setSuccessfulSaves={calculator.resolver.setSuccessfulSaves}
          resolvedResult={calculator.resolver.resolvedResult}
        />
      </div>

      <ExpectedResultPanel expectedResult={calculator.expectedResult} />

      <SimulationPanel
        mode={simulation.mode}
        setMode={simulation.setMode}
        runs={simulation.runs}
        setRuns={simulation.setRuns}
        onRun={simulation.runSimulation}
        summary={simulation.simulationSummary}
      />

      {calculator.battleSetup.attacker.weapons.length > 1 && (
        <CompareWeaponsPanel
          weaponA={calculator.battleSetup.selectedWeapon}
          weaponB={calculator.compareWeapon}
          compareWeaponId={calculator.compareWeaponId}
          setCompareWeaponId={calculator.setCompareWeaponId}
          availableWeapons={calculator.battleSetup.attacker.weapons}
          resultA={calculator.expectedResult}
          resultB={calculator.compareResult}
        />
      )}
    </div>
  );
}
