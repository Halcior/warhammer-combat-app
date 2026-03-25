export type SimulationRunResult = {
  damage: number;
  slainModels: number;
};

export type SimulationSummary = {
  runs: number;

  meanDamage: number;
  medianDamage: number;
  minDamage: number;
  maxDamage: number;
  p10Damage: number;
  p90Damage: number;

  meanSlainModels: number;
  medianSlainModels: number;
  minSlainModels: number;
  maxSlainModels: number;

  killOneChance: number;
  wipeChance: number;
};

export function analyzeSimulation(
  results: SimulationRunResult[],
  defendingModels: number
): SimulationSummary {
  if (results.length === 0) {
    return {
      runs: 0,
      meanDamage: 0,
      medianDamage: 0,
      minDamage: 0,
      maxDamage: 0,
      p10Damage: 0,
      p90Damage: 0,
      meanSlainModels: 0,
      medianSlainModels: 0,
      minSlainModels: 0,
      maxSlainModels: 0,
      killOneChance: 0,
      wipeChance: 0,
    };
  }

  const runs = results.length;

  const damageValues = results.map((r) => r.damage).sort((a, b) => a - b);
  const slainValues = results.map((r) => r.slainModels).sort((a, b) => a - b);

  const sumDamage = damageValues.reduce((acc, value) => acc + value, 0);
  const sumSlain = slainValues.reduce((acc, value) => acc + value, 0);

  const killOneCount = slainValues.filter((value) => value >= 1).length;
  const wipeCount = slainValues.filter((value) => value >= defendingModels).length;

  return {
    runs,

    meanDamage: sumDamage / runs,
    medianDamage: percentile(damageValues, 0.5),
    minDamage: damageValues[0],
    maxDamage: damageValues[damageValues.length - 1],
    p10Damage: percentile(damageValues, 0.1),
    p90Damage: percentile(damageValues, 0.9),

    meanSlainModels: sumSlain / runs,
    medianSlainModels: percentile(slainValues, 0.5),
    minSlainModels: slainValues[0],
    maxSlainModels: slainValues[slainValues.length - 1],

    killOneChance: killOneCount / runs,
    wipeChance: wipeCount / runs,
  };
}

function percentile(sorted: number[], p: number): number {
  if (sorted.length === 0) return 0;
  if (sorted.length === 1) return sorted[0];

  const index = (sorted.length - 1) * p;
  const lower = Math.floor(index);
  const upper = Math.ceil(index);

  if (lower === upper) {
    return sorted[lower];
  }

  const weight = index - lower;
  return sorted[lower] + (sorted[upper] - sorted[lower]) * weight;
}