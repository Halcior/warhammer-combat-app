const canonicalFactionNamesByKey: Record<string, string> = {
  "tau empire": "T'au Empire",
  "t'au empire": "T'au Empire",
  "emperor's children": "Emperor's Children",
};

export function normalizeFactionName(factionName: string): string {
  const normalized = factionName
    .trim()
    .replace(/\u00E2\u20AC[\u2122\u02DC]/g, "'")
    .replace(/[‘’`´]/g, "'")
    .replace(/Ă˘â‚¬â„˘/g, "'")
    .replace(/\s+/g, " ");

  return canonicalFactionNamesByKey[normalized.toLowerCase()] ?? normalized;
}
