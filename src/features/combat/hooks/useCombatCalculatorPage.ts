import { useEffect, useMemo, useState } from "react";
import { calculateExpectedDamage } from "../../../lib/combat";
import { useAttackModifiers } from "../../../hooks/useAttackModifiers";
import { useBattleSetup } from "../../../hooks/useBattleSetup";
import { useFactionRules } from "../../../hooks/useFactionRules";
import { useResolver } from "../../../hooks/useResolver";
import { useRuleOptions } from "../../../hooks/useRuleOptions";

export function useCombatCalculatorPage() {
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

  useEffect(() => {
    const fallbackWeapon =
      battleSetup.attacker.weapons.find(
        (weapon) => weapon.id !== battleSetup.selectedWeapon.id
      ) ?? battleSetup.selectedWeapon;

    setCompareWeaponId(fallbackWeapon.id);
  }, [battleSetup.attacker, battleSetup.selectedWeapon]);

  const compareWeapon =
    battleSetup.attacker.weapons.find((weapon) => weapon.id === compareWeaponId) ??
    battleSetup.selectedWeapon;

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
    battleSetup.attacker,
    battleSetup.selectedWeapon,
    battleSetup.defender,
    battleSetup.attackingModels,
    battleSetup.defendingModels,
    battleSetup.conditions,
    allActiveModifierRules,
    ruleOptions.activeEngineTags,
  ]);

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

  const resetResolvedAttack = () => {
    resolver.resetResolveAttack();
  };

  return {
    battleSetup,
    attackModifiers,
    factionRules,
    ruleOptions,
    resolver,
    compareWeaponId,
    setCompareWeaponId,
    compareWeapon,
    allActiveModifierRules,
    expectedResult,
    compareResult,
    resetResolvedAttack,
  };
}
