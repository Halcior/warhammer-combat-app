export type SimulationSummary = {
  runs: number;
  mean: number;
  median: number;
  min: number;
  max: number;
  p10: number;
  p90: number;
  killChance: number;
  histogram: Array<{
    damage: number;
    count: number;
    probability: number;
  }>;
};

export function analyzeSimulation(
  results: number[],
  woundsToKillTarget?: number
): SimulationSummary {
  if (results.length === 0) {
    return {
      runs: 0,
      mean: 0,
      median: 0,
      min: 0,
      max: 0,
      p10: 0,
      p90: 0,
      killChance: 0,
      histogram: [],
    };
  }

  const sorted = [...results].sort((a, b) => a - b);
  const runs = sorted.length;
  const sum = sorted.reduce((acc, value) => acc + value, 0);
  const histogramMap = new Map<number, number>();

  for (const value of sorted) {
    histogramMap.set(value, (histogramMap.get(value) ?? 0) + 1);
  }

  const killThreshold = woundsToKillTarget ?? Number.POSITIVE_INFINITY;
  const killCount = Number.isFinite(killThreshold)
    ? sorted.filter((value) => value >= killThreshold).length
    : 0;

  return {
    runs,
    mean: sum / runs,
    median: percentile(sorted, 0.5),
    min: sorted[0],
    max: sorted[sorted.length - 1],
    p10: percentile(sorted, 0.1),
    p90: percentile(sorted, 0.9),
    killChance: Number.isFinite(killThreshold) ? killCount / runs : 0,
    histogram: [...histogramMap.entries()].map(([damage, count]) => ({
      damage,
      count,
      probability: count / runs,
    })),
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
