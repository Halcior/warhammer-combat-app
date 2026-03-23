import { useMemo } from "react";
import "./App.css";
import { calculateExpectedDamage } from "./lib/combat";
import { SetupPanel } from "./components/SetupPanel";
import { ModifiersPanel } from "./components/ModifiersPanel";
import { ResolveAttackPanel } from "./components/ResolveAttackPanel";
import { ExpectedResultPanel } from "./components/ExpectedResultPanel";
import { useBattleSetup } from "./hooks/useBattleSetup";
import { useAttackModifiers } from "./hooks/useAttackModifiers";
import { useResolver } from "./hooks/useResolver";
import { useFactionRules } from "./hooks/useFactionRules";
import { useRuleOptions } from "./hooks/useRuleOptions";

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
    });
  }, [
    battleSetup.attacker,
    battleSetup.selectedWeapon,
    battleSetup.defender,
    battleSetup.attackingModels,
    battleSetup.defendingModels,
    battleSetup.conditions,
    allActiveModifierRules,
  ]);

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
    </div>
  );
}

export default App;