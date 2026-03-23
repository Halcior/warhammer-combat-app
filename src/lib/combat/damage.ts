import type { Unit, Weapon } from "../../types/combat";
import { parseDiceValue } from "./probability";

type ResolveAttackParams = {
  weapon: Weapon;
  defender: Unit;
  defendingModels: number;
  rolledHits: number;
  rolledWounds: number;
  successfulSaves: number;
};

export function resolveAttack({
  weapon,
  defender,
  defendingModels,
  rolledHits,
  rolledWounds,
  successfulSaves,
}: ResolveAttackParams) {
  const damagePerFailedSave = parseDiceValue(weapon.damage);

  const safeHits = Math.max(0, rolledHits);
  const safeWounds = Math.max(0, Math.min(rolledWounds, safeHits));
  const safeSaves = Math.max(0, Math.min(successfulSaves, safeWounds));

  const unsavedWounds = safeWounds - safeSaves;
  const resolvedDamage = unsavedWounds * damagePerFailedSave;

  const killsPerFailedSave = Math.min(
    1,
    damagePerFailedSave / defender.woundsPerModel
  );
  const rawResolvedSlainModels = unsavedWounds * killsPerFailedSave;
  const resolvedSlainModels = Math.min(rawResolvedSlainModels, defendingModels);

  return {
    unsavedWounds,
    resolvedDamage,
    resolvedSlainModels,
    damagePerFailedSave,
  };
}