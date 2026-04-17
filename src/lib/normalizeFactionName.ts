export function normalizeFactionName(factionName: string): string {
  return factionName
    .trim()
    .normalize("NFKD")
    .replace(/[‘’`´]/g, "'")
    .replace(/â€™/g, "'")
    .replace(/\s+/g, " ");
}

