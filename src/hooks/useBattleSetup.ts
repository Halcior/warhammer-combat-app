import { useMemo, useState } from "react";
import { units } from "../data/units";
import type { AttackConditions } from "../types/combat";

export function useBattleSetup() {
  const initialConditions: AttackConditions = {
    battleRound: 1,
    isTargetInCover: false,
    isHalfRange: false,
    remainedStationary: false,
    advancedThisTurn: false,
    targetVisible: true,
    targetDistanceInches: 24,
    targetInEngagementRange: false,
    attackerWithinAuxiliarySupportRange: false,
    defenderWithinAuxiliaryStealthRange: false,
    targetWithinAuxiliarySupportRange: false,
    targetModelCount: 10,
    targetHasMatchingAntiKeyword: false,
    isChargeTurn: false,
    isAttachedUnit: false,
    attackWithinObjectiveRange: false,
    attackerDisembarkedThisTurn: false,
    attackerIsFiringOverwatch: false,
    attackerIsGuided: false,
    attackerIsVesselOfWrath: false,
    attackerWithinFriendlyCharacterRange: false,
    attackerWithinFriendlyMonsterAura: false,
    attackerWithinPowerMatrix: false,
    attackerSetUpThisTurn: false,
    attackerSetToDefend: false,
    targetIsClosestEligible: false,
    targetIsAfflicted: false,
    targetWithinContagionRange: false,
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
  };

  const factions = [...new Set(units.map((unit) => unit.faction))];

  const initialAttackerFaction = units[0].faction;
  const initialAttackerUnits = units.filter(
    (unit) => unit.faction === initialAttackerFaction
  );
  const initialAttacker = initialAttackerUnits[0];

  const initialDefenderFaction = units[1]?.faction ?? units[0].faction;
  const initialDefenderUnits = units.filter(
    (unit) => unit.faction === initialDefenderFaction
  );
  const initialDefender = initialDefenderUnits[0];

  const [attackerFaction, setAttackerFaction] = useState(initialAttackerFaction);
  const [defenderFaction, setDefenderFaction] = useState(initialDefenderFaction);

  const [attackerId, setAttackerId] = useState(initialAttacker.id);
  const [defenderId, setDefenderId] = useState(initialDefender.id);
  const [weaponId, setWeaponId] = useState(initialAttacker.weapons[0].id);

  const [attackingModels, setAttackingModels] = useState(1);
  const [defendingModels, setDefendingModels] = useState(10);

  const [conditions, setConditions] = useState<AttackConditions>(initialConditions);

  const attackerUnits = useMemo(() => {
    return units.filter((unit) => unit.faction === attackerFaction);
  }, [attackerFaction]);

  const defenderUnits = useMemo(() => {
    return units.filter((unit) => unit.faction === defenderFaction);
  }, [defenderFaction]);

  const attacker =
    attackerUnits.find((unit) => unit.id === attackerId) ?? attackerUnits[0];

  const defender =
    defenderUnits.find((unit) => unit.id === defenderId) ?? defenderUnits[0];

  const selectedWeapon =
    attacker.weapons.find((weapon) => weapon.id === weaponId) ??
    attacker.weapons[0];

  function handleAttackerFactionChange(newFaction: string) {
    const newAttackerUnits = units.filter((unit) => unit.faction === newFaction);
    const newAttacker = newAttackerUnits[0];

    setAttackerFaction(newFaction);

    if (newAttacker) {
      setAttackerId(newAttacker.id);
      setWeaponId(newAttacker.weapons[0].id);
    }
  }

  function handleAttackerChange(newAttackerId: string) {
    const newAttacker = attackerUnits.find((unit) => unit.id === newAttackerId);

    setAttackerId(newAttackerId);

    if (newAttacker) {
      setWeaponId(newAttacker.weapons[0].id);
    }
  }

  function handleWeaponChange(newWeaponId: string) {
    setWeaponId(newWeaponId);
  }

  function handleDefenderFactionChange(newFaction: string) {
    const newDefenderUnits = units.filter((unit) => unit.faction === newFaction);
    const newDefender = newDefenderUnits[0];

    setDefenderFaction(newFaction);

    if (newDefender) {
      setDefenderId(newDefender.id);
    }
  }

  function handleDefenderChange(newDefenderId: string) {
    setDefenderId(newDefenderId);
  }

  return {
    factions,
    attackerFaction,
    defenderFaction,
    attackerId,
    defenderId,
    weaponId,
    attackingModels,
    defendingModels,
    conditions,
    attackerUnits,
    defenderUnits,
    attacker,
    defender,
    selectedWeapon,
    setAttackingModels,
    setDefendingModels,
    setConditions,
    handleAttackerFactionChange,
    handleAttackerChange,
    handleWeaponChange,
    handleDefenderFactionChange,
    handleDefenderChange,
  };
}
