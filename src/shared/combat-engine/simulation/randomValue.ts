export function rollRandomValue(value: number | string): number {
  if (typeof value === "number") return value;

  const normalized = value.trim().toUpperCase();

  if (/^\d+$/.test(normalized)) {
    return Number(normalized);
  }

  const d3Match = normalized.match(/^D3(?:\+(\d+))?$/);
  if (d3Match) {
    return rollDie(3) + Number(d3Match[1] ?? 0);
  }

  const d6Match = normalized.match(/^D6(?:\+(\d+))?$/);
  if (d6Match) {
    return rollDie(6) + Number(d6Match[1] ?? 0);
  }

  const flatPlusMatch = normalized.match(/^(\d+)\+(\d+)$/);
  if (flatPlusMatch) {
    return Number(flatPlusMatch[1]) + Number(flatPlusMatch[2]);
  }

  throw new Error(`Unsupported random value expression: ${value}`);
}

function rollDie(sides: number): number {
  return Math.floor(Math.random() * sides) + 1;
}
