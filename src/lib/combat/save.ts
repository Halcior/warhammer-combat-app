import type { Weapon } from "../../types/combat";

export function applyCoverToSave(
  saveTarget: number,
  weaponType: Weapon["type"],
  isTargetInCover: boolean
): number {
  if (!isTargetInCover) return saveTarget;
  if (weaponType !== "ranged") return saveTarget;

  return Math.max(2, saveTarget - 1);
}

export function getModifiedSave(
  baseSave: number,
  ap: number,
  invul: number | null
) {
  const modifiedArmorSave = baseSave - ap;

  if (invul !== null) {
    return Math.min(modifiedArmorSave, invul);
  }

  return modifiedArmorSave;
}