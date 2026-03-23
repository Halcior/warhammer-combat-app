import type { DiceValue } from "../../types/combat";

export function getSuccessChance(target: number | null): number {
  if (target === null) return 0;

  if (target <= 2) return 5 / 6;
  if (target === 3) return 4 / 6;
  if (target === 4) return 3 / 6;
  if (target === 5) return 2 / 6;
  if (target === 6) return 1 / 6;
  return 0;
}

export function parseDiceValue(value: DiceValue): number {
  if (typeof value === "number") {
    return value;
  }

  const normalized = value.replace(/\s+/g, "").toUpperCase();

  const diceRegex = /^(\d*)D(\d+)([+-]\d+)?$/;
  const match = normalized.match(diceRegex);

  if (!match) {
    const parsedNumber = Number(normalized);
    return Number.isNaN(parsedNumber) ? 0 : parsedNumber;
  }

  const diceCount = match[1] ? Number(match[1]) : 1;
  const diceSides = Number(match[2]);
  const modifier = match[3] ? Number(match[3]) : 0;

  const averageSingleDie = (diceSides + 1) / 2;
  return diceCount * averageSingleDie + modifier;
}