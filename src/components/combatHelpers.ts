export function getBestSave(save: number, invulnerableSave: number | null): number {
  if (invulnerableSave === null) return save;
  return Math.min(save, invulnerableSave);
}

export function doesHit(roll: number, skill: number | null): boolean {
  if (skill === null) return true; // torrent / auto-hit
  return roll >= skill;
}