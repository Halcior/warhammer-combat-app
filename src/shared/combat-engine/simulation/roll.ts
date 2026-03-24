export function rollD6(): number {
  return Math.floor(Math.random() * 6) + 1;
}

export function rollMany(n: number): number[] {
  const out: number[] = [];
  for (let i = 0; i < n; i++) out.push(rollD6());
  return out;
}

export function successCount(target: number, rolls: number[]): number {
  let c = 0;
  for (const r of rolls) if (r >= target) c++;
  return c;
}
