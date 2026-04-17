import { useEffect, useMemo, useState } from "react";
import type { Unit } from "../types/combat";
import type { AttackConditions } from "../types/combat";
import { loadBattleSetup, saveBattleSetup } from "../lib/storage/uiStorage";
import { normalizeFactionName } from "../lib/normalizeFactionName";

export function useBattleSetup(units: Unit[]) {
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
    defenderWithinFriendlyVehicleSupportRange: false,
    defenderWithinAuxiliaryStealthRange: false,
    targetWithinAuxiliarySupportRange: false,
    targetModelCount: 10,
    targetHasMatchingAntiKeyword: false,
    isChargeTurn: false,
    isAttachedUnit: false,
    attackWithinObjectiveRange: false,
    attackerWithinObjectiveRange: false,
    attackerDisembarkedThisTurn: false,
    attackerIsFiringOverwatch: false,
    attackerIsAfflicted: false,
    attackerIsGuided: false,
    attackerIsVesselOfWrath: false,
    attackerWithinFriendlyCharacterRange: false,
    attackerWithinFriendlyMonsterAura: false,
    attackerWithinPowerMatrix: false,
    attackerSetUpThisTurn: false,
    attackerSetToDefend: false,
    targetIsClosestEligible: false,
    targetWithinPlagueLegionsEngagementRange: false,
    targetIsAfflicted: false,
    targetWithinContagionRange: false,
    targetInOpponentDeploymentZone: false,
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

  const saved = loadBattleSetup();

  const factions = [...new Set(units.map((unit) => normalizeFactionName(unit.faction)))];

  // ── Attacker initial values ───────────────────────────────────────────────

  const initialAttackerFaction = (() => {
    const normalizedSavedAttackerFaction = saved.attackerFaction
      ? normalizeFactionName(saved.attackerFaction)
      : "";
    if (
      normalizedSavedAttackerFaction &&
      units.some((u) => normalizeFactionName(u.faction) === normalizedSavedAttackerFaction)
    ) {
      return normalizedSavedAttackerFaction;
    }
    return normalizeFactionName(units[0].faction);
  })();

  const initialAttackerUnits = units.filter(
    (u) => normalizeFactionName(u.faction) === initialAttackerFaction
  );

  const initialAttackerId = (() => {
    if (saved.attackerId) {
      const match = initialAttackerUnits.find(u => u.id === saved.attackerId);
      if (match) return match.id;
    }
    return initialAttackerUnits[0].id;
  })();

  const initialAttacker = initialAttackerUnits.find(u => u.id === initialAttackerId) ?? initialAttackerUnits[0];

  const initialWeaponId = (() => {
    if (saved.weaponId) {
      const match = initialAttacker.weapons.find(w => w.id === saved.weaponId);
      if (match) return match.id;
    }
    return initialAttacker.weapons[0].id;
  })();

  // ── Defender initial values ───────────────────────────────────────────────

  const initialDefenderFaction = (() => {
    const normalizedSavedDefenderFaction = saved.defenderFaction
      ? normalizeFactionName(saved.defenderFaction)
      : "";
    if (
      normalizedSavedDefenderFaction &&
      units.some((u) => normalizeFactionName(u.faction) === normalizedSavedDefenderFaction)
    ) {
      return normalizedSavedDefenderFaction;
    }
    return normalizeFactionName(units[1]?.faction ?? units[0].faction);
  })();

  const initialDefenderUnits = units.filter(
    (u) => normalizeFactionName(u.faction) === initialDefenderFaction
  );

  const initialDefenderId = (() => {
    if (saved.defenderId) {
      const match = initialDefenderUnits.find(u => u.id === saved.defenderId);
      if (match) return match.id;
    }
    return initialDefenderUnits[0].id;
  })();

  // ── State ─────────────────────────────────────────────────────────────────

  const [attackerFaction, setAttackerFaction] = useState(initialAttackerFaction);
  const [defenderFaction, setDefenderFaction] = useState(initialDefenderFaction);

  const [attackerId, setAttackerId] = useState(initialAttackerId);
  const [defenderId, setDefenderId] = useState(initialDefenderId);
  const [weaponId, setWeaponId] = useState(initialWeaponId);

  const [attackingModels, setAttackingModels] = useState(saved.attackingModels ?? 1);
  const [defendingModels, setDefendingModels] = useState(saved.defendingModels ?? 10);

  const [conditions, setConditions] = useState<AttackConditions>(initialConditions);

  // ── Persist on change ─────────────────────────────────────────────────────

  useEffect(() => {
    saveBattleSetup({
      attackerFaction,
      attackerId,
      weaponId,
      defenderFaction,
      defenderId,
      attackingModels,
      defendingModels,
    });
  }, [attackerFaction, attackerId, weaponId, defenderFaction, defenderId, attackingModels, defendingModels]);

  // ── Derived ───────────────────────────────────────────────────────────────

  const attackerUnits = useMemo(() => {
    return units.filter(
      (unit) => normalizeFactionName(unit.faction) === normalizeFactionName(attackerFaction)
    );
  }, [units, attackerFaction]);

  const defenderUnits = useMemo(() => {
    return units.filter(
      (unit) => normalizeFactionName(unit.faction) === normalizeFactionName(defenderFaction)
    );
  }, [units, defenderFaction]);

  const attacker =
    attackerUnits.find((unit) => unit.id === attackerId) ?? attackerUnits[0];

  const defender =
    defenderUnits.find((unit) => unit.id === defenderId) ?? defenderUnits[0];

  const selectedWeapon =
    attacker.weapons.find((weapon) => weapon.id === weaponId) ??
    attacker.weapons[0];

  // ── Handlers ──────────────────────────────────────────────────────────────

  function handleAttackerFactionChange(newFaction: string) {
    const normalizedFaction = normalizeFactionName(newFaction);
    const newAttackerUnits = units.filter(
      (unit) => normalizeFactionName(unit.faction) === normalizedFaction
    );
    const newAttacker = newAttackerUnits[0];

    setAttackerFaction(normalizedFaction);

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
    const normalizedFaction = normalizeFactionName(newFaction);
    const newDefenderUnits = units.filter(
      (unit) => normalizeFactionName(unit.faction) === normalizedFaction
    );
    const newDefender = newDefenderUnits[0];

    setDefenderFaction(normalizedFaction);

    if (newDefender) {
      setDefenderId(newDefender.id);
    }
  }

  function handleDefenderChange(newDefenderId: string) {
    setDefenderId(newDefenderId);
  }

  // Directly select attacker from an army preset unit (sets faction + unit + weapon atomically)
  function selectAttacker(faction: string, unitId: string, weaponId: string) {
    setAttackerFaction(normalizeFactionName(faction));
    setAttackerId(unitId);
    setWeaponId(weaponId);
  }

  // Directly select defender from an army preset unit
  function selectDefender(faction: string, unitId: string) {
    setDefenderFaction(normalizeFactionName(faction));
    setDefenderId(unitId);
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
    selectAttacker,
    selectDefender,
  };
}
