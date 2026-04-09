import type { DiceValue } from "../../types/combat";

type DiceOutcome = {
  value: number;
  probability: number;
};

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

export function getExpectedDiceValueWithOptionalReroll(
  value: DiceValue
): number {
  const outcomes = getDiceOutcomeDistribution(value);
  const freshAverage = parseDiceValue(value);

  return outcomes.reduce((sum, outcome) => {
    const keptOrRerolled =
      outcome.value < freshAverage ? freshAverage : outcome.value;

    return sum + outcome.probability * keptOrRerolled;
  }, 0);
}

function getDiceOutcomeDistribution(value: DiceValue): DiceOutcome[] {
  if (typeof value === "number") {
    return [{ value, probability: 1 }];
  }

  const normalized = value.replace(/\s+/g, "").toUpperCase();
  const parsedNumber = Number(normalized);

  if (!Number.isNaN(parsedNumber)) {
    return [{ value: parsedNumber, probability: 1 }];
  }

  const diceRegex = /^(\d*)D(\d+)([+-]\d+)?$/;
  const match = normalized.match(diceRegex);

  if (!match) {
    return [{ value: 0, probability: 1 }];
  }

  const diceCount = match[1] ? Number(match[1]) : 1;
  const diceSides = Number(match[2]);
  const modifier = match[3] ? Number(match[3]) : 0;

  const singleDieOutcomes = Array.from({ length: diceSides }, (_, index) => ({
    value: index + 1,
    probability: 1 / diceSides,
  }));

  let outcomes: DiceOutcome[] = [{ value: 0, probability: 1 }];

  for (let i = 0; i < diceCount; i++) {
    const nextOutcomeMap = new Map<number, number>();

    for (const current of outcomes) {
      for (const face of singleDieOutcomes) {
        const nextValue = current.value + face.value;
        const nextProbability = current.probability * face.probability;

        nextOutcomeMap.set(
          nextValue,
          (nextOutcomeMap.get(nextValue) ?? 0) + nextProbability
        );
      }
    }

    outcomes = Array.from(nextOutcomeMap.entries()).map(
      ([outcomeValue, probability]) => ({
        value: outcomeValue,
        probability,
      })
    );
  }

  return outcomes.map((outcome) => ({
    value: outcome.value + modifier,
    probability: outcome.probability,
  }));
}
