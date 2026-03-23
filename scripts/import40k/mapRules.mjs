function normalize(text) {
  return String(text || "").toLowerCase().trim();
}

export function parseWeaponRules(description) {
  if (!description) return [];

  const text = normalize(description);
  const rules = [];

  const pushIf = (condition, rule) => {
    if (condition) rules.push(rule);
  };

  const rapidFireMatch = text.match(/rapid fire (\d+)/);
  if (rapidFireMatch) {
    rules.push({ type: "RAPID_FIRE", value: Number(rapidFireMatch[1]) });
  }

  const meltaMatch = text.match(/melta (\d+)/);
  if (meltaMatch) {
    rules.push({ type: "MELTA", value: Number(meltaMatch[1]) });
  }

  const sustainedHitsMatch = text.match(/sustained hits (\d+)/);
  if (sustainedHitsMatch) {
    rules.push({
      type: "SUSTAINED_HITS",
      value: Number(sustainedHitsMatch[1]),
    });
  }

  const antiMatch = text.match(/anti-([a-z ]+?) (\d)\+/);
  if (antiMatch) {
    rules.push({
      type: "ANTI",
      keyword: antiMatch[1].trim(),
      value: Number(antiMatch[2]),
    });
  }

  pushIf(text.includes("assault"), { type: "ASSAULT" });
  pushIf(text.includes("pistol"), { type: "PISTOL" });
  pushIf(text.includes("ignores cover"), { type: "IGNORES_COVER" });
  pushIf(text.includes("twin-linked"), { type: "TWIN_LINKED" });
  pushIf(text.includes("torrent"), { type: "TORRENT" });
  pushIf(text.includes("lethal hits"), { type: "LETHAL_HITS" });
  pushIf(text.includes("lance"), { type: "LANCE" });
  pushIf(text.includes("indirect fire"), { type: "INDIRECT_FIRE" });
  pushIf(text.includes("precision"), { type: "PRECISION" });
  pushIf(text.includes("blast"), { type: "BLAST" });
  pushIf(text.includes("heavy"), { type: "HEAVY" });
  pushIf(text.includes("hazardous"), { type: "HAZARDOUS" });
  pushIf(text.includes("extra attacks"), { type: "EXTRA_ATTACKS" });
  pushIf(text.includes("devastating wounds"), { type: "DEVASTATING_WOUNDS" });

  return rules;
}