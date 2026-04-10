import type { SpecialRule } from "../types/combat";

export function formatSpecialRule(rule: SpecialRule): string {
  switch (rule.type) {
    case "ASSAULT":
      return "Assault";
    case "PISTOL":
      return "Pistol";
    case "RAPID_FIRE":
      return `Rapid Fire ${rule.value}`;
    case "IGNORES_COVER":
      return "Ignores Cover";
    case "TWIN_LINKED":
      return "Twin-linked";
    case "TORRENT":
      return "Torrent";
    case "LETHAL_HITS":
      return "Lethal Hits";
    case "LANCE":
      return "Lance";
    case "INDIRECT_FIRE":
      return "Indirect Fire";
    case "PRECISION":
      return "Precision";
    case "BLAST":
      return "Blast";
    case "MELTA":
      return `Melta ${rule.value}`;
    case "HEAVY":
      return "Heavy";
    case "HAZARDOUS":
      return "Hazardous";
    case "SUSTAINED_HITS":
      return `Sustained Hits ${rule.value}`;
    case "EXTRA_ATTACKS":
      return "Extra Attacks";
    case "DEVASTATING_WOUNDS":
      return "Devastating Wounds";
    case "ANTI":
      return `Anti-${rule.keyword} ${rule.value}+`;
    case "SET_SAVE_CHARACTERISTIC":
      return `Save ${rule.value}+`;
    case "INVULNERABLE_SAVE":
      return `Invulnerable Save ${rule.value}+`;
    case "FEEL_NO_PAIN":
      return `Feel No Pain ${rule.value}+`;
    case "DAMAGE_REDUCTION":
      return `Damage Reduction ${rule.value}`;
    case "TARGETING_RANGE_LIMIT":
      return `Can only be targeted within ${rule.value}"`;
    case "REROLL_HITS":
      return "Re-roll Hits";
    case "REROLL_HITS_ONES":
      return "Re-roll Hit Rolls of 1";
    case "REROLL_ATTACKS":
      return "Re-roll Attacks";
    case "REROLL_WOUNDS":
      return "Re-roll Wounds";
    case "REROLL_WOUNDS_ONES":
      return "Re-roll Wound Rolls of 1";
    case "FIXED_HIT_ROLL":
      return `Hits on ${rule.value}+`;
    case "HIT_MODIFIER":
      return rule.attackType
        ? `Hit ${formatSignedValue(rule.value)} (${rule.attackType})`
        : `Hit ${formatSignedValue(rule.value)}`;
    case "ATTACKS_MODIFIER":
      return rule.attackType
        ? `Attacks ${formatSignedValue(rule.value)} (${rule.attackType})`
        : `Attacks ${formatSignedValue(rule.value)}`;
    case "CRITICAL_WOUND_AP_MODIFIER":
      return rule.attackType
        ? `Critical Wound AP ${formatSignedValue(rule.value)} (${rule.attackType})`
        : `Critical Wound AP ${formatSignedValue(rule.value)}`;
    case "CRITICAL_HITS_ON":
      return `Critical Hits on ${rule.value}+`;
    case "AP_MODIFIER":
      return rule.attackType
        ? `AP ${formatSignedValue(rule.value)} (${rule.attackType})`
        : `AP ${formatSignedValue(rule.value)}`;
    case "STRENGTH_MODIFIER":
      return rule.attackType
        ? `Strength ${formatSignedValue(rule.value)} (${rule.attackType})`
        : `Strength ${formatSignedValue(rule.value)}`;
    case "DAMAGE_MODIFIER":
      return rule.attackType
        ? `Damage ${formatSignedValue(rule.value)} (${rule.attackType})`
        : `Damage ${formatSignedValue(rule.value)}`;
    case "WOUND_MODIFIER":
      if (rule.attackType && rule.targetToughnessAtLeast !== undefined) {
        return `Wound ${formatSignedValue(rule.value)} (${rule.attackType}, vs T${rule.targetToughnessAtLeast}+)`;
      }

      if (rule.attackType) {
        return `Wound ${formatSignedValue(rule.value)} (${rule.attackType})`;
      }

      if (rule.targetToughnessAtLeast !== undefined) {
        return `Wound ${formatSignedValue(rule.value)} (vs T${rule.targetToughnessAtLeast}+)`;
      }

      return `Wound ${formatSignedValue(rule.value)}`;
    default: {
      const exhaustiveCheck: never = rule;
      void exhaustiveCheck;
      return "Unknown Rule";
    }
  }
}

export function hasRule(
  rules: SpecialRule[] | undefined,
  type: SpecialRule["type"]
): boolean {
  return rules?.some((rule) => rule.type === type) ?? false;
}

export function getRapidFireValue(rules?: SpecialRule[]): number {
  if (!rules) return 0;

  const rapidFireRule = rules.find((rule) => rule.type === "RAPID_FIRE");
  return rapidFireRule?.type === "RAPID_FIRE" ? rapidFireRule.value : 0;
}

export function getSustainedHitsValue(rules?: SpecialRule[]): number {
  if (!rules) return 0;

  const sustainedHitsRule = rules.find(
    (rule) => rule.type === "SUSTAINED_HITS"
  );

  return sustainedHitsRule?.type === "SUSTAINED_HITS"
    ? sustainedHitsRule.value
    : 0;
}

export function hasBlast(rules?: SpecialRule[]): boolean {
  return rules?.some((rule) => rule.type === "BLAST") ?? false;
}

export function getMeltaValue(rules?: SpecialRule[]): number {
  if (!rules) return 0;

  const meltaRule = rules.find((rule) => rule.type === "MELTA");
  return meltaRule?.type === "MELTA" ? meltaRule.value : 0;
}

export function getAntiRule(rules?: SpecialRule[]) {
  if (!rules) return null;
  const antiRule = rules.find((rule) => rule.type === "ANTI");
  return antiRule?.type === "ANTI" ? antiRule : null;
}

function formatSignedValue(value: number): string {
  return value >= 0 ? `+${value}` : `${value}`;
}

