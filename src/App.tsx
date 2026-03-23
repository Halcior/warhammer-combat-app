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

function App() {
  const battleSetup = useBattleSetup();

  const attackModifiers = useAttackModifiers();

  const resolver = useResolver({
    weapon: battleSetup.selectedWeapon,
    defender: battleSetup.defender,
    defendingModels: battleSetup.defendingModels,
  });

  const expectedResult = useMemo(() => {
    return calculateExpectedDamage({
      attacker: battleSetup.attacker,
      weapon: battleSetup.selectedWeapon,
      defender: battleSetup.defender,
      attackingModels: battleSetup.attackingModels,
      defendingModels: battleSetup.defendingModels,
      conditions: battleSetup.conditions,
      activeModifierRules: attackModifiers.allActiveModifierRules,
    });
  }, [
    battleSetup.attacker,
    battleSetup.selectedWeapon,
    battleSetup.defender,
    battleSetup.attackingModels,
    battleSetup.defendingModels,
    battleSetup.conditions,
    attackModifiers.allActiveModifierRules,
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
          attackerFaction={battleSetup.attackerFaction}
          activeFactionModifiers={attackModifiers.activeFactionModifiers}
          setActiveFactionModifiers={attackModifiers.setActiveFactionModifiers}
          activeAttackModifiers={attackModifiers.activeAttackModifiers}
          setActiveAttackModifiers={attackModifiers.setActiveAttackModifiers}
          allActiveModifierRules={attackModifiers.allActiveModifierRules}
          selectedWeapon={battleSetup.selectedWeapon}
          attacker={battleSetup.attacker}
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