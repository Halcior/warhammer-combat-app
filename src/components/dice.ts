export function rollDiceValue(value: number | string): number {
  if (typeof value === "number") return value;

  const cleaned = value.toUpperCase().replace(/\s/g, "");
  const match = cleaned.match(/^(\d*)D(\d+)([+-]\d+)?$/);

  if (!match) {
    const asNumber = Number(cleaned);
    if (!Number.isNaN(asNumber)) return asNumber;
    throw new Error(`Invalid dice expression: ${value}`);
  }

  const diceCount = Number(match[1] || 1);
  const diceSize = Number(match[2]);
  const modifier = Number(match[3] || 0);

  let total = 0;

  for (let i = 0; i < diceCount; i++) {
    total += Math.floor(Math.random() * diceSize) + 1;
  }

  return total + modifier;
}