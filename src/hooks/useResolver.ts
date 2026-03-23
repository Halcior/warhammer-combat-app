import { useCallback, useMemo, useState } from "react";
import type { Unit, Weapon } from "../types/combat";
import { resolveAttack, type ResolvedAttackResult } from "../lib/combat/index";

type UseResolverParams = {
  weapon: Weapon;
  defender: Unit;
  defendingModels: number;
};

export function useResolver({
  weapon,
  defender,
  defendingModels,
}: UseResolverParams) {
  const [rolledHits, setRolledHits] = useState(0);
  const [rolledWounds, setRolledWounds] = useState(0);
  const [successfulSaves, setSuccessfulSaves] = useState(0);

  const resolvedResult: ResolvedAttackResult = useMemo(() => {
    return resolveAttack({
      weapon,
      defender,
      defendingModels,
      rolledHits,
      rolledWounds,
      successfulSaves,
    });
  }, [
    weapon,
    defender,
    defendingModels,
    rolledHits,
    rolledWounds,
    successfulSaves,
  ]);

  const resetResolveAttack = useCallback(() => {
    setRolledHits(0);
    setRolledWounds(0);
    setSuccessfulSaves(0);
  }, []);

  return {
    rolledHits,
    setRolledHits,
    rolledWounds,
    setRolledWounds,
    successfulSaves,
    setSuccessfulSaves,
    resolvedResult,
    resetResolveAttack,
  };
}