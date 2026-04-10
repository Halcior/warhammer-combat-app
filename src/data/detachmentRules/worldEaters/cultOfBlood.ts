import type { DetachmentRuleOverride } from "../types";

export const cultOfBloodRuleOverride: DetachmentRuleOverride = ({ rule }) => {
  const haystack = `${rule.name} ${rule.description ?? ""}`.toLowerCase();

  if (haystack.includes("idols of khorne")) {
    return {
      ...rule,
      supportLevel: "implemented",
      phase: "any",
      modifiers: [
        {
          type: "HIT_MODIFIER",
          value: 1,
          requiredAttackerKeywords: ["JAKHALS", "GOREMONGERS"],
          requiresAttackerWithinFriendlyMonsterAura: true,
        },
        {
          type: "WOUND_MODIFIER",
          value: 1,
          requiredAttackerKeywords: ["JAKHALS", "GOREMONGERS"],
          requiresAttackerWithinFriendlyMonsterAura: true,
        },
        {
          type: "INVULNERABLE_SAVE",
          value: 4,
          requiredDefenderKeywords: ["JAKHALS", "GOREMONGERS"],
          requiresAttackerWithinFriendlyMonsterAura: true,
        },
      ],
      engineTags: [],
    };
  }

  return rule;
};
